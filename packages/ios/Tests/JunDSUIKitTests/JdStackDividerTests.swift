import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

@MainActor
final class JdStackViewTests: XCTestCase {

    // 기본값 3케이스 — 웹 jd-vstack 동형: column·gap md(16)·stretch(→.fill)

    func test_default_axis_is_vertical() {
        XCTAssertEqual(JdStackView().axis, .vertical)
    }

    func test_default_spacing_is_md_gap() {
        XCTAssertEqual(JdStackView().spacing, JdGap.md.value)
        XCTAssertEqual(JdStackView().spacing, JdToken.Space.s4)
    }

    func test_default_alignment_is_fill() {
        XCTAssertEqual(JdStackView().alignment, .fill)
    }

    func test_gap_didSet_updates_spacing() {
        let stack = JdStackView()
        stack.gap = .lg
        XCTAssertEqual(stack.spacing, JdToken.Space.s6)
        stack.gap = .custom(JdToken.Space.s3)
        XCTAssertEqual(stack.spacing, JdToken.Space.s3)
    }

    // 웹 jd-hstack 기본 동형: row·gap sm(8)·align center
    func test_horizontal_factory_matches_web_hstack_defaults() {
        let stack = JdStackView.horizontal([UIView(), UIView()])
        XCTAssertEqual(stack.axis, .horizontal)
        XCTAssertEqual(stack.spacing, JdGap.sm.value)
        XCTAssertEqual(stack.alignment, .center)
        XCTAssertEqual(stack.arrangedSubviews.count, 2)
    }

    // 웹 jd-vstack 기본 동형: column·gap md(16)·stretch(→.fill)
    func test_vertical_factory_matches_web_vstack_defaults() {
        let stack = JdStackView.vertical([UIView()])
        XCTAssertEqual(stack.axis, .vertical)
        XCTAssertEqual(stack.spacing, JdGap.md.value)
        XCTAssertEqual(stack.alignment, .fill)
        XCTAssertEqual(stack.arrangedSubviews.count, 1)
    }
}

@MainActor
final class JdDividerViewTests: XCTestCase {

    // 선 두께는 intrinsic으로 축 고정(1pt = JdToken.Border.thin), 길이 축은 소비자 몫

    func test_horizontal_intrinsic_fixes_height_to_thin() {
        let divider = JdDividerView()
        XCTAssertEqual(divider.intrinsicContentSize.height, JdToken.Border.thin)
        XCTAssertEqual(divider.intrinsicContentSize.width, UIView.noIntrinsicMetric)
    }

    func test_vertical_intrinsic_fixes_width_to_thin() {
        let divider = JdDividerView(orientation: .vertical)
        XCTAssertEqual(divider.intrinsicContentSize.width, JdToken.Border.thin)
        XCTAssertEqual(divider.intrinsicContentSize.height, UIView.noIntrinsicMetric)
    }

    // role=separator의 iOS 번역 — 라벨 없으면 장식(접근성 트리 제외)
    func test_plain_divider_is_decorative_for_accessibility() {
        let divider = JdDividerView()
        XCTAssertFalse(divider.isAccessibilityElement)
        XCTAssertNil(divider.accessibilityLabel)
    }

    // 라벨 모드: line—label—line 3분할, gap 12(--jd-space-3)
    func test_label_mode_builds_line_label_line() {
        let divider = JdDividerView(label: "또는")
        guard let stack = divider.subviews.first as? JdStackView else {
            XCTFail("라벨 모드 내부 스택 없음")
            return
        }
        XCTAssertEqual(stack.arrangedSubviews.count, 3)
        XCTAssertEqual(stack.spacing, JdToken.Space.s3)
        let middle = stack.arrangedSubviews[1] as? UILabel
        XCTAssertEqual(middle?.text, "또는")
        XCTAssertEqual(middle?.adjustsFontForContentSizeCategory, true)
        XCTAssertFalse(stack.arrangedSubviews[0] is UILabel)
        XCTAssertFalse(stack.arrangedSubviews[2] is UILabel)
    }

    func test_label_mode_exposes_label_to_accessibility() {
        let divider = JdDividerView(label: "또는")
        XCTAssertTrue(divider.isAccessibilityElement)
        XCTAssertEqual(divider.accessibilityLabel, "또는")
    }

    // label 세터로 두 모드를 오간다 — 순수 선으로 복귀 시 intrinsic도 1pt로 복원
    func test_label_setter_switches_between_modes() {
        let divider = JdDividerView()
        divider.label = "또는"
        XCTAssertTrue(divider.isAccessibilityElement)
        XCTAssertEqual(divider.subviews.count, 1)
        divider.label = nil
        XCTAssertFalse(divider.isAccessibilityElement)
        XCTAssertTrue(divider.subviews.isEmpty)
        XCTAssertEqual(divider.intrinsicContentSize.height, JdToken.Border.thin)
    }
}
