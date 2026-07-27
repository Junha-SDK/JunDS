import UIKit

// MARK: - finance 칩·톤 어휘 (DEC-047)
//
// DEC-040이 "상승/하락"이라는 **방향** 어휘를 세웠다면, 여기는 **분류** 어휘다:
// 공시 톤(호재·악재·중립)과 테마 카테고리 회전 팔레트. 둘 다 웹에서 각 컴포넌트가
// `--bm-cat-*` 폴백 체인을 재선언하고 있어 단일 소스가 없었다(DEC-040과 같은 상황).
//
// 대비 규칙이 하나 있고, 그게 이 파일에서 가장 중요한 부분이다:
// **12~14% 틴트 배경 위에 원색 글자는 대비가 안 나온다**(웹 실측: amber 계열 ~1.9:1).
// 그래서 글자는 색상(hue)을 유지한 채 foreground 쪽으로 섞어 올린다 — 웹 v3가 쓴 교정을
// 그대로 가져온다. 이 계산을 컴포넌트마다 다시 쓰면 반드시 어긋나므로 스펙이 소유한다.

/// 공시 톤 — 웹 `jd-disclosure-tone-badge`의 tone 속성값과 동일
public enum JdDisclosureTone: String, CaseIterable, Sendable {
    case positive, negative, neutral

    /// 웹 TONE_LABELS 동형 — 3플랫폼 동일 문자열 (04 §3 규칙 1)
    public var label: String {
        switch self {
        case .positive: return "호재"
        case .negative: return "악재"
        case .neutral: return "중립"
        }
    }
}

/// 공시 카테고리 — 웹 CATEGORY_LABELS 9종. 분류 로직은 앱의 몫이고 라벨만 여기 있다.
public enum JdDisclosureCategory: String, CaseIterable, Sendable {
    case earnings, financing, treasury, governance, ownership, dividend, guidance, litigation, other

    public var label: String {
        switch self {
        case .earnings: return "실적"
        case .financing: return "자금조달"
        case .treasury: return "자사주"
        case .governance: return "지배구조"
        case .ownership: return "지분"
        case .dividend: return "배당"
        case .guidance: return "사업"
        case .litigation: return "분쟁/제재"
        case .other: return "기타"
        }
    }
}

public extension JdFinanceTheme {
    /// 테마 카테고리 회전 팔레트 — 웹 `--bm-cat-*` 기본값 5종을 웹과 **같은 순서**로 둔다
    /// (cat-3 → 2 → 4 → 8 → 5). 순서가 다르면 같은 데이터가 두 플랫폼에서 다른 색이 된다.
    static var categoryPalette: [JdDynamicColor] = [
        JdDynamicColor(light: 0x14B8_A6FF, dark: 0x2DD4_BFFF), // cat-3 teal
        JdDynamicColor(light: 0xEC48_99FF, dark: 0xF472_B6FF), // cat-2 pink
        JdDynamicColor(light: 0xF59E_0BFF, dark: 0xFBBF_24FF), // cat-4 amber
        JdDynamicColor(light: 0x10B9_81FF, dark: 0x34D3_99FF), // cat-8 emerald
        JdDynamicColor(light: 0x8B5C_F6FF, dark: 0xA78B_FAFF), // cat-5 violet
    ]

    /// 인덱스를 팔레트 길이로 감아 색을 고른다. 음수·초과도 안전하다.
    static func categoryColor(_ index: Int) -> JdDynamicColor {
        let palette = categoryPalette
        guard !palette.isEmpty else { return JdToken.Color.muted }
        let i = ((index % palette.count) + palette.count) % palette.count
        return palette[i]
    }

    /// 틴트 배경 위에서 읽히는 글자색.
    /// 원색을 그대로 쓰면 amber·teal 계열이 1.9:1까지 떨어진다 — 색상은 유지하고
    /// foreground 쪽으로 섞어 올린다(웹 v3 교정과 동일 규칙).
    static func onTint(_ base: JdDynamicColor) -> JdDynamicColor {
        JdFinanceSpecMix.mix(base, with: JdToken.Color.foreground, ratio: 0.35)
    }

    /// 틴트 배경 — 원색의 옅은 판
    static func tint(_ base: JdDynamicColor, alpha: Double = 0.12) -> JdDynamicColor {
        JdFinanceSpecMix.wash(base, alpha: alpha)
    }
}

