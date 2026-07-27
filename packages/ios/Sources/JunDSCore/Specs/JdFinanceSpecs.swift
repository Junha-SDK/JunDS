import UIKit

// MARK: - finance 공통 어휘 (DEC-040)
//
// 왜 스펙을 먼저 세우는가: 웹 finance 86종 중 **33개 파일이 `--jd-fin-*` 팔레트를 각자
// 재선언**하고 있고(`--jd-fin-up: var(--bm-up, var(--jd-color-success))` …), 등락 판정
// 규칙도 컴포넌트마다 손으로 다시 쓰여 있다. 그 상태를 iOS로 그대로 옮기면 86종이 같은
// 판정을 86번 구현한다. 그래서 Core가 (1) 추세 판정 (2) 도메인 색 (3) 숫자 포맷 세 가지를
// 소유하고, 렌더 계층은 결과만 그린다 (04 §4.2 규칙 1·3).
//
// 데이터는 여기 없다: 시세 구독·장 세션 계산은 @junds/finance-data 대응 스코프이며
// (DEC-003 · DEC-019), 컴포넌트는 판정된 값만 주입받는다 — 웹 v3가 `useLivePrice` 훅을
// 버리고 property 주입으로 바꾼 것과 같은 계약이다.

/// 등락 추세. rawValue는 웹 `data-trend` 속성값과 일치한다 (3플랫폼 동일 어휘).
public enum JdTrend: String, CaseIterable, Sendable {
    case up, flat, down
}

/// 추세 판정 규칙 — **웹에 두 가지가 실제로 공존한다.** 하나로 합치면 표면이 달라지므로
/// 규칙 자체를 타입으로 올렸다.
///
/// - `live`: 웹 `jd-live-pct-badge` — `up(> 0)`이 flat보다 **우선**한다. 즉 +0.003은
///   상승(초록)이고 flat(회색)은 `[-0.005, 0]` 구간뿐이다. 틱이 잘게 흔들리는 실시간
///   숫자에서 "거의 0"을 회색으로 눌러 눈이 덜 피로하게 하려는 규칙이다.
/// - `exact`: 웹 `jd-price-badge` — flat은 **정확히 0**이다. 일봉 등락률처럼 확정된
///   숫자에는 임계값을 두지 않는다.
public enum JdTrendPolicy: String, CaseIterable, Sendable {
    case live, exact

    /// 웹 live 규칙의 flat 임계값(|v| < 0.005)
    public static let liveFlatEpsilon: Double = 0.005
}

public extension JdTrend {
    /// 등락률(%) → 추세. 판정 규칙은 정책이 고른다 (위 주석의 두 규칙).
    static func resolve(_ value: Double, policy: JdTrendPolicy = .exact) -> JdTrend {
        guard value.isFinite else { return .flat }
        switch policy {
        case .live:
            // up이 flat보다 우선 — 순서를 바꾸면 +0.003이 회색이 된다(웹과 어긋남)
            if value > 0 { return .up }
            if abs(value) < JdTrendPolicy.liveFlatEpsilon { return .flat }
            return .down
        case .exact:
            if value > 0 { return .up }
            if value == 0 { return .flat }
            return .down
        }
    }
}

/// finance 도메인 색 — 웹 `--jd-fin-*` 팔레트의 **단일 소스**.
///
/// 웹은 각 컴포넌트가 `var(--bm-up, var(--jd-color-success))` 폴백 체인을 재선언해
/// 소비자 앱(`--bm-*`)이 덮어쓸 수 있게 했다. iOS엔 CSS 캐스케이드가 없으므로 같은
/// "기본값 + 앱 override" 구조를 **정적 저장 프로퍼티**로 만든다. 앱은 시작 시 한 번
/// 바꿔 쓴다:
///
/// ```swift
/// JdFinanceTheme.up = JdDynamicColor(light: 0xE1_1D48_FF, dark: 0xFB_7185_FF) // 한국식 적상승
/// ```
///
/// 기본값은 웹과 동일하게 상승=success · 하락=danger다. 한국 시장 관례(상승 적색)를
/// 기본으로 삼지 않은 이유는 웹 v2/v3가 이미 초록 상승으로 출고돼 있어 3플랫폼 표면이
/// 갈라지기 때문이다 — 관례 전환은 앱의 override로 남긴다.
public enum JdFinanceTheme {
    public static var up: JdDynamicColor = JdToken.Color.success
    public static var down: JdDynamicColor = JdToken.Color.danger
    public static var flat: JdDynamicColor = JdToken.Color.muted

    /// 라이브 세션 강조색 — 웹 `--bm-live` / `--bm-live-bright`의 대응분
    public static var live: JdDynamicColor = JdToken.Color.success

