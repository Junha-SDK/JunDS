import UIKit

// MARK: - 시리즈 차트 지오메트리 5종 (DEC-049 — Area·MultiLine·Donut·QuarterBar·InvestorFlow)
//
// 좌표 계산은 전부 여기(Core)이고 렌더는 결과만 그린다 (04 §4.2 규칙 1). 규칙 셋 공유:
//  ① 평평한 데이터는 0으로 나누지 않는다(JdChartLinearScale의 `range || 1`)
//  ② 비수치는 대입 시점에 거른다 — 선 차트는 인덱스를 보존한 채 점만 건너뛰고(여러 시리즈의
//     x축이 서로 밀리면 안 된다), 막대 차트는 0으로 눕힌다(rect 하나가 NaN이면 min/max까지
//     오염된다)
//  ③ 획·마커가 상자에서 잘리지 않게 여백을 계산에 포함한다

// MARK: - AreaChart (웹 AreaChart.tsx)

public struct JdAreaChartGeometry: Sendable {
    public var frame: JdChartFrame
    public var scale: JdChartLinearScale
    public var points: [CGPoint]
    /// 기준선 y — `baseline`이 없으면 상자 세로 중앙(웹 `padT + innerH / 2`)
    public var baselineY: CGFloat
    /// 마지막 값이 기준(명시 baseline 또는 첫 값)보다 **크면** up — 웹 이진 분기라 보합이 없고
    /// 같으면 down이다(`last > base ? "up" : "down"` 동형).
    public var trend: JdTrend
    public var ticks: [Double]

    /// 웹 strokeWidth 1.8 · 그라디언트 0.42→0.02 · 끝점 2.2/헤일로 4.5
    public static let strokeWidth: CGFloat = 1.8
    public static let fillTopAlpha: Double = 0.42
    public static let fillBottomAlpha: Double = 0.02
    public static let dotRadius: CGFloat = 2.2
    public static let haloRadius: CGFloat = 4.5

    /// 웹 pad 36/12/14/24
    public static func frame(width: CGFloat, height: CGFloat) -> JdChartFrame {
        JdChartFrame(width: width, height: height, padL: 36, padR: 12, padT: 14, padB: 24)
    }

    public static func resolve(
        data: [Double],
        baseline: Double? = nil,
        width: CGFloat = 380,
        height: CGFloat = 200
    ) -> JdAreaChartGeometry? {
        let values = JdChartGeometry.sanitize(data)
        guard !values.isEmpty, width > 0, height > 0 else { return nil }
        let frame = frame(width: width, height: height)
        let scale = JdChartLinearScale(min: values.min() ?? 0, max: values.max() ?? 0)
        let stepX = frame.innerW / CGFloat(Swift.max(1, values.count - 1))
        let points = values.enumerated().map { index, value in
            CGPoint(x: frame.padL + CGFloat(index) * stepX, y: scale.y(value, in: frame))
        }
        let base = baseline ?? values[0]
        let baselineY =
            baseline.map { scale.y($0, in: frame) } ?? (frame.padT + frame.innerH / 2)
        return JdAreaChartGeometry(
            frame: frame,
            scale: scale,
            points: points,
            baselineY: baselineY,
            trend: (values[values.count - 1] > base) ? .up : .down,
            ticks: JdChartAxis.ticks(
                min: scale.min, max: scale.max,
                step: JdChartAxis.niceStep(scale.range / 4, minimum: 1)))
    }

    public func y(of value: Double) -> CGFloat { scale.y(value, in: frame) }
}

// MARK: - MultiLineChart (웹 MultiLineChart.tsx)

/// 다중 라인 시리즈 하나. 색은 시리즈 정체성이라 소비자가 준다(웹 계약 동형).
public struct JdChartSeries: Sendable {
    public var name: String
    public var color: JdDynamicColor
    public var data: [Double]

    public init(name: String, color: JdDynamicColor, data: [Double]) {
        self.name = name
        self.color = color
        self.data = data
    }
}

