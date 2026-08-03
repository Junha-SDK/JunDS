import JunDSCore
import XCTest

// primitives 잔여 27종의 Core 순수 함수 전수 검증 (DESIGN-3 §E).
//
// 이 배치는 "렌더가 재구현하면 안 되는 계산"을 Core에 몰아둔 것이 요점이다 —
// 포맷·마스킹·강도 판정·하이라이트 매칭·클램프·별점·카운트. 따라서 여기서 고정한
// 문자열/경계가 곧 SwiftUI·UIKit 두 계층의 공통 정답지다(04 §4.2 규칙 1·3).
//
// ⚠️ 문자열 기대값은 **전부 상수 로케일("ko-KR" 등)** 전제다. JdNumberFormat이 환경
//    로케일을 읽지 않는다는 것이 계약이며, 그 계약 자체는 JdNumberFormatLocaleTests가 본다.

// MARK: - JdNumberFormat

final class JdNumberFormatStyleTests: XCTestCase {

    // decimal — decimals 미지정이면 유효 자릿수 그대로, 지정하면 양쪽 고정(웹 min=max=fixed 동형)
    func test_decimal_without_decimals_keeps_significant_fraction() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_234_567.891), "1,234,567.891")
        XCTAssertEqual(JdNumberFormat.string(value: 0), "0")
        XCTAssertEqual(JdNumberFormat.string(value: -1_234.56), "-1,234.56")
    }

    func test_decimal_with_decimals_pins_both_bounds() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, decimals: 0), "1,235")
        XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, decimals: 2), "1,234.50")
        XCTAssertEqual(JdNumberFormat.string(value: 1_000, decimals: 2), "1,000.00")
    }

    // currency — 자릿수 미지정은 **통화 기본값**에 위임한다(KRW 0 / USD 2).
    // v2의 `KRW ? 0 : 2` 하드코딩이 JPY·VND를 틀리게 그리던 것을 웹 v3가 고쳤고 iOS도 따른다.
    func test_currency_defaults_to_currency_specific_fraction_digits() {
        XCTAssertEqual(JdNumberFormat.string(value: 12_000, style: .currency), "₩12,000")
        XCTAssertEqual(
            JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD"), "US$12.50")
        // 0자리 통화가 KRW만이 아니라는 것이 이 규칙의 존재 이유다
        XCTAssertEqual(
            JdNumberFormat.string(value: 1_234, style: .currency, currency: "JPY"), "JP¥1,234")
        XCTAssertEqual(
            JdNumberFormat.string(value: 50_000, style: .currency, currency: "VND"), "₫50,000")
    }

    func test_currency_rounds_to_zero_digits_for_krw() {
        XCTAssertEqual(JdNumberFormat.string(value: 12_000.4, style: .currency), "₩12,000")
        XCTAssertEqual(JdNumberFormat.string(value: 12_000.6, style: .currency), "₩12,001")
        XCTAssertEqual(JdNumberFormat.string(value: -12_000, style: .currency), "-₩12,000")
    }

    // decimals 지정은 통화 기본값을 덮는다
    func test_currency_explicit_decimals_override_currency_default() {
        XCTAssertEqual(
            JdNumberFormat.string(value: 12_000, style: .currency, decimals: 2), "₩12,000.00")
        XCTAssertEqual(
            JdNumberFormat.string(value: 12.6, style: .currency, currency: "USD", decimals: 0),
            "US$13")
    }

    // 반올림은 웹 Intl·toFixed와 같은 halfExpand다(Foundation 기본 halfEven이 아니다 — Core가
    // roundingMode = .halfUp을 명시한다). 정확히 반인 값이 항상 위로 가는지 고정한다.
    func test_rounding_mode_matches_web_half_expand() {
        XCTAssertEqual(
            JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", decimals: 0),
            "US$13")
        XCTAssertEqual(JdNumberFormat.string(value: 0.5, decimals: 0), "1")
        XCTAssertEqual(JdNumberFormat.string(value: 1.5, decimals: 0), "2")
        XCTAssertEqual(JdNumberFormat.string(value: 2.5, decimals: 0), "3")
    }

    // percent — 웹 style:"percent" 동형으로 **100을 곱한다**(0.15 → "15%")
    func test_percent_multiplies_by_hundred() {
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent), "15%")
        XCTAssertEqual(JdNumberFormat.string(value: 1, style: .percent), "100%")
        XCTAssertEqual(JdNumberFormat.string(value: 0, style: .percent), "0%")
        XCTAssertEqual(JdNumberFormat.string(value: -0.5, style: .percent), "-50%")
    }

    // percent 기본 자릿수는 min 0 / max 1 (웹 v2 승계) — 정수면 소수점을 붙이지 않는다
    func test_percent_default_fraction_digits_are_zero_to_one() {
        XCTAssertEqual(JdNumberFormat.string(value: 0.1234, style: .percent), "12.3%")
        XCTAssertEqual(JdNumberFormat.string(value: 0.155, style: .percent), "15.5%")
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent), "15%")  // 15.0%가 아니다
    }

    func test_percent_with_decimals_pins_both_bounds() {
        XCTAssertEqual(JdNumberFormat.string(value: 0.1234, style: .percent, decimals: 2), "12.34%")
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent, decimals: 2), "15.00%")
        XCTAssertEqual(JdNumberFormat.string(value: 0.1234, style: .percent, decimals: 0), "12%")
    }

    // compact — NumberFormatter엔 compact 스타일이 없어 Core가 자체 축약한다(천/만/억)
    func test_compact_uses_korean_units() {
        XCTAssertEqual(JdNumberFormat.string(value: 999, style: .compact), "999")
        XCTAssertEqual(JdNumberFormat.string(value: 1_500, style: .compact), "1.5천")
        XCTAssertEqual(JdNumberFormat.string(value: 15_000, style: .compact), "1.5만")
        XCTAssertEqual(JdNumberFormat.string(value: 150_000_000, style: .compact), "1.5억")
    }

    func test_compact_decimals_control_fraction_digits() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_500, style: .compact, decimals: 0), "2천")
        XCTAssertEqual(JdNumberFormat.string(value: 15_000, style: .compact, decimals: 2), "1.5만")
    }

    // prefix/suffix는 포맷 결과의 바깥에 그대로 결합한다(웹 `${prefix}${formatted}${suffix}`)
    func test_prefix_and_suffix_wrap_every_style() {
        XCTAssertEqual(
            JdNumberFormat.string(value: 1_234.5, decimals: 0, prefix: "약 ", suffix: " 원"),
            "약 1,235 원")
        XCTAssertEqual(
            JdNumberFormat.string(value: 12_345, style: .compact, prefix: "~", suffix: "회"),
            "~1.2만회")
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent, prefix: "+"), "+15%")
        XCTAssertEqual(
            JdNumberFormat.string(value: 12_000, style: .currency, suffix: " (VAT 포함)"),
            "₩12,000 (VAT 포함)")
        XCTAssertEqual(JdNumberFormat.string(value: 1, prefix: "", suffix: ""), "1")  // 기본값은 무해
    }

    func test_style_raw_values_match_web_attribute_vocabulary() {
        XCTAssertEqual(
            JdNumberFormatStyle.allCases.map(\.rawValue),
            ["decimal", "currency", "percent", "compact"])
    }
}

