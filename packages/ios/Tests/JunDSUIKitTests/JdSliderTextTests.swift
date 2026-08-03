import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// MARK: - 공용 탐색 도우미

/// 내부 뷰를 API로 노출하지 않고도 표면을 검증하기 위한 계층 탐색(추가 전용 — 컴포넌트 오염 방지)
private func descendants<T: UIView>(_ root: UIView, _ type: T.Type) -> [T] {
    var found: [T] = []
    for child in root.subviews {
        if let match = child as? T { found.append(match) }
        found.append(contentsOf: descendants(child, type))
    }
    return found
}

/// 부모 사슬 중 하나라도 숨겨져 있으면 화면에 없다 — 스택 숨김 검증용
private func isVisible(_ view: UIView) -> Bool {
    var current: UIView? = view
    while let node = current {
        if node.isHidden { return false }
        current = node.superview
    }
    return true
}

@MainActor
final class JdSliderViewTests: XCTestCase {

    // 값 세터는 Core 양자화를 통과한다 — UISlider와 헤더가 같은 값을 본다
    func test_value_is_quantized_and_reflected_into_slider_and_header() {
        let view = JdSliderView(value: 0, in: 0...100, step: 5, showsValue: true)
        view.value = 32
        XCTAssertEqual(view.value, 30, accuracy: 0.0001)

        let slider = descendants(view, UISlider.self).first
        XCTAssertNotNil(slider)
        XCTAssertEqual(Double(slider?.value ?? 0), 30, accuracy: 0.001)
        XCTAssertNotNil(descendants(view, UILabel.self).first { $0.text == "30" })
    }

    func test_value_setter_clamps_to_bounds() {
        let view = JdSliderView(value: 0, in: 0...50, step: 1)
        view.value = 999
        XCTAssertEqual(view.value, 50, accuracy: 0.0001)
        view.value = -999
        XCTAssertEqual(view.value, 0, accuracy: 0.0001)
    }

    // 웹 show-value 동형 — 헤더 행(min/현재값/max) 노출 토글
    func test_showsValue_toggles_header_visibility() {
        let view = JdSliderView(value: 30, in: 0...100, step: 5, showsValue: false)
        guard let display = descendants(view, UILabel.self).first(where: { $0.text == "30" }) else {
            return XCTFail("현재값 라벨 없음")
        }
        XCTAssertFalse(isVisible(display))
        view.showsValue = true
        XCTAssertTrue(isVisible(display))
        XCTAssertNotNil(descendants(view, UILabel.self).first { $0.text == "100" })  // max 라벨
    }

    // format은 현재값·접근성 값에만 적용된다(min/max는 원값 — 웹 동형)
    func test_format_applies_to_display_and_accessibility_value() {
        let view = JdSliderView(value: 40, in: 0...100, step: 10, showsValue: true)
        view.format = { "\(Int($0))%" }
        XCTAssertNotNil(descendants(view, UILabel.self).first { $0.text == "40%" })
        XCTAssertEqual(descendants(view, UISlider.self).first?.accessibilityValue, "40%")
    }

    // 마크는 장식 — 라벨은 그리되 접근성에서 제외한다
    func test_marks_render_labels_and_stay_out_of_accessibility() {
        let view = JdSliderView(
            value: 0, in: 0...100, step: 1,
            marks: [JdSliderMark(value: 50, label: "중간")])
        guard let markLabel = descendants(view, UILabel.self).first(where: { $0.text == "중간" })
        else {
            return XCTFail("마크 라벨 없음")
        }
        var container: UIView? = markLabel.superview
        var hidden = false
        while let node = container {
            if node.accessibilityElementsHidden { hidden = true; break }
            container = node.superview
        }
        XCTAssertTrue(hidden)
    }

    func test_disabled_dims_and_blocks_slider() {
        let view = JdSliderView(value: 10, in: 0...100, step: 1)
        view.isEnabled = false
        XCTAssertEqual(Double(view.alpha), JdToken.Opacity.o50, accuracy: 0.001)
        XCTAssertEqual(descendants(view, UISlider.self).first?.isEnabled, false)
    }
}

@MainActor
final class JdRangeSliderViewTests: XCTestCase {

