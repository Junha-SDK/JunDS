import JunDSCore
import XCTest

// finance 공통 어휘 계약 (DEC-040).
//
// 이 파일이 지키는 것은 세 가지다.
//  (1) 추세 판정 **두 규칙이 실제로 다르다** — 하나로 합쳐지면 즉시 실패한다.
//      웹 jd-live-pct-badge(live)와 jd-price-badge(exact)는 같은 입력에 다른 색을 낸다.
//  (2) 포맷은 로케일·환경에 의존하지 않는다 — 기기 지역이 결과에 새면 실패한다.
//  (3) 색 override(JdFinanceTheme)가 실제로 스펙에 흐른다 — 죽은 노브가 아니다.
final class JdFinanceSpecTests: XCTestCase {

    override func tearDown() {
        // 정적 상태 누수 차단 — 한 테스트의 override가 다음 테스트를 오염시키면 안 된다
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    // MARK: - (1) 추세 판정 두 규칙

    // live 규칙: up(>0)이 flat보다 우선한다. 순서를 바꾸면 아주 작은 양수가 회색이 된다.
    func test_live_policy_prefers_up_over_flat_for_tiny_positives() {
        XCTAssertEqual(
            JdTrend.resolve(0.003, policy: .live), .up,
            "+0.003은 상승이어야 한다 — flat 임계값(0.005)보다 up 판정이 우선")
        XCTAssertEqual(JdTrend.resolve(0.0001, policy: .live), .up)
    }

    // live 규칙의 flat은 [-0.005, 0] 구간뿐이다 (음수 쪽만 임계값이 산다)
    func test_live_policy_flat_band_is_negative_side_only() {
        XCTAssertEqual(JdTrend.resolve(0, policy: .live), .flat)
        XCTAssertEqual(JdTrend.resolve(-0.004, policy: .live), .flat)
        XCTAssertEqual(
            JdTrend.resolve(-0.005, policy: .live), .down,
            "임계값 경계는 미포함(abs < 0.005)")
        XCTAssertEqual(JdTrend.resolve(-0.01, policy: .live), .down)
    }

    // exact 규칙: flat은 정확히 0뿐이다
    func test_exact_policy_flat_is_only_zero() {
        XCTAssertEqual(JdTrend.resolve(0, policy: .exact), .flat)
        XCTAssertEqual(JdTrend.resolve(0.0001, policy: .exact), .up)
        XCTAssertEqual(JdTrend.resolve(-0.0001, policy: .exact), .down)
    }

    // 두 규칙은 같은 입력에서 실제로 갈린다 — 이 단언이 깨지면 규칙이 하나로 합쳐진 것이다
    func test_two_policies_disagree_on_the_tiny_negative_band() {
        let sample = -0.003
        XCTAssertEqual(JdTrend.resolve(sample, policy: .live), .flat)
        XCTAssertEqual(JdTrend.resolve(sample, policy: .exact), .down)
    }

    func test_non_finite_input_is_flat_not_a_crash() {
        XCTAssertEqual(JdTrend.resolve(.nan, policy: .live), .flat)
        XCTAssertEqual(JdTrend.resolve(.infinity, policy: .exact), .flat)
    }

    // MARK: - (2) 포맷

    // 웹 `change !== 0 ? change : fallback` 분기 — 0을 "시드 전"으로 본다
    func test_resolved_change_falls_back_only_on_exact_zero() {
        XCTAssertEqual(JdFinanceFormat.resolvedChange(change: 1.5, fallback: 9), 1.5)
        XCTAssertEqual(JdFinanceFormat.resolvedChange(change: 0, fallback: 9), 9)
        XCTAssertEqual(JdFinanceFormat.resolvedChange(change: -0.2, fallback: 9), -0.2)
        XCTAssertEqual(JdFinanceFormat.resolvedChange(change: .nan, fallback: 9), 9)
        XCTAssertEqual(JdFinanceFormat.resolvedChange(change: 0, fallback: .nan), 0)
    }

    // 웹 `price > 0 ? price : fallback` — 0과 음수 모두 폴백이다(등락률과 규칙이 다르다)
    func test_resolved_price_falls_back_on_zero_and_negative() {
        XCTAssertEqual(JdFinanceFormat.resolvedPrice(price: 100, fallback: 7), 100)
        XCTAssertEqual(JdFinanceFormat.resolvedPrice(price: 0, fallback: 7), 7)
        XCTAssertEqual(JdFinanceFormat.resolvedPrice(price: -5, fallback: 7), 7)
    }

    func test_percent_text_matches_web_toFixed_shape() {
        XCTAssertEqual(JdFinanceFormat.percentText(1.234), "+1.23%")
        XCTAssertEqual(JdFinanceFormat.percentText(-1.235), "-1.24%", "halfExpand 반올림")
        XCTAssertEqual(JdFinanceFormat.percentText(0), "0.00%", "0에는 부호가 붙지 않는다")
        XCTAssertEqual(JdFinanceFormat.percentText(1.5, showSign: false), "1.50%")
        XCTAssertEqual(JdFinanceFormat.percentText(1.5, withPercent: false), "+1.50")
        XCTAssertEqual(JdFinanceFormat.percentText(1.5, decimals: 0), "+2%")
    }

    // 웹 safeDecimals 클램프 — toFixed 범위 밖 인자로 죽지 않는다
    func test_percent_decimals_are_clamped_not_crashing() {
        XCTAssertEqual(JdFinanceFormat.safeFixedDecimals(-3), 0)
        XCTAssertEqual(JdFinanceFormat.safeFixedDecimals(500), 100)
        XCTAssertEqual(JdFinanceFormat.percentText(1.5, decimals: -3), "+2%")
    }

    func test_price_text_uses_em_dash_below_one() {
        XCTAssertEqual(JdFinanceFormat.priceText(0), JdFinanceFormat.emDash)
        XCTAssertEqual(JdFinanceFormat.priceText(-1), JdFinanceFormat.emDash)
        XCTAssertEqual(JdFinanceFormat.priceText(71_200), "71,200")
    }

    // 기기 지역 설정이 결과에 새면 실패한다 (JdNumberFormat의 locale 고정 계약 상속)
    func test_price_text_is_pinned_regardless_of_device_locale() {
        let hint = "기기 로케일(\(Locale.current.identifier))이 결과에 새고 있다"
        XCTAssertEqual(JdFinanceFormat.priceText(1_234_567), "1,234,567", hint)
        XCTAssertEqual(JdFinanceFormat.priceText(1_234.5, decimals: 2), "1,234.50", hint)
        for _ in 0..<20 {
            XCTAssertEqual(JdFinanceFormat.priceText(71_200), "71,200")
        }
    }

    // MARK: - (3) 색 override가 살아 있다

    func test_finance_theme_override_flows_into_specs() {
        let koreanUp = JdDynamicColor(light: 0xE11D_48FF, dark: 0xFB71_85FF)
        JdFinanceTheme.up = koreanUp

        XCTAssertEqual(
            JdFinanceTheme.color(.up).light, koreanUp.light,
            "override가 색 조회에 반영되지 않는다 — 죽은 노브")
        XCTAssertEqual(
            JdPriceBadgeSpec.resolve(pct: 1.2).color.light, koreanUp.light,
            "스펙이 테마를 읽지 않고 토큰을 직접 박아 뒀다")
        XCTAssertEqual(JdHotPctChipSpec.resolve().gradientTop.light, koreanUp.light)
        XCTAssertEqual(
            JdLiveStatusDotSpec.resolve(live: false).color.light,
            JdToken.Color.muted.light,
            "비라이브는 up override와 무관해야 한다")
    }

    func test_reset_restores_token_defaults() {
        JdFinanceTheme.up = JdDynamicColor(light: 0x0000_00FF, dark: 0x0000_00FF)
        JdFinanceTheme.resetToDefaults()
        XCTAssertEqual(JdFinanceTheme.color(.up).light, JdToken.Color.success.light)
        XCTAssertEqual(JdFinanceTheme.color(.down).light, JdToken.Color.danger.light)
        XCTAssertEqual(JdFinanceTheme.color(.flat).light, JdToken.Color.muted.light)
    }

    // MARK: - 스펙 사다리

    func test_price_badge_hides_arrow_on_flat_regardless_of_flag() {
        XCTAssertFalse(
            JdPriceBadgeSpec.resolve(pct: 0, showArrow: true).showsArrow,
            "flat엔 화살표가 없다(웹 trend !== flat 조건)")
        XCTAssertTrue(JdPriceBadgeSpec.resolve(pct: 1, showArrow: true).showsArrow)
        XCTAssertFalse(JdPriceBadgeSpec.resolve(pct: 1, showArrow: false).showsArrow)
        XCTAssertNil(JdPriceBadgeSpec.symbolName(.flat))
        XCTAssertNotNil(JdPriceBadgeSpec.symbolName(.up))
        XCTAssertNotNil(JdPriceBadgeSpec.symbolName(.down))
    }

    func test_price_badge_size_ladder_and_weight() {
        XCTAssertEqual(JdPriceBadgeSpec.resolve(pct: 1, size: .sm).fontSize, 12)
        XCTAssertEqual(JdPriceBadgeSpec.resolve(pct: 1, size: .md).fontSize, 14)
        XCTAssertEqual(
            JdPriceBadgeSpec.resolve(pct: 1, bold: true).fontWeight, JdToken.FontWeight.bold)
        XCTAssertEqual(
            JdPriceBadgeSpec.resolve(pct: 1, bold: false).fontWeight, JdToken.FontWeight.medium)
    }

    func test_live_status_dot_spec_and_default_labels() {
        let live = JdLiveStatusDotSpec.resolve(live: true)
        XCTAssertEqual(live.dotSize, 8)
        XCTAssertEqual(live.fontSize, 11, "웹 리터럴 11px — text-xs(12) 눈금 밖")
        XCTAssertTrue(live.pulses)
        XCTAssertFalse(JdLiveStatusDotSpec.resolve(live: false).pulses)
        XCTAssertEqual(JdLiveStatusDotSpec.defaultLabel(live: true), "실시간")
        XCTAssertEqual(JdLiveStatusDotSpec.defaultLabel(live: false), "장마감")
    }

    func test_hot_pct_chip_text_is_always_upward() {
        XCTAssertEqual(JdHotPctChipSpec.text(12.345), "↑ 12.35%")
        XCTAssertEqual(
            JdHotPctChipSpec.text(-3), "↑ -3.00%",
            "웹과 동형 — 부호 분기가 없다(늘 급등 표기)")
        XCTAssertEqual(JdHotPctChipSpec.text(.nan), "↑ 0.00%")
    }

    // MARK: - 색 혼합 (웹 color-mix 대응)

    func test_mix_is_linear_srgb_blend() {
        let black = JdDynamicColor(light: 0x0000_00FF, dark: 0x0000_00FF)
        let white = JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF)
        XCTAssertEqual(JdFinanceSpecMix.mix(black, with: white, ratio: 0).light, 0x0000_00FF)
        XCTAssertEqual(JdFinanceSpecMix.mix(black, with: white, ratio: 1).light, 0xFFFF_FFFF)
        // 50% 혼합 = RGB 0x80 (127.5 → 128, halfUp). 알파는 양쪽 다 FF이므로 FF로 남는다 —
        // 혼합은 알파도 성분으로 같이 섞으며, 투명도를 만들지 않는다(그건 wash의 일이다).
        XCTAssertEqual(JdFinanceSpecMix.mix(black, with: white, ratio: 0.5).light, 0x8080_80FF)
    }

    func test_mix_ratio_is_clamped() {
        let black = JdDynamicColor(light: 0x0000_00FF, dark: 0x0000_00FF)
        let white = JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF)
        XCTAssertEqual(JdFinanceSpecMix.mix(black, with: white, ratio: -5).light, 0x0000_00FF)
        XCTAssertEqual(JdFinanceSpecMix.mix(black, with: white, ratio: 5).light, 0xFFFF_FFFF)
    }

    // wash는 RGB를 보존하고 알파만 바꾼다 — 웹 color-mix(… X%, transparent) 대응
    func test_wash_only_replaces_alpha() {
        let color = JdDynamicColor(light: 0x1234_56FF, dark: 0xABCD_EFFF)
        let washed = JdFinanceSpecMix.wash(color, alpha: 0.45)
        XCTAssertEqual(washed.light & 0xFFFF_FF00, 0x1234_5600)
        XCTAssertEqual(washed.light & 0xFF, 115, "0.45 × 255 = 114.75 → 115")
        XCTAssertEqual(JdFinanceSpecMix.wash(color, alpha: 0).light & 0xFF, 0)
        XCTAssertEqual(JdFinanceSpecMix.wash(color, alpha: 1).light & 0xFF, 255)
    }
}