public struct JdMultiLineChartGeometry: Sendable {
    public var frame: JdChartFrame
    public var scale: JdChartLinearScale
    /// 정규화 반영 후 시리즈 값. **비수치는 nil로 남겨 인덱스를 보존한다** — 여러 시리즈가
    /// 한 x축을 공유하므로 sanitize로 지우면 시리즈끼리 축이 어긋난다(규칙 ②의 다중 시리즈판).
    public var seriesValues: [[Double?]]
    /// 시리즈별 화면 좌표 — 비수치 점만 건너뛰되 x는 원래 인덱스로 계산한다
    public var seriesPoints: [[CGPoint]]
    public var zeroY: CGFloat
    public var ticks: [Double]
    public var longest: Int

    public static let strokeWidth: CGFloat = 1.9
    public static let endDotRadius: CGFloat = 3.5

    /// 웹 pad 42/14/12/(범례 있으면 24, 없으면 22)
    public static func frame(width: CGFloat, height: CGFloat, showLegend: Bool) -> JdChartFrame {
        JdChartFrame(
            width: width, height: height,
            padL: 42, padR: 14, padT: 12, padB: showLegend ? 24 : 22)
    }

    public static func resolve(
        series: [JdChartSeries],
        normalize: Bool = true,
        width: CGFloat = 380,
        height: CGFloat = 220,
        showLegend: Bool = true
    ) -> JdMultiLineChartGeometry? {
        guard !series.isEmpty, width > 0, height > 0 else { return nil }
        let frame = frame(width: width, height: height, showLegend: showLegend)

        // 정규화: 첫 값 = 0% 기준의 등락률(웹 `((v - base) / base) * 100`).
        // 첫 값이 0이거나 비수치면 그 시리즈는 정규화하지 않는다(웹 `if (!base) return s`).
        let transformed: [[Double?]] = series.map { s in
            let base = s.data.first
            if normalize, let base, base.isFinite, base != 0 {
                return s.data.map { $0.isFinite ? ($0 - base) / base * 100 : nil }
            }
            return s.data.map { $0.isFinite ? $0 : nil }
        }

        let finite = transformed.flatMap { $0 }.compactMap { $0 }
        guard var minV = finite.min(), var maxV = finite.max() else { return nil }
        // 위아래 10% 숨 — 평평하면 1(웹 `(max - min) * 0.1 || 1`)
        let breathing = (maxV - minV) * 0.1 == 0 ? 1 : (maxV - minV) * 0.1
        minV -= breathing
        maxV += breathing
        let scale = JdChartLinearScale(min: minV, max: maxV)

        let longest = transformed.map(\.count).max() ?? 0
        let stepX = frame.innerW / CGFloat(Swift.max(1, longest - 1))
        let seriesPoints: [[CGPoint]] = transformed.map { values in
            values.enumerated().compactMap { index, value in
                guard let value else { return nil }
                return CGPoint(
                    x: frame.padL + CGFloat(index) * stepX,
                    y: scale.y(value, in: frame))
            }
        }

        return JdMultiLineChartGeometry(
            frame: frame,
            scale: scale,
            seriesValues: transformed,
            seriesPoints: seriesPoints,
            zeroY: scale.y(0, in: frame),
            ticks: JdChartAxis.ticks(
                min: minV, max: maxV,
                step: JdChartAxis.niceStep(scale.range / 4)),
            longest: longest)
    }

    /// 눈금 라벨 — 웹 `${tv >= 0 ? "+" : ""}${tv.toFixed(0)}${unit}`
    public static func tickText(_ value: Double, unit: String = "%") -> String {
        (value >= 0 ? "+" : "") + String(format: "%.0f", value) + unit
    }

    /// 툴팁·요약용 값 문자열 — 웹 `${v >= 0 ? "+" : ""}${v.toFixed(2)}${unit}`, 없으면 em dash
    public static func valueText(_ value: Double?, unit: String = "%") -> String {
        guard let value else { return JdFinanceFormat.emDash }
        return (value >= 0 ? "+" : "") + String(format: "%.2f", value) + unit
    }
}

// MARK: - DonutChart (웹 DonutChart.tsx)

public struct JdDonutSlice: Sendable {
    public var label: String
    public var value: Double
    public var color: JdDynamicColor

    public init(label: String, value: Double, color: JdDynamicColor) {
        self.label = label
        self.value = value
        self.color = color
    }
}

