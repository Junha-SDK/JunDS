import CoreGraphics
import Foundation

// 웹 variant 문자열과 rawValue 일치 (04 §9). outline/link/xs는 G1 iOS 표면 제외 — DEC-013.
public enum JdButtonVariant: String, CaseIterable, Sendable {
    case primary
    case secondary
    case ghost
    case danger
}

private let jdWhite = JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF)
private let jdClear = JdDynamicColor(light: 0x0000_0000, dark: 0x0000_0000)
// ghost 눌림: muted 16% (웹 .jd-button ghost:active의 color-mix 등가)
private let jdGhostPressed = JdDynamicColor(light: 0x6B68_8029, dark: 0xA09C_B529)

public struct JdButtonSpec: Sendable {
    public var minHeight: CGFloat
    public var hPadding: CGFloat
    public var radius: CGFloat
    public var fontSize: CGFloat
    public var fontWeight: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var pressedBackground: JdDynamicColor
    public var border: JdDynamicColor?
    public var disabledOpacity: CGFloat

    // 토큰만 읽는 순수 함수 — variant×size 전 조합을 단위 테스트로 검증 (04 §9)
    public static func resolve(variant: JdButtonVariant, size: JdControlSize) -> JdButtonSpec {
        let minHeight: CGFloat
        let hPadding: CGFloat
        let fontSize: CGFloat
        let radius: CGFloat
        switch size {
        case .sm:
            minHeight = 32
            hPadding = JdToken.Space.s3
            fontSize = JdToken.FontSize.xs
            radius = JdToken.Radius.lg
        case .md:
            minHeight = 40
            hPadding = JdToken.Space.s4
            fontSize = JdToken.FontSize.md
            radius = JdToken.Radius.xl
        case .lg:
            minHeight = 48
            hPadding = JdToken.Space.s6
            fontSize = JdToken.FontSize.lg
            radius = JdToken.Radius.xl
        }

        let background: JdDynamicColor
        let foreground: JdDynamicColor
        let pressedBackground: JdDynamicColor
        var border: JdDynamicColor?
        switch variant {
        case .primary:
            background = JdToken.Color.primary
            foreground = jdWhite
            pressedBackground = JdToken.Color.primaryHover
        case .secondary:
            background = JdToken.Color.card
            foreground = JdToken.Color.foreground
            pressedBackground = JdToken.Color.borderLight
            border = JdToken.Color.border
        case .ghost:
            background = jdClear
            foreground = JdToken.Color.foreground
            pressedBackground = jdGhostPressed
        case .danger:
            background = JdToken.Color.danger
            foreground = jdWhite
            pressedBackground = JdToken.Color.dangerHover
        }

        return JdButtonSpec(
            minHeight: minHeight,
            hPadding: hPadding,
            radius: radius,
            fontSize: fontSize,
            fontWeight: JdToken.FontWeight.semibold,
            background: background,
            foreground: foreground,
            pressedBackground: pressedBackground,
            border: border,
            disabledOpacity: CGFloat(JdToken.Opacity.o40)
        )
    }
}
