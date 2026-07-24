import XCTest
import JunDSCore

// JdNumberFormat의 **로케일 고정 계약** (DESIGN-3 §E).
//
// 웹 jd-number-formatter는 locale 기본값을 navigator가 아니라 상수 "ko-KR"로 둔다 —
// 프리렌더 결정성(§3.1-3) 때문이다. iOS엔 프리렌더가 없지만 같은 이유가 그대로 산다:
// 포맷 결과가 기기 설정에 따라 달라지면 스냅샷·테스트·디자인 대조가 전부 흔들린다.
// 그래서 Core는 Locale.current를 **읽지 않고** 인자로 받은 식별자만 쓴다.
//
// 이 파일은 두 가지를 본다.
//   (1) 같은 인자 → 항상 같은 문자열 (환경 무관 · 호출 간 무관)
//   (2) locale 인자를 바꾸면 결과가 실제로 바뀐다 (인자가 죽어 있지 않다)
//
// ⚠️ 아래 기대 문자열은 전부 **하드코딩된 상수**다. 만약 구현이 어딘가에서 Locale.current를
//    읽는다면 기기 지역 설정이 다른 머신에서 이 테스트가 깨진다 — 그게 이 파일의 검출 방식이다.
final class JdNumberFormatLocaleTests: XCTestCase {

    // MARK: - (1) 결정성

