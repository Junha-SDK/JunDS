import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// UIKit 뷰: init 후 기본 상태·프로퍼티 didSet 반영·접근성 표면 (DESIGN-2 §C).
final class JdAvatarViewTests: XCTestCase {

    private let lightTraits = UITraitCollection(userInterfaceStyle: .light)

    private func resolved(_ color: UIColor?) -> UIColor? {
        color?.resolvedColor(with: lightTraits)
    }

    private func makeImage() -> UIImage {
        UIGraphicsImageRenderer(size: CGSize(width: 4, height: 4)).image { context in
            UIColor.gray.setFill()
            context.fill(CGRect(x: 0, y: 0, width: 4, height: 4))
        }
    }

    // 이미지가 없으면 이니셜 폴백 — 글자는 Core, 색은 이름 해시(같은 이름 = 같은 색)
    func test_initials_fallback_when_no_image() {
        let view = JdAvatarView(name: "Ada Lovelace")
        XCTAssertFalse(view.initialsLabel.isHidden)
        XCTAssertTrue(view.imageView.isHidden)
        XCTAssertEqual(view.initialsLabel.text, "AL")
        XCTAssertEqual(resolved(view.initialsLabel.textColor),
                       resolved(JdAvatarSpec.fallbackColor(for: "Ada Lovelace").uiColor))
    }

    // 이름이 비었거나 공백뿐이면 웹과 동일하게 "?" — Core initials의 공백 반환을 렌더가 흡수한다
    func test_empty_name_falls_back_to_question_mark() {
        XCTAssertEqual(JdAvatarView(name: "").initialsLabel.text, "?")
        XCTAssertEqual(JdAvatarView(name: "   ").initialsLabel.text, "?")
    }

    // 웹 src 유무 전환 동형 — 이미지가 들어오면 폴백이 물러나고, 빠지면 되돌아온다
    func test_image_toggles_between_photo_and_fallback() {
        let view = JdAvatarView(name: "홍 길동")
        XCTAssertNil(view.imageView.image)

        view.image = makeImage()
        XCTAssertNotNil(view.imageView.image)
        XCTAssertFalse(view.imageView.isHidden)
        XCTAssertTrue(view.initialsLabel.isHidden)
        XCTAssertNil(view.backgroundColor) // 사진이 원을 채우므로 폴백 배경은 걷는다

        view.image = nil
        XCTAssertTrue(view.imageView.isHidden)
        XCTAssertFalse(view.initialsLabel.isHidden)
        XCTAssertEqual(view.initialsLabel.text, "홍길")
        XCTAssertEqual(resolved(view.backgroundColor),
                       resolved(JdToken.Color.borderLight.uiColor))
    }

    // 상태 도트: nil이면 아예 없다(웹 dot.remove() 동형), 있으면 색 + accessibilityValue
    func test_status_dot_appears_and_reports_value() {
        let view = JdAvatarView(name: "Ada", status: .online)
        XCTAssertFalse(view.statusDot.isHidden)
        XCTAssertEqual(resolved(view.statusDot.backgroundColor),
                       resolved(JdAvatarSpec.statusColor(.online).uiColor))
        XCTAssertEqual(view.accessibilityValue, "온라인")

        view.status = .busy
        XCTAssertEqual(resolved(view.statusDot.backgroundColor),
                       resolved(JdAvatarSpec.statusColor(.busy).uiColor))
        XCTAssertEqual(view.accessibilityValue, "다른 용무 중")

        view.status = nil
        XCTAssertTrue(view.statusDot.isHidden)
        XCTAssertNil(view.accessibilityValue)
    }

    // 04 §7.1 — 하나의 요소로 합치고 라벨 = name(비면 "아바타")
    func test_accessibility_is_single_element_with_name_label() {
        let named = JdAvatarView(name: "Ada Lovelace")
        XCTAssertTrue(named.isAccessibilityElement)
        XCTAssertEqual(named.accessibilityLabel, "Ada Lovelace")
        XCTAssertNil(named.accessibilityValue)

        let anonymous = JdAvatarView()
        XCTAssertEqual(anonymous.accessibilityLabel, "아바타")
    }

