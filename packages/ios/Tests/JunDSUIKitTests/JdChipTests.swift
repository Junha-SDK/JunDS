import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

@MainActor
final class JdIconButtonViewTests: XCTestCase {

    private func makeView(size: JdIconButtonSize) -> JdIconButtonView {
        JdIconButtonView(systemImage: "xmark", accessibilityLabel: "닫기", size: size)
    }

    // 웹 정사각 히트 타깃 4종 — 변은 스펙 하한 이상(Dynamic Type에서 자란다, 04 §7.2)
    func test_all_sizes_are_square_and_at_least_spec_side() {
        for size in JdIconButtonSize.allCases {
            let view = makeView(size: size)
            let intrinsic = view.intrinsicContentSize
            let side = JdIconButtonSpec.resolve(variant: .ghost, size: size).side
            XCTAssertEqual(intrinsic.width, intrinsic.height, accuracy: 0.001, "\(size)")
            XCTAssertGreaterThanOrEqual(intrinsic.width, side, "\(size)")
        }
        XCTAssertEqual(JdIconButtonSize.allCases.count, 4)
    }

    // 크기 램프 xs 24 < sm 28 < md 32 < lg 40 — 인접은 비감소, 끝점은 확실히 벌어진다
    func test_size_ramp_does_not_shrink() {
        let widths = JdIconButtonSize.allCases.map { makeView(size: $0).intrinsicContentSize.width }
        for (smaller, larger) in zip(widths, widths.dropFirst()) {
            XCTAssertLessThanOrEqual(smaller, larger)
        }
        XCTAssertGreaterThan(widths.last ?? 0, widths.first ?? 0)
    }

    // 아이콘 전용 컨트롤은 라벨이 유일한 VoiceOver 표면 — init 인자가 그대로 노출된다 (04 §7.1)
    func test_accessibility_label_is_exposed_as_given() {
        let view = makeView(size: .md)
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertTrue(view.accessibilityTraits.contains(.button))
        XCTAssertEqual(view.accessibilityLabel, "닫기")
    }

    func test_onTap_fires_on_touch_up_inside() {
        let view = makeView(size: .md)
        var taps = 0
        view.onTap = { taps += 1 }
        view.jdSendActions(for: .touchUpInside)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(taps, 2)
    }

    // variant별 표면: outline만 테두리, filled는 primary 배경
    func test_variant_border_and_background() {
        let ghost = JdIconButtonView(systemImage: "gear", accessibilityLabel: "설정", variant: .ghost)
        XCTAssertEqual(ghost.layer.borderWidth, 0)

        let outline = JdIconButtonView(
            systemImage: "gear", accessibilityLabel: "설정", variant: .outline)
        XCTAssertEqual(outline.layer.borderWidth, JdToken.Border.thin)

        let filled = JdIconButtonView(
            systemImage: "gear", accessibilityLabel: "설정", variant: .filled)
        let light = UITraitCollection(userInterfaceStyle: .light)
        XCTAssertEqual(
            filled.backgroundColor?.resolvedColor(with: light),
            JdToken.Color.primary.uiColor.resolvedColor(with: light))
    }

    // 웹 :disabled opacity-50 동형
    func test_disabled_dims_to_token_opacity() {
        let view = makeView(size: .md)
        XCTAssertEqual(view.alpha, 1, accuracy: 0.001)
        view.isEnabled = false
        XCTAssertEqual(view.alpha, CGFloat(JdToken.Opacity.o50), accuracy: 0.001)
    }
}

@MainActor
final class JdBadgeViewTests: XCTestCase {

    private func laidOut(_ view: JdBadgeView) -> JdBadgeView {
        view.frame = CGRect(origin: .zero, size: view.intrinsicContentSize)
        view.setNeedsLayout()
        view.layoutIfNeeded()
        return view
    }

    // 카운트 모드 = 원형 18pt — 한 자리면 정원, 반지름은 높이의 절반(웹 radius-full 동형)
    func test_count_mode_is_a_circle_of_min_diameter() {
        let view = laidOut(JdBadgeView(count: 3))
        XCTAssertEqual(view.contentLabel.text, "3")
        XCTAssertGreaterThanOrEqual(view.bounds.height, JdBadgeSpec.countDiameter)
        XCTAssertEqual(view.bounds.width, view.bounds.height, accuracy: 0.001)
        XCTAssertEqual(view.layer.cornerRadius, view.bounds.height / 2, accuracy: 0.001)
    }