    // 매 호출이 NumberFormatter를 새로 만드는 구조라 인스턴스 재사용 상태가 새지 않는지 본다
    func test_same_arguments_always_produce_the_same_string() {
        let samples: [() -> String] = [
            { JdNumberFormat.string(value: 1_234_567.891) },
            { JdNumberFormat.string(value: 12_000, style: .currency) },
            { JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD") },
            { JdNumberFormat.string(value: 0.1234, style: .percent) },
            { JdNumberFormat.string(value: 15_000, style: .compact) },
            { JdNumberFormat.string(value: 1_234.5, decimals: 2, prefix: "약 ", suffix: " 원") },
            { JdNumberFormat.compactCount(1_500) },
        ]
        for produce in samples {
            let first = produce()
            for _ in 0..<50 {
                XCTAssertEqual(produce(), first)
            }
        }
    }

    // 서로 다른 스타일을 번갈아 호출해도 앞 호출이 뒤 호출을 오염시키지 않는다
    func test_interleaved_calls_do_not_leak_formatter_state() {
        let decimal = JdNumberFormat.string(value: 1_234.5)
        let currency = JdNumberFormat.string(value: 1_234.5, style: .currency)
        let percent = JdNumberFormat.string(value: 1_234.5, style: .percent)
        let compact = JdNumberFormat.string(value: 1_234.5, style: .compact)

        for _ in 0..<20 {
            XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, style: .percent), percent)
            XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, style: .currency), currency)
            XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, style: .compact), compact)
            XCTAssertEqual(JdNumberFormat.string(value: 1_234.5), decimal)
        }
        XCTAssertNotEqual(decimal, currency)
        XCTAssertNotEqual(currency, percent)
    }

    // 환경 무관 — 기기 지역 설정이 무엇이든 아래 상수가 나와야 한다
    func test_output_is_pinned_to_constants_regardless_of_device_locale() {
        let hint = "기기 로케일(\(Locale.current.identifier))이 결과에 새고 있다 — Core가 Locale.current를 읽으면 안 된다"
        XCTAssertEqual(JdNumberFormat.string(value: 1_234_567.891), "1,234,567.891", hint)
        XCTAssertEqual(JdNumberFormat.string(value: 12_000, style: .currency), "₩12,000", hint)
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent), "15%", hint)
        XCTAssertEqual(JdNumberFormat.string(value: 15_000, style: .compact), "1.5만", hint)
        XCTAssertEqual(JdNumberFormat.compactCount(1_500), "1.5천", hint)
    }

    // MARK: - (2) locale 기본값과 인자 반영

    // 기본값은 상수 "ko-KR"다 — 생략과 명시가 같은 결과여야 한다
    func test_default_locale_is_the_constant_ko_kr() {
        XCTAssertEqual(JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD"),
                       JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", locale: "ko-KR"))
        XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, decimals: 2),
                       JdNumberFormat.string(value: 1_234.5, locale: "ko-KR", decimals: 2))
        XCTAssertEqual(JdNumberFormat.string(value: 1_234, style: .currency, currency: "JPY"),
                       JdNumberFormat.string(value: 1_234, style: .currency, currency: "JPY", locale: "ko-KR"))
    }

    // locale을 바꾸면 통화 기호 표기가 실제로 달라진다(인자가 살아 있다는 증거)
    func test_locale_argument_changes_currency_symbol_presentation() {
        XCTAssertEqual(JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", locale: "ko-KR"),
                       "US$12.50")
        XCTAssertEqual(JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", locale: "en-US"),
                       "$12.50")
        XCTAssertNotEqual(JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", locale: "ko-KR"),
                          JdNumberFormat.string(value: 12.5, style: .currency, currency: "USD", locale: "en-US"))

        XCTAssertEqual(JdNumberFormat.string(value: 1_234, style: .currency, currency: "JPY", locale: "ko-KR"),
                       "JP¥1,234")
        XCTAssertEqual(JdNumberFormat.string(value: 1_234, style: .currency, currency: "JPY", locale: "en-US"),
                       "¥1,234")
    }

    // 구분자·소수점도 locale을 따른다 — ko/en은 동률이라 de-DE로 확인한다
    func test_locale_argument_changes_grouping_and_decimal_separators() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_234_567.891, locale: "en-US"), "1,234,567.891")
        XCTAssertEqual(JdNumberFormat.string(value: 1_234_567.891, locale: "de-DE"), "1.234.567,891")
        XCTAssertNotEqual(JdNumberFormat.string(value: 1_234_567.891, locale: "de-DE"),
                          JdNumberFormat.string(value: 1_234_567.891, locale: "ko-KR"))
    }

    // 반대로 **달라지지 않는** 축도 고정한다 — 차이가 없어야 정상인 곳에서 차이가 생기면 회귀다
    func test_axes_that_must_stay_identical_across_ko_and_en() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_234_567.891, locale: "ko-KR"),
                       JdNumberFormat.string(value: 1_234_567.891, locale: "en-US"))
        XCTAssertEqual(JdNumberFormat.string(value: 0.15, style: .percent, locale: "ko-KR"),
                       JdNumberFormat.string(value: 0.15, style: .percent, locale: "en-US"))
        // KRW 기호는 두 로케일에서 같다 — USD와 달리 축약 기호가 없다
        XCTAssertEqual(JdNumberFormat.string(value: 12_000, style: .currency, locale: "en-US"), "₩12,000")
    }

    // compact 단위 접미사는 **로케일과 무관하게 한국어**다(Core 주석의 명시 계약).
    // 다국어가 필요해지면 여기가 먼저 깨지도록 남긴다.
    func test_compact_unit_suffix_is_korean_regardless_of_locale() {
        XCTAssertEqual(JdNumberFormat.string(value: 15_000, style: .compact, locale: "en-US"), "1.5만")
        XCTAssertEqual(JdNumberFormat.string(value: 15_000, style: .compact, locale: "de-DE"), "1,5만")
        XCTAssertEqual(JdNumberFormat.string(value: 1_500, style: .compact, locale: "en-US"), "1.5천")
    }

    // compactCount는 locale 인자 자체가 없다 — 언제나 ko-KR 표기
    func test_compactCount_has_no_locale_axis() {
        XCTAssertEqual(JdNumberFormat.compactCount(15_000),
                       JdNumberFormat.string(value: 15_000, style: .compact, locale: "ko-KR"))
        XCTAssertEqual(JdNumberFormat.compactCount(1_234_567), "123.5만")
    }

    // prefix/suffix는 포맷 대상이 아니라 그대로 이어 붙는 문자열이다(로케일 변환 없음)
    func test_prefix_and_suffix_are_untouched_by_locale() {
        XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, locale: "de-DE", decimals: 1,
                                             prefix: "약 ", suffix: " 원"),
                       "약 1.234,5 원")
        XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, locale: "en-US", decimals: 1,
                                             prefix: "약 ", suffix: " 원"),
                       "약 1,234.5 원")
    }

    // 알 수 없는 로케일 식별자를 줘도 크래시 없이 결정적 문자열을 낸다(소비자 오타 방어)
    func test_unknown_locale_identifier_still_returns_a_stable_string() {
        let first = JdNumberFormat.string(value: 1_234.5, locale: "zz-ZZ", decimals: 1)
        XCTAssertFalse(first.isEmpty)
        for _ in 0..<10 {
            XCTAssertEqual(JdNumberFormat.string(value: 1_234.5, locale: "zz-ZZ", decimals: 1), first)
        }
    }
}
