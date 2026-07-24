import SwiftUI
import JunDSCore

// 웹 jd-empty-state의 SwiftUI 번역 — 중앙 배치 빈 상태 (DESIGN-4 §B).
// ContentUnavailableView는 iOS17+라 iOS16 하한에서 자체 구현이 정본. 아이콘 칩(cardHover 배경,
// muted 아이콘) + 제목 + 설명 + 액션. a11y: 제목·설명은 하나로 합치고 액션 버튼만 독립 포커스.
public struct JdEmptyState<Action: View>: View {
    private let title: String
    private let description: String?
    private let systemImage: String
    private let action: () -> Action

    @Environment(\.sizeCategory) private var sizeCategory

    // 원형 아이콘 칩 지름 — 웹 고정 px의 토큰 번역(하드코딩 금지)
    private var chipDiameter: CGFloat { JdToken.Space.s16 }

    public init(title: String,
                description: String? = nil,
                systemImage: String = "tray",
                @ViewBuilder action: @escaping () -> Action = { EmptyView() }) {
        self.title = title
        self.description = description
        self.systemImage = systemImage
        self.action = action
    }

    public var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            Image(systemName: systemImage)
                .jdFont(size: JdToken.FontSize.xl3, weight: JdToken.FontWeight.normal)
                .foregroundColor(JdToken.Color.muted.color)
                .frame(width: chipDiameter, height: chipDiameter)
                .background(JdToken.Color.cardHover.color)
                .clipShape(Circle())
                .accessibilityHidden(true) // 아이콘은 장식

            VStack(spacing: JdToken.Space.s2) {
                Text(title)
                    .jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                    .foregroundColor(JdToken.Color.foreground.color)
                    .multilineTextAlignment(.center)
                if let description {
                    Text(description)
                        .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                        .foregroundColor(JdToken.Color.muted.color)
                        .multilineTextAlignment(.center)
                }
            }
            // 제목·설명을 하나의 요소로 합친다(액션 버튼은 밖에 있어 독립 포커스 유지)
            .accessibilityElement(children: .combine)

            action()
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
