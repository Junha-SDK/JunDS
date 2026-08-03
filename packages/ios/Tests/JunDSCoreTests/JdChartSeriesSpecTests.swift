import JunDSCore
import XCTest

// 시리즈 차트 5종 지오메트리 계약 (DEC-049).
//
// 좌표를 손으로 계산해 직접 단언한다 — "그려 보고 눈으로"가 아니라. 여기가 틀리면
// SwiftUI Canvas와 UIKit draw(_:) 두 계층의 그림이 함께 틀린다.
final class JdChartSeriesSpecTests: XCTestCase {

    // MARK: - 축 공통

    // 1·2·5·10 사다리 — 웹 niceStep 동형
    func test_nice_step_climbs_the_1_2_5_ladder() {
        XCTAssertEqual(JdChartAxis.niceStep(1.2), 1, accuracy: 1e-9)
        XCTAssertEqual(JdChartAxis.niceStep(25), 20, accuracy: 1e-9, "f=2.5 → 2 × 10¹")
        XCTAssertEqual(JdChartAxis.niceStep(60), 50, accuracy: 1e-9, "f=6 → 5 × 10¹")
        XCTAssertEqual(JdChartAxis.niceStep(80), 100, accuracy: 1e-9, "f=8 → 10 × 10¹")
        XCTAssertEqual(JdChartAxis.niceStep(0.4), 0.5, accuracy: 1e-9)
    }

    // 클램프는 차트마다 다르다(Area 1 · 기본 0.001) — 지우면 눈금 개수가 웹과 어긋난다
    func test_nice_step_minimum_clamp_is_preserved() {
        XCTAssertEqual(JdChartAxis.niceStep(0.2, minimum: 1), 1, accuracy: 1e-9)
        XCTAssertEqual(JdChartAxis.niceStep(0, minimum: 0.1), 0.1, accuracy: 1e-9)
        XCTAssertEqual(JdChartAxis.niceStep(.nan), 0.001, accuracy: 1e-9, "비수치는 최소값으로")
    }

    // 웹은 `<`(Area·MultiLine)와 `<=`(QuarterBar·InvestorFlow)를 섞어 쓴다 — 차이가 계약이다
    func test_ticks_include_max_flag_matches_web_variants() {
        XCTAssertEqual(JdChartAxis.ticks(min: 0, max: 10, step: 5), [0, 5])
        XCTAssertEqual(JdChartAxis.ticks(min: 0, max: 10, step: 5, includeMax: true), [0, 5, 10])
        XCTAssertEqual(JdChartAxis.ticks(min: -7, max: 7, step: 5), [-5, 0, 5], "ceil(min/step)*step에서 출발")
        XCTAssertEqual(JdChartAxis.ticks(min: 0, max: 10, step: 0), [], "step 0은 눈금이 없다")
    }

    // 평평하면 1로 나눈다 — 규칙 ①이 8종 공용 스케일에도 있다
    func test_linear_scale_flat_range_does_not_divide_by_zero() {
        let frame = JdChartFrame(width: 100, height: 120, padL: 0, padR: 0, padT: 10, padB: 10)
        let scale = JdChartLinearScale(min: 5, max: 5)
        XCTAssertEqual(scale.range, 1)
        XCTAssertEqual(scale.y(5, in: frame), 10, accuracy: 0.001, "평평하면 천장에 눕는다")
    }

    func test_linear_scale_inverts_y() {
        let frame = JdChartFrame(width: 100, height: 120, padL: 0, padR: 0, padT: 10, padB: 10)
        let scale = JdChartLinearScale(min: 0, max: 10)
        XCTAssertEqual(scale.y(10, in: frame), 10, accuracy: 0.001, "최댓값이 천장")
        XCTAssertEqual(scale.y(0, in: frame), 110, accuracy: 0.001, "최솟값이 바닥")
        XCTAssertEqual(scale.y(5, in: frame), 60, accuracy: 0.001)
    }

    // MARK: - AreaChart

