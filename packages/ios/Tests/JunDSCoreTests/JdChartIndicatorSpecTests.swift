import JunDSCore
import XCTest

// 차트 지표 17종 — 웹 ds/__tests__/finance/chartIndicators.test.ts의 손검산 테스트를
// **같은 입력·같은 기대값**으로 이식했다. 여기가 웹↔iOS 수치 패리티의 정본이다 (DEC-048).
// 웹 toBeCloseTo(x, 10) ≈ accuracy 1e-9 · toBeCloseTo(x, 4~6)은 각각 명시.
final class JdChartIndicatorSpecTests: XCTestCase {

    private func bar(
        _ o: Double, _ h: Double, _ l: Double, _ c: Double, _ v: Double = 100
    ) -> JdCandle {
        JdCandle(o: o, h: h, l: l, c: c, v: v)
    }

    /// n개의 동일한 바 — 지표 수렴값 검증용(웹 constantBars 동형)
    private func constantBars(_ n: Int, _ b: JdCandle? = nil) -> [JdCandle] {
        let base = b ?? bar(100, 110, 90, 100)
        return Array(repeating: base, count: n)
    }

    // MARK: - computeSMA

    func test_sma_computes_with_null_warmup() {
        XCTAssertEqual(JdChartIndicators.sma([1, 2, 3, 4, 5], period: 3), [nil, nil, 2, 3, 4])
    }

    func test_sma_period_1_returns_values_themselves() {
        XCTAssertEqual(JdChartIndicators.sma([3, 7, 11], period: 1), [3, 7, 11])
    }

    func test_sma_period_greater_than_length_is_all_nil() {
        XCTAssertEqual(JdChartIndicators.sma([1, 2, 3], period: 10), [nil, nil, nil])
    }

    func test_sma_empty_input_returns_empty() {
        XCTAssertEqual(JdChartIndicators.sma([], period: 5), [])
    }

    // MARK: - computeEMA

    func test_ema_seeds_with_sma_then_applies_k_smoothing() {
        // period=3 → k=0.5. seed at i=2: (1+2+3)/3 = 2
        // i=3: 4*0.5 + 2*0.5 = 3 ; i=4: 5*0.5 + 3*0.5 = 4
        XCTAssertEqual(JdChartIndicators.ema([1, 2, 3, 4, 5], period: 3), [nil, nil, 2, 3, 4])
    }

    func test_ema_period_1_equals_input() {
        XCTAssertEqual(JdChartIndicators.ema([10, 20, 30], period: 1), [10, 20, 30])
    }

    func test_ema_period_greater_than_length_is_all_nil() {
        XCTAssertEqual(JdChartIndicators.ema([1, 2], period: 5), [nil, nil])
    }

    func test_ema_empty_input_returns_empty() {
        XCTAssertEqual(JdChartIndicators.ema([], period: 3), [])
    }

    func test_ema_stays_constant_on_constant_series() {
        let out = JdChartIndicators.ema([7, 7, 7, 7, 7, 7], period: 3)
        XCTAssertEqual(Array(out[2...]), [7, 7, 7, 7])
    }

    // MARK: - computeBollinger

    func test_bollinger_collapses_to_middle_on_constant_series() {
        let s = JdChartIndicators.bollinger([5, 5, 5, 5], period: 3, stdDev: 2)
        XCTAssertEqual(s.middle, [nil, nil, 5, 5])
        XCTAssertEqual(s.upper, [nil, nil, 5, 5])
        XCTAssertEqual(s.lower, [nil, nil, 5, 5])
    }

    func test_bollinger_bands_symmetric_around_sma() {
        // window [2,4,6]: mean 4, variance ((−2)²+0+2²)/3 = 8/3
        let sd = (8.0 / 3.0).squareRoot()
        let s = JdChartIndicators.bollinger([2, 4, 6], period: 3, stdDev: 2)
        XCTAssertEqual(s.middle[2]!, 4, accuracy: 1e-9)
        XCTAssertEqual(s.upper[2]!, 4 + 2 * sd, accuracy: 1e-9)
        XCTAssertEqual(s.lower[2]!, 4 - 2 * sd, accuracy: 1e-9)
    }

    func test_bollinger_handles_empty_input() {
        let s = JdChartIndicators.bollinger([], period: 20, stdDev: 2)
        XCTAssertEqual(s.upper, [])
        XCTAssertEqual(s.middle, [])
        XCTAssertEqual(s.lower, [])
    }

    // MARK: - computeRSI