    private func thumbs(of view: UIView) -> [UIView] {
        descendants(view, UIView.self).filter {
            $0.isAccessibilityElement && $0.accessibilityTraits.contains(.adjustable)
        }
    }

    // 손잡이 2개가 각각 접근성 요소 — 라벨은 웹 리터럴 동형
    func test_each_thumb_is_an_adjustable_element_with_web_label() {
        let view = JdRangeSliderView(
            state: JdRangeState(bounds: 0...100, step: 10, lower: 20, upper: 80)
        )
        let handles = thumbs(of: view)
        XCTAssertEqual(handles.count, 2)
        XCTAssertEqual(handles.first?.accessibilityLabel, "최솟값")
        XCTAssertEqual(handles.last?.accessibilityLabel, "최댓값")
        XCTAssertEqual(handles.first?.accessibilityValue, "20")
        XCTAssertEqual(handles.last?.accessibilityValue, "80")
        XCTAssertFalse(view.isAccessibilityElement)
    }

    // 증감은 step 단위 — 판정은 Core가 하고 뷰는 결과만 반영한다
    func test_adjustable_action_moves_by_step_and_notifies() {
        let view = JdRangeSliderView(
            state: JdRangeState(bounds: 0...100, step: 10, lower: 20, upper: 80)
        )
        var notified: JdRangeState?
        view.onChange = { notified = $0 }

        let handles = thumbs(of: view)
        handles.first?.accessibilityIncrement()
        XCTAssertEqual(view.rangeState.lower, 30, accuracy: 0.0001)
        XCTAssertEqual(notified?.lower ?? 0, 30, accuracy: 0.0001)

        handles.last?.accessibilityDecrement()
        XCTAssertEqual(view.rangeState.upper, 70, accuracy: 0.0001)
    }

    // 최소 간격은 Core가 지킨다 — 렌더 계층이 통과시켜도 값이 뭉개지지 않는다
    func test_adjust_respects_core_gap_rule() {
        let view = JdRangeSliderView(
            state: JdRangeState(bounds: 0...100, step: 10, lower: 60, upper: 70)
        )
        let handles = thumbs(of: view)
        handles.first?.accessibilityIncrement()  // lower를 upper 위로 밀어보기
        XCTAssertEqual(view.rangeState.lower, 60, accuracy: 0.0001)
        XCTAssertEqual(view.rangeState.upper, 70, accuracy: 0.0001)
    }

    // 웹 show-values 동형 — 값 행 토글(장식이므로 접근성 제외)
    func test_showsValues_toggles_value_row() {
        let view = JdRangeSliderView(
            state: JdRangeState(bounds: 0...100, step: 10, lower: 20, upper: 80),
            showsValues: false
        )
        guard let lower = descendants(view, UILabel.self).first(where: { $0.text == "20" }) else {
            return XCTFail("최솟값 라벨 없음")
        }
        XCTAssertFalse(isVisible(lower))
        view.showsValues = true
        XCTAssertTrue(isVisible(lower))
    }
}

@MainActor
final class JdLabelViewTests: XCTestCase {

    private let lightTraits = UITraitCollection(userInterfaceStyle: .light)

    // 웹 required ::after 동형 — 표식은 붙이되 AT에는 "필수"로 합류시킨다
    func test_required_marker_is_shown_and_joined_into_accessibility_label() {
        let view = JdLabelView("이메일", isRequired: true)
        XCTAssertEqual(view.text, "이메일*")
        XCTAssertEqual(view.accessibilityLabel, "이메일 필수")
        XCTAssertTrue(view.isAccessibilityElement)
    }

    func test_marker_uses_danger_color() {
        let view = JdLabelView("이메일", isRequired: true)
        guard let attributed = view.attributedText, attributed.length > 0 else {
            return XCTFail("attributedText 없음")
        }
        let color =
            attributed.attribute(
                .foregroundColor,
                at: attributed.length - 1,
                effectiveRange: nil) as? UIColor
        XCTAssertEqual(
            color?.resolvedColor(with: lightTraits),
            JdToken.Color.danger.uiColor.resolvedColor(with: lightTraits))
    }

    func test_isRequired_toggle_restores_plain_text() {
        let view = JdLabelView("이메일", isRequired: true)
        view.isRequired = false
        XCTAssertEqual(view.text, "이메일")
        XCTAssertEqual(view.accessibilityLabel, "이메일")
        view.isRequired = true
        XCTAssertEqual(view.text, "이메일*")
    }