    // 기본 380×200: pad 36/12/14/24 → innerW 332 · innerH 162
    func test_area_points_span_the_inner_box() {
        let g = JdAreaChartGeometry.resolve(data: [0, 10])!
        XCTAssertEqual(g.points.count, 2)
        XCTAssertEqual(g.points[0].x, 36, accuracy: 0.001)
        XCTAssertEqual(g.points[1].x, 368, accuracy: 0.001, "padL + innerW")
        XCTAssertEqual(g.points[0].y, 176, accuracy: 0.001, "최솟값 = padT + innerH")
        XCTAssertEqual(g.points[1].y, 14, accuracy: 0.001, "최댓값 = padT")
    }

    // 기준선 없음 → 상자 세로 중앙(웹 `padT + innerH / 2`)
    func test_area_default_baseline_is_vertical_center() {
        let g = JdAreaChartGeometry.resolve(data: [0, 10])!
        XCTAssertEqual(g.baselineY, 95, accuracy: 0.001)
        let withBase = JdAreaChartGeometry.resolve(data: [0, 10], baseline: 5)!
        XCTAssertEqual(withBase.baselineY, 95, accuracy: 0.001, "5는 마침 중앙값")
        let low = JdAreaChartGeometry.resolve(data: [0, 10], baseline: 0)!
        XCTAssertEqual(low.baselineY, 176, accuracy: 0.001)
    }

    // 추세는 이진이다 — 웹 `last > base ? up : down`(같으면 down)
    func test_area_trend_is_binary_web_parity() {
        XCTAssertEqual(JdAreaChartGeometry.resolve(data: [1, 5])!.trend, .up)
        XCTAssertEqual(JdAreaChartGeometry.resolve(data: [5, 1])!.trend, .down)
        XCTAssertEqual(JdAreaChartGeometry.resolve(data: [5, 5])!.trend, .down, "같으면 down(웹 동형)")
        XCTAssertEqual(JdAreaChartGeometry.resolve(data: [1, 8], baseline: 9)!.trend, .down)
    }

    // 눈금: range 10 → step = niceStep(2.5, min 1) = 2, `< max` 미포함
    func test_area_ticks_exclude_max() {
        let g = JdAreaChartGeometry.resolve(data: [0, 10])!
        XCTAssertEqual(g.ticks, [0, 2, 4, 6, 8])
    }

    func test_area_sanitizes_and_handles_empty() {
        XCTAssertEqual(JdAreaChartGeometry.resolve(data: [1, .nan, 3])!.points.count, 2)
        XCTAssertNil(JdAreaChartGeometry.resolve(data: []))
        XCTAssertNil(JdAreaChartGeometry.resolve(data: [.nan]))
    }

    // MARK: - MultiLineChart

    private func series(_ data: [Double], name: String = "s") -> JdChartSeries {
        JdChartSeries(name: name, color: JdToken.Color.primary, data: data)
    }

    // 정규화: 첫 값 = 0% 기준 등락률(웹 `((v - base) / base) * 100`)
    func test_multiline_normalizes_to_percent_change() {
        let g = JdMultiLineChartGeometry.resolve(series: [series([100, 110, 90])])!
        XCTAssertEqual(g.seriesValues[0][0]!, 0, accuracy: 1e-9)
        XCTAssertEqual(g.seriesValues[0][1]!, 10, accuracy: 1e-9)
        XCTAssertEqual(g.seriesValues[0][2]!, -10, accuracy: 1e-9)
    }

    // 첫 값이 0이면 정규화하지 않는다(웹 `if (!base) return s`)
    func test_multiline_zero_base_skips_normalization() {
        let g = JdMultiLineChartGeometry.resolve(series: [series([0, 5])])!
        XCTAssertEqual(g.seriesValues[0][1]!, 5, accuracy: 1e-9)
    }

    // 범위엔 위아래 10% 숨이 붙는다 — [0,10] → [-1,11]
    func test_multiline_range_breathes_ten_percent() {
        let g = JdMultiLineChartGeometry.resolve(series: [series([100, 110])])!
        XCTAssertEqual(g.scale.min, -1, accuracy: 1e-9)
        XCTAssertEqual(g.scale.max, 11, accuracy: 1e-9)
    }

    // 380×220 · 범례 → pad 42/14/12/24 → innerW 324 · innerH 184
    func test_multiline_points_and_zero_line() {
        let g = JdMultiLineChartGeometry.resolve(series: [series([100, 110])])!
        XCTAssertEqual(g.seriesPoints[0][0].x, 42, accuracy: 0.001)
        XCTAssertEqual(g.seriesPoints[0][1].x, 366, accuracy: 0.001, "width - padR")
        // zeroY = 12 + (11 - 0)/12 × 184
        XCTAssertEqual(g.zeroY, 12 + 184 * 11 / 12, accuracy: 0.001)
    }

