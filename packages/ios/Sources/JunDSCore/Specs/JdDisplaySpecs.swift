import Foundation
import CoreGraphics

// 표시 계열 스펙 — 순수 함수 (04 §9).
// ⚠️ 이 계열은 웹 CSS가 토큰이 아닌 **v2 리터럴 팔레트**를 쓰는 곳이 많다(tag 7색·battery
// 채움색·severity 쌍 등). 패리티 원칙상 값을 임의로 토큰에 맞추지 않고 리터럴을 승계하며,
// 어휘 통합은 G2 재심의 대상이다 (DEC-014-1 계보).

// MARK: - Badge (웹 jd-badge)

public struct JdBadgeSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var fontSize: CGFloat
    public var radius: CGFloat
    public var dotSize: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var border: JdDynamicColor?

    /// 웹 크기: sm 2/8·10pt·r6 · md 4/10·12pt·r8 · lg 4/12·14pt·r8. 도트 6px.
    public static func resolve(variant: JdBadgeVariant, size: JdDisplaySize) -> JdBadgeSpec {
        let hPadding: CGFloat, vPadding: CGFloat, fontSize: CGFloat, radius: CGFloat
        switch size {
        case .sm:
            hPadding = JdToken.Space.s2; vPadding = JdToken.Space.s0_5
            fontSize = JdTextSpec.resolve(size: .xs2).fontSize   // 10
            radius = JdToken.Radius.md                           // 6
        case .md:
            hPadding = JdToken.Space.s2_5; vPadding = JdToken.Space.s1
            fontSize = JdTextSpec.resolve(size: .xs).fontSize    // 12
            radius = JdToken.Radius.lg                           // 8
        case .lg:
            hPadding = JdToken.Space.s3; vPadding = JdToken.Space.s1
            fontSize = JdTextSpec.resolve(size: .sm).fontSize    // 14
            radius = JdToken.Radius.lg                           // 8
        }

        // 웹은 bg를 10% 워시 + 진한 텍스트로 만든다 — 라이트/다크 각각 알파 승계
        let clear = JdDynamicColor(light: 0x0000_0000, dark: 0x0000_0000)
        let background: JdDynamicColor
        let foreground: JdDynamicColor
        var border: JdDynamicColor?
        switch variant {
        case .default:
            background = JdDynamicColor(light: 0x6B72_801A, dark: 0xA09C_B51A)
            foreground = JdToken.Color.muted
        case .primary:
            background = JdToken.Color.primaryLight
            foreground = JdToken.Color.primary
        case .success:
            background = JdToken.Color.successLight
            foreground = JdToken.Color.success
        case .warning:
            background = JdToken.Color.warningLight
            foreground = JdToken.Color.warning
        case .danger:
            background = JdToken.Color.dangerLight
            foreground = JdToken.Color.danger
        case .info:
            background = JdToken.Color.infoLight
            foreground = JdToken.Color.info
        case .outline:
            background = clear
            foreground = JdToken.Color.foreground
            border = JdToken.Color.border
        }

        return JdBadgeSpec(hPadding: hPadding, vPadding: vPadding, fontSize: fontSize,
                           radius: radius, dotSize: 6,
                           background: background, foreground: foreground, border: border)
    }

    /// 웹 count 모드: 원형 18px 최소·10pt·danger 고정, maxCount 초과 시 "N+"
    public static let countDiameter: CGFloat = 18
    public static let countFontSize: CGFloat = 10

    public static func countText(_ count: Int, maxCount: Int) -> String {
        count > maxCount ? "\(maxCount)+" : "\(count)"
    }
}

// MARK: - Tag (웹 jd-tag)

