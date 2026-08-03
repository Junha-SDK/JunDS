import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 오버레이 4종은 전부 시스템 프레젠테이션 위임이라 present 자체는 부모 VC 없이 단위 테스트가 어렵다.
// 그래서 (1) 액션 배열→UIAlertAction 변환·스타일 매핑, (2) 콜백 발화 경로, (3) delegate 게이트
// (onDismissAttempt)·side별 프레젠테이션 스타일만 정적으로 고정한다 (DESIGN-4 §D).

@MainActor
final class JdActionSheetControllerTests: XCTestCase {

    private let items = [
        JdActionItem(id: "share", label: "공유"),
        JdActionItem(id: "edit", label: "편집"),
        JdActionItem(id: "delete", label: "삭제", isDestructive: true),
    ]

    func test_actions_map_to_alertActions_with_labels() {
        let controller = JdActionSheetController(title: "옵션", actions: items) { _ in }
        let alert = controller.makeAlertController()
        // 항목 3개 + 취소 1개
        XCTAssertEqual(alert.actions.count, items.count + 1)
        for (index, item) in items.enumerated() {
            XCTAssertEqual(alert.actions[index].title, item.label)
        }
    }

    func test_destructive_item_maps_to_destructive_style() {
        let controller = JdActionSheetController(actions: items) { _ in }
        let alert = controller.makeAlertController()
        XCTAssertEqual(alert.actions[0].style, .default)  // 공유
        XCTAssertEqual(alert.actions[1].style, .default)  // 편집
        XCTAssertEqual(alert.actions[2].style, .destructive)  // 삭제
    }

    func test_cancel_action_present_with_cancel_style() {
        let controller = JdActionSheetController(actions: items, cancelLabel: "그만") { _ in }
        let alert = controller.makeAlertController()
        let cancel = alert.actions.last
        XCTAssertEqual(cancel?.style, .cancel)
        XCTAssertEqual(cancel?.title, "그만")
    }

    func test_select_fires_onSelect_with_item() {
        var received: JdActionItem?
        let controller = JdActionSheetController(actions: items) { received = $0 }
        controller.select(items[2])
        XCTAssertEqual(received, items[2])
    }

    func test_title_visibility_reflected_in_alert_title() {
        let titled = JdActionSheetController(title: "제목", message: "설명", actions: items) { _ in }
        XCTAssertEqual(titled.makeAlertController().title, "제목")
        XCTAssertEqual(titled.makeAlertController().message, "설명")

        let untitled = JdActionSheetController(actions: items) { _ in }
        XCTAssertNil(untitled.makeAlertController().title)
    }
}

@MainActor
final class JdAlertDialogControllerTests: XCTestCase {

    func test_confirm_and_cancel_buttons_present() {
        let controller = JdAlertDialogController(
            title: "삭제할까요?",
            confirmLabel: "삭제",
            cancelLabel: "취소",
            onConfirm: {})
        let alert = controller.makeAlertController()
        XCTAssertEqual(alert.actions.count, 2)
        let titles = alert.actions.map(\.title)
        XCTAssertTrue(titles.contains("삭제"))
        XCTAssertTrue(titles.contains("취소"))
    }

    func test_nil_cancelLabel_yields_single_confirm() {
        let controller = JdAlertDialogController(title: "알림", cancelLabel: nil, onConfirm: {})
        let alert = controller.makeAlertController()
        XCTAssertEqual(alert.actions.count, 1)
        XCTAssertEqual(alert.actions[0].title, "확인")
    }

    func test_isDestructive_maps_confirm_to_destructive_style() {
        let danger = JdAlertDialogController(
            title: "T", confirmLabel: "삭제",
            isDestructive: true, onConfirm: {})
        let alert = danger.makeAlertController()
        let confirm = alert.actions.first { $0.title == "삭제" }
        XCTAssertEqual(confirm?.style, .destructive)

        let safe = JdAlertDialogController(title: "T", confirmLabel: "확인", onConfirm: {})
        let confirmSafe = safe.makeAlertController().actions.first { $0.title == "확인" }
        XCTAssertEqual(confirmSafe?.style, .default)
    }

    func test_cancel_action_has_cancel_style() {
        let controller = JdAlertDialogController(title: "T", onConfirm: {})
        let cancel = controller.makeAlertController().actions.first { $0.title == "취소" }
        XCTAssertEqual(cancel?.style, .cancel)
    }

    func test_confirm_and_cancel_fire_callbacks() {
        var confirmed = false
        var cancelled = false
        let controller = JdAlertDialogController(
            title: "T",
            onConfirm: { confirmed = true },
            onCancel: { cancelled = true })
        controller.confirm()
        controller.cancel()
        XCTAssertTrue(confirmed)
        XCTAssertTrue(cancelled)
    }
}