    // 치수는 스펙이 준 정사각 — 크기 축 단조성도 함께 확인
    func test_intrinsic_size_follows_spec_ramp() {
        let xs = JdAvatarView(name: "A", size: .xs)
        let xl = JdAvatarView(name: "A", size: .xl)
        XCTAssertEqual(xs.intrinsicContentSize,
                       CGSize(width: JdAvatarSpec.resolve(size: .xs).side,
                              height: JdAvatarSpec.resolve(size: .xs).side))
        XCTAssertGreaterThan(xl.intrinsicContentSize.width, xs.intrinsicContentSize.width)
        XCTAssertGreaterThan(xl.initialsLabel.font.pointSize, xs.initialsLabel.font.pointSize)
    }

    // Dynamic Type 필수 플래그 (04 §7.2)
    func test_initials_label_scales_with_dynamic_type() {
        let view = JdAvatarView(name: "Ada")
        XCTAssertTrue(view.initialsLabel.adjustsFontForContentSizeCategory)
    }
}

final class JdSpinnerViewTests: XCTestCase {

    override func tearDown() {
        JdMotion.isReduced = { false }
        super.tearDown()
    }

    // 04 §7.3 — Reduce Motion이면 회전을 멈추고 정지 프레임을 남긴다(숨기지 않는다)
    func test_stops_spinning_when_reduce_motion_is_on() {
        JdMotion.isReduced = { true }
        let view = JdSpinnerView()
        XCTAssertFalse(view.isAnimating)
        XCTAssertFalse(view.isHidden)
    }

    func test_spins_when_reduce_motion_is_off() {
        JdMotion.isReduced = { false }
        let view = JdSpinnerView()
        XCTAssertTrue(view.isAnimating)
    }

    // 웹 role=status + aria-label 동형
    func test_accessibility_surface() {
        let view = JdSpinnerView()
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertEqual(view.accessibilityLabel, JdSpinnerSpec.defaultLabel)
        XCTAssertTrue(view.accessibilityTraits.contains(.updatesFrequently))

        view.label = "저장 중"
        XCTAssertEqual(view.accessibilityLabel, "저장 중")
    }

    func test_intrinsic_size_follows_spec() {
        for size in JdDisplaySize.allCases {
            let spec = JdSpinnerSpec.resolve(size: size)
            XCTAssertEqual(JdSpinnerView(size: size).intrinsicContentSize,
                           CGSize(width: spec.side, height: spec.side))
        }
    }
}

final class JdKbdViewTests: XCTestCase {

    // 웹 keys attribute 동형 — 공백 제거는 Core가 하고 뷰는 결과만 그린다
    func test_keys_are_normalized_on_init_and_assignment() {
        let view = JdKbdView("⌘ K")
        XCTAssertEqual(view.text, "⌘K")

        view.keys = "Ctrl + Shift + P"
        XCTAssertEqual(view.text, "Ctrl+Shift+P")
    }

    // 웹 padding 2/6 동형 — intrinsic이 좌우/상하 패딩만큼 커진다
    func test_intrinsic_size_includes_padding() {
        let spec = JdKbdSpec.resolve()
        let view = JdKbdView("⌘K")
        let bare = UILabel()
        bare.font = view.font
        bare.text = view.text
        XCTAssertEqual(view.intrinsicContentSize.width,
                       bare.intrinsicContentSize.width + spec.hPadding * 2,
                       accuracy: 0.5)
        XCTAssertEqual(view.intrinsicContentSize.height,
                       bare.intrinsicContentSize.height + spec.vPadding * 2,
                       accuracy: 0.5)
    }

