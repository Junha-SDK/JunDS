import JunDSCore
import SwiftUI

// 웹 jd-bookmark-button 동형 — 심볼 토글 버튼 (DESIGN-3 §B).
// JdLikeButton과 **같은 골격**이고 심볼·켜짐 색만 다르다 → 눌림 스타일은 이 파일에 1회만
// 정의하고 두 컴포넌트가 공유한다(계층 내부 공유라 DEC-010과 무관).
// 기하(변·모서리·아이콘 크기)는 JdIconButtonSpec(ghost)을 재사용한다 — 전용 스펙 신설 금지.
public struct JdBookmarkButton: View {
    @Binding private var isBookmarked: Bool
    private let spec: JdIconButtonSpec
    // UIControl 계열의 isEnabled와 혼동을 피하려 저장 이름을 분리한다(표면 인자명은 계약대로)
    private let isControlEnabled: Bool

    public init(
        isBookmarked: Binding<Bool>,
        size: JdIconButtonSize = .md,
        isEnabled: Bool = true
    ) {
        self._isBookmarked = isBookmarked
        self.spec = JdIconButtonSpec.resolve(variant: .ghost, size: size)
        self.isControlEnabled = isEnabled
    }

    public var body: some View {
        Button {
            isBookmarked.toggle()
        } label: {
            Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
        }
        .buttonStyle(JdSocialButtonStyle(spec: spec, tint: tint))
        .disabled(!isControlEnabled)
        // 웹 aria-pressed + 라벨 교체 동형 — 라벨은 "다음 동작", 상태는 트레이트 (04 §7.1)
        .accessibilityLabel(Text(isBookmarked ? "북마크 해제" : "북마크"))
        .accessibilityAddTraits(isBookmarked ? [.isButton, .isSelected] : [.isButton])
    }

    /// 켜짐 = warning 토큰, 꺼짐 = 아이콘 버튼 스펙의 기본 전경(muted)
    private var tint: JdDynamicColor {
        isBookmarked ? JdToken.Color.warning : spec.foreground
    }
}

// MARK: - 공유 눌림 스타일 (Bookmark · Like)

/// 아이콘 버튼과 같은 눌림 어휘를 쓰되 전경색만 상태에 따라 주입받는다.
/// (JdIconButtonPressStyle은 스펙의 foreground를 고정으로 쓰므로 토글 색을 실을 수 없다)
struct JdSocialButtonStyle: ButtonStyle {
    let spec: JdIconButtonSpec
    let tint: JdDynamicColor

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        let background = configuration.isPressed ? spec.pressedBackground : spec.background
        return configuration.label
            // SF Symbol은 폰트 크기로 스케일된다 (04 §7.2)
            .font(
                JdSwiftUIFont.scaled(
                    size: spec.iconSize,
                    weight: JdToken.FontWeight.medium,
                    category: sizeCategory)
            )
            .foregroundColor(tint.color)
            .frame(minWidth: spec.side, minHeight: spec.side)  // 고정 크기 금지 (04 §7.2)
            .background(background.color)
            .clipShape(shape)
            .contentShape(shape)  // 투명 배경에서도 모서리까지 탭 수용
            .opacity(isEnabled ? 1 : JdToken.Opacity.o50)
            .animation(
                reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                value: configuration.isPressed)
    }
}