    /// 추세 → 색. 컴포넌트는 이 한 줄만 쓴다.
    public static func color(_ trend: JdTrend) -> JdDynamicColor {
        switch trend {
        case .up: return up
        case .flat: return flat
        case .down: return down
        }
    }

    /// 테스트·프리뷰가 override를 되돌릴 때 쓴다(정적 상태 누수 차단).
    public static func resetToDefaults() {
        up = JdToken.Color.success
        down = JdToken.Color.danger
        flat = JdToken.Color.muted
        live = JdToken.Color.success
    }
}

// MARK: - 가격·등락 포맷 (웹 jd-live-price-text · jd-live-pct-text 리프의 계산부)

public enum JdFinanceFormat {
    /// 값이 없을 때의 표기 — 웹 EM_DASH와 동일 문자
    public static let emDash = "—"

    /// `toFixed(0...100)` 안전 범위 (웹 리프의 safeDecimals 동형)
    public static func safeFixedDecimals(_ decimals: Int) -> Int {
        min(100, max(0, decimals))
    }

    /// 등락률 표시값 — 웹 규칙: `change`가 0이 아니면 실값, 0이면 `fallback`.
    /// 0을 "시드 전 신호"로 보는 웹 v2 분기를 그대로 보존한다.
    public static func resolvedChange(change: Double, fallback: Double) -> Double {
        if change.isFinite && change != 0 { return change }
        return fallback.isFinite ? fallback : 0
    }

    /// 가격 표시값 — 웹 규칙: `price > 0`이면 실값, 아니면 `fallback`.
    public static func resolvedPrice(price: Double, fallback: Double) -> Double {
        if price.isFinite && price > 0 { return price }
        return fallback.isFinite ? fallback : 0
    }

    /// 등락률 문자열 — 웹 `${sign}${v.toFixed(d)}${%}`.
    /// 로케일을 타지 않는다(toFixed 동형) — 기기 지역 설정과 무관하게 같은 문자열이다.
    public static func percentText(_ value: Double,
                                   decimals: Int = 2,
                                   showSign: Bool = true,
                                   withPercent: Bool = true) -> String {
        let v = value.isFinite ? value : 0
        let d = safeFixedDecimals(decimals)
        let sign = (showSign && v > 0) ? "+" : ""
        return sign + String(format: "%.\(d)f", v) + (withPercent ? "%" : "")
    }

    /// 가격 문자열 — 0 이하면 em dash, 그 외는 로케일 천단위 포맷.
    /// 포맷은 Core의 JdNumberFormat에 위임한다(규칙 중복 금지 — locale 고정 계약 상속).
    public static func priceText(_ value: Double,
                                 decimals: Int = 0,
                                 locale: String = "ko-KR") -> String {
        guard value > 0 else { return emDash }
        return JdNumberFormat.string(value: value,
                                     locale: locale,
                                     decimals: min(20, max(0, decimals)))
    }
}

// MARK: - LiveStatusDot (웹 jd-live-status-dot)

public struct JdLiveStatusDotSpec: Sendable {
    public var dotSize: CGFloat
    public var gap: CGFloat
    /// 11pt — 웹 리터럴이다(text-xs=12 눈금 밖). notes 보고분.
    public var fontSize: CGFloat
    public var color: JdDynamicColor
    /// 라이브일 때만 확장-소멸 링이 돈다. Reduce Motion은 렌더 계층이 멈춘다 (04 §7.3)
    public var pulses: Bool

    /// 웹 keyframe `jd-live-status-pulse 1.6s` 한 주기. Duration 토큰 램프(최대 0.5) 밖 —
    /// StatusDot의 pulsePeriod와 같은 성격의 스펙 부재분이다.
    public static let pulsePeriod: TimeInterval = 1.6

    /// 웹: 점 8px · gap 4(space-1) · 11px bold, 라이브면 success 계열 / 아니면 muted
    public static func resolve(live: Bool) -> JdLiveStatusDotSpec {
        JdLiveStatusDotSpec(dotSize: 8,
                            gap: JdToken.Space.s1,
                            fontSize: 11,
                            color: live ? JdFinanceTheme.live : JdToken.Color.muted,
                            pulses: live)
    }

    /// 라벨 기본값 — 웹 `live ? "실시간" : "장마감"`. 앱이 세부 세션명으로 덮어쓸 수 있다.
    public static func defaultLabel(live: Bool) -> String {
        live ? "실시간" : "장마감"
    }
}

// MARK: - PriceBadge (웹 jd-price-badge)

/// 웹 size sm(12) / md(14)
public enum JdPriceBadgeSize: String, CaseIterable, Sendable {
    case sm, md
}