public struct JdTagSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var fontSize: CGFloat
    public var fontWeight: CGFloat
    public var radius: CGFloat
    public var gap: CGFloat
    public var closeIconSize: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor

    /// 웹: padding 2/8, radius 6, 12pt medium, gap 4, 닫기 아이콘 12
    public static func resolve(color: JdTagColor) -> JdTagSpec {
        let palette = JdTagSpec.palette(color)
        return JdTagSpec(hPadding: JdToken.Space.s2,
                         vPadding: JdToken.Space.s0_5,
                         fontSize: JdTextSpec.resolve(size: .xs).fontSize,
                         fontWeight: JdToken.FontWeight.medium,
                         radius: JdToken.Radius.md,
                         gap: JdToken.Space.s1,
                         closeIconSize: 12,
                         background: palette.bg,
                         foreground: palette.fg)
    }

    /// primary만 토큰 기반(테마 반응), 나머지 7종은 v2 리터럴 — 패리티 승계.
    /// 다크에서는 리터럴 배경이 과하게 밝아 알파 워시로 낮춘다(웹의 다크 미대응 결함 보정 —
    /// 값 변경이 아니라 알파 적용이므로 색상(hue)은 동일).
    private static func palette(_ color: JdTagColor) -> (bg: JdDynamicColor, fg: JdDynamicColor) {
        switch color {
        case .gray:
            return (JdDynamicColor(light: 0xF3F4_F6FF, dark: 0x9CA3_AF26),
                    JdDynamicColor(light: 0x3741_51FF, dark: 0xD1D5_DBFF))
        case .primary:
            return (JdToken.Color.primaryLight, JdToken.Color.primary)
        case .blue:
            return (JdDynamicColor(light: 0xEFF6_FFFF, dark: 0x3B82_F626),
                    JdDynamicColor(light: 0x1D4E_D8FF, dark: 0x93C5_FDFF))
        case .green:
            return (JdDynamicColor(light: 0xECFD_F5FF, dark: 0x10B9_8126),
                    JdDynamicColor(light: 0x0477_57FF, dark: 0x6EE7_B7FF))
        case .red:
            return (JdDynamicColor(light: 0xFEF2_F2FF, dark: 0xEF44_4426),
                    JdDynamicColor(light: 0xB91C_1CFF, dark: 0xFCA5_A5FF))
        case .orange:
            return (JdDynamicColor(light: 0xFFF7_EDFF, dark: 0xF59E_0B26),
                    JdDynamicColor(light: 0xC241_0CFF, dark: 0xFDBA_74FF))
        case .purple:
            return (JdDynamicColor(light: 0xFAF5_FFFF, dark: 0xA855_F726),
                    JdDynamicColor(light: 0x7E22_CEFF, dark: 0xD8B4_FEFF))
        case .teal:
            return (JdDynamicColor(light: 0xF0FD_FAFF, dark: 0x14B8_A626),
                    JdDynamicColor(light: 0x0F76_6EFF, dark: 0x5EEA_D4FF))
        }
    }
}

// MARK: - Avatar (웹 jd-avatar)

public struct JdAvatarSpec: Sendable {
    public var side: CGFloat
    public var initialsFontSize: CGFloat
    public var statusDotSize: CGFloat
    public var statusRingWidth: CGFloat

    /// 웹: xs 24/10 · sm 32/12 · md 36/14 · lg 44/16 · xl 56/18 (도트 6/8/10/12/14)
    public static func resolve(size: JdAvatarSize) -> JdAvatarSpec {
        switch size {
        case .xs: return JdAvatarSpec(side: 24, initialsFontSize: 10, statusDotSize: 6, statusRingWidth: 1)
        case .sm: return JdAvatarSpec(side: 32, initialsFontSize: 12, statusDotSize: 8, statusRingWidth: 1.5)
        case .md: return JdAvatarSpec(side: 36, initialsFontSize: 14, statusDotSize: 10, statusRingWidth: 1.5)
        case .lg: return JdAvatarSpec(side: 44, initialsFontSize: 16, statusDotSize: 12, statusRingWidth: 2)
        case .xl: return JdAvatarSpec(side: 56, initialsFontSize: 18, statusDotSize: 14, statusRingWidth: 2)
        }
    }

    /// 웹 이니셜 규칙: `name.trim().split(/\s+/)` 후 2어절 이상이면 **앞 두 어절**의 첫 글자,
    /// 아니면 앞 2글자 — 대문자화. 한글은 대문자 개념이 없어 그대로 유지된다(toUpperCase 동일 결과).
    /// trim 선행이라 공백만 있는 이름은 빈 문자열이 되고, 렌더 계층이 "?" 폴백으로 보낸다(웹 동형).
    public static func initials(from name: String) -> String {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let parts = trimmed.split(whereSeparator: { $0.isWhitespace })
        if parts.count >= 2 {
            let first = parts[0].first.map(String.init) ?? ""
            let second = parts[1].first.map(String.init) ?? ""
            return (first + second).uppercased()
        }
        return String(trimmed.prefix(2)).uppercased()
    }

