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
            // 겹 단위 엘리베이션 (DEC-039). 키캡은 눌리면 아래로 내려가며 그림자를 잃는다 —
            // offset과 그림자 제거가 함께 가야 '키가 들어갔다'로 읽힌다.
            .jdElevation(keyElevation, in: shape)
            .offset(y: isPressed ? JdKeyCapSpec.pressedOffset : 0)
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.press),
                       value: isPressed)
    }

    // 웹 .jd-key-cap의 미세 바닥 그림자 — 토큰 사다리의 xs를 승계한다.
    private var keyElevation: JdToken.Shadow.Dynamic {
        guard spec.hasKeyShadow, !isPressed else { return JdToken.Shadow.none }
        return JdToken.Shadow.xs
    }
}