@MainActor
final class JdBottomSheetControllerTests: XCTestCase {

    func test_detent_kind_from_size() {
        XCTAssertEqual(
            JdBottomSheetController(size: .md).detentKind,
            .fixedHeight(JdOverlaySize.md.sheetHeight))
        XCTAssertEqual(
            JdBottomSheetController(size: .sm).detentKind,
            .fixedHeight(JdOverlaySize.sm.sheetHeight))
        XCTAssertEqual(JdBottomSheetController(size: .full).detentKind, .large)
    }

    func test_resolvedDetents_count_matches_kind() {
        XCTAssertEqual(JdBottomSheetController(size: .md).resolvedDetents().count, 1)
        XCTAssertEqual(JdBottomSheetController(size: .full).resolvedDetents().count, 1)
    }

    func test_draggable_drives_grabber_intent() {
        XCTAssertTrue(JdBottomSheetController(draggable: true).prefersGrabber)
        XCTAssertFalse(JdBottomSheetController(draggable: false).prefersGrabber)
    }

    func test_interactiveDismiss_blocked_when_persistent_or_not_draggable() {
        XCTAssertFalse(
            JdBottomSheetController(draggable: true, persistent: false).isModalInPresentation)
        XCTAssertTrue(
            JdBottomSheetController(draggable: true, persistent: true).isModalInPresentation)
        XCTAssertTrue(
            JdBottomSheetController(draggable: false, persistent: false).isModalInPresentation)
    }

    func test_shouldDismiss_gate_blocks_when_onDismissAttempt_false() {
        let controller = JdBottomSheetController(draggable: true)
        controller.onDismissAttempt = { _ in false }
        let pc = UIPresentationController(presentedViewController: controller, presenting: nil)
        XCTAssertFalse(controller.presentationControllerShouldDismiss(pc))

        controller.onDismissAttempt = { _ in true }
        XCTAssertTrue(controller.presentationControllerShouldDismiss(pc))
    }

    func test_shouldDismiss_false_when_not_draggable() {
        let controller = JdBottomSheetController(draggable: false)
        let pc = UIPresentationController(presentedViewController: controller, presenting: nil)
        XCTAssertFalse(controller.presentationControllerShouldDismiss(pc))
    }
}

@MainActor
final class JdDrawerControllerTests: XCTestCase {

    func test_side_drives_presentation_style() {
        XCTAssertEqual(JdDrawerController(side: .bottom).modalPresentationStyle, .pageSheet)
        XCTAssertEqual(JdDrawerController(side: .left).modalPresentationStyle, .custom)
        XCTAssertEqual(JdDrawerController(side: .right).modalPresentationStyle, .custom)
    }

    func test_persistent_blocks_interactive_dismiss() {
        XCTAssertTrue(JdDrawerController(side: .right, persistent: true).isModalInPresentation)
        XCTAssertFalse(JdDrawerController(side: .right, persistent: false).isModalInPresentation)
    }

    func test_shouldDismiss_gate() {
        let controller = JdDrawerController(side: .bottom)
        let pc = UIPresentationController(presentedViewController: controller, presenting: nil)
        XCTAssertTrue(controller.presentationControllerShouldDismiss(pc))

        controller.onDismissAttempt = { _ in false }
        XCTAssertFalse(controller.presentationControllerShouldDismiss(pc))

        let persistent = JdDrawerController(side: .bottom, persistent: true)
        let pc2 = UIPresentationController(presentedViewController: persistent, presenting: nil)
        XCTAssertFalse(persistent.presentationControllerShouldDismiss(pc2))
    }

    func test_title_builds_header_with_close_button() {
        let controller = JdDrawerController(side: .right, title: "필터")
        controller.loadViewIfNeeded()
        XCTAssertEqual(controller.titleLabel?.text, "필터")
        XCTAssertEqual(controller.closeButton?.accessibilityLabel, "닫기")
    }

    func test_no_title_builds_no_header() {
        let controller = JdDrawerController(side: .right)
        controller.loadViewIfNeeded()
        XCTAssertNil(controller.titleLabel)
        XCTAssertNil(controller.closeButton)
    }

    func test_presentationController_is_custom_for_side_drawers() {
        let controller = JdDrawerController(side: .left, size: .md)
        let pc = controller.presentationController(
            forPresented: controller,
            presenting: nil,
            source: controller)
        XCTAssertTrue(pc is JdDrawerPresentationController)
    }

    func test_slide_animator_duration_routes_through_motion() {
        // JdMotion.duration 경유(Reduce Motion 시 0) — 전역 상태와 무관하게 동일 경로를 검증
        let animator = JdDrawerSlideAnimator(side: .left, isPresenting: true)
        XCTAssertEqual(
            animator.transitionDuration(using: nil),
            JdMotion.duration(JdToken.Duration.normal), accuracy: 0.0001)
    }
}