    func test_rsi_all_nil_when_length_not_above_period() {
        XCTAssertEqual(JdChartIndicators.rsi([1, 2, 3], period: 14), [nil, nil, nil])
        XCTAssertEqual(JdChartIndicators.rsi([], period: 14), [])
    }

    func test_rsi_is_100_for_monotonically_rising_series() {
        let out = JdChartIndicators.rsi([1, 2, 3, 4, 5, 6], period: 3)
        XCTAssertEqual(Array(out[0..<3]), [nil, nil, nil])
        for v in out[3...] { XCTAssertEqual(v, 100) }
    }

    func test_rsi_is_0_for_monotonically_falling_series() {
        let out = JdChartIndicators.rsi([6, 5, 4, 3, 2, 1], period: 3)
        for v in out[3...] { XCTAssertEqual(v, 0) }
    }

    func test_rsi_matches_hand_computed_wilder_example() {
        // period=2, closes [10, 11, 10, 11]
        // warmup: gain=0.5 loss=0.5 → RSI[2] = 50
        // i=3: diff +1 → gain=(0.5+1)/2=0.75, loss=0.25 → RS=3 → RSI = 75
        let out = JdChartIndicators.rsi([10, 11, 10, 11], period: 2)
        XCTAssertNil(out[0])
        XCTAssertNil(out[1])
        XCTAssertEqual(out[2]!, 50, accuracy: 1e-9)
        XCTAssertEqual(out[3]!, 75, accuracy: 1e-9)
    }

    func test_rsi_stays_within_0_100() {
        let closes = (0..<60).map { 100 + sin(Double($0)) * 10 }
        for v in JdChartIndicators.rsi(closes, period: 14) {
            guard let v else { continue }
            XCTAssertGreaterThanOrEqual(v, 0)
            XCTAssertLessThanOrEqual(v, 100)
        }
    }

    // MARK: - computeMACD

    func test_macd_is_zero_after_warmup_on_constant_series() {
        let closes = Array(repeating: 10.0, count: 20)
        let s = JdChartIndicators.macd(closes, fast: 3, slow: 5, signalPeriod: 3)
        // macd starts when slow EMA (period 5) is ready → index 4
        XCTAssertEqual(Array(s.macd[0..<4]), [nil, nil, nil, nil])
        for v in s.macd[4...] { XCTAssertEqual(v!, 0, accuracy: 1e-9) }
        // signal seeds after 3 macd values → index 6
        XCTAssertNil(s.signal[5])
        for v in s.signal[6...] { XCTAssertEqual(v!, 0, accuracy: 1e-9) }
        for v in s.histogram[6...] { XCTAssertEqual(v!, 0, accuracy: 1e-9) }
    }

    func test_macd_keeps_all_series_aligned_to_input_length() {
        let closes = (0..<50).map { 100.0 + Double($0) }
        let s = JdChartIndicators.macd(closes)
        XCTAssertEqual(s.macd.count, 50)
        XCTAssertEqual(s.signal.count, 50)
        XCTAssertEqual(s.histogram.count, 50)
    }

    func test_macd_positive_in_sustained_uptrend() {
        let closes = (0..<60).map { 100 * pow(1.01, Double($0)) }
        let s = JdChartIndicators.macd(closes, fast: 12, slow: 26, signalPeriod: 9)
        let last = s.macd[s.macd.count - 1]
        XCTAssertNotNil(last)
        XCTAssertGreaterThan(last!, 0)
    }

    // MARK: - toHeikinAshi

    func test_heikin_ashi_empty_input_returns_empty() {
        XCTAssertEqual(JdChartIndicators.heikinAshi([]), [])
    }

    func test_heikin_ashi_first_candle_from_own_o_c() {
        let ha = JdChartIndicators.heikinAshi([bar(10, 12, 8, 11, 500)])[0]
        XCTAssertEqual(ha.c, (10 + 12 + 8 + 11) / 4, accuracy: 1e-9)  // 10.25
        XCTAssertEqual(ha.o, (10 + 11) / 2, accuracy: 1e-9)  // 10.5
        XCTAssertEqual(ha.h, 12)
        XCTAssertEqual(ha.l, 8)
        XCTAssertEqual(ha.v, 500)
    }

    func test_heikin_ashi_chains_open_from_previous_candle() {
        let out = JdChartIndicators.heikinAshi([bar(10, 12, 8, 11), bar(11, 14, 10, 13)])
        let prevO = 10.5
        let prevC = 10.25
        XCTAssertEqual(out[1].o, (prevO + prevC) / 2, accuracy: 1e-9)  // 10.375
        XCTAssertEqual(out[1].c, (11 + 14 + 10 + 13) / 4, accuracy: 1e-9)  // 12
        XCTAssertEqual(out[1].h, 14)
        XCTAssertEqual(out[1].l, 10)
    }