    /// 웹의 결정적 팔레트 — 이름 해시로 색을 고정한다(같은 이름 = 항상 같은 색).
    public static let fallbackPalette: [JdDynamicColor] = [
        JdToken.Color.primary, JdToken.Color.accent, JdToken.Color.info,
        JdToken.Color.success, JdToken.Color.warning, JdToken.Color.danger,
    ]

    public static func fallbackColor(for name: String) -> JdDynamicColor {
        guard !name.isEmpty else { return fallbackPalette[0] }
        // djb2 계열 단순 합 — 결정적이면 충분(프리렌더 안정성과 무관한 순수 계산)
        var hash = 0
        for scalar in name.unicodeScalars {
            hash = (hash &* 31 &+ Int(scalar.value)) & 0x7FFF_FFFF
        }
        return fallbackPalette[hash % fallbackPalette.count]
    }

    public static func statusColor(_ status: JdAvatarStatus) -> JdDynamicColor {
        switch status {
        case .online: return JdToken.Color.success
        case .away: return JdToken.Color.warning
        case .busy: return JdToken.Color.danger
        case .offline: return JdDynamicColor(light: 0x9CA3_AFFF, dark: 0x6B72_80FF)
        }
    }
}

// MARK: - StatusDot (웹 jd-status-dot)

public struct JdStatusDotSpec: Sendable {
    public var dotSize: CGFloat
    public var gap: CGFloat
    public var labelFontSize: CGFloat
    public var color: JdDynamicColor
    /// pulse 상태만 맥동 — Reduce Motion 시 렌더 계층이 정지시킨다 (04 §7.3)
    public var pulses: Bool

    /// 웹: sm 6 · md 8 · lg 10, gap 6(--jd-space-1-5), 라벨 12pt
    public static func resolve(status: JdStatusKind, size: JdDisplaySize) -> JdStatusDotSpec {
        let dotSize: CGFloat
        switch size {
        case .sm: dotSize = 6
        case .md: dotSize = 8
        case .lg: dotSize = 10
        }
        let neutral = JdDynamicColor(light: 0x9CA3_AFFF, dark: 0x6B72_80FF)
        let color: JdDynamicColor
        switch status {
        case .neutral: color = neutral
        case .success, .pulse: color = JdToken.Color.success
        case .warning: color = JdToken.Color.warning
        case .danger: color = JdToken.Color.danger
        case .info: color = JdToken.Color.primary
        }
        return JdStatusDotSpec(dotSize: dotSize,
                               gap: JdToken.Space.s1_5,
                               labelFontSize: JdTextSpec.resolve(size: .xs).fontSize,
                               color: color,
                               pulses: status == .pulse)
    }
}

// MARK: - SeverityBadge (웹 jd-severity-badge)

