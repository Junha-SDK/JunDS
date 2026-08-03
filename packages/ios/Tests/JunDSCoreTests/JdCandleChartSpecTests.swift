import JunDSCore
import XCTest

// 캔들 계열(Candle·MarketIndex·RealCandle) 지오메트리 계약 (DEC-049).
final class JdCandleChartSpecTests: XCTestCase {

    private let candles = [
        JdCandle(o: 100, h: 110, l: 90, c: 105, v: 10),
        JdCandle(o: 105, h: 120, l: 100, c: 95, v: 30),
    ]

    private func layout(
        markers: [JdCandleMarkerLine] = [],
        showVolume: Bool = true,
        logScale: Bool = false
    ) -> JdCandleChartLayout {
        JdCandleChartLayout.resolve(
            candles: candles, markers: markers, showVolume: showVolume, logScale: logScale)!
    }

    // MARK: - 레이아웃

    // 기본 380×380 · pad 8/64/6/22 · 거래량 70 → candleH 282 · innerW 308
    func test_layout_partitions_price_and_volume_panels() {
        let l = layout()
        XCTAssertEqual(l.candleH, 282, accuracy: 0.001)
        XCTAssertEqual(l.volH, 70, accuracy: 0.001)
        XCTAssertEqual(l.volTop, 294, accuracy: 0.001, "padT + candleH + 6")
        XCTAssertEqual(l.volBottom, 364, accuracy: 0.001)
        XCTAssertEqual(l.slot, 154, accuracy: 0.001, "innerW 308 / 2봉")
        XCTAssertEqual(l.bodyW, 107.8, accuracy: 0.001, "slot × 0.7")
        let noVol = layout(showVolume: false)
        XCTAssertEqual(noVol.candleH, 352, accuracy: 0.001)
    }

    // 범위: l~h(90~120) + 4% 숨 → 88.8~121.2
    func test_price_range_breathes_four_percent() {
        let l = layout()
        XCTAssertEqual(l.minPrice, 88.8, accuracy: 1e-9)
        XCTAssertEqual(l.maxPrice, 121.2, accuracy: 1e-9)
    }

    func test_y_price_hand_computed() {
        let l = layout()
        XCTAssertEqual(l.yPrice(121.2), 6, accuracy: 0.001, "최댓값 = padT")
        XCTAssertEqual(l.yPrice(88.8), 288, accuracy: 0.001, "최솟값 = padT + candleH")
        // yPrice(105) = 6 + (121.2 - 105)/32.4 × 282
        XCTAssertEqual(l.yPrice(105), 147, accuracy: 0.001)
        XCTAssertEqual(l.centerX(0), 85, accuracy: 0.001, "padL + slot/2")
        XCTAssertEqual(l.centerX(1), 239, accuracy: 0.001)
    }

    // 평평한 캔들(min == max)이면 숨이 1로 대체된다 — 규칙 ①의 캔들판
    func test_flat_candles_do_not_divide_by_zero() {
        let l = JdCandleChartLayout.resolve(candles: [JdCandle(o: 50, h: 50, l: 50, c: 50)])!
        XCTAssertEqual(l.minPrice, 49, accuracy: 1e-9)
        XCTAssertEqual(l.maxPrice, 51, accuracy: 1e-9)
        XCTAssertTrue(l.yPrice(50).isFinite)
    }

    // MARK: - 마커

    // 정적 마커는 범위를 넓히고, live 마커는 범위를 쏠리게 하지 않는다(웹 동형)
    func test_static_markers_extend_range_but_live_markers_do_not() {
        let color = JdToken.Color.primary
        let withStatic = layout(markers: [
            JdCandleMarkerLine(label: "B1", price: 140, color: color)
        ])
        XCTAssertEqual(withStatic.maxPrice, 142, accuracy: 1e-9, "140 + (140-90)×0.04")
        let withLive = layout(markers: [
            JdCandleMarkerLine(label: "현재", price: 140, color: color, live: true)
        ])
        XCTAssertEqual(withLive.maxPrice, 121.2, accuracy: 1e-9)
    }

    // live 마커의 화면 밖 가격은 캔들 영역 안쪽 10pt로 접힌다
    func test_live_marker_clamps_into_the_candle_panel() {
        let l = layout()
        XCTAssertEqual(l.yPriceClamped(1000), 16, accuracy: 0.001, "padT + 10")
        XCTAssertEqual(l.yPriceClamped(1), 278, accuracy: 0.001, "padT + candleH - 10")
        XCTAssertEqual(l.yPriceClamped(105), l.yPrice(105), accuracy: 0.001, "범위 안이면 그대로")
    }

    // MARK: - 눈금

    // 선형: step = niceStep(32.4/6 = 5.4) = 5 → 90…120 (max 미포함)
    func test_linear_ticks() {
        XCTAssertEqual(layout().ticks, [90, 95, 100, 105, 110, 115, 120])
    }

    // 로그: 1·2·5 사다리를 자릿수마다 — [88.8, 121.2]엔 100 하나뿐
    func test_log_ticks_use_1_2_5_ladder() {
        let l = layout(logScale: true)
        XCTAssertTrue(l.useLog)
        XCTAssertEqual(l.ticks, [100])
    }

    // 음수 범위에선 로그가 자동 폴백된다(웹 `logScale && min > 0`)
    func test_log_scale_falls_back_on_non_positive_range() {
        let l = JdCandleChartLayout.resolve(
            candles: [JdCandle(o: -5, h: 5, l: -10, c: 0)], logScale: true)!
        XCTAssertFalse(l.useLog)
    }

    // MARK: - 거래량·이동평균