    func test_heikin_ashi_preserves_length() {
        XCTAssertEqual(JdChartIndicators.heikinAshi(constantBars(7)).count, 7)
    }

    // MARK: - computeStochastic

    func test_stochastic_computes_k_from_rolling_window() {
        // bar_i: l=i, h=i+4, c=i+1 → window(3) ending at i: hi=i+4, lo=i-2, span=6
        // %K = ((i+1)-(i-2))/6*100 = 50
        let bars = (0..<6).map { i in
            bar(Double(i), Double(i) + 4, Double(i), Double(i) + 1)
        }
        let s = JdChartIndicators.stochastic(bars, period: 3, smoothPeriod: 3)
        XCTAssertNil(s.k[0])
        XCTAssertNil(s.k[1])
        for v in s.k[2...] { XCTAssertEqual(v!, 50, accuracy: 1e-9) }
        // %D needs 3 k-values → first at index 4
        XCTAssertNil(s.d[3])
        XCTAssertEqual(s.d[4]!, 50, accuracy: 1e-9)
        XCTAssertEqual(s.d[5]!, 50, accuracy: 1e-9)
    }

    func test_stochastic_falls_back_to_50_on_zero_span() {
        let flat = constantBars(5, bar(10, 10, 10, 10))
        let s = JdChartIndicators.stochastic(flat, period: 3, smoothPeriod: 3)
        for v in s.k[2...] { XCTAssertEqual(v, 50) }
    }

    func test_stochastic_is_100_when_close_at_window_high() {
        let bars = [bar(1, 2, 1, 1), bar(1, 3, 1, 2), bar(2, 5, 1, 5)]
        let s = JdChartIndicators.stochastic(bars, period: 3, smoothPeriod: 3)
        XCTAssertEqual(s.k[2], 100)
    }

    // MARK: - computeOBV

    func test_obv_accumulates_volume_by_close_direction() {
        let bars = [
            bar(0, 0, 0, 10, 100),
            bar(0, 0, 0, 12, 200),  // up → +200
            bar(0, 0, 0, 11, 300),  // down → -300
            bar(0, 0, 0, 11, 400),  // flat → unchanged
            bar(0, 0, 0, 15, 500),  // up → +500
        ]
        XCTAssertEqual(JdChartIndicators.obv(bars), [0, 200, -100, -100, 400])
    }

    func test_obv_empty_input_returns_empty() {
        XCTAssertEqual(JdChartIndicators.obv([]), [])
    }

    // MARK: - computeVWAP

    func test_vwap_equals_typical_price_for_single_bar() {
        let out = JdChartIndicators.vwap([bar(10, 12, 8, 10, 100)])
        XCTAssertEqual(out[0]!, (12 + 8 + 10) / 3, accuracy: 1e-9)
    }

    func test_vwap_volume_weights_across_bars_in_one_session() {
        // typical prices 10 and 20, equal volume → 15
        let out = JdChartIndicators.vwap([bar(0, 12, 8, 10, 100), bar(0, 22, 18, 20, 100)])
        XCTAssertEqual(out[1]!, 15, accuracy: 1e-9)
    }

    func test_vwap_resets_at_session_boundary() {
        let bars = [bar(0, 12, 8, 10, 100), bar(0, 22, 18, 20, 100)]
        let out = JdChartIndicators.vwap(bars) { _, _, i in i == 1 }
        XCTAssertEqual(out[0]!, 10, accuracy: 1e-9)
        XCTAssertEqual(out[1]!, 20, accuracy: 1e-9)  // new session → only bar 2
    }

    func test_vwap_nil_when_cumulative_volume_is_zero() {
        let out = JdChartIndicators.vwap([bar(0, 12, 8, 10, 0)])
        XCTAssertNil(out[0])
    }

    // MARK: - computeATR

    func test_atr_all_nil_when_bars_below_period_plus_one() {
        XCTAssertEqual(JdChartIndicators.atr(constantBars(3), period: 3), [nil, nil, nil])
    }

