import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// Toast/Snackbar UIKit 계층 — Core 큐 상태전이 + 호스트/바의 자동닫힘·정지·정렬을 고정한다.
// SwiftUI JdToastCenter는 DEC-010으로 이 타겟에서 보이지 않아, 여기선 UIKit JdToastHostView가
// 소유한 Core 큐(show/dismiss/clear·max 축출)와 자동닫힘 타이머 로직을 검증한다.

// MARK: - Core JdToastQueue (값 타입 상태머신)

final class JdToastQueueTests: XCTestCase {

    func test_add_appends_in_order() {
        var queue = JdToastQueue(maxVisible: 4)
        let a = JdToast(title: "A", duration: 0)
        let b = JdToast(title: "B", duration: 0)
        queue.add(a)
        queue.add(b)
        XCTAssertEqual(queue.visible.map { $0.id }, [a.id, b.id])
    }

    func test_add_evicts_oldest_beyond_max() {
        var queue = JdToastQueue(maxVisible: 2)
        let a = JdToast(title: "A", duration: 0)
        let b = JdToast(title: "B", duration: 0)
        let c = JdToast(title: "C", duration: 0)
        queue.add(a)
        queue.add(b)
        queue.add(c)
        // 가장 오래된 A가 축출되고 최신 순서는 유지된다
        XCTAssertEqual(queue.visible.count, 2)
        XCTAssertEqual(queue.visible.map { $0.id }, [b.id, c.id])
    }

    func test_maxVisible_floor_is_one() {
        // Core는 0/음수 max를 1로 보정한다
        var queue = JdToastQueue(maxVisible: 0)
        queue.add(JdToast(title: "A", duration: 0))
        queue.add(JdToast(title: "B", duration: 0))
        XCTAssertEqual(queue.visible.count, 1)
    }

    func test_dismiss_and_clear() {
        var queue = JdToastQueue(maxVisible: 4)
        let a = JdToast(title: "A", duration: 0)
        let b = JdToast(title: "B", duration: 0)
        queue.add(a)
        queue.add(b)
        queue.dismiss(a.id)
        XCTAssertEqual(queue.visible.map { $0.id }, [b.id])
        queue.clear()
        XCTAssertTrue(queue.visible.isEmpty)
    }
}

// MARK: - JdToastHostView (UIKit 호스트)

@MainActor
final class JdToastHostViewTests: XCTestCase {

    func test_show_dismiss_clear_drive_core_queue() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        let idA = host.show(JdToast(title: "A", duration: 0))
        let idB = host.show(JdToast(title: "B", duration: 0))
        XCTAssertEqual(host.visibleToasts.map { $0.id }, [idA, idB])

        host.dismiss(idA)
        XCTAssertEqual(host.visibleToasts.map { $0.id }, [idB])

        host.clear()
        XCTAssertTrue(host.visibleToasts.isEmpty)
    }

    func test_show_evicts_oldest_beyond_max() {
        let host = JdToastHostView(position: .topRight, maxVisible: 2)
        let idA = host.show(JdToast(title: "A", duration: 0))
        let idB = host.show(JdToast(title: "B", duration: 0))
        let idC = host.show(JdToast(title: "C", duration: 0))
        XCTAssertEqual(host.visibleToasts.map { $0.id }, [idB, idC])
        XCTAssertFalse(host.visibleToasts.contains { $0.id == idA })
    }

    // 자동 닫힘 타이머는 duration>0 일 때만 걸린다(웹 duration 0 = 수동 닫기 전용)
    func test_auto_dismiss_scheduled_only_for_positive_duration() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        let auto = host.show(JdToast(title: "auto", duration: 4))
        let manual = host.show(JdToast(title: "manual", duration: 0))
        XCTAssertTrue(host.hasPendingAutoDismiss(auto))
        XCTAssertFalse(host.hasPendingAutoDismiss(manual))
        host.clear()  // 대기 타이머 정리
    }

    // 정지(hover/드래그) 중엔 타이머를 멈추고, 해제 시 다시 건다(WCAG 2.2.1)
    func test_setPaused_cancels_and_reschedules_timers() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        let id = host.show(JdToast(title: "auto", duration: 4))
        XCTAssertTrue(host.hasPendingAutoDismiss(id))

        host.setPaused(true)
        XCTAssertTrue(host.isPausedForTests)
        XCTAssertFalse(host.hasPendingAutoDismiss(id))

        host.setPaused(false)
        XCTAssertFalse(host.isPausedForTests)
        XCTAssertTrue(host.hasPendingAutoDismiss(id))
        host.clear()
    }

    // 정지 상태에서 새로 뜬 토스트는 타이머가 걸리지 않는다
    func test_show_while_paused_does_not_schedule() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        host.setPaused(true)
        let id = host.show(JdToast(title: "auto", duration: 4))
        XCTAssertFalse(host.hasPendingAutoDismiss(id))
        host.clear()
    }

    // 결정적 시계 주입 — 자동 닫힘이 실제로 큐를 비우는지 종단 검증
    func test_auto_dismiss_removes_toast_from_queue() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        host.autoDismissSleep = { _ in }  // 즉시 반환
        _ = host.show(JdToast(title: "auto", duration: 4))
        XCTAssertEqual(host.visibleToasts.count, 1)

        expectEventually("자동 닫힘으로 큐가 비워진다") { host.visibleToasts.isEmpty }
    }

    // 재렌더는 스택에 카드를 큐 크기만큼 만든다(빈 공간 통과는 point(inside:))
    func test_renders_one_card_per_visible_toast() {
        let host = JdToastHostView(position: .topRight, maxVisible: 4)
        _ = host.show(JdToast(title: "A", duration: 0))
        _ = host.show(JdToast(title: "B", message: "본문", duration: 0))
        host.setNeedsLayout()
        host.layoutIfNeeded()
        let cards = host.recursiveSubviews.filter { $0 is JdToastCardView }
        XCTAssertEqual(cards.count, 2)
    }
}