final class JdNumberFormatCompactCountTests: XCTestCase {

    // 1000 미만은 원문 그대로
    func test_below_thousand_is_verbatim() {
        XCTAssertEqual(JdNumberFormat.compactCount(0), "0")
        XCTAssertEqual(JdNumberFormat.compactCount(1), "1")
        XCTAssertEqual(JdNumberFormat.compactCount(42), "42")
        XCTAssertEqual(JdNumberFormat.compactCount(999), "999")
    }

    // 단위 경계는 "이상"에서 갈린다 — 999는 원문, 1000부터 천
    func test_unit_thresholds_are_inclusive_from_below() {
        XCTAssertEqual(JdNumberFormat.compactCount(1_000), "1천")
        XCTAssertEqual(JdNumberFormat.compactCount(1_500), "1.5천")
        XCTAssertEqual(JdNumberFormat.compactCount(10_000), "1만")
        XCTAssertEqual(JdNumberFormat.compactCount(15_000), "1.5만")
        XCTAssertEqual(JdNumberFormat.compactCount(100_000_000), "1억")
        XCTAssertEqual(JdNumberFormat.compactCount(123_456_789), "1.2억")
    }

    func test_negative_counts_keep_sign_and_unit() {
        XCTAssertEqual(JdNumberFormat.compactCount(-1_500), "-1.5천")
        XCTAssertEqual(JdNumberFormat.compactCount(-100_000_000), "-1억")
    }

    // ⚠️ 현행 동작 고정 — 웹 대조본과 어긋나는 지점이다(아래 webParity 테스트가 상세를 남긴다).
    //    반올림이 단위 경계를 넘으면 단위를 **재평가**한다(Intl notation:"compact" 동형).
    //    9999 → "10천"이 아니라 "1만", 99999999 → "10,000만"이 아니라 "1억".
    func test_rounding_carry_reevaluates_unit() {
        XCTAssertEqual(JdNumberFormat.compactCount(1_050), "1.1천")
        XCTAssertEqual(JdNumberFormat.compactCount(9_999), "1만")
        XCTAssertEqual(JdNumberFormat.compactCount(10_500), "1.1만")
        XCTAssertEqual(JdNumberFormat.compactCount(99_999_999), "1억")
    }

    // compact 스타일과 compactCount는 같은 규칙을 공유한다(중복 구현 금지의 증명)
    func test_compactCount_matches_compact_style() {
        for count in [0, 999, 1_000, 1_050, 9_999, 10_000, 100_000_000] {
            XCTAssertEqual(
                JdNumberFormat.compactCount(count),
                JdNumberFormat.string(value: Double(count), style: .compact),
                "count=\(count)")
        }
    }
}

// MARK: - JdNumberInputRules

final class JdNumberInputRulesTests: XCTestCase {

    private let epsilon = 1e-9

    // nil 경계 = 그 축 무제한(웹 NaN 센티널 동형)
    func test_nil_bounds_mean_unlimited() {
        XCTAssertEqual(JdNumberInputRules.clamp(50, min: nil, max: nil), 50, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(-1e9, min: nil, max: nil), -1e9, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(-100, min: nil, max: 10), -100, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(1_000, min: 0, max: nil), 1_000, accuracy: epsilon)
    }

    func test_clamp_pins_to_specified_axis_only() {
        XCTAssertEqual(JdNumberInputRules.clamp(-100, min: 0, max: nil), 0, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(999, min: nil, max: 10), 10, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(5, min: 0, max: 10), 5, accuracy: epsilon)
    }

