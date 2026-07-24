import SwiftUI
import JunDSCore

// 웹 jd-key-cap 동형 — 키 한 개 모양 칩. 치수·색·눌림 오프셋은 전부 JdKeyCapSpec.
// 눌림 = 아래로 1pt 이동 + 그림자 제거(웹 translateY(1px) + box-shadow:none).
public struct JdKeyCap: View {
    private let key: String
    private let spec: JdKeyCapSpec
    private let isPressed: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(_ key: String,
                variant: JdKeyCapVariant = .default,
                size: JdDisplaySize = .md,
                isPressed: Bool = false) {
        self.key = key
        self.spec = JdKeyCapSpec.resolve(variant: variant, size: size)
        self.isPressed = isPressed
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        return Text(key)
            .font(JdSwiftUIFont.scaledMono(size: spec.fontSize,
                                           weight: JdToken.FontWeight.medium,
                                           category: sizeCategory))
            .foregroundColor(spec.foreground.color)
            .padding(.horizontal, spec.hPadding)
            // 고정 height 금지 — XXXL에서 자란다 (04 §7.2). 웹의 height는 하한으로 번역.
            .frame(minWidth: spec.minWidth, minHeight: spec.height)
            .background(spec.background.color)
            .clipShape(shape)
            .overlay(shape.strokeBorder(spec.border.color, lineWidth: JdToken.Border.thin))
            .shadow(color: shadowColor,
                    radius: JdKeyCap.shadowGeometry.blur / 2, // CSS blur = 2 × 렌더 반경
                    x: JdKeyCap.shadowGeometry.x,
                    y: JdKeyCap.shadowGeometry.y)
            .offset(y: isPressed ? JdKeyCapSpec.pressedOffset : 0)
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                       value: isPressed)
    }

    // 웹 .jd-key-cap의 미세 바닥 그림자 — 토큰 사다리의 xs를 승계한다(기하는 라이트/다크 동일).
    private var shadowColor: Color {
        guard spec.hasKeyShadow, !isPressed else { return .clear }
        return JdKeyCap.shadowInk.color
    }

    private static let shadowInk = JdDynamicColor(
        light: JdToken.Shadow.xs.light.first?.color ?? 0,
        dark: JdToken.Shadow.xs.dark.first?.color ?? 0
    )

    private static let shadowGeometry: JdToken.Shadow.Layer =
        JdToken.Shadow.xs.light.first ?? .init(color: 0, x: 0, y: 0, blur: 0, spread: 0)
}
