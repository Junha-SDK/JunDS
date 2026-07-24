import XCTest
import SwiftUI
import JunDS

// 오버레이 SwiftUI 계층은 present 자체를 단위 테스트하기 어렵다(DESIGN-4 §D) — 각 뷰의 호스팅
// 스모크(조립·크기 축 통과)와 onDismissAttempt 게이트(false면 바인딩 유지)만 고정한다.
// 프레젠테이션 실동작은 쇼룸 실기동의 몫.

final class JdOverlayHostTests: XCTestCase {

    private func hosts<V: View>(_ view: V) -> Bool {
        UIHostingController(rootView: view).view != nil
    }

    func test_bottomSheet_hosts_all_sizes() {
        for size in JdOverlaySize.allCases {
            let view = JdBottomSheet(isPresented: .constant(false), size: size) { Text("본문") }
            XCTAssertTrue(hosts(view), "BottomSheet 호스팅 실패: \(size.rawValue)")
        }
    }

    func test_bottomSheet_persistent_and_nondraggable_host() {
        XCTAssertTrue(hosts(JdBottomSheet(isPresented: .constant(false),
                                          draggable: false, persistent: true) { Text("x") }))
    }

    func test_drawer_bottom_hosts() {
        let view = JdDrawer(isPresented: .constant(false), side: .bottom, title: "메뉴") { Text("본문") }
        XCTAssertTrue(hosts(view))
    }

    func test_drawer_side_overlays_host() {
        // 커스텀 슬라이드 경로 — isPresented=true로 패널 렌더까지 통과시킨다
        for side in [JdDrawerSide.left, .right] {
            let view = JdDrawer(isPresented: .constant(true), side: side, size: .md, title: "필터") {
                Text("본문")
            }
            XCTAssertTrue(hosts(view), "Drawer 호스팅 실패: \(side.rawValue)")
        }
    }

    func test_actionSheet_hosts() {
        let actions = [
            JdActionItem(id: "a", label: "공유"),
            JdActionItem(id: "b", label: "삭제", isDestructive: true),
        ]
        let view = JdActionSheet(isPresented: .constant(false), title: "옵션",
                                 actions: actions) { _ in }
        XCTAssertTrue(hosts(view))
    }

    func test_alertDialog_hosts() {
        let view = JdAlertDialog(isPresented: .constant(false), title: "삭제할까요?",
                                 message: "되돌릴 수 없습니다", isDestructive: true, onConfirm: {})
        XCTAssertTrue(hosts(view))
    }

    // MARK: onDismissAttempt 게이트

    @MainActor
    func test_dismissGate_vetoes_when_attempt_returns_false() {
        final class Box { var value = true }
        let box = Box()
        let binding = Binding(get: { box.value }, set: { box.value = $0 })

        JdOverlayDismissGate.apply(binding, reason: .backdrop, onDismissAttempt: { _ in false })
        XCTAssertTrue(box.value, "게이트 false면 바인딩이 유지돼야 한다")
    }

    @MainActor
    func test_dismissGate_allows_when_attempt_returns_true() {
        final class Box { var value = true }
        let box = Box()
        let binding = Binding(get: { box.value }, set: { box.value = $0 })

        JdOverlayDismissGate.apply(binding, reason: .backdrop, onDismissAttempt: { _ in true })
        XCTAssertFalse(box.value, "게이트 true면 닫혀야 한다")
    }

    @MainActor
    func test_dismissGate_allows_when_no_attempt() {
        final class Box { var value = true }
        let box = Box()
        let binding = Binding(get: { box.value }, set: { box.value = $0 })

        JdOverlayDismissGate.apply(binding, reason: .close, onDismissAttempt: nil)
        XCTAssertFalse(box.value, "게이트 없으면 닫혀야 한다")
    }

    @MainActor
    func test_dismissGate_passes_reason_to_attempt() {
        final class Box { var value = true }
        let box = Box()
        var seen: JdDismissReason?
        let binding = Binding(get: { box.value }, set: { box.value = $0 })

        JdOverlayDismissGate.apply(binding, reason: .escape, onDismissAttempt: { reason in
            seen = reason
            return false
        })
        XCTAssertEqual(seen, .escape)
    }
}
