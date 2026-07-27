import UIKit

// MARK: - finance 조립 스펙 (DEC-041)
//
// 여기 셋은 리프(DEC-040)와 성격이 다르다 — **자기 안의 배치를 스스로 소유한다.**
// 그래서 소비자는 "무엇을 보여줄지"만 정하고 "어떻게 놓을지"는 넘기지 않는다:
//  - StackedCell : 두 값을 한 색으로 묶어 2단 우측정렬 (테이블 셀 관용구)
//  - PositionBar : 구간·현재 위치를 분수로 받아 좌표를 계산 (렌더는 결과만 놓는다)
//  - MicroKpiRow : N개 셀을 폭에 맞춰 감싸 배치 (격자를 소비자가 짜지 않는다)
//
// 좌표·클램프 계산이 Core에 있는 이유(04 §4.2 규칙 1): 두 렌더 계층이 같은 산수를 각자
// 구현하면 반드시 어긋난다. 웹이 `update()`에서 인라인 %로 넣던 계산이 여기 온 것이다.

// MARK: - LiveStackedCell (웹 jd-live-stacked-cell)

public struct JdLiveStackedCellSpec: Sendable {
    /// 13pt — v2 리터럴(text 눈금 밖). notes 보고분.
    public var priceFontSize: CGFloat
    /// 10.5pt — v2 리터럴
    public var pctFontSize: CGFloat
    public var priceFontWeight: CGFloat
    public var pctFontWeight: CGFloat
    /// 가격·등락률이 **같은 색**이다 — 색 통로가 하나뿐인 것이 이 셀의 정체성
    public var color: JdDynamicColor
    public var lineSpacing: CGFloat

    /// 웹: 가격 13px extrabold · 등락률 10.5px semibold · 둘 다 trend 색 · leading-tight.
    /// extrabold 토큰이 없어 bold(700)로 매핑한다(웹 CSS도 같은 매핑).
    public static func resolve(change: Double) -> JdLiveStackedCellSpec {
        // gainOrEven — 0%도 상승 쪽이다(위 JdTrendPolicy 주석)
        let trend = JdTrend.resolve(change, policy: .gainOrEven)
        return JdLiveStackedCellSpec(priceFontSize: 13,
                                     pctFontSize: 10.5,
                                     priceFontWeight: JdToken.FontWeight.bold,
                                     pctFontWeight: JdToken.FontWeight.semibold,
                                     color: JdFinanceTheme.color(trend),
                                     lineSpacing: 0)
    }

    /// 두 줄의 확정 문자열. 폴백 규칙이 값마다 다르다(가격 `> 0` / 등락률 `!= 0`) —
    /// 리프와 같은 규칙을 Core에서 재사용한다.
    public static func lines(price: Double,
                            change: Double,
                            priceFallback: Double = 0,
                            pctFallback: Double = 0,
                            priceDecimals: Int = 0,
                            pctDecimals: Int = 2,
                            locale: String = "ko-KR") -> (price: String, pct: String) {
        let p = JdFinanceFormat.resolvedPrice(price: price, fallback: priceFallback)
        let c = JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        return (JdFinanceFormat.priceText(p, decimals: priceDecimals, locale: locale),
                JdFinanceFormat.percentText(c, decimals: pctDecimals))
    }

    /// 색이 유일한 방향 신호가 되지 않게 말로도 준다(웹엔 없는 보정, 04 §7.1)
    public static func accessibilityText(price: String, pct: String, change: Double) -> String {
        let trend = JdTrend.resolve(change, policy: .gainOrEven)
        let word = trend == .up ? "상승" : "하락"
        return "\(price), \(word) \(pct)"
    }
}

// MARK: - PositionBar (웹 jd-position-bar)

/// 색 방향 — 웹 `tone` 속성
public enum JdPositionBarTone: String, CaseIterable, Sendable {
    case up, down
}

public struct JdPositionBarSpec: Sendable {
    public var trackHeight: CGFloat
    /// 마커는 트랙보다 크다(웹 12 vs 8) — 그래서 클리핑하면 안 된다
    public var markerHeight: CGFloat
    public var markerWidth: CGFloat
    public var trackColor: JdDynamicColor
    /// [low, high] 밴드 — tone색 18% 워시
    public var bandColor: JdDynamicColor
    /// [low, cur] 채움 — tone 원색
    public var fillColor: JdDynamicColor
    public var markerColor: JdDynamicColor

    /// 웹: 트랙 8px full-radius(muted 18%), 밴드 tone 18%, 채움 tone 원색,
    /// 마커 2×12px foreground 정중앙(50%)
    public static func resolve(tone: JdPositionBarTone) -> JdPositionBarSpec {
        let base = tone == .up ? JdFinanceTheme.up : JdFinanceTheme.down
        return JdPositionBarSpec(trackHeight: 8,
                                 markerHeight: 12,
                                 markerWidth: 2,
                                 trackColor: JdFinanceSpecMix.wash(JdToken.Color.muted, alpha: 0.18),
                                 bandColor: JdFinanceSpecMix.wash(base, alpha: 0.18),
                                 fillColor: base,
                                 markerColor: JdToken.Color.foreground)
    }
}

/// 좌표 계산 — **양 렌더 계층이 공유한다.** 웹이 update()에서 하던 산수가 여기 있다.
public enum JdPositionBarGeometry {
    /// 0~1 분수 → 0~100 퍼센트, 범위 밖·비유한은 클램프
    public static func percent(_ fraction: Double) -> Double {
        let n = fraction * 100
        guard n.isFinite else { return 0 }
        return min(100, max(0, n))
    }

