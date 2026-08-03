import JunDSCore
import SwiftUI

// 웹 jd-like-button 동형 — 하트 토글 + 선택적 카운트 (DESIGN-3 §B).
// 카운트 표기는 **JdNumberFormat.compactCount** 단일 소스다 — 자리수 축약을 여기서
// 다시 계산하지 않는다 (04 §4.2 규칙 3).
public struct JdLikeButton: View {
    @Binding private var isLiked: Bool
    private let count: Int?
    private let spec: JdIconButtonSpec
    private let isControlEnabled: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        isLiked: Binding<Bool>,
        count: Int? = nil,
        size: JdIconButtonSize = .md,
        isEnabled: Bool = true
    ) {
        self._isLiked = isLiked
        self.count = count
        self.spec = JdIconButtonSpec.resolve(variant: .ghost, size: size)
        self.isControlEnabled = isEnabled
    }

    public var body: some View {
        Button {
            isLiked.toggle()
        } label: {
            HStack(spacing: JdToken.Space.s1) {
                Image(systemName: isLiked ? "heart.fill" : "heart")
                if let countText {
                    Text(countText)
                        // 스타일이 심볼 폰트를 깔아두므로 카운트만 본문 크기로 되돌린다
                        .font(
                            JdSwiftUIFont.scaled(
                                size: JdTextSpec.resolve(size: .xs).fontSize,
                                weight: JdToken.FontWeight.medium,
                                category: sizeCategory))
                }
            }
            // 카운트가 붙으면 정사각 히트 타깃이 아니므로 좌우 숨통을 준다
            .padding(.horizontal, count == nil ? 0 : JdToken.Space.s1)
        }
        .buttonStyle(JdSocialButtonStyle(spec: spec, tint: tint))
        .disabled(!isControlEnabled)
        // 웹 aria-pressed + 라벨 교체 동형 (04 §7.1)
        .accessibilityLabel(Text(isLiked ? "좋아요 취소" : "좋아요"))
        .accessibilityValue(Text(countText ?? ""))
        .accessibilityAddTraits(isLiked ? [.isButton, .isSelected] : [.isButton])
    }

    /// 켜짐 = danger 토큰, 꺼짐 = 아이콘 버튼 스펙의 기본 전경(muted)
    private var tint: JdDynamicColor {
        isLiked ? JdToken.Color.danger : spec.foreground
    }

    private var countText: String? {
        guard let count else { return nil }
        return JdNumberFormat.compactCount(count)
    }
}
