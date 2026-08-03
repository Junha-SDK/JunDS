import JunDSCore
import XCTest

// finance 조립 스펙 계약 (DEC-041).
//
// 보는 것: (1) **세 번째** 추세 규칙이 앞의 둘과 실제로 다른가 (2) PositionBar 좌표 산수가
// 클램프까지 맞는가 — 웹 v2가 음수 width를 내던 결함이 되돌아오지 않는가 (3) KPI 셀의
// 보조 라인·착색 규칙.
final class JdFinanceLayoutSpecTests: XCTestCase {

    override func tearDown() {
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    // MARK: - 세 번째 추세 규칙

    // gainOrEven엔 flat이 없다 — 두 값이 한 색으로 묶인 셀에서 회색은 "죽은 행"이 된다
    func test_gainOrEven_never_returns_flat() {
        for v in [-5.0, -0.001, 0.0, 0.001, 5.0] {
            XCTAssertNotEqual(JdTrend.resolve(v, policy: .gainOrEven), .flat, "value=\(v)")
        }
        XCTAssertEqual(JdTrend.resolve(0, policy: .gainOrEven), .up, "0은 상승 쪽이다")
        XCTAssertEqual(JdTrend.resolve(-0.001, policy: .gainOrEven), .down)
    }

    // 세 규칙이 0에서 모두 갈린다 — 하나로 합쳐지면 이 단언이 깨진다
    func test_three_policies_disagree_at_zero() {
        XCTAssertEqual(JdTrend.resolve(0, policy: .live), .flat)
        XCTAssertEqual(JdTrend.resolve(0, policy: .exact), .flat)
        XCTAssertEqual(JdTrend.resolve(0, policy: .gainOrEven), .up)
        XCTAssertEqual(JdTrendPolicy.allCases.count, 3)
    }

    // MARK: - LiveStackedCell

    func test_stacked_cell_uses_one_color_for_both_lines() {
        XCTAssertEqual(
            JdLiveStackedCellSpec.resolve(change: 0).color.light,
            JdFinanceTheme.color(.up).light, "0%도 상승색")
        XCTAssertEqual(
            JdLiveStackedCellSpec.resolve(change: -1).color.light,
            JdFinanceTheme.color(.down).light)
    }

    func test_stacked_cell_lines_use_per_value_fallback_rules() {
        // 가격은 > 0, 등락률은 != 0 — 규칙이 값마다 다르다
        let a = JdLiveStackedCellSpec.lines(price: 71_200, change: 1.234)
        XCTAssertEqual(a.price, "71,200")
        XCTAssertEqual(a.pct, "+1.23%")

        let b = JdLiveStackedCellSpec.lines(
            price: 0, change: 0,
            priceFallback: 68_000, pctFallback: -2.5)
        XCTAssertEqual(b.price, "68,000")
        XCTAssertEqual(b.pct, "-2.50%")

        let c = JdLiveStackedCellSpec.lines(price: 0, change: 0)
        XCTAssertEqual(c.price, JdFinanceFormat.emDash)
        XCTAssertEqual(c.pct, "0.00%")
    }

    func test_stacked_cell_speaks_direction() {
        XCTAssertEqual(
            JdLiveStackedCellSpec.accessibilityText(price: "71,200", pct: "+1.23%", change: 1.23),
            "71,200, 상승 +1.23%")
        XCTAssertEqual(
            JdLiveStackedCellSpec.accessibilityText(price: "71,200", pct: "-1.23%", change: -1.23),
            "71,200, 하락 -1.23%")
    }

    func test_stacked_cell_font_ladder_is_v2_literals() {
        let spec = JdLiveStackedCellSpec.resolve(change: 1)
        XCTAssertEqual(spec.priceFontSize, 13)
        XCTAssertEqual(spec.pctFontSize, 10.5)
        XCTAssertGreaterThan(spec.priceFontWeight, spec.pctFontWeight)
    }

    // MARK: - PositionBar 좌표

    func test_percent_converts_fraction_and_clamps() {
        XCTAssertEqual(JdPositionBarGeometry.percent(0.5), 50)
        XCTAssertEqual(JdPositionBarGeometry.percent(0), 0)
        XCTAssertEqual(JdPositionBarGeometry.percent(1), 100)
        XCTAssertEqual(JdPositionBarGeometry.percent(2), 100, "범위 밖은 클램프")
        XCTAssertEqual(JdPositionBarGeometry.percent(-1), 0)
        // 비유한은 클램프가 아니라 **0**이다 — 웹 v3와 동형:
        //   `if (!Number.isFinite(n)) return 0`
        // 무한대를 100(최대)으로 접으면 데이터 결손이 "구간 끝에 도달"로 잘못 보인다.
        XCTAssertEqual(JdPositionBarGeometry.percent(.nan), 0)
        XCTAssertEqual(JdPositionBarGeometry.percent(.infinity), 0)
        XCTAssertEqual(JdPositionBarGeometry.percent(-.infinity), 0)
    }

    func test_layout_produces_band_and_fill() {
        let g = JdPositionBarGeometry.layout(low: 0.2, high: 0.8, cur: 0.5)
        XCTAssertEqual(g.bandStart, 20)
        XCTAssertEqual(g.bandWidth, 60)
        XCTAssertEqual(g.fillStart, 20)
        XCTAssertEqual(g.fillWidth, 30)
    }

    // 웹 v2는 cur < low일 때 음수 width를 냈다 — 그 결함이 돌아오지 않는지 본다
    func test_widths_never_go_negative() {
        let below = JdPositionBarGeometry.layout(low: 0.5, high: 0.9, cur: 0.1)
        XCTAssertEqual(below.fillWidth, 0, "cur < low인데 음수 폭이 나왔다")
        let inverted = JdPositionBarGeometry.layout(low: 0.9, high: 0.2, cur: 0.5)
        XCTAssertEqual(inverted.bandWidth, 0, "high < low인데 음수 폭이 나왔다")
    }

    func test_accessibility_text_trims_trailing_zero() {
        XCTAssertEqual(
            JdPositionBarGeometry.accessibilityText(low: 0.2, high: 0.8, cur: 0.5),
            "구간 20–80% 중 현재 50%")
        XCTAssertEqual(
            JdPositionBarGeometry.accessibilityText(low: 0.205, high: 0.8, cur: 0.5),
            "구간 20.5–80% 중 현재 50%")
    }

    func test_position_bar_marker_is_taller_than_track() {
        let spec = JdPositionBarSpec.resolve(tone: .up)
        XCTAssertGreaterThan(
            spec.markerHeight, spec.trackHeight,
            "마커가 트랙보다 작으면 클립 금지 규칙의 근거가 사라진다")
        XCTAssertEqual(
            JdPositionBarSpec.resolve(tone: .up).fillColor.light, JdFinanceTheme.up.light)
        XCTAssertEqual(
            JdPositionBarSpec.resolve(tone: .down).fillColor.light, JdFinanceTheme.down.light)
    }

    // 밴드는 채움의 옅은 판이다 — 같은 색이면 구간이 안 보인다
    func test_band_is_a_wash_of_the_fill() {
        let spec = JdPositionBarSpec.resolve(tone: .up)
        XCTAssertEqual(
            spec.bandColor.light & 0xFFFF_FF00, spec.fillColor.light & 0xFFFF_FF00,
            "밴드와 채움의 색상은 같아야 한다")
        XCTAssertLessThan(
            spec.bandColor.light & 0xFF, spec.fillColor.light & 0xFF,
            "밴드가 더 투명해야 구간이 채움과 구분된다")
    }

    // MARK: - MicroKpi 셀

    func test_sub_text_prefers_hint_then_percent() {
        XCTAssertEqual(
            JdMicroKpiCellSpec.subText(item: .init(label: "L", value: "1", pct: 1.5)), "+1.50%")
        XCTAssertEqual(
            JdMicroKpiCellSpec.subText(item: .init(label: "L", value: "1", pct: 1.5, hint: "순매수")),
            "순매수")
        XCTAssertEqual(
            JdMicroKpiCellSpec.subText(item: .init(label: "L", value: "1")), "0.00%",
            "pct가 없으면 0%로 그린다(웹 `it.pct ?? 0` 동형)")
        XCTAssertEqual(
            JdMicroKpiCellSpec.subText(item: .init(label: "L", value: "1", pct: 1.5, hint: "")),
            "+1.50%", "빈 hint는 hint가 아니다")
    }

    // hint가 있어도 **색은 pct 부호를 따른다**(웹 계약) — 문구가 색을 가리지 않는다
    func test_sub_color_follows_pct_even_with_hint() {
        let up = JdMicroKpiCellSpec.resolve(
            item: .init(label: "L", value: "1", pct: 2, hint: "순매수"))
        XCTAssertEqual(up.subColor.light, JdFinanceTheme.color(.up).light)
        let down = JdMicroKpiCellSpec.resolve(
            item: .init(label: "L", value: "1", pct: -2, hint: "순매도"))
        XCTAssertEqual(down.subColor.light, JdFinanceTheme.color(.down).light)
        // pct 자체가 없으면 방향이 없다 → muted
        let none = JdMicroKpiCellSpec.resolve(item: .init(label: "L", value: "1", hint: "휴장"))
        XCTAssertEqual(none.subColor.light, JdToken.Color.muted.light)
    }

    // 0%는 gainOrEven이라 상승 쪽이다(StackedCell과 같은 규칙 — 웹 `(pct ?? 0) >= 0`)
    func test_zero_pct_cell_is_up_colored() {
        XCTAssertEqual(
            JdMicroKpiCellSpec.resolve(item: .init(label: "L", value: "1", pct: 0)).subColor.light,
            JdFinanceTheme.color(.up).light)
    }

    func test_cell_accessibility_joins_label_value_unit_sub() {
        let item = JdMicroKpiItem(label: "USD/KRW", value: "1,320", pct: -0.4, unit: "원")
        XCTAssertEqual(JdMicroKpiCellSpec.accessibilityText(item: item), "USD/KRW, 1,320 원, -0.40%")
        let noUnit = JdMicroKpiItem(label: "WTI", value: "78.2", pct: 1.1)
        XCTAssertEqual(JdMicroKpiCellSpec.accessibilityText(item: noUnit), "WTI, 78.2, +1.10%")
    }

    func test_cell_font_ladder_is_v2_literals() {
        let spec = JdMicroKpiCellSpec.resolve(item: .init(label: "L", value: "1"))
        XCTAssertEqual(spec.labelFontSize, 10.5)
        XCTAssertEqual(spec.valueFontSize, 16)
        XCTAssertEqual(spec.subFontSize, 10)
        XCTAssertEqual(spec.valueFontWeight, 800, "웹 extrabold — FontWeight 램프 밖 리터럴")
    }

    func test_theme_override_reaches_layout_specs() {
        let koreanUp = JdDynamicColor(light: 0xE11D_48FF, dark: 0xFB71_85FF)
        JdFinanceTheme.up = koreanUp
        XCTAssertEqual(JdLiveStackedCellSpec.resolve(change: 1).color.light, koreanUp.light)
        XCTAssertEqual(JdPositionBarSpec.resolve(tone: .up).fillColor.light, koreanUp.light)
        XCTAssertEqual(
            JdMicroKpiCellSpec.resolve(item: .init(label: "L", value: "1", pct: 1)).subColor.light,
            koreanUp.light)
    }
}
