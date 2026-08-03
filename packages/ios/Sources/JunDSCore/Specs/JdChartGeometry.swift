import UIKit

// MARK: - 차트 지오메트리 (DEC-049)
//
// 남은 finance 차트 8종(Area·Candle·Donut·MultiLine·QuarterBar·RealCandle·MarketIndex·
// InvestorFlow)이 전부 같은 계산을 한다: 값 배열 → 정규화 → 화면 좌표. 04 §4.2 규칙 1대로
// **계산은 Core, 렌더는 결과만** 그린다 — SwiftUI Canvas와 UIKit CALayer가 같은 산수를
// 각자 구현하면 두 계층의 그림이 서로 어긋난다.
//
// Sparkline이 이 파일의 첫 소비자이고, 여기 담긴 규칙 셋은 8종이 공유한다:
//  ① 평평한 데이터(min == max)는 0으로 나누지 않고 눕힌다 — 웹 `range = max - min || 1`.
//  ② 비수치(NaN·무한)는 **대입 시점에 걸러낸다.** 좌표 하나가 NaN이면 path 전체가
//     에러 없이 사라진다(웹 v2가 실제로 그랬다).
//  ③ 획 두께만큼 위아래를 비워 둔다 — 선이 상자 경계에서 잘리지 않게.

public enum JdChartGeometry {

    /// 그릴 수 있는 값만 남긴다. **대입 시점에 부르는 것이 계약이다** — 그리기 직전에
    /// 거르면 이미 인덱스가 밀려 x축이 어긋난다.
    public static func sanitize(_ values: [Double]) -> [Double] {
        values.filter { $0.isFinite }
    }

    /// 값 배열 → 상자 안 좌표.
    ///
    /// - Parameters:
    ///   - inset: 위아래로 비워 둘 여백. 획 두께의 절반을 넘겨 선이 잘리지 않게 한다.
    /// - Returns: 값이 비었으면 빈 배열. 한 개면 가로 중앙이 아니라 **왼쪽 끝**에 둔다
    ///   (웹 `stepX = 0` 동형 — 스파크라인은 시간축이라 시작점이 왼쪽이다).
    public static func points(
        _ values: [Double],
        in size: CGSize,
        inset: CGFloat = 1
    ) -> [CGPoint] {
        let data = sanitize(values)
        guard !data.isEmpty, size.width > 0, size.height > 0 else { return [] }

        let minV = data.min() ?? 0
        let maxV = data.max() ?? 0
        // 평평하면 1로 나눈다 — 0 나눗셈 대신 가운데(정확히는 바닥)에 눕힌다
        let range = (maxV - minV) == 0 ? 1 : (maxV - minV)

        let usable = max(0, size.height - inset * 2)
        let stepX = data.count == 1 ? 0 : size.width / CGFloat(data.count - 1)

        return data.enumerated().map { index, value in
            let ratio = (value - minV) / range
            return CGPoint(
                x: CGFloat(index) * stepX,
                y: size.height - CGFloat(ratio) * usable - inset)
        }
    }

    /// 면적 채움용 닫힌 경로 — 선 아래를 바닥까지 내려 닫는다.
    /// 점이 2개 미만이면 채울 면이 없다(빈 배열).
    public static func areaPath(_ points: [CGPoint], in size: CGSize) -> [CGPoint] {
        guard points.count >= 2 else { return [] }
        var closed = points
        closed.append(CGPoint(x: points[points.count - 1].x, y: size.height))
        closed.append(CGPoint(x: points[0].x, y: size.height))
        return closed
    }

    /// 기준선 y — 첫 값의 높이. "지금이 시작보다 위인가"를 한 줄로 말한다.
    public static func baselineY(_ points: [CGPoint]) -> CGFloat? {
        points.first?.y
    }

    /// 마지막 값이 첫 값보다 높은가 — 색을 정하는 기본 판정.
    /// 값이 2개 미만이면 방향이 없다(nil).
    public static func direction(_ values: [Double]) -> JdTrend? {
        let data = sanitize(values)
        guard data.count >= 2, let first = data.first, let last = data.last else { return nil }
        return JdTrend.resolve(last - first, policy: .gainOrEven)
    }
}

// MARK: - Sparkline (웹 jd-sparkline)

public struct JdSparklineSpec: Sendable {
    public var width: CGFloat
    public var height: CGFloat
    public var strokeWidth: CGFloat
    public var lineColor: JdDynamicColor
    /// 면적 채움 위/아래 알파 — 웹 그라디언트 0.45 → 0.02
    public var fillTopAlpha: Double
    public var fillBottomAlpha: Double
    /// 기준선·마지막 점 헤일로 투명도 — 웹 opacity 25 / 20
    public var baselineAlpha: Double
    public var haloAlpha: Double
    public var dotRadius: CGFloat

    /// 웹 기본: 80×24 · 획 1.6
    public static func resolve(
        values: [Double] = [],
        width: CGFloat = 80,
        height: CGFloat = 24,
        strokeWidth: CGFloat = 1.6,
        color: JdDynamicColor? = nil
    ) -> JdSparklineSpec {
        // 색을 명시하지 않으면 추세가 정한다 — 웹은 늘 success 고정이었지만,
        // 스파크라인은 방향을 보여주는 물건이라 하락을 초록으로 그리면 정보가 거꾸로 간다.
        let resolved =
            color
            ?? JdFinanceTheme.color(JdChartGeometry.direction(values) ?? .up)
        return JdSparklineSpec(
            width: width,
            height: height,
            strokeWidth: strokeWidth,
            lineColor: resolved,
            fillTopAlpha: 0.45,
            fillBottomAlpha: 0.02,
            baselineAlpha: 0.25,
            haloAlpha: 0.20,
            dotRadius: 2)
    }

    /// 획이 상자에서 잘리지 않을 최소 여백
    public var inset: CGFloat { max(1, strokeWidth / 2) }
}