    func test_atr_equals_constant_true_range_on_uniform_bars() {
        // every bar h=11 l=9 c=10 → TR = 2 everywhere
        let bars = constantBars(5, bar(10, 11, 9, 10))
        let out = JdChartIndicators.atr(bars, period: 3)
        XCTAssertNil(out[0])
        XCTAssertNil(out[1])
        XCTAssertEqual(out[2]!, 2, accuracy: 1e-9)
        XCTAssertEqual(out[3]!, 2, accuracy: 1e-9)
        XCTAssertEqual(out[4]!, 2, accuracy: 1e-9)
    }

    func test_atr_includes_gap_moves_via_prev_close() {
        // bar1 closes at 10, bar2 gaps to h=20 l=15 → TR2 = max(5, 10, 5) = 10
        let bars = [bar(10, 11, 9, 10), bar(18, 20, 15, 19), bar(18, 20, 15, 19)]
        let out = JdChartIndicators.atr(bars, period: 2)
        // trs = [2, 10, 5] → ATR[1] = 6, ATR[2] = (6 + 5)/2 = 5.5
        XCTAssertEqual(out[1]!, 6, accuracy: 1e-9)
        XCTAssertEqual(out[2]!, 5.5, accuracy: 1e-9)
    }

    // MARK: - computeWilliamsR

    func test_williams_r_is_0_at_window_high_and_minus_100_at_low() {
        let atHigh = [bar(1, 2, 1, 1), bar(1, 3, 1, 2), bar(2, 5, 1, 5)]
        XCTAssertEqual(JdChartIndicators.williamsR(atHigh, period: 3)[2], -0.0)  // (hi-c)=0
        let atLow = [bar(5, 5, 3, 4), bar(4, 4, 2, 3), bar(3, 3, 1, 1)]
        XCTAssertEqual(JdChartIndicators.williamsR(atLow, period: 3)[2], -100)
    }

    func test_williams_r_falls_back_to_minus_50_on_zero_span() {
        let flat = constantBars(4, bar(10, 10, 10, 10))
        XCTAssertEqual(JdChartIndicators.williamsR(flat, period: 3)[3], -50)
    }

    func test_williams_r_keeps_warmup_nils() {
        let out = JdChartIndicators.williamsR(constantBars(5), period: 3)
        XCTAssertNil(out[0])
        XCTAssertNil(out[1])
    }

    // MARK: - computeCCI

    func test_cci_is_0_on_constant_series() {
        let out = JdChartIndicators.cci(constantBars(6), period: 3)
        XCTAssertNil(out[0])
        XCTAssertNil(out[1])
        for v in out[2...] { XCTAssertEqual(v, 0) }
    }

    func test_cci_matches_hand_computed_value() {
        // typical prices: bar(0,3,0,0) → 1 ; bar(0,6,0,0) → 2 ; bar(0,9,0,0) → 3
        // mean = 2, MD = (1+0+1)/3 = 2/3 → CCI = (3-2)/(0.015*2/3) = 100
        let bars = [bar(0, 3, 0, 0), bar(0, 6, 0, 0), bar(0, 9, 0, 0)]
        XCTAssertEqual(JdChartIndicators.cci(bars, period: 3)[2]!, 100, accuracy: 1e-9)
    }

    // MARK: - computeIchimoku

    private var ichimokuBars: [JdCandle] { constantBars(80, bar(100, 110, 90, 100)) }  // (110+90)/2 = 100

    func test_ichimoku_conversion_base_after_warmups() {
        let s = JdChartIndicators.ichimoku(ichimokuBars)
        XCTAssertNil(s.conversion[7])
        XCTAssertEqual(s.conversion[8], 100)
        XCTAssertNil(s.base[24])
        XCTAssertEqual(s.base[25], 100)
    }

    func test_ichimoku_shifts_spans_forward_by_base_period() {
        let s = JdChartIndicators.ichimoku(ichimokuBars)
        // spanA raw ready at 25, shifted +26 → first non-nil at 51
        XCTAssertNil(s.spanA[50])
        XCTAssertEqual(s.spanA[51], 100)
        // spanB raw ready at 51, shifted +26 → first non-nil at 77
        XCTAssertNil(s.spanB[76])
        XCTAssertEqual(s.spanB[77], 100)
    }

    func test_ichimoku_keeps_every_series_aligned_to_input_length() {
        let s = JdChartIndicators.ichimoku(ichimokuBars)
        for series in [s.conversion, s.base, s.spanA, s.spanB] {
            XCTAssertEqual(series.count, 80)
        }
    }

    // MARK: - computePivot