    // 경계값 자체는 통과한다(포함 경계)
    func test_clamp_keeps_values_exactly_on_the_bound() {
        XCTAssertEqual(JdNumberInputRules.clamp(0, min: 0, max: 10), 0, accuracy: epsilon)
        XCTAssertEqual(JdNumberInputRules.clamp(10, min: 0, max: 10), 10, accuracy: epsilon)
    }

    // 뒤집힌 경계는 상한이 이긴다(max가 나중에 적용된다) — 소비자 실수 시의 결정적 결과를 고정한다
    func test_inverted_bounds_let_upper_win() {
        XCTAssertEqual(JdNumberInputRules.clamp(5, min: 10, max: 0), 0, accuracy: epsilon)
    }

    // 스텝: 값이 비어 있으면 0에서 출발한다(웹 `Number.isNaN(value) ? 0 : value` 동형)
    func test_stepped_starts_from_zero_when_value_is_empty() {
        XCTAssertEqual(
            JdNumberInputRules.stepped(nil, direction: 1, step: 1, min: nil, max: nil),
            1, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(nil, direction: -1, step: 1, min: nil, max: nil),
            -1, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(nil, direction: -1, step: 1, min: 0, max: nil),
            0, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(nil, direction: 1, step: 5, min: nil, max: nil),
            5, accuracy: epsilon)
    }

    func test_stepped_applies_step_and_direction() {
        XCTAssertEqual(
            JdNumberInputRules.stepped(3, direction: 1, step: 0.5, min: nil, max: nil),
            3.5, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(3, direction: -1, step: 0.5, min: nil, max: nil),
            2.5, accuracy: epsilon)
        // direction 0이면 값은 그대로(다만 클램프는 적용된다)
        XCTAssertEqual(
            JdNumberInputRules.stepped(3, direction: 0, step: 10, min: nil, max: nil),
            3, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(99, direction: 0, step: 10, min: nil, max: 10),
            10, accuracy: epsilon)
    }

    // 스텝은 **클램프한다** — 타이핑과 달리 스텝 버튼은 경계를 넘지 않는다(§1.5 계약)
    func test_stepped_clamps_at_bounds() {
        XCTAssertEqual(
            JdNumberInputRules.stepped(9.5, direction: 1, step: 1, min: 0, max: 10),
            10, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(10, direction: 1, step: 1, min: 0, max: 10),
            10, accuracy: epsilon)
        XCTAssertEqual(
            JdNumberInputRules.stepped(0.5, direction: -1, step: 1, min: 0, max: 10),
            0, accuracy: epsilon)
    }

    // canIncrement/canDecrement — 경계와 **정확히 같은 값**이면 더 못 간다(웹 `v >= max` 동형)
    func test_can_increment_boundary_is_exclusive_at_max() {
        XCTAssertFalse(JdNumberInputRules.canIncrement(10, max: 10))
        XCTAssertTrue(JdNumberInputRules.canIncrement(9.999, max: 10))
        XCTAssertFalse(JdNumberInputRules.canIncrement(10.001, max: 10))
    }

    func test_can_decrement_boundary_is_exclusive_at_min() {
        XCTAssertFalse(JdNumberInputRules.canDecrement(0, min: 0))
        XCTAssertTrue(JdNumberInputRules.canDecrement(0.001, min: 0))
        XCTAssertFalse(JdNumberInputRules.canDecrement(-0.001, min: 0))
    }

    func test_can_step_is_always_true_without_a_bound() {
        XCTAssertTrue(JdNumberInputRules.canIncrement(nil, max: nil))
        XCTAssertTrue(JdNumberInputRules.canIncrement(1e9, max: nil))
        XCTAssertTrue(JdNumberInputRules.canDecrement(nil, min: nil))
        XCTAssertTrue(JdNumberInputRules.canDecrement(-1e9, min: nil))
    }

    // 빈 값은 0으로 취급된다 — min=0인 필드의 감소 버튼은 처음부터 비활성이어야 한다
    func test_empty_value_is_treated_as_zero_for_step_availability() {
        XCTAssertFalse(JdNumberInputRules.canDecrement(nil, min: 0))
        XCTAssertTrue(JdNumberInputRules.canDecrement(nil, min: -1))
        XCTAssertFalse(JdNumberInputRules.canIncrement(nil, max: 0))
        XCTAssertTrue(JdNumberInputRules.canIncrement(nil, max: 1))
    }

    // 웹 램프는 컨트롤(32/40/48)이 아니라 NumberInput 전용(32/36/44)이다 — 혼동 방지 고정
    func test_size_ramp_is_number_input_specific() {
        XCTAssertEqual(JdNumberInputSize.sm.height, 32)
        XCTAssertEqual(JdNumberInputSize.md.height, 36)
        XCTAssertEqual(JdNumberInputSize.lg.height, 44)
        XCTAssertEqual(JdNumberInputSize.allCases.map(\.fontSize), [12, 13, 14])
    }
}

// MARK: - JdPinRules

final class JdPinRulesTests: XCTestCase {