    // 웹 font-family mono + muted 글자색
    func test_style_uses_mono_font_and_muted_color() {
        let view = JdKbdView("⌘K")
        XCTAssertTrue(view.font.fontDescriptor.symbolicTraits.contains(.traitMonoSpace))
        XCTAssertEqual(view.textColor.resolvedColor(with: UITraitCollection(userInterfaceStyle: .light)),
                       JdToken.Color.muted.uiColor.resolvedColor(with: UITraitCollection(userInterfaceStyle: .light)))
        XCTAssertTrue(view.adjustsFontForContentSizeCategory)
    }
}

final class JdKeyCapViewTests: XCTestCase {

    override func tearDown() {
        JdMotion.isReduced = { false }
        super.tearDown()
    }

    // 웹 translateY(1px) 동형 — 눌리면 1pt 내려앉고 풀리면 되돌아온다
    func test_pressed_applies_offset_transform() {
        let view = JdKeyCapView("⌘")
        XCTAssertEqual(view.transform.ty, 0, accuracy: 0.001)

        view.isPressed = true
        XCTAssertEqual(view.transform.ty, JdKeyCapSpec.pressedOffset, accuracy: 0.001)

        view.isPressed = false
        XCTAssertEqual(view.transform.ty, 0, accuracy: 0.001)
    }

    // init에서 눌린 상태로 들어와도 오프셋이 반영된다
    func test_initially_pressed_starts_offset() {
        let view = JdKeyCapView("⌘", isPressed: true)
        XCTAssertEqual(view.transform.ty, JdKeyCapSpec.pressedOffset, accuracy: 0.001)
    }

    // Reduce Motion이면 JdMotion.duration이 0 → 애니메이션 없이 즉시 반영 (04 §7.3)
    func test_pressed_applies_immediately_under_reduce_motion() {
        JdMotion.isReduced = { true }
        let view = JdKeyCapView("⌘")
        view.isPressed = true
        XCTAssertEqual(view.transform.ty, JdKeyCapSpec.pressedOffset, accuracy: 0.001)
    }

    // 웹 box-shadow: default variant만 입체, 눌리면 제거
    func test_shadow_only_on_default_variant_and_released() {
        let standard = JdKeyCapView("⌘")
        XCTAssertGreaterThan(standard.layer.shadowOpacity, 0)

        standard.isPressed = true
        XCTAssertEqual(standard.layer.shadowOpacity, 0, accuracy: 0.001)

        let primary = JdKeyCapView("⌘", variant: .primary)
        XCTAssertEqual(primary.layer.shadowOpacity, 0, accuracy: 0.001)
    }

    // 웹 height/min-width는 하한 — 내용이 커지면 자란다 (04 §7.2)
    func test_intrinsic_size_respects_spec_minimums() {
        for size in JdDisplaySize.allCases {
            let spec = JdKeyCapSpec.resolve(variant: .default, size: size)
            let view = JdKeyCapView("⌘", size: size)
            XCTAssertGreaterThanOrEqual(view.intrinsicContentSize.width, spec.minWidth)
            XCTAssertGreaterThanOrEqual(view.intrinsicContentSize.height, spec.height)
        }
        let wide = JdKeyCapView("Shift", size: .sm)
        XCTAssertGreaterThan(wide.intrinsicContentSize.width,
                             JdKeyCapSpec.resolve(variant: .default, size: .sm).minWidth)
    }

    // variant별 색은 전부 스펙에서 온다
    func test_colors_come_from_spec() {
        let light = UITraitCollection(userInterfaceStyle: .light)
        for variant in JdKeyCapVariant.allCases {
            let spec = JdKeyCapSpec.resolve(variant: variant, size: .md)
            let view = JdKeyCapView("⌘", variant: variant)
            XCTAssertEqual(view.backgroundColor?.resolvedColor(with: light),
                           spec.background.uiColor.resolvedColor(with: light))
            XCTAssertEqual(view.textColor.resolvedColor(with: light),
                           spec.foreground.uiColor.resolvedColor(with: light))
        }
    }
}
