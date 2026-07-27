import SwiftUI
import JunDSCore

// 웹 jd-icon-button 동형 — 아이콘 전용 버튼 (DESIGN-2 §B1).
// 아이콘 children은 iOS에서 SF Symbols 이름(systemImage)으로 번역한다 — 서드파티 0 규칙 아래
// 시스템 심볼만 허용되며, 스케일은 폰트에 묶여 Dynamic Type을 따라간다.
//
// ⚠️ 접근성 각주(히트 타깃): 웹 크기(xs 24 · sm 28 · md 32 · lg 40)를 그대로 승계하므로
//    **네 크기 모두 HIG 최소 44pt에 미달한다**. 표면은 3플랫폼 패리티 때문에 유지하되,
//    단독 배치되는 주요 액션에는 lg + 소비자 측 여백(터치 영역 확장)을 권한다.
//    Dynamic Type에서는 minWidth/minHeight 해석(04 §7.2)이라 크기가 자라 실질 타깃도 커진다.
public struct JdIconButton: View {
    private let systemImage: String
    private let label: String
    private let spec: JdIconButtonSpec
    private let action: () -> Void

    // 라벨 없는 init을 제공하지 않는다 — 아이콘 전용 컨트롤의 컴파일 타임 강제 (04 §7.1)
    public init(systemImage: String,
                accessibilityLabel: String,
                variant: JdIconButtonVariant = .ghost,
                size: JdIconButtonSize = .md,
                action: @escaping () -> Void) {
        self.systemImage = systemImage
        self.label = accessibilityLabel
        self.spec = JdIconButtonSpec.resolve(variant: variant, size: size)
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
        }
        .buttonStyle(JdIconButtonPressStyle(spec: spec))
        // 아이콘은 장식이 아니라 컨트롤의 유일한 내용 — 라벨을 강제로 덮어쓴다
        .accessibilityLabel(Text(label))
    }
}

struct JdIconButtonPressStyle: ButtonStyle {
    let spec: JdIconButtonSpec

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        let background = configuration.isPressed ? spec.pressedBackground : spec.background
        return configuration.label
            // SF Symbol은 폰트 크기로 스케일된다 — 웹 아이콘 크기(변 0.5배)를 폰트에 싣는다
            .font(JdSwiftUIFont.scaled(size: spec.iconSize,
                                       weight: JdToken.FontWeight.medium,
                                       category: sizeCategory))
            .foregroundColor(spec.foreground.color)
            .frame(minWidth: spec.side, minHeight: spec.side) // 고정 크기 금지 (04 §7.2)
            .background(background.color)
            .clipShape(shape)
            .overlay(borderOverlay(shape))
            .contentShape(shape) // 투명 배경(ghost)에서도 모서리까지 탭 수용
            // 24~40pt 컨트롤이라 standard(0.97)로는 변화가 안 보인다 → compact (DEC-039)
            .jdPressScale(configuration.isPressed && !reduceMotion, depth: .compact)
            .opacity(isEnabled ? 1 : JdToken.Opacity.o50) // 웹 :disabled opacity-50
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.press),
                       value: configuration.isPressed)
    }

    @ViewBuilder
    private func borderOverlay(_ shape: RoundedRectangle) -> some View {
        if let border = spec.border {
            shape.strokeBorder(border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