    // 숫자 모드: 숫자 외 전부 제거(웹 `/^\d?$/` 필터 · 붙여넣기 `replace(/\D/g,"")` 동형)
    func test_sanitize_numeric_mode_keeps_digits_only() {
        XCTAssertEqual(JdPinRules.sanitize("12a3", length: 6, alphanumeric: false), "123")
        XCTAssertEqual(JdPinRules.sanitize("123-456", length: 6, alphanumeric: false), "123456")
        XCTAssertEqual(JdPinRules.sanitize("1 2 3", length: 6, alphanumeric: false), "123")
        XCTAssertEqual(JdPinRules.sanitize("!@#$", length: 6, alphanumeric: false), "")
        XCTAssertEqual(JdPinRules.sanitize("가1나2", length: 6, alphanumeric: false), "12")
    }

    // 영숫자 모드: 문자·숫자는 남기고 특수문자·공백만 제거. 대소문자는 접지 않는다.
    func test_sanitize_alphanumeric_mode_keeps_letters_and_digits() {
        XCTAssertEqual(JdPinRules.sanitize("12a3", length: 6, alphanumeric: true), "12a3")
        XCTAssertEqual(JdPinRules.sanitize("ABC123", length: 6, alphanumeric: true), "ABC123")
        XCTAssertEqual(JdPinRules.sanitize("abc!@#123", length: 10, alphanumeric: true), "abc123")
        XCTAssertEqual(JdPinRules.sanitize("a b c", length: 6, alphanumeric: true), "abc")
        // Character.isLetter는 한글도 참이다 — 웹 textMode가 아무 문자나 받던 것에 가까운 쪽
        XCTAssertEqual(JdPinRules.sanitize("가A1", length: 6, alphanumeric: true), "가A1")
    }

    // 길이 자르기는 필터 **이후**에 적용된다(구분자 섞인 코드를 붙여넣어도 자릿수가 맞는다)
    func test_sanitize_truncates_after_filtering() {
        XCTAssertEqual(JdPinRules.sanitize("123456789", length: 6, alphanumeric: false), "123456")
        XCTAssertEqual(JdPinRules.sanitize("123-456-789", length: 6, alphanumeric: false), "123456")
        XCTAssertEqual(JdPinRules.sanitize("12", length: 6, alphanumeric: false), "12")
    }

    func test_sanitize_degenerate_lengths_yield_empty() {
        XCTAssertEqual(JdPinRules.sanitize("123", length: 0, alphanumeric: false), "")
        XCTAssertEqual(JdPinRules.sanitize("123", length: -3, alphanumeric: false), "")
        XCTAssertEqual(JdPinRules.sanitize("", length: 6, alphanumeric: false), "")
    }

    // 셀 표시 — 범위 밖은 nil(빈 칸), masked는 가림 문자
    func test_cellText_returns_nil_outside_range() {
        XCTAssertEqual(JdPinRules.cellText("123", index: 0, masked: false), "1")
        XCTAssertEqual(JdPinRules.cellText("123", index: 2, masked: false), "3")
        XCTAssertNil(JdPinRules.cellText("123", index: 3, masked: false))
        XCTAssertNil(JdPinRules.cellText("123", index: -1, masked: false))
        XCTAssertNil(JdPinRules.cellText("", index: 0, masked: false))
    }

    func test_cellText_masks_every_filled_cell() {
        XCTAssertEqual(JdPinRules.cellText("123", index: 0, masked: true), "●")
        XCTAssertEqual(JdPinRules.cellText("123", index: 2, masked: true), "●")
        // 마스킹은 빈 칸을 채우지 않는다
        XCTAssertNil(JdPinRules.cellText("123", index: 3, masked: true))
    }

    // 포커스 인덱스 = 채워진 길이, 가득 차면 마지막 셀을 유지한다(넘어갈 칸이 없다)
    func test_focusIndex_follows_filled_count_and_stops_at_last_cell() {
        XCTAssertEqual(JdPinRules.focusIndex("", length: 6), 0)
        XCTAssertEqual(JdPinRules.focusIndex("1", length: 6), 1)
        XCTAssertEqual(JdPinRules.focusIndex("12345", length: 6), 5)
        XCTAssertEqual(JdPinRules.focusIndex("123456", length: 6), 5)
        XCTAssertEqual(JdPinRules.focusIndex("1234567", length: 6), 5)  // 과충전도 마지막 칸
        XCTAssertEqual(JdPinRules.focusIndex("", length: 1), 0)
        XCTAssertEqual(JdPinRules.focusIndex("1", length: 1), 0)
        XCTAssertEqual(JdPinRules.focusIndex("", length: 0), 0)  // 음수 인덱스 방어
    }

    func test_isComplete_needs_full_length_and_positive_length() {
        XCTAssertTrue(JdPinRules.isComplete("123456", length: 6))
        XCTAssertTrue(JdPinRules.isComplete("1234567", length: 6))
        XCTAssertFalse(JdPinRules.isComplete("12345", length: 6))
        XCTAssertFalse(JdPinRules.isComplete("", length: 6))
        XCTAssertFalse(JdPinRules.isComplete("", length: 0))  // length 0은 "완료"가 아니다
    }

    // 붙여넣기 한 번에 전체 채움 — sanitize 하나로 처리된다는 계약(렌더가 재구현하지 않는 이유)
    func test_paste_flow_is_a_single_sanitize_call() {
        let pasted = JdPinRules.sanitize("코드: 123-456", length: 6, alphanumeric: false)
        XCTAssertEqual(pasted, "123456")
        XCTAssertTrue(JdPinRules.isComplete(pasted, length: 6))
        XCTAssertEqual(JdPinRules.focusIndex(pasted, length: 6), 5)
    }
}