public struct JdDonutSegment: Sendable {
    public var label: String
    public var color: JdDynamicColor
    /// 12시 방향(-π/2)에서 시작하는 시계 방향 라디안 — 웹 SVG 각도 동형
    public var startAngle: Double
    public var endAngle: Double
    public var pct: Double
}

public struct JdDonutChartGeometry: Sendable {
    public var center: CGPoint
    /// 링 중심선 반지름 — 웹 `size/2 - thickness/2`
    public var radius: CGFloat
    public var thickness: CGFloat
    public var segments: [JdDonutSegment]

    /// 중앙 라벨 10.5 bold(축색) · 값 18/800(전경색) — 웹 리터럴
    public static let centerLabelFontSize: CGFloat = 10.5
    public static let centerValueFontSize: CGFloat = 18
    public static let centerLabelOffsetY: CGFloat = -6
    public static let centerValueOffsetY: CGFloat = 12

    public static func resolve(
        slices: [JdDonutSlice],
        size: CGFloat = 220,
        thickness: CGFloat = 28
    ) -> JdDonutChartGeometry {
        let center = CGPoint(x: size / 2, y: size / 2)
        let radius = Swift.max(0, size / 2 - thickness / 2)
        // 비수치·0 이하 값은 조각이 될 수 없다 — 대입 시점에 거른다(규칙 ②).
        // 웹은 거르지 않아 음수 하나가 전체 각도를 조용히 망가뜨린다.
        let data = slices.filter { $0.value.isFinite && $0.value > 0 }
        let total = data.reduce(0) { $0 + $1.value }
        guard total > 0, radius > 0 else {
            return JdDonutChartGeometry(
                center: center, radius: radius, thickness: thickness, segments: [])
        }
        var acc = 0.0
        let segments = data.map { slice -> JdDonutSegment in
            let start = acc / total * 2 * .pi - .pi / 2
            acc += slice.value
            let end = acc / total * 2 * .pi - .pi / 2
            return JdDonutSegment(
                label: slice.label,
                color: slice.color,
                startAngle: start,
                endAngle: end,
                pct: slice.value / total * 100)
        }
        return JdDonutChartGeometry(
            center: center, radius: radius, thickness: thickness, segments: segments)
    }
}

// MARK: - QuarterBarChart (웹 QuarterBarChart.tsx)

public struct JdQuarterRow: Sendable {
    public var label: String
    public var revenue: Double
    public var operatingIncome: Double
    public var netIncome: Double

    public init(label: String, revenue: Double, operatingIncome: Double, netIncome: Double) {
        self.label = label
        self.revenue = revenue
        self.operatingIncome = operatingIncome
        self.netIncome = netIncome
    }
}

/// 짝 막대의 둘째 지표 — 웹 `metric="revenue-op" | "revenue-net"`
public enum JdQuarterBarMetric: String, CaseIterable, Sendable {
    case revenueOp, revenueNet

    public var secondaryLabel: String {
        self == .revenueOp ? "영업이익" : "순이익"
    }
}

public struct JdQuarterBarChartGeometry: Sendable {
    public struct BarPair: Sendable {
        public var label: String
        public var centerX: CGFloat
        public var primaryRect: CGRect
        public var secondaryRect: CGRect
    }

    public var frame: JdChartFrame
    public var scale: JdChartLinearScale
    public var slot: CGFloat
    public var barWidth: CGFloat
    public var zeroY: CGFloat
    public var ticks: [Double]
    public var bars: [BarPair]

    public static let cornerRadius: CGFloat = 2

    /// 계열색은 정체성이다(웹 주석 승계) — 매출/이익 짝을 한눈에 가르는 색이라
    /// 테마 토큰으로 접지 않는다. 웹 #5cdcd0 · #0f766e(=hueTeal) · #a855f7.
    public static let primaryColor = JdDynamicColor(light: 0x5CDC_D0FF, dark: 0x5CDC_D0FF)

    public static func secondaryColor(_ metric: JdQuarterBarMetric) -> JdDynamicColor {
        switch metric {
        case .revenueOp: return JdToken.Color.hueTeal
        case .revenueNet: return JdDynamicColor(light: 0xA855_F7FF, dark: 0xA855_F7FF)
        }
    }