// MARK: - DisclosureToneBadge (웹 jd-disclosure-tone-badge)

public struct JdDisclosureToneBadgeSpec: Sendable {
    public var height: CGFloat
    public var hPadding: CGFloat
    public var cornerRadius: CGFloat
    public var gap: CGFloat
    public var toneFontSize: CGFloat
    public var categoryFontSize: CGFloat
    public var confidenceFontSize: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    /// 카테고리·신뢰도는 톤보다 물러난다 — 웹 opacity .85 / .6
    public var categoryOpacity: Double
    public var confidenceOpacity: Double
    /// compact은 톤 라벨만 남긴다(표 행에서 쓴다)
    public var showsDetail: Bool

    /// 웹: full = h28 · px10 · radius lg · 톤 11/800 · cat 10.5/700 · conf 10/700,
    /// compact = h20 · px6 · radius sm · 톤 10.5/800 · 나머지 숨김
    public static func resolve(tone: JdDisclosureTone, compact: Bool = false) -> JdDisclosureToneBadgeSpec {
        let base: JdDynamicColor
        switch tone {
        case .positive: base = JdFinanceTheme.up
        case .negative: base = JdFinanceTheme.down
        case .neutral:  base = JdToken.Color.muted
        }
        // 중립은 색이 아니라 무채 틴트다 — 톤이 없다는 뜻을 색으로도 말한다
        let background = tone == .neutral
            ? JdFinanceSpecMix.wash(JdToken.Color.foreground, alpha: 0.06)
            : JdFinanceTheme.tint(base, alpha: 0.14)
        let foreground = tone == .neutral ? JdToken.Color.muted : JdFinanceTheme.onTint(base)

        return JdDisclosureToneBadgeSpec(
            height: compact ? 20 : 28,
            hPadding: compact ? JdToken.Space.s1_5 : JdToken.Space.s2_5,
            cornerRadius: compact ? JdToken.Radius.sm : JdToken.Radius.lg,
            gap: JdToken.Space.s2,
            toneFontSize: compact ? 10.5 : 11,
            categoryFontSize: 10.5,
            confidenceFontSize: 10,
            background: background,
            foreground: foreground,
            categoryOpacity: 0.85,
            confidenceOpacity: 0.6,
            showsDetail: !compact
        )
    }

    /// 신뢰도 표기 — 0이면 숨긴다(웹 `confidence > 0` 동형)
    public static func confidenceText(_ confidence: Double) -> String? {
        guard confidence.isFinite, confidence > 0 else { return nil }
        let pct = Int((min(1, max(0, confidence)) * 100).rounded())
        return "\(pct)%"
    }

    /// compact에서 카테고리·신뢰도를 숨겨도 스크린리더는 전부 읽어야 한다.
    /// 웹 v2는 접근 이름이 아예 없었고 v3가 얹은 보정을 iOS도 따른다.
    public static func accessibilityText(tone: JdDisclosureTone,
                                        category: JdDisclosureCategory,
                                        confidence: Double) -> String {
        var parts = [tone.label, category.label]
        if let c = confidenceText(confidence) { parts.append("신뢰도 \(c)") }
        return parts.joined(separator: " · ")
    }
}

// MARK: - ThemeTagList 칩 (웹 jd-theme-tag-list)

public struct JdThemeChipSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var gap: CGFloat
    public var fontSize: CGFloat
    public var fontWeight: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    /// 앞머리 "#"는 한 단 옅다 — 웹 opacity .7
    public var prefixOpacity: Double

    /// 웹: 알약 · px8/py2 · 12px bold · 회전 accent 12% 배경 + 섞은 글자
    public static func resolve(index: Int) -> JdThemeChipSpec {
        let base = JdFinanceTheme.categoryColor(index)
        return JdThemeChipSpec(hPadding: JdToken.Space.s2,
                               vPadding: JdToken.Space.s0_5,
                               gap: 2,
                               fontSize: JdTextSpec.resolve(size: .xs).fontSize,
                               fontWeight: JdToken.FontWeight.bold,
                               background: JdFinanceTheme.tint(base),
                               foreground: JdFinanceTheme.onTint(base),
                               prefixOpacity: 0.7)
    }
}