// MARK: - JdPhoneMask

final class JdPhoneMaskTests: XCTestCase {

    // KR 3-4-4 — 입력 중 부분 문자열이 자릿수대로 자란다
    func test_kr_progressive_input() {
        let expected = [
            "0", "01", "010", "010-1", "010-12", "010-123", "010-1234",
            "010-1234-5", "010-1234-56", "010-1234-567", "010-1234-5678",
        ]
        let source = "01012345678"
        for (index, want) in expected.enumerated() {
            let raw = String(source.prefix(index + 1))
            XCTAssertEqual(JdPhoneMask.format(raw, country: .kr), want, "raw=\(raw)")
        }
    }

    // US 3-3-4 — 그룹 길이가 KR과 다르다는 것이 국가 축의 존재 이유다
    func test_us_progressive_input() {
        let expected = [
            "2", "21", "212", "212-5", "212-55", "212-555",
            "212-555-1", "212-555-12", "212-555-123", "212-555-1234",
        ]
        let source = "2125551234"
        for (index, want) in expected.enumerated() {
            let raw = String(source.prefix(index + 1))
            XCTAssertEqual(JdPhoneMask.format(raw, country: .us), want, "raw=\(raw)")
        }
    }

    func test_jp_uses_the_same_grouping_as_kr() {
        XCTAssertEqual(JdPhoneMask.format("09012345678", country: .jp), "090-1234-5678")
        XCTAssertEqual(JdPhoneMask.format("0901234", country: .jp), "090-1234")
        XCTAssertEqual(
            JdPhoneMask.format("09012345678", country: .kr),
            JdPhoneMask.format("09012345678", country: .jp))
    }

    // 초과분은 잘리지 않고 마지막 그룹으로 붙는다(입력을 삼키지 않는다 — 자르기는 소비자 몫)
    func test_overflow_digits_append_as_a_trailing_group() {
        XCTAssertEqual(JdPhoneMask.format("010123456789", country: .kr), "010-1234-5678-9")
        XCTAssertEqual(JdPhoneMask.format("21255512345", country: .us), "212-555-1234-5")
    }

    func test_non_digits_are_stripped_and_masking_is_idempotent() {
        XCTAssertEqual(JdPhoneMask.format("010-1234-5678", country: .kr), "010-1234-5678")
        XCTAssertEqual(JdPhoneMask.format(" 010 1234 ", country: .kr), "010-1234")
        XCTAssertEqual(JdPhoneMask.format("(010) 1234-5678", country: .kr), "010-1234-5678")
        XCTAssertEqual(JdPhoneMask.format("abc", country: .kr), "")
        XCTAssertEqual(JdPhoneMask.format("", country: .kr), "")
    }

    // 국제 표기 — 선행 0 하나만 떨어진다(KR 010 → +82 10)
    func test_fullNumber_drops_a_single_leading_zero() {
        XCTAssertEqual(JdPhoneMask.fullNumber("01012345678", country: .kr), "+82 1012345678")
        XCTAssertEqual(JdPhoneMask.fullNumber("1012345678", country: .kr), "+82 1012345678")
        // 두 번째 0은 남는다
        XCTAssertEqual(JdPhoneMask.fullNumber("0012345", country: .kr), "+82 012345")
        XCTAssertEqual(JdPhoneMask.fullNumber("09012345678", country: .jp), "+81 9012345678")
        XCTAssertEqual(JdPhoneMask.fullNumber("2125551234", country: .us), "+1 2125551234")
    }

    func test_fullNumber_strips_formatting_and_handles_empty() {
        XCTAssertEqual(JdPhoneMask.fullNumber("010-1234-5678", country: .kr), "+82 1012345678")
        XCTAssertEqual(JdPhoneMask.fullNumber("", country: .kr), "")
        XCTAssertEqual(JdPhoneMask.fullNumber("abc", country: .kr), "")
    }

    func test_country_axis_matches_web_attribute_vocabulary() {
        XCTAssertEqual(JdPhoneCountry.allCases.map(\.rawValue), ["KR", "US", "JP"])
        XCTAssertEqual(JdPhoneCountry.kr.dialCode, "+82")
        XCTAssertEqual(JdPhoneCountry.us.dialCode, "+1")
        XCTAssertEqual(JdPhoneCountry.jp.dialCode, "+81")
    }
}

// MARK: - JdPasswordStrength

final class JdPasswordStrengthTests: XCTestCase {

    // 규칙 5종 단독 충족 — 서로 간섭하지 않는다(소문자 규칙이 있어 영소문자는 항상 함께 잡힌다)
    func test_each_rule_is_satisfied_independently() {
        XCTAssertEqual(JdPasswordStrength.evaluate("ABCDEFGH").satisfied, [.length, .uppercase])
        XCTAssertEqual(JdPasswordStrength.evaluate("aB").satisfied, [.uppercase, .lowercase])
        XCTAssertEqual(JdPasswordStrength.evaluate("a1").satisfied, [.lowercase, .number])
        XCTAssertEqual(JdPasswordStrength.evaluate("a!").satisfied, [.lowercase, .symbol])
        XCTAssertEqual(JdPasswordStrength.evaluate("1!").satisfied, [.number, .symbol])
    }

