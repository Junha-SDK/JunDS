import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// 입력 계열 6종의 값 규칙·표시·접근성 표면 (04 §8.2 · DESIGN-3 §E).
// 내부 필드/버튼은 전부 구현 세부(private)라 뷰 계층을 훑어 찾는다 — 공개 표면을
// 테스트 편의로 넓히지 않는다.
// ⚠️ sendActions(for:)는 이 하네스에서 무동작이라 jdSendActions(for:)를 쓴다
//    (Support/JdControlActionDispatch.swift).

private func jdDescendants<T: UIView>(_ root: UIView, of type: T.Type) -> [T] {
    var found: [T] = []
    for subview in root.subviews {
        if let match = subview as? T { found.append(match) }
        found.append(contentsOf: jdDescendants(subview, of: type))
    }
    return found
}

private func jdField(_ root: UIView) throws -> UITextField {
    try XCTUnwrap(jdDescendants(root, of: UITextField.self).first)
}

/// 사용자 타이핑 시뮬레이션 — 필드에 문자열을 얹고 editingChanged를 발화한다
private func jdType(_ text: String, into field: UITextField) {
    field.text = text
    field.jdSendActions(for: .editingChanged)
}

/// 편집 시작/종료 — 창 없는 하네스에선 becomeFirstResponder가 성립하지 않으므로
/// 컴포넌트가 보는 편집 이벤트를 직접 발화한다
private func jdBeginEditing(_ field: UITextField) {
    field.jdSendActions(for: .editingDidBegin)
}

private func jdEndEditing(_ field: UITextField) {
    field.jdSendActions(for: .editingDidEnd)
}

// MARK: - NumberInput

final class JdNumberInputViewTests: XCTestCase {

    private func stepButton(_ view: JdNumberInputView, direction: Int) throws -> UIButton {
        let match = jdDescendants(view, of: UIButton.self).first { $0.tag == direction }
        return try XCTUnwrap(match)
    }

    // ⚠️ 이 컴포넌트의 계약: 타이핑 중에는 클램프하지 않는다.
    // v2는 매 키 입력마다 클램프해 min=10 필드에 "50"을 칠 수 없었다("5"→"10" 즉시 덮임).
    func test_typing_does_not_clamp() throws {
        let view = JdNumberInputView(min: 10, max: 100)
        let field = try jdField(view)
        jdBeginEditing(field)

        jdType("5", into: field)
        XCTAssertEqual(view.value, 5)      // 중간 상태가 살아 있다
        XCTAssertEqual(field.text, "5")    // 되쓰기로 덮이지도 않는다

        jdType("50", into: field)
        XCTAssertEqual(view.value, 50)
    }

    // 커밋(포커스 종료)에서만 클램프한다
    func test_commit_clamps_and_rewrites_text() throws {
        let view = JdNumberInputView(min: 10, max: 100)
        let field = try jdField(view)
        var committed: [Double?] = []
        view.onCommit = { committed.append($0) }

        jdBeginEditing(field)
        jdType("5", into: field)
        jdEndEditing(field)

        XCTAssertEqual(view.value, 10)
        XCTAssertEqual(field.text, "10")
        XCTAssertEqual(committed.count, 1)
        XCTAssertEqual(committed.first ?? nil, 10)
    }

    // 범위 안의 값은 커밋해도 그대로 (클램프가 값을 만지지 않는다)
    func test_commit_keeps_in_range_value() throws {
        let view = JdNumberInputView(min: 10, max: 100)
        let field = try jdField(view)

        jdBeginEditing(field)
        jdType("50", into: field)
        jdEndEditing(field)

        XCTAssertEqual(view.value, 50)
    }

    // 빈 값은 빈 값으로 유지한다 (웹 NaN 센티널 동형 — v2는 0을 강제했다)
    func test_empty_commit_stays_empty() throws {
        let view = JdNumberInputView(value: 42, min: 0)
        let field = try jdField(view)

        jdBeginEditing(field)
        jdType("", into: field)
        jdEndEditing(field)

        XCTAssertNil(view.value)
        XCTAssertEqual(field.text, "")
    }

