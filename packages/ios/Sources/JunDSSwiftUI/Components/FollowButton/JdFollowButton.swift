import JunDSCore
import SwiftUI

// 웹 jd-follow-button 동형 — 두 변형 캡슐 버튼 (DESIGN-3 §B).
// 미팔로우 = primary 채움 / 팔로잉 = secondary 외곽선. 두 변형 모두 JdButtonSpec을
// 그대로 재사용하고 모서리만 캡슐(Radius.full)로 바꾼다 — 전용 색·치수 신설 금지.
// iOS엔 호버가 없으므로 웹의 "팔로잉 → 언팔로우" 호버 문구 교체는 이식하지 않는다(눌림만).
public struct JdFollowButton: View {
    @Binding private var isFollowing: Bool
    private let size: JdControlSize
    private let isControlEnabled: Bool
    private let followLabel: String
    private let followingLabel: String

    public init(
        isFollowing: Binding<Bool>,
        size: JdControlSize = .md,
        isEnabled: Bool = true,
        followLabel: String = "팔로우",
        followingLabel: String = "팔로잉"
    ) {
        self._isFollowing = isFollowing
        self.size = size
        self.isControlEnabled = isEnabled
        self.followLabel = followLabel
        self.followingLabel = followingLabel
    }

    public var body: some View {
        Button {
            isFollowing.toggle()
        } label: {
            Text(title)
        }
        .buttonStyle(JdFollowButtonStyle(spec: spec))
        .disabled(!isControlEnabled)
        // 라벨 교체가 곧 상태 표기다 — 트레이트로 눌림 상태를 함께 준다 (웹 aria-pressed 동형)
        .accessibilityLabel(Text(title))
        .accessibilityAddTraits(isFollowing ? [.isButton, .isSelected] : [.isButton])
    }

    private var title: String {
        isFollowing ? followingLabel : followLabel
    }

    private var spec: JdButtonSpec {
        JdButtonSpec.resolve(variant: isFollowing ? .secondary : .primary, size: size)
    }
}

/// JdButtonPressStyle과 같은 어휘지만 모서리만 캡슐이다(웹 border-radius: 9999px 동형).
struct JdFollowButtonStyle: ButtonStyle {
    let spec: JdButtonSpec

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func makeBody(configuration: Configuration) -> some View {
        // Radius.full(9999) = 캡슐 — 토큰 사다리의 끝값을 형태로 번역한다
        let shape = Capsule(style: .continuous)
        let background = configuration.isPressed ? spec.pressedBackground : spec.background
        return configuration.label
            .font(
                JdSwiftUIFont.scaled(
                    size: spec.fontSize,
                    weight: spec.fontWeight,
                    category: sizeCategory)
            )
            .padding(.horizontal, spec.hPadding)
            .frame(minHeight: spec.minHeight)  // 고정 height 금지 (04 §7.2)
            .foregroundColor(spec.foreground.color)
            .background(background.color)
            .clipShape(shape)
            .overlay(borderOverlay(shape))
            .contentShape(shape)
            .opacity(isEnabled ? 1 : spec.disabledOpacity)
            .animation(
                reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                value: configuration.isPressed)
    }

    @ViewBuilder
    private func borderOverlay(_ shape: Capsule) -> some View {
        if let border = spec.border {
            shape.strokeBorder(border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