    // 길이 규칙 경계 — 8자 이상(7자는 미달)
    func test_length_rule_boundary_is_eight() {
        XCTAssertFalse(JdPasswordStrength.evaluate("abcdefg").isSatisfied(.length))
        XCTAssertTrue(JdPasswordStrength.evaluate("abcdefgh").isSatisfied(.length))
    }

    func test_all_rules_satisfied_together() {
        let strength = JdPasswordStrength.evaluate("Passw0rd!")
        XCTAssertEqual(strength.satisfied, [.length, .uppercase, .lowercase, .number, .symbol])
        XCTAssertEqual(strength.score, 5)
        for rule in JdPasswordRule.allCases {
            XCTAssertTrue(strength.isSatisfied(rule), "\(rule)")
        }
    }

    func test_empty_password_satisfies_nothing() {
        let strength = JdPasswordStrength.evaluate("")
        XCTAssertTrue(strength.satisfied.isEmpty)
        XCTAssertEqual(strength.score, 0)
    }

    // 공백은 특수문자가 아니다(웹 특수문자 클래스에 공백이 없다 — 동형)
    func test_whitespace_is_not_a_symbol() {
        let strength = JdPasswordStrength.evaluate("Ab 12345")
        XCTAssertEqual(strength.satisfied, [.length, .uppercase, .lowercase, .number])
        XCTAssertFalse(strength.isSatisfied(.symbol))
    }

    // 한글은 영숫자 집합에 들어가므로 특수문자가 아니다(오탐 방지)
    func test_hangul_is_not_a_symbol() {
        XCTAssertTrue(JdPasswordStrength.evaluate("비밀번호입니다").satisfied.isEmpty)
    }

    func test_underscore_and_punctuation_are_symbols() {
        XCTAssertTrue(JdPasswordStrength.evaluate("a_b").isSatisfied(.symbol))
        XCTAssertTrue(JdPasswordStrength.evaluate("a.b").isSatisfied(.symbol))
        XCTAssertTrue(JdPasswordStrength.evaluate("a@b").isSatisfied(.symbol))
    }

    // 정규화 점수(규칙 비율×0.8 + 길이보너스×0.2) → 웹 임계값 0.3/0.5/0.8 → 라벨·톤.
    // 렌더는 label·tone만 본다.
    func test_normalized_score_bands_map_to_label_and_tone() {
        let cases: [(String, JdPasswordLevel, String, JdSeverity)] = [
            ("abc", .weak, "취약", .danger),  // 규칙 1/5 + 길이보너스 소량
            ("abcdefgh", .fair, "보통", .warn),  // 규칙 2/5 + 0.5×0.2
            ("abcdefgH", .good, "양호", .ok),  // 규칙 3/5
            ("abcdefgH1!", .strong, "강력", .ok),  // 규칙 5/5
        ]
        for (password, level, label, tone) in cases {
            let strength = JdPasswordStrength.evaluate(password)
            XCTAssertEqual(strength.level, level, password)
            XCTAssertEqual(strength.label, label, password)
            XCTAssertEqual(strength.tone, tone, password)
        }
    }

    // 정규화 점수는 0…1이고 빈 문자열은 0이다
    func test_normalized_score_range() {
        XCTAssertEqual(JdPasswordStrength.evaluate("").normalized, 0, accuracy: 0.0001)
        let full = JdPasswordStrength.evaluate("Passw0rd!Passw0rd!")
        XCTAssertEqual(full.normalized, 1.0, accuracy: 0.0001)
        for password in ["a", "abcdefgh", "abcdefgH1!"] {
            let n = JdPasswordStrength.evaluate(password).normalized
            XCTAssertGreaterThanOrEqual(n, 0, password)
            XCTAssertLessThanOrEqual(n, 1, password)
        }
    }

    func test_score_is_the_satisfied_rule_count() {
        for password in ["", "a", "abcdefgh", "abcdefgH", "abcdefgH1", "abcdefgH1!"] {
            let strength = JdPasswordStrength.evaluate(password)
            XCTAssertEqual(strength.score, strength.satisfied.count, password)
            XCTAssertLessThanOrEqual(strength.score, JdPasswordRule.allCases.count, password)
        }
    }

    func test_evaluation_is_deterministic_and_equatable() {
        XCTAssertEqual(
            JdPasswordStrength.evaluate("Passw0rd!"), JdPasswordStrength.evaluate("Passw0rd!"))
        XCTAssertNotEqual(
            JdPasswordStrength.evaluate("Passw0rd!"), JdPasswordStrength.evaluate("password"))
    }

    func test_rule_labels_are_present_for_the_checklist() {
        XCTAssertEqual(
            JdPasswordRule.allCases.map(\.rawValue),
            ["length", "uppercase", "lowercase", "number", "symbol"])
        XCTAssertEqual(JdPasswordRule.length.label, "8자 이상")
        XCTAssertEqual(JdPasswordRule.uppercase.label, "대문자 포함")
        XCTAssertEqual(JdPasswordRule.number.label, "숫자 포함")
        XCTAssertEqual(JdPasswordRule.symbol.label, "특수문자 포함")
    }
}

// MARK: - JdHighlight

final class JdHighlightSegmentsTests: XCTestCase {