    // 스텝 버튼은 경계에서 비활성 — 판정은 Core의 canIncrement/canDecrement
    func test_step_buttons_track_bounds() throws {
        let view = JdNumberInputView(value: 0, min: 0, max: 2, step: 1)
        let dec = try stepButton(view, direction: -1)
        let inc = try stepButton(view, direction: 1)

        XCTAssertFalse(dec.isEnabled) // 하한
        XCTAssertTrue(inc.isEnabled)

        inc.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.value, 1)
        XCTAssertTrue(dec.isEnabled)
        XCTAssertTrue(inc.isEnabled)

        inc.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.value, 2)
        XCTAssertFalse(inc.isEnabled) // 상한
    }

    // 스텝은 커밋이다 — 값이 비어 있으면 0에서 출발한다(Core stepped 계약)
    func test_step_from_empty_starts_at_zero_and_commits() throws {
        let view = JdNumberInputView(step: 5)
        var committed: [Double?] = []
        view.onCommit = { committed.append($0) }

        try stepButton(view, direction: 1).jdSendActions(for: .touchUpInside)

        XCTAssertEqual(view.value, 5)
        XCTAssertEqual(committed.count, 1)
        XCTAssertEqual(try jdField(view).text, "5")
    }

    // 스텝 버튼 2개를 따로 노출하지 않고 필드 하나를 .adjustable로 노출한다
    func test_accessibility_exposes_single_adjustable_element() throws {
        let view = JdNumberInputView(value: 1, step: 1, accessibilityLabel: "수량")
        let field = try jdField(view)

        XCTAssertEqual(view.accessibilityElements?.count, 1)
        XCTAssertEqual(field.accessibilityLabel, "수량")
        XCTAssertTrue(field.accessibilityTraits.contains(.adjustable))
        XCTAssertFalse(try stepButton(view, direction: 1).isAccessibilityElement)

        field.accessibilityIncrement()
        XCTAssertEqual(view.value, 2)
        field.accessibilityDecrement()
        XCTAssertEqual(view.value, 1)
    }

    // hide-controls 동형 — 버튼과 구분선을 함께 감춘다
    func test_hides_controls() throws {
        let view = JdNumberInputView(hidesControls: true)
        XCTAssertTrue(try stepButton(view, direction: -1).isHidden)
        XCTAssertTrue(try stepButton(view, direction: 1).isHidden)
    }
}

// MARK: - CurrencyInput

final class JdCurrencyInputViewTests: XCTestCase {

    // 포맷은 전부 Core — 같은 인자면 같은 문자열이어야 한다
    func test_display_uses_core_currency_format() throws {
        let view = JdCurrencyInputView(value: 1500)
        let field = try jdField(view)
        XCTAssertEqual(field.text,
                       JdNumberFormat.string(value: 1500, style: .currency, currency: "KRW", locale: "ko-KR"))
    }

    // 입력 중에는 포맷하지 않고 숫자만 걷어 값으로 옮긴다
    func test_typing_extracts_number_without_formatting() throws {
        let view = JdCurrencyInputView()
        let field = try jdField(view)
        var changed: [Double?] = []
        view.onValueChange = { changed.append($0) }

        jdBeginEditing(field)
        jdType("₩1,500", into: field)

        XCTAssertEqual(view.value, 1500)
        XCTAssertEqual(field.text, "₩1,500") // 입력 중 되쓰기 없음
        XCTAssertEqual(changed.count, 1)
    }

    // 편집 종료에서 통화 표기로 확정한다 (웹 blur 동형)
    func test_commit_switches_to_formatted_text() throws {
        let view = JdCurrencyInputView()
        let field = try jdField(view)
        var committed: [Double?] = []
        view.onCommit = { committed.append($0) }

        jdBeginEditing(field)
        jdType("1500", into: field)
        jdEndEditing(field)

        XCTAssertEqual(field.text,
                       JdNumberFormat.string(value: 1500, style: .currency, currency: "KRW", locale: "ko-KR"))
        XCTAssertEqual(committed.count, 1)
    }

    // 통화 축을 바꾸면 표기도 따라 바뀐다(소수 자릿수는 Core가 통화별 기본값에 위임)
    func test_currency_axis_changes_display() throws {
        let view = JdCurrencyInputView(value: 12)
        view.currency = "USD"
        view.locale = "en-US"
        XCTAssertEqual(try jdField(view).text,
                       JdNumberFormat.string(value: 12, style: .currency, currency: "USD", locale: "en-US"))
    }
}