    func test_volume_bar_height_floors_like_web() {
        let l = layout()
        XCTAssertEqual(l.maxVol, 30, accuracy: 1e-9)
        XCTAssertEqual(l.volumeBarHeight(30), 62, accuracy: 0.001, "(volH - 8) 만점")
        XCTAssertEqual(l.volumeBarHeight(10), floor(62.0 / 3), accuracy: 0.001)
        XCTAssertEqual(l.volumeBarHeight(0), 0, accuracy: 0.001)
        XCTAssertEqual(l.volumeBarHeight(.nan), 0, accuracy: 0.001)
    }

    func test_moving_average_hand_computed() {
        let series = [1.0, 2, 3, 4].map { JdCandle(o: $0, h: $0, l: $0, c: $0) }
        let ma = JdCandleChartLayout.movingAverage(series, period: 2)
        XCTAssertNil(ma[0], "기간 미달 구간은 nil")
        XCTAssertEqual(ma[1]!, 1.5, accuracy: 1e-9)
        XCTAssertEqual(ma[2]!, 2.5, accuracy: 1e-9)
        XCTAssertEqual(ma[3]!, 3.5, accuracy: 1e-9)
    }

    // MARK: - 위생·표시

    func test_sanitize_drops_non_finite_candles() {
        let mixed = candles + [JdCandle(o: .nan, h: 1, l: 1, c: 1)]
        XCTAssertEqual(JdCandleChartLayout.sanitize(mixed).count, 2)
        // resolve도 걸러서 범위를 오염시키지 않는다
        let l = JdCandleChartLayout.resolve(candles: mixed)!
        XCTAssertEqual(l.maxPrice, 121.2, accuracy: 1e-9)
    }

    // 빈 캔들도 레이아웃은 선다(웹 로딩 상태 — RealCandle이 빈 배열을 넘긴다)
    func test_empty_candles_resolve_to_a_stable_layout() {
        let l = JdCandleChartLayout.resolve(candles: [])!
        XCTAssertEqual(l.minPrice, -0.04, accuracy: 1e-9)
        XCTAssertEqual(l.maxPrice, 1.04, accuracy: 1e-9)
        XCTAssertTrue(l.yPrice(0.5).isFinite)
    }

    func test_candle_up_judgement_and_texts() {
        XCTAssertTrue(JdCandle(o: 100, h: 1, l: 1, c: 100).isUp, "c == o는 양봉(웹 c >= o)")
        XCTAssertFalse(JdCandle(o: 100, h: 1, l: 1, c: 99).isUp)
        XCTAssertEqual(JdCandleChartLayout.tickText(71200), "71,200")
        XCTAssertEqual(JdCandleChartLayout.tickText(98.5), "98.50", "1000 미만은 소수 2자리")
        XCTAssertEqual(JdCandleChartLayout.priceChipText(71199.6), "71,200")
    }

    func test_ma_palette_is_distinct_per_period() {
        let periods = [5, 10, 20, 60, 120]
        let colors = periods.map { JdCandleChartLayout.maColor(period: $0).light }
        XCTAssertEqual(Set(colors).count, periods.count, "구분되는 것 자체가 기능이다")
        XCTAssertEqual(
            JdCandleChartLayout.maColor(period: 20).light, JdToken.Color.warning.light)
    }

    // 거래량 색 — 웹 리터럴 빨강/파랑 대신 추세색 55% 워시(의도된 차이, 테마 추종)
    func test_volume_color_follows_finance_theme() {
        JdFinanceTheme.resetToDefaults()
        let up = JdCandleChartLayout.volumeColor(up: true)
        XCTAssertEqual(up.light & 0xFFFF_FF00, JdFinanceTheme.up.light & 0xFFFF_FF00)
        XCTAssertEqual(up.light & 0xFF, UInt32((0.55 * 255).rounded()), "알파 55%")
    }

    // MARK: - MarketIndexChart 스펙

    func test_market_index_pill_and_legend() {
        let selected = JdMarketIndexChartSpec.pill(selected: true)
        let idle = JdMarketIndexChartSpec.pill(selected: false)
        XCTAssertEqual(selected.fontWeight, JdToken.FontWeight.bold)
        XCTAssertEqual(idle.fontWeight, JdToken.FontWeight.medium)
        XCTAssertNotEqual(selected.background.light, idle.background.light)
        XCTAssertEqual(JdMarketIndexChartSpec.maLegend.map(\.period), [5, 10, 20, 60, 120])
    }

    // MARK: - RealCandleChart 스펙

    func test_real_candle_header_states() {
        let live = JdRealCandleHeaderSpec.resolve(source: .live, liveLabel: "KIS · 실시간")
        XCTAssertEqual(live.text, "KIS · 실시간")
        XCTAssertEqual(live.foreground.light, JdToken.Color.success.light)
        XCTAssertEqual(
            JdRealCandleHeaderSpec.resolve(source: .loading).text, "데이터 불러오는 중…")
        XCTAssertEqual(JdRealCandleHeaderSpec.resolve(source: .sample).text, "샘플 데이터")
    }

    // 웹 신선도 규칙: <5 방금 · <60 n초 전 · 그 외 n분 전
    func test_real_candle_freshness_text() {
        XCTAssertEqual(JdRealCandleHeaderSpec.freshnessText(secondsAgo: 3), "방금")
        XCTAssertEqual(JdRealCandleHeaderSpec.freshnessText(secondsAgo: 45), "45초 전")
        XCTAssertEqual(JdRealCandleHeaderSpec.freshnessText(secondsAgo: 130), "2분 전")
        XCTAssertEqual(JdRealCandleHeaderSpec.freshnessText(secondsAgo: -7), "방금", "음수는 0으로")
    }

    func test_real_candle_caption() {
        XCTAssertEqual(
            JdRealCandleHeaderSpec.caption(count: 88, range: "3mo", interval: "1d"),
            "88봉 · 3mo 1d")
    }
}