    // 자릿수가 늘면 알약으로 늘어난다 + maxCount 초과 표기는 Core가 판정한다
    func test_count_mode_overflow_widens_into_a_pill() {
        let view = laidOut(JdBadgeView(count: 150, maxCount: 99))
        XCTAssertEqual(view.contentLabel.text, "99+")
        XCTAssertGreaterThan(view.bounds.width, view.bounds.height)
        XCTAssertEqual(view.layer.cornerRadius, view.bounds.height / 2, accuracy: 0.001)
    }

    // 카운트 모드는 도트를 갖지 않고 danger 고정
    func test_count_mode_is_danger_without_dot() {
        let view = JdBadgeView(count: 1)
        let light = UITraitCollection(userInterfaceStyle: .light)
        XCTAssertTrue(view.dotView.isHidden)
        XCTAssertEqual(
            view.backgroundColor?.resolvedColor(with: light),
            JdToken.Color.danger.uiColor.resolvedColor(with: light))
    }

    // 웹 dot attribute 동형 — 표시 여부가 프로퍼티를 따라간다(장식이라 접근성 트리 제외)
    func test_dot_visibility_follows_showsDot() {
        let view = JdBadgeView("배포됨", variant: .success)
        XCTAssertTrue(view.dotView.isHidden)
        XCTAssertFalse(view.dotView.isAccessibilityElement)
        view.showsDot = true
        XCTAssertFalse(view.dotView.isHidden)
    }

    // variant/size didSet → 스펙 재결의 (텍스트 모드)
    func test_variant_and_size_change_reapply_spec() {
        let view = JdBadgeView("라벨")
        let light = UITraitCollection(userInterfaceStyle: .light)
        XCTAssertEqual(
            view.layer.cornerRadius, JdBadgeSpec.resolve(variant: .default, size: .md).radius)

        view.variant = .outline
        XCTAssertEqual(view.layer.borderWidth, JdToken.Border.thin)
        XCTAssertEqual(
            view.contentLabel.textColor.resolvedColor(with: light),
            JdToken.Color.foreground.uiColor.resolvedColor(with: light))

        let mdHeight = view.intrinsicContentSize.height
        view.size = .sm
        XCTAssertLessThan(view.intrinsicContentSize.height, mdHeight)
    }
}

@MainActor
final class JdTagViewTests: XCTestCase {

    func test_onRemove_fires_from_close_button() {
        var removed = 0
        let view = JdTagView("SwiftUI", color: .blue, onRemove: { removed += 1 })
        XCTAssertFalse(view.closeButton.isHidden)
        view.closeButton.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(removed, 1)
    }

    // 웹 aria-label "삭제" 리터럴 동형 — 아이콘 전용 버튼이라 라벨이 유일한 표면 (04 §7.1)
    func test_close_button_has_localized_accessibility_label() {
        let view = JdTagView("SwiftUI", onRemove: {})
        XCTAssertEqual(view.closeButton.accessibilityLabel, "삭제")
        XCTAssertNotNil(view.closeButton.image(for: .normal))
    }

    // 콜백이 없으면 닫기 버튼 자체가 없다(웹 closable 부재 동형) — 나중에 붙이면 나타난다
    func test_close_button_absent_without_callback() {
        let view = JdTagView("읽기 전용")
        XCTAssertTrue(view.closeButton.isHidden)
        let withoutClose = measuredWidth(view)
        view.onRemove = {}
        XCTAssertFalse(view.closeButton.isHidden)
        XCTAssertGreaterThan(measuredWidth(view), withoutClose)
    }

    // 스택의 arranged 숨김 반영을 확정한 뒤 재는 헬퍼
    private func measuredWidth(_ view: JdTagView) -> CGFloat {
        view.frame = CGRect(origin: .zero, size: view.intrinsicContentSize)
        view.setNeedsLayout()
        view.layoutIfNeeded()
        return view.intrinsicContentSize.width
    }

    // color didSet → 팔레트 재결의 (primary만 토큰, 나머지는 v2 리터럴 승계)
    func test_color_change_reapplies_palette() {
        let view = JdTagView("태그")
        let light = UITraitCollection(userInterfaceStyle: .light)
        view.color = .primary
        XCTAssertEqual(
            view.backgroundColor?.resolvedColor(with: light),
            JdToken.Color.primaryLight.uiColor.resolvedColor(with: light))
        XCTAssertEqual(
            view.contentLabel.textColor.resolvedColor(with: light),
            JdToken.Color.primary.uiColor.resolvedColor(with: light))
    }
}