    // JdHighlightSegment는 memberwise init이 internal이라 축별로 비교한다
    private func texts(_ segments: [JdHighlightSegment]) -> [String] { segments.map(\.text) }
    private func flags(_ segments: [JdHighlightSegment]) -> [Bool] { segments.map(\.isMatch) }

    func test_no_match_yields_one_plain_segment() {
        let segments = JdHighlight.segments(text: "hello", query: "zzz")
        XCTAssertEqual(texts(segments), ["hello"])
        XCTAssertEqual(flags(segments), [false])
    }

    // 쿼리가 본문보다 길면 매치가 없다
    func test_query_longer_than_text_is_not_a_match() {
        let segments = JdHighlight.segments(text: "ab", query: "abcdef")
        XCTAssertEqual(texts(segments), ["ab"])
        XCTAssertEqual(flags(segments), [false])
    }

    // 빈 쿼리 = 전체가 non-match 1구간(웹 `if (!query) 원문 그대로` 동형)
    func test_empty_query_yields_one_plain_segment() {
        let segments = JdHighlight.segments(text: "hello", query: "")
        XCTAssertEqual(texts(segments), ["hello"])
        XCTAssertEqual(flags(segments), [false])
    }

    // 빈 본문은 구간이 없다(빈 Text 노드를 만들지 않는다)
    func test_empty_text_yields_no_segments() {
        XCTAssertTrue(JdHighlight.segments(text: "", query: "a").isEmpty)
        XCTAssertTrue(JdHighlight.segments(text: "", query: "").isEmpty)
    }

    func test_single_match_in_the_middle() {
        let segments = JdHighlight.segments(text: "hello world", query: "o w")
        XCTAssertEqual(texts(segments), ["hell", "o w", "orld"])
        XCTAssertEqual(flags(segments), [false, true, false])
    }

    func test_match_at_the_edges() {
        let head = JdHighlight.segments(text: "abcdef", query: "abc")
        XCTAssertEqual(texts(head), ["abc", "def"])
        XCTAssertEqual(flags(head), [true, false])

        let tail = JdHighlight.segments(text: "abcdef", query: "def")
        XCTAssertEqual(texts(tail), ["abc", "def"])
        XCTAssertEqual(flags(tail), [false, true])

        let whole = JdHighlight.segments(text: "abc", query: "abc")
        XCTAssertEqual(texts(whole), ["abc"])
        XCTAssertEqual(flags(whole), [true])
    }

    func test_multiple_matches_split_every_occurrence() {
        let segments = JdHighlight.segments(text: "a-b-a-b", query: "a")
        XCTAssertEqual(texts(segments), ["a", "-b-", "a", "-b"])
        XCTAssertEqual(flags(segments), [true, false, true, false])
    }

    // 연속 매치는 합쳐지지 않고 각각 구간이 된다(커서가 upperBound에서 이어진다)
    func test_adjacent_matches_stay_separate_segments() {
        let segments = JdHighlight.segments(text: "abab", query: "ab")
        XCTAssertEqual(texts(segments), ["ab", "ab"])
        XCTAssertEqual(flags(segments), [true, true])
    }

    // 대소문자 무시 — 원문의 대소문자는 보존된다(표시는 원문 그대로)
    func test_matching_ignores_case_but_preserves_original_text() {
        let lowered = JdHighlight.segments(text: "Hello World", query: "hello")
        XCTAssertEqual(texts(lowered), ["Hello", " World"])
        XCTAssertEqual(flags(lowered), [true, false])

        let uppered = JdHighlight.segments(text: "hello world", query: "WORLD")
        XCTAssertEqual(texts(uppered), ["hello ", "world"])
        XCTAssertEqual(flags(uppered), [false, true])
    }

    func test_korean_matching() {
        let segments = JdHighlight.segments(text: "안녕 안녕하세요", query: "안녕")
        XCTAssertEqual(texts(segments), ["안녕", " ", "안녕", "하세요"])
        XCTAssertEqual(flags(segments), [true, false, true, false])
    }

    // 불변식: 구간을 이어 붙이면 항상 원문이다(렌더가 글자를 잃지 않는다는 보증)
    func test_segments_always_reconstruct_the_source_text() {
        let samples = [
            ("hello world", "o"), ("abab", "ab"), ("Hello", "zzz"), ("한글 테스트", "테"),
            ("aaa", "a"), ("hello", ""), ("x", "x"),
        ]
        for (text, query) in samples {
            let joined = JdHighlight.segments(text: text, query: query).map(\.text).joined()
            XCTAssertEqual(joined, text, "text=\(text) query=\(query)")
        }
    }
}

// MARK: - JdStarRating

final class JdStarRatingCoreTests: XCTestCase {

    private let epsilon = 1e-9