    /// 밴드·채움의 시작·폭(퍼센트).
    /// 폭은 음수가 되지 않게 0으로 클램프한다 — 웹 v2는 `cur < low`일 때 음수 width를 냈다.
    public static func layout(low: Double, high: Double, cur: Double)
        -> (bandStart: Double, bandWidth: Double, fillStart: Double, fillWidth: Double) {
        let l = percent(low), h = percent(high), c = percent(cur)
        return (bandStart: l,
                bandWidth: max(0, h - l),
                fillStart: l,
                fillWidth: max(0, c - l))
    }

    /// 웹은 순수 장식 div였다(대체 텍스트 0) — v3가 role=img + 위치 낭독을 얹었고 iOS도 따른다
    public static func accessibilityText(low: Double, high: Double, cur: Double) -> String {
        let round1: (Double) -> Double = { (($0 * 10).rounded()) / 10 }
        let l = round1(percent(low)), h = round1(percent(high)), c = round1(percent(cur))
        return "구간 \(trim(l))–\(trim(h))% 중 현재 \(trim(c))%"
    }

    /// 정수면 소수점을 떼서 "50%"로 읽히게 한다("50.0%"는 낭독이 지저분하다)
    private static func trim(_ v: Double) -> String {
        v == v.rounded() ? String(Int(v)) : String(format: "%.1f", v)
    }
}

// MARK: - MicroKpiRow (웹 jd-live-micro-kpi-row)

/// KPI 셀 한 칸. **값은 이미 포맷된 문자열**이다 — 폴링·포맷은 앱의 몫이고(DEC-019)
/// 컴포넌트는 표시만 한다(웹과 동일 계약).
public struct JdMicroKpiItem: Sendable, Equatable {
    public var label: String
    /// 이미 포맷된 표시 문자열 (예: "1,320", "—")
    public var value: String
    /// 등락률(%) — hint가 없을 때 보조 라인에 표시되고, 있든 없든 **방향 착색**을 결정한다
    public var pct: Double?
    /// 값 접미 단위 (예: "원", "$")
    public var unit: String?
    /// pct 대신 보조 라인에 넣을 문구 (예: "순매수") — 색은 여전히 pct 부호를 따른다
    public var hint: String?

    public init(label: String,
                value: String,
                pct: Double? = nil,
                unit: String? = nil,
                hint: String? = nil) {
        self.label = label
        self.value = value
        self.pct = pct
        self.unit = unit
        self.hint = hint
    }
}

public struct JdMicroKpiCellSpec: Sendable {
    /// 10.5 / 16 / 10 — 전부 v2 리터럴(토큰 눈금 밖). notes 보고분.
    public var labelFontSize: CGFloat
    public var valueFontSize: CGFloat
    public var unitFontSize: CGFloat
    public var subFontSize: CGFloat
    public var labelFontWeight: CGFloat
    public var valueFontWeight: CGFloat
    public var subFontWeight: CGFloat
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var cornerRadius: CGFloat
    public var background: JdDynamicColor
    public var border: JdDynamicColor
    public var labelColor: JdDynamicColor
    public var valueColor: JdDynamicColor
    /// 보조 라인 색 — pct 부호를 따른다. pct가 없으면 muted.
    public var subColor: JdDynamicColor

    /// 웹: card 배경 + 1px border + radius 2xl, padding 10/12,
    /// 라벨 10.5 bold muted · 값 16 extrabold(800) · 단위 10.5 semibold · 보조 10 bold 착색
    public static func resolve(item: JdMicroKpiItem) -> JdMicroKpiCellSpec {
        let sub: JdDynamicColor
        if let pct = item.pct {
            // 웹 `(it.pct ?? 0) >= 0` — 0도 상승 쪽(StackedCell과 같은 규칙)
            sub = JdFinanceTheme.color(JdTrend.resolve(pct, policy: .gainOrEven))
        } else {
            sub = JdToken.Color.muted
        }
        return JdMicroKpiCellSpec(labelFontSize: 10.5,
                                  valueFontSize: 16,
                                  unitFontSize: 10.5,
                                  subFontSize: 10,
                                  labelFontWeight: JdToken.FontWeight.bold,
                                  // 웹 800 — FontWeight 램프(최대 700) 밖이라 리터럴
                                  valueFontWeight: 800,
                                  subFontWeight: JdToken.FontWeight.bold,
                                  hPadding: JdToken.Space.s3,
                                  vPadding: JdToken.Space.s2_5,
                                  cornerRadius: JdToken.Radius.xl2,
                                  background: JdToken.Color.card,
                                  border: JdToken.Color.border,
                                  labelColor: JdToken.Color.muted,
                                  valueColor: JdToken.Color.foreground,
                                  subColor: sub)
    }

    /// 보조 라인 문자열 — hint가 있으면 hint, 없으면 부호 붙은 퍼센트(웹 동형)
    public static func subText(item: JdMicroKpiItem) -> String {
        if let hint = item.hint, !hint.isEmpty { return hint }
        return JdFinanceFormat.percentText(item.pct ?? 0, decimals: 2)
    }

    /// 셀 하나를 한 문장으로 — 라벨·값·보조가 따로 읽히면 관계가 사라진다 (04 §7.1)
    public static func accessibilityText(item: JdMicroKpiItem) -> String {
        let unit = (item.unit?.isEmpty == false) ? " \(item.unit!)" : ""
        return "\(item.label), \(item.value)\(unit), \(subText(item: item))"
    }
}
