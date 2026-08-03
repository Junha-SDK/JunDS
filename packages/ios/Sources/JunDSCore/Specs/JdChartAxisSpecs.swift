import UIKit

// MARK: - 차트 축 공통 어휘 (DEC-049 — 차트 8종)
//
// 차트 8종(Area·MultiLine·Donut·QuarterBar·InvestorFlow·Candle·MarketIndex·RealCandle)이
// 전부 같은 축 산수를 쓴다: nice step(1·2·5 사다리) · 눈금 나열 · 값→y 변환. 웹은 niceStep을
// 파일마다 복사해 두었지만(AreaChart·MultiLineChart·QuarterBarChart·InvestorFlowChart 각자
// 한 벌씩) iOS는 한 벌만 둔다 — 계산은 Core, 렌더는 결과만 그린다 (04 §4.2 규칙 1).

public enum JdChartAxis {

    /// 웹 `niceStep` 동형 — 눈금 간격을 1·2·5·10 사다리로 올림.
    /// `minimum`은 웹이 차트마다 달리 쓰는 log10 클램프다(Area 1 · MultiLine/QuarterBar 0.001 ·
    /// InvestorFlow 0.1) — 그 차이를 지우면 같은 데이터의 눈금 개수가 웹과 어긋난다.
    public static func niceStep(_ raw: Double, minimum: Double = 0.001) -> Double {
        let clamped = Swift.max(minimum, raw.isFinite ? raw : minimum)
        let exp = pow(10, floor(log10(clamped)))
        let f = clamped / exp
        let nf: Double
        if f < 1.5 {
            nf = 1
        } else if f < 3 {
            nf = 2
        } else if f < 7 {
            nf = 5
        } else {
            nf = 10
        }
        return nf * exp
    }

    /// min~max 구간의 눈금 값 — 웹 `t = Math.ceil(min/step)*step; while (t < max)` 동형.
    /// `includeMax`: 웹이 차트마다 `<`와 `<=`를 섞어 쓴다(Area·MultiLine·Candle은 미포함,
    /// QuarterBar·InvestorFlow는 포함). 그 차이도 계약이라 보존한다.
    public static func ticks(
        min: Double, max: Double, step: Double, includeMax: Bool = false
    ) -> [Double] {
        guard step > 0, min.isFinite, max.isFinite, min <= max else { return [] }
        var out: [Double] = []
        var t = (min / step).rounded(.up) * step
        while includeMax ? t <= max : t < max {
            out.append(t)
            t += step
            // 방어 — step이 상대적으로 0에 가까우면 눈금이 무한히 나온다
            if out.count >= 1000 { break }
        }
        return out
    }
}

/// 차트 상자 — 웹 padL/padR/padT/padB 4패딩 관용구의 타입화.
public struct JdChartFrame: Sendable, Equatable {
    public var width: CGFloat
    public var height: CGFloat
    public var padL: CGFloat
    public var padR: CGFloat
    public var padT: CGFloat
    public var padB: CGFloat

    public init(
        width: CGFloat, height: CGFloat,
        padL: CGFloat, padR: CGFloat, padT: CGFloat, padB: CGFloat
    ) {
        self.width = width
        self.height = height
        self.padL = padL
        self.padR = padR
        self.padT = padT
        self.padB = padB
    }

    public var innerW: CGFloat { Swift.max(0, width - padL - padR) }
    public var innerH: CGFloat { Swift.max(0, height - padT - padB) }
    public var plotRight: CGFloat { width - padR }
    public var plotBottom: CGFloat { padT + innerH }
}

/// 값→y 선형 변환 — 큰 값이 위(작은 y). 평평하면(min == max) 1로 나눈다(웹 `range || 1` —
/// JdChartGeometry 규칙 ①과 같은 계약이고, 8종 전체가 이 한 곳을 쓴다).
public struct JdChartLinearScale: Sendable, Equatable {
    public var min: Double
    public var max: Double

    public init(min: Double, max: Double) {
        self.min = min
        self.max = max
    }

    public var range: Double { (max - min) == 0 ? 1 : (max - min) }

    public func y(_ value: Double, in frame: JdChartFrame) -> CGFloat {
        frame.padT + CGFloat((max - value) / range) * frame.innerH
    }
}

/// 차트 표면색 — 웹 `--bm-grid` / `--bm-axis`의 대응분. JdFinanceTheme.up/down과 같은
/// "기본값 + 앱 override" 구조다(iOS엔 CSS 캐스케이드가 없다).
public enum JdChartTheme {
    /// 격자선 — 웹 `--bm-grid`
    public static var grid: JdDynamicColor = JdToken.Color.borderLight
    /// 축·눈금 라벨 — 웹 `--bm-axis`
    public static var axis: JdDynamicColor = JdToken.Color.muted

    /// 테스트·프리뷰가 override를 되돌릴 때 쓴다(정적 상태 누수 차단).
    public static func resetToDefaults() {
        grid = JdToken.Color.borderLight
        axis = JdToken.Color.muted
    }
}