public struct JdPriceBadgeSpec: Sendable {
    public var fontSize: CGFloat
    public var iconSize: CGFloat
    public var gap: CGFloat
    public var fontWeight: CGFloat
    public var color: JdDynamicColor
    /// flat이면 화살표가 없다(웹 `showArrow && trend !== "flat"`)
    public var showsArrow: Bool

    public static func resolve(pct: Double,
                              size: JdPriceBadgeSize = .md,
                              showArrow: Bool = true,
                              bold: Bool = true) -> JdPriceBadgeSpec {
        let trend = JdTrend.resolve(pct, policy: .exact)
        let fontSize: CGFloat = size == .sm ? 12 : 14
        return JdPriceBadgeSpec(fontSize: fontSize,
                                // 웹 아이콘은 폰트 크기에 붙어 자란다 — 변 = 폰트 크기
                                iconSize: fontSize,
                                gap: JdToken.Space.s1,
                                fontWeight: bold ? JdToken.FontWeight.bold : JdToken.FontWeight.medium,
                                color: JdFinanceTheme.color(trend),
                                showsArrow: showArrow && trend != .flat)
    }

    /// SF Symbols 대응 — 웹은 lucide TrendingUp/Down 폴리라인이다.
    /// 서드파티 0 규칙 아래 시스템 심볼로 번역하며, 의미(추세 방향)는 동일하다.
    public static func symbolName(_ trend: JdTrend) -> String? {
        switch trend {
        case .up: return "chart.line.uptrend.xyaxis"
        case .down: return "chart.line.downtrend.xyaxis"
        case .flat: return nil
        }
    }
}

// MARK: - HotPctChip (웹 jd-hot-pct-chip)

public struct JdHotPctChipSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var fontSize: CGFloat
    public var fontWeight: CGFloat
    /// 세로 그라디언트 위/아래 — 급등 알약의 정체성이다
    public var gradientTop: JdDynamicColor
    public var gradientBottom: JdDynamicColor
    public var foreground: JdDynamicColor

    /// 웹: padding 4/10 · 12px/800 · 알약 · 흰 글자 · linear-gradient(180deg, up → up 80%+fg)
    public static func resolve() -> JdHotPctChipSpec {
        let up = JdFinanceTheme.up
        return JdHotPctChipSpec(hPadding: 10,
                                vPadding: 4,
                                fontSize: 12,
                                // 웹 800 — FontWeight 램프(최대 bold 700) 밖이라 리터럴이다
                                fontWeight: 800,
                                gradientTop: up,
                                gradientBottom: JdFinanceSpecMix.mix(up, with: JdToken.Color.foreground, ratio: 0.2),
                                foreground: JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF))
    }

    /// 웹 표시 문자열 — 늘 상승 표기다(`↑ n%`), 부호·색 분기가 없다.
    public static func text(_ pct: Double) -> String {
        let v = pct.isFinite ? pct : 0
        return "↑ " + String(format: "%.2f", v) + "%"
    }
}

// MARK: - 색 혼합 (웹 color-mix(in srgb, …) 대응)

/// 웹 CSS `color-mix(in srgb, A X%, B)`의 Swift 대응. finance 스펙이 그라디언트·소프트
/// 배경을 만들 때 쓴다. sRGB 성분 선형 보간이라 CSS srgb 보간과 같은 결과다.
public enum JdFinanceSpecMix {
    public static func mix(_ base: JdDynamicColor,
                          with other: JdDynamicColor,
                          ratio: Double) -> JdDynamicColor {
        JdDynamicColor(light: blend(base.light, other.light, ratio),
                       dark: blend(base.dark, other.dark, ratio))
    }

    /// 알파를 곱해 옅은 워시를 만든다 — 웹 `color-mix(… X%, transparent)` 대응
    public static func wash(_ color: JdDynamicColor, alpha: Double) -> JdDynamicColor {
        JdDynamicColor(light: withAlpha(color.light, alpha), dark: withAlpha(color.dark, alpha))
    }

    private static func blend(_ a: UInt32, _ b: UInt32, _ ratio: Double) -> UInt32 {
        let t = min(1, max(0, ratio))
        var out: UInt32 = 0
        for shift in stride(from: 24, through: 0, by: -8) {
            let ca = Double((a >> UInt32(shift)) & 0xFF)
            let cb = Double((b >> UInt32(shift)) & 0xFF)
            let mixed = UInt32((ca * (1 - t) + cb * t).rounded())
            out |= (mixed & 0xFF) << UInt32(shift)
        }
        return out
    }

    private static func withAlpha(_ color: UInt32, _ alpha: Double) -> UInt32 {
        let a = UInt32((min(1, max(0, alpha)) * 255).rounded())
        return (color & 0xFFFF_FF00) | (a & 0xFF)
    }
}