// MARK: - PhoneInput

final class JdPhoneInputViewTests: XCTestCase {

    // 마스킹은 전부 JdPhoneMask.format — 값은 숫자만 남는다
    func test_typing_applies_country_mask() throws {
        let view = JdPhoneInputView()
        let field = try jdField(view)

        jdType("01012345678", into: field)

        XCTAssertEqual(view.value, "01012345678")
        XCTAssertEqual(field.text, JdPhoneMask.format("01012345678", country: .kr))
        XCTAssertEqual(field.text, "010-1234-5678")
    }

    // 하이픈을 직접 쳐도 값에는 숫자만 남는다
    func test_non_digits_are_dropped_from_value() throws {
        let view = JdPhoneInputView()
        let field = try jdField(view)

        jdType("010-1234", into: field)

        XCTAssertEqual(view.value, "0101234")
        XCTAssertEqual(field.text, "010-1234")
    }

    // 국가 변경은 같은 값의 마스킹을 다시 만든다(그룹 규칙은 Core)
    func test_country_change_reformats_same_value() throws {
        let view = JdPhoneInputView(value: "2125550123", country: .kr)
        view.country = .us
        XCTAssertEqual(try jdField(view).text, JdPhoneMask.format("2125550123", country: .us))
        XCTAssertEqual(view.fullNumber, "+1 2125550123")
    }

    // 낭독 값은 국제 표기 — 국가번호가 빠진 채 읽히지 않게 한다
    func test_accessibility_value_is_full_number() throws {
        let view = JdPhoneInputView(value: "01012345678")
        XCTAssertEqual(try jdField(view).accessibilityValue, "+82 1012345678")
    }
}

// MARK: - PasswordInput

final class JdPasswordInputViewTests: XCTestCase {

    private func strengthText(_ view: JdPasswordInputView) -> String? {
        let labels = JdPasswordStrength.evaluate(view.text).label
        return jdDescendants(view, of: UILabel.self).first { $0.text == labels }?.text
    }

    // 강도 표시는 Core 판정을 그대로 옮긴다 — 렌더가 점수를 다시 매기지 않는다
    func test_strength_display_follows_core_evaluation() throws {
        let view = JdPasswordInputView(showsStrength: true)
        let field = try jdField(view)

        jdType("abc", into: field)
        XCTAssertEqual(view.strength.label, "취약")
        XCTAssertEqual(strengthText(view), "취약")

        jdType("Abcdef1!", into: field)
        XCTAssertEqual(view.strength.score, 5)
        XCTAssertEqual(view.strength.label, "강력")
        XCTAssertEqual(strengthText(view), "강력")
    }

    // 빈 값에는 강도를 매기지 않는다 (웹 level "none" 동형)
    func test_strength_row_hidden_when_empty() throws {
        let view = JdPasswordInputView(showsStrength: true)
        let field = try jdField(view)
        let row = try XCTUnwrap(jdDescendants(view, of: UIStackView.self)
            .first { $0.accessibilityLabel == "비밀번호 강도" })

        XCTAssertTrue(row.isHidden)
        jdType("a", into: field)
        XCTAssertFalse(row.isHidden)
        jdType("", into: field)
        XCTAssertTrue(row.isHidden)
    }

    // 규칙 체크리스트는 Core의 규칙 집합을 그대로 노출한다(라벨·충족 여부)
    func test_rules_list_mirrors_core_rules() throws {
        let view = JdPasswordInputView(showsRules: true)
        let field = try jdField(view)
        jdType("abcdefgh", into: field) // 8자 소문자 — length·lowercase 두 규칙 충족

        let expectedSatisfied: Set<JdPasswordRule> = [.length, .lowercase]
        for rule in JdPasswordRule.allCases {
            let row = jdDescendants(view, of: UIStackView.self).first { $0.accessibilityLabel == rule.label }
            XCTAssertNotNil(row, "규칙 행 누락: \(rule.label)")
            XCTAssertEqual(row?.accessibilityValue,
                           expectedSatisfied.contains(rule) ? "충족" : "미충족", rule.label)
        }
    }