    // 비수치는 nil로 남아 인덱스를 보존한다 — 지우면 여러 시리즈의 x축이 서로 밀린다
    func test_multiline_nan_keeps_index_alignment() {
        let g = JdMultiLineChartGeometry.resolve(
            series: [series([100, .nan, 120])], normalize: false)!
        XCTAssertNil(g.seriesValues[0][1])
        XCTAssertEqual(g.seriesPoints[0].count, 2)
        // 마지막 점의 x는 index 2 그대로 — stepX = 324/2 = 162
        XCTAssertEqual(g.seriesPoints[0][1].x, 42 + 324, accuracy: 0.001)
    }

    func test_multiline_empty_and_all_nan_are_nil() {
        XCTAssertNil(JdMultiLineChartGeometry.resolve(series: []))
        XCTAssertNil(JdMultiLineChartGeometry.resolve(series: [series([.nan, .infinity])]))
    }

    // 값 문자열 — 웹 `+v.toFixed(2)%` / 없으면 em dash
    func test_multiline_value_text() {
        XCTAssertEqual(JdMultiLineChartGeometry.valueText(3.456), "+3.46%")
        XCTAssertEqual(JdMultiLineChartGeometry.valueText(-2), "-2.00%")
        XCTAssertEqual(JdMultiLineChartGeometry.valueText(nil), "—")
        XCTAssertEqual(JdMultiLineChartGeometry.tickText(4), "+4%")
    }

    // MARK: - DonutChart

    // size 220 · thickness 28 → r 96, 12시(-π/2)에서 시계 방향
    func test_donut_segments_partition_the_circle() {
        let g = JdDonutChartGeometry.resolve(slices: [
            JdDonutSlice(label: "a", value: 75, color: JdToken.Color.primary),
            JdDonutSlice(label: "b", value: 25, color: JdToken.Color.accent),
        ])
        XCTAssertEqual(g.radius, 96, accuracy: 0.001)
        XCTAssertEqual(g.center.x, 110, accuracy: 0.001)
        XCTAssertEqual(g.segments.count, 2)
        XCTAssertEqual(g.segments[0].startAngle, -.pi / 2, accuracy: 1e-9)
        XCTAssertEqual(g.segments[0].endAngle, .pi, accuracy: 1e-9, "75% = 3/4바퀴")
        XCTAssertEqual(g.segments[0].pct, 75, accuracy: 1e-9)
        XCTAssertEqual(g.segments[1].startAngle, .pi, accuracy: 1e-9, "이어서 시작")
        XCTAssertEqual(g.segments[1].endAngle, 1.5 * .pi, accuracy: 1e-9)
    }

    // 0·음수·비수치 조각은 대입 시점에 걸러진다 — 웹은 안 걸러서 음수가 각도를 망가뜨린다
    func test_donut_drops_non_drawable_slices() {
        let g = JdDonutChartGeometry.resolve(slices: [
            JdDonutSlice(label: "a", value: 10, color: JdToken.Color.primary),
            JdDonutSlice(label: "b", value: -5, color: JdToken.Color.accent),
            JdDonutSlice(label: "c", value: .nan, color: JdToken.Color.accent),
            JdDonutSlice(label: "d", value: 0, color: JdToken.Color.accent),
        ])
        XCTAssertEqual(g.segments.count, 1)
        XCTAssertEqual(g.segments[0].pct, 100, accuracy: 1e-9)
    }

    func test_donut_zero_total_yields_no_segments() {
        XCTAssertTrue(JdDonutChartGeometry.resolve(slices: []).segments.isEmpty)
        XCTAssertTrue(
            JdDonutChartGeometry.resolve(slices: [
                JdDonutSlice(label: "a", value: 0, color: JdToken.Color.primary)
            ]).segments.isEmpty)
    }

    // MARK: - QuarterBarChart

    private let rows = [
        JdQuarterRow(label: "1Q", revenue: 100, operatingIncome: 40, netIncome: 30),
        JdQuarterRow(label: "2Q", revenue: 80, operatingIncome: -20, netIncome: -10),
    ]