public struct JdSeverityBadgeSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var fontSize: CGFloat
    public var gap: CGFloat
    public var dotSize: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var dotColor: JdDynamicColor

    /// 웹: md 4/10·12pt · sm 2/8·10pt, 알약(radius full), 도트 8px, gap 6.
    /// 웹은 라이트 리터럴 고정이라 다크에서 대비가 깨진다 — iOS는 알파 워시로 다크를 보정한다.
    public static func resolve(severity: JdSeverity, size: JdDisplaySize) -> JdSeverityBadgeSpec {
        let hPadding: CGFloat, vPadding: CGFloat, fontSize: CGFloat
        switch size {
        case .sm:
            hPadding = JdToken.Space.s2; vPadding = JdToken.Space.s0_5
            fontSize = JdTextSpec.resolve(size: .xs2).fontSize   // 10
        case .md, .lg:
            hPadding = JdToken.Space.s2_5; vPadding = JdToken.Space.s1
            fontSize = JdTextSpec.resolve(size: .xs).fontSize    // 12
        }

        let bg: JdDynamicColor, fg: JdDynamicColor, dot: JdDynamicColor
        switch severity {
        case .ok:
            bg = JdDynamicColor(light: 0xECFD_F5FF, dark: 0x10B9_8126)
            fg = JdDynamicColor(light: 0x0477_57FF, dark: 0x6EE7_B7FF)
            dot = JdDynamicColor(light: 0x10B9_81FF, dark: 0x10B9_81FF)
        case .warn:
            bg = JdDynamicColor(light: 0xFFFB_EBFF, dark: 0xF59E_0B26)
            fg = JdDynamicColor(light: 0xB453_09FF, dark: 0xFCD3_4DFF)
            dot = JdDynamicColor(light: 0xF59E_0BFF, dark: 0xF59E_0BFF)
        case .danger:
            bg = JdDynamicColor(light: 0xFEF2_F2FF, dark: 0xEF44_4426)
            fg = JdDynamicColor(light: 0xB91C_1CFF, dark: 0xFCA5_A5FF)
            dot = JdDynamicColor(light: 0xEF44_44FF, dark: 0xEF44_44FF)
        case .info:
            bg = JdDynamicColor(light: 0xEFF6_FFFF, dark: 0x3B82_F626)
            fg = JdDynamicColor(light: 0x1D4E_D8FF, dark: 0x93C5_FDFF)
            dot = JdDynamicColor(light: 0x3B82_F6FF, dark: 0x3B82_F6FF)
        case .neutral:
            bg = JdDynamicColor(light: 0xF3F4_F6FF, dark: 0x9CA3_AF26)
            fg = JdDynamicColor(light: 0x4B55_63FF, dark: 0xD1D5_DBFF)
            dot = JdDynamicColor(light: 0x9CA3_AFFF, dark: 0x9CA3_AFFF)
        }

        return JdSeverityBadgeSpec(hPadding: hPadding, vPadding: vPadding, fontSize: fontSize,
                                   gap: JdToken.Space.s1_5, dotSize: 8,
                                   background: bg, foreground: fg, dotColor: dot)
    }
}

// MARK: - BatteryIndicator (웹 jd-battery-indicator)

public struct JdBatterySpec: Sendable {
    public var bodyWidth: CGFloat
    public var bodyHeight: CGFloat
    public var capWidth: CGFloat
    public var capHeight: CGFloat
    public var borderWidth: CGFloat
    public var radius: CGFloat
    /// 웹은 lg에서만 퍼센트 텍스트를 노출한다
    public var showsPercentText: Bool
    public var percentFontSize: CGFloat
    public var labelFontSize: CGFloat

