import JunDS
import SwiftUI
import XCTest

// Toast/Snackbar SwiftUI 계층 — JdToastCenter 큐 전이·자동닫힘·정지 + 호스팅 스모크 + position 정렬.
// (JdToastCenter는 @MainActor라 테스트 클래스도 @MainActor.)

@MainActor
final class JdToastCenterTests: XCTestCase {

    // show/dismiss/clear가 Core 큐를 갱신한다(duration 0으로 타이머 없이 결정적으로)
    func test_show_dismiss_clear_drive_queue() {
        let center = JdToastCenter(maxVisible: 4)
        let idA = center.show(JdToast(title: "A", duration: 0))
        let idB = center.show(JdToast(title: "B", duration: 0))
        XCTAssertEqual(center.queue.visible.map { $0.id }, [idA, idB])

        center.dismiss(idA)
        XCTAssertEqual(center.queue.visible.map { $0.id }, [idB])

        center.clear()
        XCTAssertTrue(center.queue.visible.isEmpty)
    }

    // max 초과 시 가장 오래된 것이 축출된다(웹 max 동형)
    func test_show_evicts_oldest_beyond_max() {
        let center = JdToastCenter(maxVisible: 2)
        let idA = center.show(JdToast(title: "A", duration: 0))
        let idB = center.show(JdToast(title: "B", duration: 0))
        let idC = center.show(JdToast(title: "C", duration: 0))
        XCTAssertEqual(center.queue.visible.map { $0.id }, [idB, idC])
        XCTAssertFalse(center.queue.visible.contains { $0.id == idA })
    }

    // duration>0이면 자동 닫힘이 큐를 비운다(짧은 duration으로 실측)
    func test_positive_duration_auto_dismisses() {
        let center = JdToastCenter(maxVisible: 4)
        center.show(JdToast(message: "auto", duration: 0.1))
        XCTAssertEqual(center.queue.visible.count, 1)
        expectEventually("자동 닫힘으로 큐가 비워진다") { center.queue.visible.isEmpty }
    }

    // duration 0은 자동 닫히지 않는다(수동 닫기 전용)
    func test_zero_duration_stays() {
        let center = JdToastCenter(maxVisible: 4)
        center.show(JdToast(message: "manual", duration: 0))
        // 잠시 런루프를 돌려도 남아 있어야 한다
        let idle = expectation(description: "idle")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { idle.fulfill() }
        wait(for: [idle], timeout: 1)
        XCTAssertEqual(center.queue.visible.count, 1)
    }

    // 정지 중엔 자동 닫힘이 진행하지 않고, 해제 시 다시 잰다(WCAG 2.2.1)
    func test_pause_holds_auto_dismiss_then_resumes() {
        let center = JdToastCenter(maxVisible: 4)
        center.show(JdToast(message: "auto", duration: 0.1))
        center.setPaused(true)

        // 정지 상태에서 duration을 넘겨도 남아 있다
        let held = expectation(description: "held")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { held.fulfill() }
        wait(for: [held], timeout: 1)
        XCTAssertEqual(center.queue.visible.count, 1, "정지 중엔 닫히지 않아야 한다")

        // 해제하면 처음부터 다시 재어 결국 닫힌다
        center.setPaused(false)
        expectEventually("해제 후 자동 닫힘") { center.queue.visible.isEmpty }
    }
}

@MainActor
final class JdToastHostSmokeTests: XCTestCase {

    private func fit<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: 390, height: 844))
    }

    // .jdToastHost가 오버레이로 붙어도 호스팅이 깨지지 않는다(빈 큐)
    func test_jdToastHost_hosts_empty() {
        let base = Color.clear.frame(width: 390, height: 844)
        let size = fit(base.jdToastHost(JdToastCenter(), position: .topRight))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // 큐에 토스트가 있어도, position 6종 전부 호스팅된다
    func test_jdToastHost_hosts_all_positions_with_toasts() {
        for position in JdToastPosition.allCases {
            let center = JdToastCenter(maxVisible: 4)
            center.show(JdToast(title: "제목", message: "본문", variant: .success, duration: 0))
            let base = Color.clear.frame(width: 390, height: 844)
            let size = fit(base.jdToastHost(center, position: position))
            XCTAssertGreaterThan(size.width, 0, "호스팅 실패: \(position.rawValue)")
            center.clear()
        }
    }

    // position이 정렬을 가르는 Core 축(isTop/isLeading/isCentered)이 계약대로다 —
    // 호스트/스낵바의 Alignment 매핑이 이 3축에서 파생된다.
    func test_position_alignment_axes() {
        let expected: [JdToastPosition: (top: Bool, leading: Bool, centered: Bool)] = [
            .topRight: (true, false, false),
            .topLeft: (true, true, false),
            .bottomRight: (false, false, false),
            .bottomLeft: (false, true, false),
            .top: (true, false, true),
            .bottom: (false, false, true),
        ]
        for (position, axes) in expected {
            XCTAssertEqual(position.isTop, axes.top, "isTop 불일치: \(position.rawValue)")
            XCTAssertEqual(position.isLeading, axes.leading, "isLeading 불일치: \(position.rawValue)")
            XCTAssertEqual(
                position.isCentered, axes.centered, "isCentered 불일치: \(position.rawValue)")
        }
    }
}

@MainActor
final class JdSnackbarHostTests: XCTestCase {

    private func fit<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: 390, height: 844))
    }

    // 표시 상태의 스낵바가 위치·variant 전반에서 호스팅된다
    func test_jdSnackbar_hosts_when_presented() {
        for position in JdToastPosition.allCases {
            let base = Color.clear.frame(width: 390, height: 844)
            let bar = JdSnackbar(
                isPresented: .constant(true),
                message: "저장됨",
                variant: .success,
                position: position,
                duration: 0,
                actionLabel: "실행 취소",
                onAction: {})
            let size = fit(base.overlay(bar))
            XCTAssertGreaterThan(size.width, 0, "호스팅 실패: \(position.rawValue)")
        }
    }

    // 닫힌 상태(default 배경 경로)도 호스팅이 깨지지 않는다
    func test_jdSnackbar_hosts_when_hidden_default_variant() {
        let base = Color.clear.frame(width: 390, height: 844)
        let bar = JdSnackbar(isPresented: .constant(false), message: "숨김", position: .bottom)
        let size = fit(base.overlay(bar))
        XCTAssertGreaterThan(size.width, 0)
    }
}

// MARK: - 지원

private extension XCTestCase {
    // 메인 런루프를 돌리며 조건이 참이 될 때까지 폴링한다(짧은 duration 자동 닫힘용)
    @MainActor
    func expectEventually(
        _ description: String,
        timeout: TimeInterval = 3,
        _ condition: @escaping () -> Bool
    ) {
        let expectation = expectation(description: description)
        func poll() {
            if condition() {
                expectation.fulfill()
                return
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.02) { poll() }
        }
        poll()
        wait(for: [expectation], timeout: timeout)
        XCTAssertTrue(condition(), description)
    }
}