    // 0.5 경계 — 첫 별 기준(index 0). 0.5부터 half, 1.0부터 full
    func test_fill_half_boundary_on_first_star() {
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0.4), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0.49), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0.5), .half)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0.9), .half)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 0.99), .half)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 1.0), .full)
        XCTAssertEqual(JdStarRating.fill(index: 0, value: 5.0), .full)
    }

    // 경계는 인덱스만큼 평행 이동한다
    func test_fill_boundary_shifts_with_index() {
        XCTAssertEqual(JdStarRating.fill(index: 1, value: 1.0), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 1, value: 1.4), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 1, value: 1.5), .half)
        XCTAssertEqual(JdStarRating.fill(index: 1, value: 2.0), .full)

        XCTAssertEqual(JdStarRating.fill(index: 4, value: 4.0), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 4, value: 4.5), .half)
        XCTAssertEqual(JdStarRating.fill(index: 4, value: 5.0), .full)
    }

    func test_fill_is_empty_for_negative_values() {
        XCTAssertEqual(JdStarRating.fill(index: 0, value: -1), .empty)
        XCTAssertEqual(JdStarRating.fill(index: 3, value: -1), .empty)
    }

    // 3.5점 별 5개의 전체 모양 — 렌더가 그대로 그리는 배열
    func test_fill_across_a_five_star_row() {
        let row = (0..<5).map { JdStarRating.fill(index: $0, value: 3.5) }
        XCTAssertEqual(row, [.full, .full, .full, .half, .empty])
    }

    // 탭 = 그 별의 정수 값. 같은 별을 다시 누르면 반값(0.5 토글)
    func test_tapping_a_star_sets_its_full_value() {
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 0, current: 0), 1, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 2, current: 0), 3, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 4, current: 0), 5, accuracy: epsilon)
    }

    func test_retapping_the_same_star_halves_it() {
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 0, current: 1), 0.5, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 2, current: 3), 2.5, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 4, current: 5), 4.5, accuracy: epsilon)
    }

    // 반값 상태에서 한 번 더 누르면 다시 정수로 돌아온다(2탭 주기)
    func test_tap_cycle_returns_to_full_value() {
        let halved = JdStarRating.value(forTappedIndex: 2, current: 3)
        XCTAssertEqual(halved, 2.5, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 2, current: halved), 3, accuracy: epsilon)
    }

    // 다른 별을 누르면 언제나 그 별의 정수 값(반값은 같은 별에서만)
    func test_tapping_a_different_star_never_halves() {
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 1, current: 5), 2, accuracy: epsilon)
        XCTAssertEqual(JdStarRating.value(forTappedIndex: 0, current: 4.5), 1, accuracy: epsilon)
    }

    // 탭 결과는 항상 그 별을 half 이상으로 만든다(탭한 별이 비어 보이지 않는다)
    func test_tap_result_always_fills_the_tapped_star() {
        for index in 0..<5 {
            for current in [0.0, 0.5, 1.0, 2.5, 5.0] {
                let next = JdStarRating.value(forTappedIndex: index, current: current)
                XCTAssertNotEqual(
                    JdStarRating.fill(index: index, value: next), .empty,
                    "index=\(index) current=\(current)")
            }
        }
    }
}

// MARK: - JdBackTop

final class JdBackTopTests: XCTestCase {

    // 웹 `window.scrollY > threshold` — 엄격 초과다(같으면 아직 숨김)
    func test_visibility_is_strictly_greater_than_threshold() {
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: 0, threshold: 400))
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: 399, threshold: 400))
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: 400, threshold: 400))
        XCTAssertTrue(JdBackTop.shouldShow(scrollY: 400.0001, threshold: 400))
        XCTAssertTrue(JdBackTop.shouldShow(scrollY: 401, threshold: 400))
    }

    // 임계 0 · 바운스로 인한 음수 오프셋
    func test_zero_threshold_and_negative_scroll() {
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: 0, threshold: 0))
        XCTAssertTrue(JdBackTop.shouldShow(scrollY: 0.1, threshold: 0))
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: -80, threshold: 0))
        XCTAssertFalse(JdBackTop.shouldShow(scrollY: -80, threshold: 400))
    }

    func test_defaults_match_web() {
        XCTAssertEqual(JdBackTop.defaultThreshold, 400)
        XCTAssertEqual(JdBackTop.defaultLabel, "상단으로 이동")
    }
}

// MARK: - 텍스트 런 (MentionChip · Hashtag)

final class JdTextRunCoreTests: XCTestCase {

    // label이 비면 "@handle"로 폴백(웹 `this.label || \`@${handle}\`` 동형)
    func test_mention_falls_back_to_handle_when_label_is_empty() {
        XCTAssertEqual(JdMentionChip.displayText(handle: "junha", label: ""), "@junha")
        XCTAssertEqual(JdMentionChip.displayText(handle: "junha", label: "박준하"), "박준하")
        XCTAssertEqual(JdMentionChip.displayText(handle: "", label: ""), "@")
        // 이미 @가 붙은 핸들을 넣으면 두 번 붙는다 — 핸들은 @ 없이 준다는 계약
        XCTAssertEqual(JdMentionChip.displayText(handle: "@junha", label: ""), "@@junha")
    }

    func test_hashtag_prefixes_a_hash() {
        XCTAssertEqual(JdHashtag.displayText(tag: "swift"), "#swift")
        XCTAssertEqual(JdHashtag.displayText(tag: "디자인시스템"), "#디자인시스템")
        XCTAssertEqual(JdHashtag.displayText(tag: ""), "#")
    }

    // 카운트 표기는 JdNumberFormat.compactCount 재사용 — 규칙 중복이 없다는 증명
    func test_hashtag_count_delegates_to_compact_count() {
        for count in [0, 999, 1_000, 1_500, 10_000, 100_000_000] {
            XCTAssertEqual(
                JdHashtag.countText(count), JdNumberFormat.compactCount(count), "count=\(count)")
        }
        XCTAssertEqual(JdHashtag.countText(999), "999")
        XCTAssertEqual(JdHashtag.countText(1_500), "1.5천")
    }
}