    /// 웹: 본체 sm 40×16 · md 56×24 · lg 80×32, 캡 4×8 / 6×12 / 8×16, 테두리 2px, radius 4
    public static func resolve(size: JdDisplaySize) -> JdBatterySpec {
        switch size {
        case .sm:
            return JdBatterySpec(bodyWidth: 40, bodyHeight: 16, capWidth: 4, capHeight: 8,
                                 borderWidth: JdToken.Border.medium, radius: JdToken.Radius.sm,
                                 showsPercentText: false, percentFontSize: 10,
                                 labelFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        case .md:
            return JdBatterySpec(bodyWidth: 56, bodyHeight: 24, capWidth: 6, capHeight: 12,
                                 borderWidth: JdToken.Border.medium, radius: JdToken.Radius.sm,
                                 showsPercentText: false, percentFontSize: 10,
                                 labelFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        case .lg:
            return JdBatterySpec(bodyWidth: 80, bodyHeight: 32, capWidth: 8, capHeight: 16,
                                 borderWidth: JdToken.Border.medium, radius: JdToken.Radius.sm,
                                 showsPercentText: true, percentFontSize: 10,
                                 labelFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        }
    }

    /// 웹 클램프 + 자동 색 임계값: >70 success · >30 warning · 그 외 danger
    public static func clamp(_ value: Double) -> Double {
        min(max(value, 0), 100)
    }

    public static func autoColor(for value: Double) -> JdBatteryColor {
        let v = clamp(value)
        if v > 70 { return .success }
        if v > 30 { return .warning }
        return .danger
    }

    /// 채움색은 v2 Tailwind-500 리터럴(테마 불변) — 패리티 승계
    public static func fillColor(_ color: JdBatteryColor) -> JdDynamicColor {
        switch color {
        case .primary: return JdDynamicColor(light: 0x3B82_F6FF, dark: 0x3B82_F6FF)
        case .success: return JdDynamicColor(light: 0x22C5_5EFF, dark: 0x22C5_5EFF)
        case .warning: return JdDynamicColor(light: 0xF59E_0BFF, dark: 0xF59E_0BFF)
        case .danger: return JdDynamicColor(light: 0xEF44_44FF, dark: 0xEF44_44FF)
        }
    }

    /// 본체·캡 외곽선 — 웹 #9ca3af(다크 #6b7280)
    public static let outlineColor = JdDynamicColor(light: 0x9CA3_AFFF, dark: 0x6B72_80FF)
}

// MARK: - Kbd / KeyCap (웹 jd-kbd · jd-key-cap)

public struct JdKbdSpec: Sendable {
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var fontSize: CGFloat
    public var radius: CGFloat
    public var gap: CGFloat

    /// 웹: padding 2/6, radius 4, 11pt mono medium, gap 2
    public static func resolve() -> JdKbdSpec {
        JdKbdSpec(hPadding: JdToken.Space.s1_5, vPadding: JdToken.Space.s0_5,
                  fontSize: 11, radius: JdToken.Radius.sm, gap: JdToken.Space.s0_5)
    }

    /// 웹은 공백을 전부 제거한다("⌘ K" → "⌘K")
    public static func normalize(keys: String) -> String {
        keys.components(separatedBy: .whitespacesAndNewlines).joined()
    }
}

public struct JdKeyCapSpec: Sendable {
    public var height: CGFloat
    public var minWidth: CGFloat
    public var hPadding: CGFloat
    public var fontSize: CGFloat
    public var radius: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var border: JdDynamicColor
    public var hasKeyShadow: Bool

    /// 웹: sm 20/20/4/10 · md 24/24/6/12 · lg 32/32/8/14, radius 6
    public static func resolve(variant: JdKeyCapVariant, size: JdDisplaySize) -> JdKeyCapSpec {
        let height: CGFloat, minWidth: CGFloat, hPadding: CGFloat, fontSize: CGFloat
        switch size {
        case .sm: height = 20; minWidth = 20; hPadding = JdToken.Space.s1; fontSize = 10
        case .md: height = 24; minWidth = 24; hPadding = JdToken.Space.s1_5; fontSize = 12
        case .lg: height = 32; minWidth = 32; hPadding = JdToken.Space.s2; fontSize = 14
        }

        let background: JdDynamicColor, foreground: JdDynamicColor, border: JdDynamicColor
        var shadow = false
        switch variant {
        case .default:
            background = JdToken.Color.card
            foreground = JdToken.Color.foreground
            border = JdToken.Color.border
            shadow = true
        case .primary:
            background = JdToken.Color.primary
            foreground = JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF)
            border = JdToken.Color.primary
        case .muted:
            background = JdToken.Color.cardHover
            foreground = JdToken.Color.muted
            border = JdToken.Color.borderLight
        }

        return JdKeyCapSpec(height: height, minWidth: minWidth, hPadding: hPadding,
                            fontSize: fontSize, radius: JdToken.Radius.md,
                            background: background, foreground: foreground,
                            border: border, hasKeyShadow: shadow)
    }

    /// 눌림 시 아래로 1pt 이동(웹 translateY(1px))
    public static let pressedOffset: CGFloat = 1
}

// MARK: - Spinner (웹 jd-spinner)

public struct JdSpinnerSpec: Sendable {
    public var side: CGFloat
    public var lineWidth: CGFloat

    /// 웹 크기 축(sm/md/lg)에 대응하는 지름 — 선 두께는 지름 비례
    public static func resolve(size: JdDisplaySize) -> JdSpinnerSpec {
        switch size {
        case .sm: return JdSpinnerSpec(side: 16, lineWidth: 2)
        case .md: return JdSpinnerSpec(side: 24, lineWidth: 3)
        case .lg: return JdSpinnerSpec(side: 32, lineWidth: 3)
        }
    }

    /// 웹 기본 aria-label
    public static let defaultLabel = "로딩 중"
}