    // 표시/숨김 토글 — 웹 type 전환 동형(라벨도 함께 교체)
    func test_reveal_toggle_switches_secure_entry() throws {
        let view = JdPasswordInputView()
        let field = try jdField(view)
        let toggle = try XCTUnwrap(jdDescendants(view, of: UIButton.self).first)

        XCTAssertTrue(field.isSecureTextEntry)
        XCTAssertEqual(toggle.accessibilityLabel, "비밀번호 표시")

        toggle.jdSendActions(for: .touchUpInside)
        XCTAssertFalse(field.isSecureTextEntry)
        XCTAssertEqual(toggle.accessibilityLabel, "비밀번호 숨기기")
    }
}

// MARK: - PinInput

final class JdPinInputViewTests: XCTestCase {

    private func cells(_ view: JdPinInputView) -> [UILabel] {
        jdDescendants(view, of: UILabel.self)
    }

    // 자리수·허용 문자 정리는 전부 JdPinRules.sanitize
    func test_sanitizes_and_truncates_to_length() throws {
        let view = JdPinInputView(length: 4)
        let field = try jdField(view)

        jdType("12ab3456", into: field)

        XCTAssertEqual(view.value, "1234") // 숫자만 + 4자리로 자름
        XCTAssertEqual(field.text, "1234")
        XCTAssertEqual(cells(view).count, 4)
        XCTAssertEqual(cells(view).map { $0.text ?? "" }, ["1", "2", "3", "4"])
    }

    // 완료 콜백은 전 자리가 찼을 때만 (판정은 Core isComplete)
    func test_complete_callback_fires_once_when_full() throws {
        let view = JdPinInputView(length: 4)
        let field = try jdField(view)
        var completed: [String] = []
        view.onComplete = { completed.append($0) }

        jdType("12", into: field)
        XCTAssertTrue(completed.isEmpty)

        jdType("1234", into: field)
        XCTAssertEqual(completed, ["1234"])
    }

    // 붙여넣기 한 번에 전체가 채워진다(sanitize가 그대로 처리)
    func test_paste_fills_every_cell_at_once() throws {
        let view = JdPinInputView(length: 6)
        let field = try jdField(view)
        var completed: [String] = []
        view.onComplete = { completed.append($0) }

        jdType("123-456", into: field) // 구분자 섞인 코드도 받아들인다

        XCTAssertEqual(view.value, "123456")
        XCTAssertEqual(completed, ["123456"])
    }

    // masked면 칸 표시가 가림 문자로 바뀐다(값은 그대로 — cellText 규칙)
    func test_masked_cells_use_core_mask_character() throws {
        let view = JdPinInputView(value: "12", length: 4, masked: true)
        XCTAssertEqual(cells(view)[0].text, JdPinRules.cellText("12", index: 0, masked: true))
        XCTAssertEqual(view.value, "12")
    }

    // alphanumeric 변형 — 영숫자를 허용한다(같은 타입의 설정 변형)
    func test_alphanumeric_variant_keeps_letters() throws {
        let view = JdPinInputView(length: 4, alphanumeric: true)
        jdType("a1-b2", into: try jdField(view))
        XCTAssertEqual(view.value, "a1b2")
    }

    // 칸 N개를 각각 노출하지 않고 컨트롤 하나로 합친다 (값 = 입력된 자리수)
    func test_accessibility_merges_cells_into_single_element() throws {
        let view = JdPinInputView(length: 6, accessibilityLabel: "인증 코드")
        let field = try jdField(view)

        XCTAssertEqual(view.accessibilityElements?.count, 1)
        XCTAssertEqual(field.accessibilityLabel, "인증 코드")
        XCTAssertEqual(field.accessibilityValue, "0자리 입력됨")

        jdType("123", into: field)
        XCTAssertEqual(field.accessibilityValue, "3자리 입력됨")
    }

    // length 변경은 칸을 재구축하고 값을 새 자리수로 다시 자른다
    func test_length_change_rebuilds_cells() throws {
        let view = JdPinInputView(value: "123456", length: 6)
        XCTAssertEqual(cells(view).count, 6)

        view.length = 4
        XCTAssertEqual(cells(view).count, 4)
        XCTAssertEqual(view.value, "1234")
    }
}