// MARK: - JdSnackbarView (단일 바)

@MainActor
final class JdSnackbarViewTests: XCTestCase {

    // 위치 6종이 세로 가장자리·가로 배치로 정확히 갈린다
    func test_position_resolves_vertical_and_horizontal_placement() {
        let cases:
            [(JdToastPosition, JdSnackbarView.VerticalEdge, JdSnackbarView.HorizontalPlacement)] = [
                (.topRight, .top, .trailing),
                (.topLeft, .top, .leading),
                (.bottomRight, .bottom, .trailing),
                (.bottomLeft, .bottom, .leading),
                (.top, .top, .center),
                (.bottom, .bottom, .center),
            ]
        for (position, edge, placement) in cases {
            let bar = JdSnackbarView(message: "저장됨", position: position)
            XCTAssertEqual(bar.verticalEdge, edge, "세로 정렬 불일치: \(position.rawValue)")
            XCTAssertEqual(bar.horizontalPlacement, placement, "가로 정렬 불일치: \(position.rawValue)")
        }
    }

    // 위치 변경이 즉시 배치에 반영된다
    func test_position_didSet_updates_placement() {
        let bar = JdSnackbarView(message: "저장됨", position: .bottom)
        XCTAssertEqual(bar.horizontalPlacement, .center)
        bar.position = .topLeft
        XCTAssertEqual(bar.verticalEdge, .top)
        XCTAssertEqual(bar.horizontalPlacement, .leading)
    }

    func test_present_adds_to_container_and_schedules_auto_dismiss() {
        let container = UIView(frame: CGRect(x: 0, y: 0, width: 390, height: 844))
        let bar = JdSnackbarView(message: "저장됨", variant: .success, position: .bottom, duration: 4)
        bar.present(in: container)
        XCTAssertTrue(bar.isShowingForTests)
        XCTAssertTrue(bar.superview === container)
        XCTAssertTrue(bar.hasPendingAutoDismiss)
        bar.dismiss()
        XCTAssertNil(bar.superview)
        XCTAssertFalse(bar.hasPendingAutoDismiss)
    }

    // duration 0이면 자동 닫힘 타이머가 없다(수동 닫기 전용)
    func test_present_with_zero_duration_does_not_schedule() {
        let container = UIView()
        let bar = JdSnackbarView(message: "저장됨", position: .bottom, duration: 0)
        bar.present(in: container)
        XCTAssertFalse(bar.hasPendingAutoDismiss)
    }

    // 정지 중엔 자동 닫힘이 멈추고, 해제 시 다시 걸린다(WCAG 2.2.1)
    func test_setPaused_stops_and_resumes_auto_dismiss() {
        let container = UIView()
        let bar = JdSnackbarView(message: "저장됨", position: .bottom, duration: 4)
        bar.present(in: container)
        XCTAssertTrue(bar.hasPendingAutoDismiss)

        bar.setPaused(true)
        XCTAssertFalse(bar.hasPendingAutoDismiss)

        bar.setPaused(false)
        XCTAssertTrue(bar.hasPendingAutoDismiss)
        bar.dismiss()
    }

    // 결정적 시계 주입 — 자동 닫힘이 실제로 바를 제거하고 onDismiss를 알린다
    func test_auto_dismiss_removes_bar() {
        let container = UIView()
        let bar = JdSnackbarView(message: "저장됨", position: .bottom, duration: 4)
        bar.autoDismissSleep = { _ in }  // 즉시 반환
        var dismissed = false
        bar.onDismiss = { dismissed = true }
        bar.present(in: container)

        expectEventually("자동 닫힘으로 바가 제거된다") { bar.superview == nil && dismissed }
    }

    // 액션 버튼 탭은 onAction 후 바를 닫는다
    func test_action_tap_invokes_and_dismisses() {
        let container = UIView()
        var acted = false
        let bar = JdSnackbarView(
            message: "삭제됨", position: .bottom, duration: 0,
            actionLabel: "실행 취소", onAction: { acted = true })
        bar.present(in: container)
        bar.simulateActionTap()
        XCTAssertTrue(acted)
        XCTAssertNil(bar.superview)
    }
}

// MARK: - 지원

private extension UIView {
    var recursiveSubviews: [UIView] {
        subviews + subviews.flatMap { $0.recursiveSubviews }
    }
}

private extension JdSnackbarView {
    // 액션 버튼의 target-action을 직접 발화한다(앱 호스트 없는 xctest에서 sendActions는 무동작)
    func simulateActionTap() {
        for case let button as UIButton in recursiveSubviews {
            button.jdSendActions(for: .touchUpInside)
        }
    }
}

private extension XCTestCase {
    // 메인 런루프를 돌리며 조건이 참이 될 때까지 폴링한다(주입된 즉시 시계로 도는 비동기 닫힘용)
    @MainActor
    func expectEventually(
        _ description: String,
        timeout: TimeInterval = 2,
        _ condition: @escaping () -> Bool
    ) {
        let expectation = expectation(description: description)
        func poll() {
            if condition() {
                expectation.fulfill()
                return
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) { poll() }
        }
        poll()
        wait(for: [expectation], timeout: timeout)
        XCTAssertTrue(condition(), description)
    }
}