    // UILabel API로 텍스트를 갈아끼워도 표식·접근성 계약이 유지된다
    func test_text_setter_keeps_marker_contract() {
        let view = JdLabelView("이름", isRequired: true)
        view.text = "전화번호"
        XCTAssertEqual(view.text, "전화번호*")
        XCTAssertEqual(view.accessibilityLabel, "전화번호 필수")
    }

    func test_defaults_multiline_and_dynamic_type() {
        let view = JdLabelView("이름")
        XCTAssertEqual(view.numberOfLines, 0)
        XCTAssertTrue(view.adjustsFontForContentSizeCategory)
        XCTAssertEqual(
            view.font.pointSize,
            JdFontBridge.scaledFont(
                size: JdLabelSpec.resolve().fontSize,
                weight: JdLabelSpec.resolve().fontWeight,
                compatibleWith: view.traitCollection
            ).pointSize)
    }
}

@MainActor
final class JdTextareaViewTests: XCTestCase {

    // 웹 auto-resize 동형 — 내용이 늘면 고유 높이가 자란다
    func test_autoResize_grows_intrinsic_height_with_content() {
        let view = JdTextareaView(placeholder: "메모", rows: 2, autoResize: true)
        view.frame = CGRect(x: 0, y: 0, width: 300, height: 200)
        view.layoutIfNeeded()
        let base = view.intrinsicContentSize.height

        view.text = String(repeating: "가나다라마바사아자차 ", count: 30)
        XCTAssertGreaterThan(view.intrinsicContentSize.height, base)
    }

    // autoResize가 꺼져 있으면 스크롤이 살아 있고 높이는 최소치로 고정된다
    func test_without_autoResize_height_stays_at_minimum() {
        let view = JdTextareaView(rows: 2, autoResize: false)
        view.frame = CGRect(x: 0, y: 0, width: 300, height: 200)
        view.layoutIfNeeded()
        let base = view.intrinsicContentSize.height

        view.text = String(repeating: "가나다라마바사아자차 ", count: 30)
        XCTAssertEqual(view.intrinsicContentSize.height, base, accuracy: 0.001)
        XCTAssertEqual(descendants(view, UITextView.self).first?.isScrollEnabled, true)
    }

    // 웹 show-count 동형 — "현재/최대" 배지
    func test_count_badge_shows_length_over_limit() {
        let view = JdTextareaView(maxLength: 20, showsCount: true)
        view.text = "안녕하세요"
        XCTAssertNotNil(descendants(view, UILabel.self).first { $0.text == "5/20" })
    }

    func test_count_badge_hidden_without_limit_or_flag() {
        let noFlag = JdTextareaView(maxLength: 20, showsCount: false)
        noFlag.text = "안녕"
        XCTAssertNil(descendants(noFlag, UILabel.self).first { $0.text == "2/20" })

        let noLimit = JdTextareaView(maxLength: 0, showsCount: true)
        noLimit.text = "안녕"
        XCTAssertNil(descendants(noLimit, UILabel.self).first { $0.text?.contains("/") == true })
    }

    // 웹 placeholder 동형 — 빈 값에서만 보인다
    func test_placeholder_visibility_follows_text() {
        let view = JdTextareaView(placeholder: "메모를 입력하세요")
        guard
            let placeholder = descendants(view, UILabel.self)
                .first(where: { $0.text == "메모를 입력하세요" })
        else {
            return XCTFail("플레이스홀더 라벨 없음")
        }
        XCTAssertTrue(isVisible(placeholder))
        view.text = "내용"
        XCTAssertFalse(isVisible(placeholder))
    }

    // 웹 aria-invalid 부재 보정 — 오류는 접근성 값으로 알린다 (계약 명시)
    func test_error_exposes_accessibility_value() {
        let view = JdTextareaView(isError: true)
        XCTAssertEqual(descendants(view, UITextView.self).first?.accessibilityValue, "오류")
        view.isError = false
        // nil로 되돌리면 UITextView 기본 낭독(본문)으로 복귀한다 — "오류"만 사라지면 된다
        XCTAssertNotEqual(descendants(view, UITextView.self).first?.accessibilityValue, "오류")
    }
}