    /// 웹 pad 38/8/12/26
    public static func frame(width: CGFloat, height: CGFloat) -> JdChartFrame {
        JdChartFrame(width: width, height: height, padL: 38, padR: 8, padT: 12, padB: 26)
    }

    public static func resolve(
        data: [JdQuarterRow],
        metric: JdQuarterBarMetric = .revenueOp,
        width: CGFloat = 380,
        height: CGFloat = 220
    ) -> JdQuarterBarChartGeometry? {
        guard !data.isEmpty, width > 0, height > 0 else { return nil }
        let frame = frame(width: width, height: height)
        // 비수치는 0으로 눕힌다(규칙 ② 막대판) — rect 하나가 NaN이면 min/max까지 오염된다
        let rows = data.map { row -> (label: String, a: Double, b: Double) in
            let b = metric == .revenueOp ? row.operatingIncome : row.netIncome
            return (row.label, row.revenue.isFinite ? row.revenue : 0, b.isFinite ? b : 0)
        }
        // 웹 범위 규칙: max는 두 지표 전체, min은 0과 **둘째 지표**만 본다
        // (매출은 음수가 없다는 재무 도메인 가정)
        let maxV = rows.flatMap { [$0.a, $0.b] }.max() ?? 0
        let minV = Swift.min(0, rows.map(\.b).min() ?? 0)
        let scale = JdChartLinearScale(min: minV, max: maxV)

        let slot = frame.innerW / CGFloat(rows.count)
        let barWidth = slot * 0.32
        let zeroY = scale.y(0, in: frame)
        let bars = rows.enumerated().map { index, row -> BarPair in
            let centerX = frame.padL + CGFloat(index) * slot + slot / 2
            let yA = scale.y(row.a, in: frame)
            let yB = scale.y(row.b, in: frame)
            return BarPair(
                label: row.label,
                centerX: centerX,
                primaryRect: CGRect(
                    x: centerX - barWidth - 2,
                    y: Swift.min(yA, zeroY),
                    width: barWidth,
                    height: Swift.max(1, abs(yA - zeroY))),
                secondaryRect: CGRect(
                    x: centerX + 2,
                    y: Swift.min(yB, zeroY),
                    width: barWidth,
                    height: Swift.max(1, abs(yB - zeroY))))
        }
        return JdQuarterBarChartGeometry(
            frame: frame,
            scale: scale,
            slot: slot,
            barWidth: barWidth,
            zeroY: zeroY,
            ticks: JdChartAxis.ticks(
                min: minV, max: maxV,
                step: JdChartAxis.niceStep(scale.range / 4),
                includeMax: true),
            bars: bars)
    }
}

// MARK: - InvestorFlowChart (웹 InvestorFlowChart.tsx)

/// 하루치 투자자별 순매수(억원). 값 계산·집계는 앱의 몫이고 이 타입은 표시 계약이다(DEC-019).
public struct JdDayFlow: Sendable {
    public var date: String
    public var foreign: Double
    public var institution: Double
    public var individual: Double

    public init(date: String, foreign: Double, institution: Double, individual: Double) {
        self.date = date
        self.foreign = foreign
        self.institution = institution
        self.individual = individual
    }
}

/// 매수 주체 — 색은 주체 **정체성**이다. 외국인만 추세색(매수=up·매도=down)을 쓰고,
/// 기관·개인의 매도 색은 up/down(빨강·파랑)과 겹치지 않으려고 고른 계열색이라 토큰으로
/// 옮기지 않는다(웹 주석 승계).
public enum JdInvestorSeries: String, CaseIterable, Sendable {
    case foreign, institution, individual

    public var label: String {
        switch self {
        case .foreign: return "외국인"
        case .institution: return "기관"
        case .individual: return "개인"
        }
    }

    public func color(positive: Bool) -> JdDynamicColor {
        switch self {
        case .foreign:
            return positive ? JdFinanceTheme.up : JdFinanceTheme.down
        case .institution:
            return positive
                ? JdDynamicColor(light: 0xA855_F7FF, dark: 0xA855_F7FF)
                : JdDynamicColor(light: 0x0EA5_E9FF, dark: 0x0EA5_E9FF)
        case .individual:
            return positive
                ? JdToken.Color.warning
                : JdDynamicColor(light: 0x6474_8BFF, dark: 0x6474_8BFF)
        }
    }
}

