import CoreGraphics
import Foundation

public struct JdTextFieldSpec: Sendable {
    public var minHeight: CGFloat
    public var hPadding: CGFloat
    public var radius: CGFloat
    public var fontSize: CGFloat
    public var labelFontSize: CGFloat
    public var labelFontWeight: CGFloat
    public var errorFontSize: CGFloat
    public var disabledOpacity: CGFloat

    // 토큰만 읽는 순수 함수 — 웹 jd-text-field size 축(sm/md/lg)과 동형
    public static func resolve(size: JdControlSize) -> JdTextFieldSpec {
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
            hPadding = JdToken.Space.s3_5
            fontSize = JdToken.FontSize.md
            radius = JdToken.Radius.xl
        case .lg:
            minHeight = 48
            hPadding = JdToken.Space.s4
            fontSize = JdToken.FontSize.lg
            radius = JdToken.Radius.xl
        }
        return JdTextFieldSpec(
            minHeight: minHeight,
            hPadding: hPadding,
            radius: radius,
            fontSize: fontSize,
            labelFontSize: JdToken.FontSize.md,
            labelFontWeight: JdToken.FontWeight.medium,
            errorFontSize: JdToken.FontSize.xs,
            disabledOpacity: CGFloat(JdToken.Opacity.o40)
        )
    }
}