    func test_pivot_computes_standard_levels_from_prev_hlc() {
        let p = JdChartIndicators.pivot(previous: bar(0, 110, 90, 100))
        XCTAssertEqual(p.pivot, 100, accuracy: 1e-9)
        XCTAssertEqual(p.r1, 110, accuracy: 1e-9)
        XCTAssertEqual(p.s1, 90, accuracy: 1e-9)
        XCTAssertEqual(p.r2, 120, accuracy: 1e-9)
        XCTAssertEqual(p.s2, 80, accuracy: 1e-9)
        XCTAssertEqual(p.r3, 130, accuracy: 1e-9)
        XCTAssertEqual(p.s3, 70, accuracy: 1e-9)
    }

    // MARK: - computeRegression

    func test_regression_returns_nil_for_fewer_than_4_points() {
        XCTAssertNil(JdChartIndicators.regression([1, 2, 3]))
        XCTAssertNil(JdChartIndicators.regression([]))
    }

    func test_regression_fits_perfect_line_exactly() {
        let r = JdChartIndicators.regression([1, 2, 3, 4, 5])
        XCTAssertNotNil(r)
        XCTAssertEqual(r!.startY, 1, accuracy: 1e-9)
        XCTAssertEqual(r!.endY, 5, accuracy: 1e-9)
        XCTAssertEqual(r!.stdDev, 0, accuracy: 1e-9)
        XCTAssertEqual(r!.r2, 1, accuracy: 1e-9)
    }

    func test_regression_flat_line_has_r2_zero_on_constant_series() {
        let r = JdChartIndicators.regression([5, 5, 5, 5, 5])
        XCTAssertNotNil(r)
        XCTAssertEqual(r!.startY, 5, accuracy: 1e-9)
        XCTAssertEqual(r!.endY, 5, accuracy: 1e-9)
        XCTAssertEqual(r!.r2, 0)
    }

    // MARK: - detectPatterns

    func test_detect_patterns_empty_for_fewer_than_25_bars() {
        XCTAssertTrue(JdChartIndicators.detectPatterns(constantBars(24)).isEmpty)
    }

    func test_detect_patterns_golden_cross_when_ma5_crosses_above_ma20() {
        // 20 declining closes then a sharp 15-bar rally
        let decline: [Double] = (0..<20).map { 120 - Double($0) }
        let rally: [Double] = (0..<15).map { 101 + Double($0 + 1) * 3 }
        let bars = (decline + rally).map { bar($0, $0 + 1, $0 - 1, $0) }
        let hits = JdChartIndicators.detectPatterns(bars)
        XCTAssertTrue(hits.contains { $0.kind == .goldenCross })
        XCTAssertFalse(hits.contains { $0.kind == .deadCross })
    }

    func test_detect_patterns_dead_cross_when_ma5_crosses_below_ma20() {
        let climb: [Double] = (0..<20).map { 100 + Double($0) }
        let drop: [Double] = (0..<15).map { 119 - Double($0 + 1) * 3 }
        let bars = (climb + drop).map { bar($0, $0 + 1, $0 - 1, $0) }
        let hits = JdChartIndicators.detectPatterns(bars)
        XCTAssertTrue(hits.contains { $0.kind == .deadCross })
    }

    // MARK: - computeVolumeProfile

    func test_volume_profile_empty_for_empty_bars_or_non_positive_bins() {
        XCTAssertTrue(JdChartIndicators.volumeProfile([], bins: 24).isEmpty)
        XCTAssertTrue(JdChartIndicators.volumeProfile(constantBars(3), bins: 0).isEmpty)
    }

    func test_volume_profile_empty_when_min_not_below_max() {
        XCTAssertTrue(
            JdChartIndicators.volumeProfile(constantBars(3, bar(10, 10, 10, 10))).isEmpty)
    }

    func test_volume_profile_distributes_volume_proportionally() {
        let out = JdChartIndicators.volumeProfile([bar(5, 10, 0, 5, 100)], bins: 2)
        XCTAssertEqual(out.count, 2)
        XCTAssertEqual(out[0].priceMin, 0, accuracy: 1e-9)
        XCTAssertEqual(out[1].priceMax, 10, accuracy: 1e-9)
        XCTAssertEqual(out[0].volume, 50, accuracy: 1e-6)
        XCTAssertEqual(out[1].volume, 50, accuracy: 1e-6)
    }

    func test_volume_profile_conserves_total_volume() {
        let bars = [bar(5, 10, 0, 5, 100), bar(6, 8, 2, 7, 60)]
        let out = JdChartIndicators.volumeProfile(bars, bins: 8)
        let total = out.reduce(0) { $0 + $1.volume }
        XCTAssertEqual(total, 160, accuracy: 1e-4)
    }
}