public struct JdInvestorFlowChartGeometry: Sendable {
    public struct Bar: Sendable {
        public var series: JdInvestorSeries
        public var rect: CGRect
        public var positive: Bool
    }

    public struct Day: Sendable {
        public var date: String
        public var centerX: CGFloat
        public var bars: [Bar]
        /// 날짜 라벨은 `ceil(count/8)` 간격으로만 찍는다(웹 동형 — 전부 찍으면 겹친다)
        public var showsDateLabel: Bool
    }

    public var frame: JdChartFrame
    public var scale: JdChartLinearScale
    public var slot: CGFloat
    public var barWidth: CGFloat
    public var zeroY: CGFloat
    public var ticks: [Double]
    public var days: [Day]

    public static let cornerRadius: CGFloat = 1.5
    /// 웹 `role="img" aria-label` 기본값 — 이 차트는 기본이 정보다(장식이 아니라)
    public static let defaultAccessibilityLabel = "투자자별 순매수 추이"

    /// 웹 pad 38/8/14/24
    public static func frame(width: CGFloat, height: CGFloat) -> JdChartFrame {
        JdChartFrame(width: width, height: height, padL: 38, padR: 8, padT: 14, padB: 24)
    }

    public static func resolve(
        data: [JdDayFlow],
        width: CGFloat = 800,
        height: CGFloat = 240
    ) -> JdInvestorFlowChartGeometry? {
        guard !data.isEmpty, width > 0, height > 0 else { return nil }
        let frame = frame(width: width, height: height)
        // 비수치는 0으로 눕힌다(규칙 ② 막대판) — 하루를 통째로 지우면 x축 날짜가 밀린다
        let rows = data.map { day -> (date: String, values: [Double]) in
            (
                day.date,
                [day.foreign, day.institution, day.individual].map { $0.isFinite ? $0 : 0 }
            )
        }
        // 웹 범위 규칙: 0을 항상 포함한다(`mn = 0, mx = 0`에서 출발)
        let minV = Swift.min(0, rows.flatMap(\.values).min() ?? 0)
        let maxV = Swift.max(0, rows.flatMap(\.values).max() ?? 0)
        let scale = JdChartLinearScale(min: minV, max: maxV)

        let slot = frame.innerW / CGFloat(rows.count)
        let barWidth = Swift.max(2, slot * 0.78 / 3)
        let zeroY = scale.y(0, in: frame)
        // 웹 x 오프셋: 외국인 -1.6w · 기관 -0.5w · 개인 +0.6w
        let offsets: [(series: JdInvestorSeries, offset: CGFloat)] = [
            (.foreign, -1.6), (.institution, -0.5), (.individual, 0.6),
        ]
        let labelEvery = Int((Double(rows.count) / 8).rounded(.up))
        let days = rows.enumerated().map { index, row -> Day in
            let centerX = frame.padL + CGFloat(index) * slot + slot / 2
            let bars = offsets.enumerated().map { valueIndex, entry -> Bar in
                let value = row.values[valueIndex]
                let y = scale.y(value, in: frame)
                return Bar(
                    series: entry.series,
                    rect: CGRect(
                        x: centerX + entry.offset * barWidth,
                        y: Swift.min(zeroY, y),
                        width: barWidth,
                        height: Swift.max(1, abs(y - zeroY))),
                    positive: value >= 0)
            }
            return Day(
                date: row.date,
                centerX: centerX,
                bars: bars,
                showsDateLabel: labelEvery > 0 && index % labelEvery == 0)
        }
        return JdInvestorFlowChartGeometry(
            frame: frame,
            scale: scale,
            slot: slot,
            barWidth: barWidth,
            zeroY: zeroY,
            ticks: JdChartAxis.ticks(
                min: minV, max: maxV,
                step: JdChartAxis.niceStep(scale.range / 4, minimum: 0.1),
                includeMax: true),
            days: days)
    }
}