    // 380×220 · pad 38/8/12/26 → innerW 334 · innerH 182. 범위: max 100 / min min(0,-20)=-20
    func test_quarterbar_range_rule_min_only_looks_at_secondary() {
        let g = JdQuarterBarChartGeometry.resolve(data: rows)!
        XCTAssertEqual(g.scale.max, 100, accuracy: 1e-9)
        XCTAssertEqual(g.scale.min, -20, accuracy: 1e-9)
        // slot 167 · barWidth 53.44
        XCTAssertEqual(g.slot, 167, accuracy: 0.001)
        XCTAssertEqual(g.barWidth, 53.44, accuracy: 0.001)
    }

    func test_quarterbar_bar_rects_hand_computed() {
        let g = JdQuarterBarChartGeometry.resolve(data: rows)!
        // zeroY = 12 + (100/120) × 182
        XCTAssertEqual(g.zeroY, 12 + 182 * 100 / 120, accuracy: 0.001)
        // 1Q 매출(=100): y = 12(천장), 높이 = zeroY - 12
        let primary = g.bars[0].primaryRect
        XCTAssertEqual(primary.origin.x, g.bars[0].centerX - g.barWidth - 2, accuracy: 0.001)
        XCTAssertEqual(primary.origin.y, 12, accuracy: 0.001)
        XCTAssertEqual(primary.height, g.zeroY - 12, accuracy: 0.001)
        // 2Q 영업이익(=-20): 0선 아래로 내려간다
        let secondary = g.bars[1].secondaryRect
        XCTAssertEqual(secondary.origin.x, g.bars[1].centerX + 2, accuracy: 0.001)
        XCTAssertEqual(secondary.origin.y, g.zeroY, accuracy: 0.001)
        XCTAssertEqual(secondary.height, 194 - g.zeroY, accuracy: 0.001, "yOf(-20) = padT + innerH")
    }

    // 눈금은 max 포함(웹 `<=`): range 120 → step 50 → [0, 50, 100]
    func test_quarterbar_ticks_include_max() {
        let g = JdQuarterBarChartGeometry.resolve(data: rows)!
        XCTAssertEqual(g.ticks, [0, 50, 100])
    }

    func test_quarterbar_metric_switches_secondary() {
        let op = JdQuarterBarChartGeometry.resolve(data: rows, metric: .revenueOp)!
        let net = JdQuarterBarChartGeometry.resolve(data: rows, metric: .revenueNet)!
        XCTAssertEqual(op.scale.min, -20, accuracy: 1e-9)
        XCTAssertEqual(net.scale.min, -10, accuracy: 1e-9)
        XCTAssertEqual(JdQuarterBarMetric.revenueOp.secondaryLabel, "영업이익")
        XCTAssertEqual(JdQuarterBarMetric.revenueNet.secondaryLabel, "순이익")
    }

    // 비수치는 0으로 눕는다 — 막대 하나가 NaN이면 min/max까지 오염되기 때문
    func test_quarterbar_non_finite_lies_flat_at_zero() {
        let g = JdQuarterBarChartGeometry.resolve(data: [
            JdQuarterRow(label: "1Q", revenue: .nan, operatingIncome: 40, netIncome: 0)
        ])!
        XCTAssertEqual(g.scale.max, 40, accuracy: 1e-9)
        XCTAssertEqual(g.bars[0].primaryRect.height, 1, accuracy: 0.001, "0 막대의 최소 높이 1")
    }

    // MARK: - InvestorFlowChart

    private let flows = [
        JdDayFlow(date: "7/1", foreign: 100, institution: -50, individual: 25),
        JdDayFlow(date: "7/2", foreign: -75, institution: 50, individual: 0),
    ]

    // 800×240 · pad 38/8/14/24 → innerW 754 · innerH 202. 범위엔 0이 항상 포함된다.
    func test_investorflow_range_always_includes_zero() {
        let g = JdInvestorFlowChartGeometry.resolve(data: flows)!
        XCTAssertEqual(g.scale.min, -75, accuracy: 1e-9)
        XCTAssertEqual(g.scale.max, 100, accuracy: 1e-9)
        let positiveOnly = JdInvestorFlowChartGeometry.resolve(data: [
            JdDayFlow(date: "7/1", foreign: 10, institution: 20, individual: 30)
        ])!
        XCTAssertEqual(positiveOnly.scale.min, 0, accuracy: 1e-9, "전부 양수여도 0이 바닥")
    }

    func test_investorflow_three_bars_hand_computed() {
        let g = JdInvestorFlowChartGeometry.resolve(data: flows)!
        // slot 377 · barW = max(2, 377×0.78/3) = 98.02
        XCTAssertEqual(g.barWidth, 98.02, accuracy: 0.001)
        let day = g.days[0]
        XCTAssertEqual(day.centerX, 38 + 188.5, accuracy: 0.001)
        XCTAssertEqual(day.bars.count, 3)
        // 외국인(+100): 웹 오프셋 -1.6w, 천장(padT)까지
        XCTAssertEqual(day.bars[0].rect.origin.x, day.centerX - 1.6 * g.barWidth, accuracy: 0.001)
        XCTAssertEqual(day.bars[0].rect.origin.y, 14, accuracy: 0.001)
        XCTAssertTrue(day.bars[0].positive)
        // 기관(-50): 0선 아래 — top이 zeroY
        XCTAssertEqual(day.bars[1].rect.origin.x, day.centerX - 0.5 * g.barWidth, accuracy: 0.001)
        XCTAssertEqual(day.bars[1].rect.origin.y, g.zeroY, accuracy: 0.001)
        XCTAssertFalse(day.bars[1].positive)
        // 개인(+25)
        XCTAssertEqual(day.bars[2].rect.origin.x, day.centerX + 0.6 * g.barWidth, accuracy: 0.001)
        // zeroY = 14 + (100/175) × 202
        XCTAssertEqual(g.zeroY, 14 + 202 * 100 / 175, accuracy: 0.001)
    }

    // 0은 상승 쪽(막대 최소 1pt) — 죽은 날처럼 보이지 않게
    func test_investorflow_zero_value_is_positive_with_min_height() {
        let g = JdInvestorFlowChartGeometry.resolve(data: flows)!
        let individual = g.days[1].bars[2]
        XCTAssertTrue(individual.positive)
        XCTAssertEqual(individual.rect.height, 1, accuracy: 0.001)
    }

    // 날짜 라벨은 ceil(count/8) 간격 — 2일이면 매일, 30일이면 4일마다
    func test_investorflow_date_label_stride() {
        let g = JdInvestorFlowChartGeometry.resolve(data: flows)!
        XCTAssertTrue(g.days.allSatisfy(\.showsDateLabel))
        let month = JdInvestorFlowChartGeometry.resolve(
            data: (0..<30).map {
                JdDayFlow(date: "\($0)", foreign: 1, institution: 1, individual: 1)
            })!
        XCTAssertEqual(month.days.filter(\.showsDateLabel).count, 8, "30/4 = 8곳")
        XCTAssertTrue(month.days[0].showsDateLabel)
        XCTAssertFalse(month.days[1].showsDateLabel)
    }

    // 주체 색: 외국인만 추세색, 기관·개인은 정체성 색
    func test_investorflow_series_colors() {
        JdFinanceTheme.resetToDefaults()
        XCTAssertEqual(
            JdInvestorSeries.foreign.color(positive: true).light, JdFinanceTheme.up.light)
        XCTAssertEqual(
            JdInvestorSeries.foreign.color(positive: false).light, JdFinanceTheme.down.light)
        XCTAssertEqual(JdInvestorSeries.institution.color(positive: true).light, 0xA855_F7FF)
        XCTAssertEqual(
            JdInvestorSeries.individual.color(positive: true).light,
            JdToken.Color.warning.light)
        XCTAssertEqual(JdInvestorSeries.foreign.label, "외국인")
    }

    // 비수치는 0으로 눕는다 — 하루를 지우면 날짜 축이 밀린다
    func test_investorflow_non_finite_lies_flat_at_zero() {
        let g = JdInvestorFlowChartGeometry.resolve(data: [
            JdDayFlow(date: "7/1", foreign: .nan, institution: 10, individual: -10)
        ])!
        XCTAssertEqual(g.days.count, 1)
        XCTAssertEqual(g.days[0].bars[0].rect.height, 1, accuracy: 0.001)
        XCTAssertTrue(g.days[0].bars[0].positive, "0은 상승 쪽")
    }
}
