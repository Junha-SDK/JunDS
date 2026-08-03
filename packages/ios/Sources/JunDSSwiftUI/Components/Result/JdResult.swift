import JunDSCore
import SwiftUI

// 웹 jd-result의 SwiftUI 번역 — EmptyState 파생, 결과 화면 (DESIGN-4 §B).
// status별 심볼·색은 Core JdResultStatus가 단일 소스. 웹의 정보 없는 일러스트 대신 64pt 시맨틱
// 심볼로 상태를 크게 알린다(장식 제거 판단 승계).
public struct JdResult<Action: View>: View {
    private let status: JdResultStatus
    private let title: String
    private let description: String?
    private let action: () -> Action

    @Environment(\.sizeCategory) private var sizeCategory

    // 대형 심볼 크기 — 웹 고정 px의 토큰 번역(하드코딩 금지)
    private var symbolSize: CGFloat { JdToken.Space.s16 }

    public init(
        status: JdResultStatus,
        title: String,
        description: String? = nil,
        @ViewBuilder action: @escaping () -> Action = { EmptyView() }
    ) {
        self.status = status
        self.title = title
        self.description = description
        self.action = action
    }

    public var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            Image(systemName: status.systemImage)
                .jdFont(size: symbolSize, weight: JdToken.FontWeight.normal)
                .foregroundColor(status.color.color)
                .accessibilityHidden(true)  // 상태는 제목/설명이 말한다 — 심볼은 장식

            VStack(spacing: JdToken.Space.s2) {
                Text(title)
                    .jdFont(size: JdToken.FontSize.xl, weight: JdToken.FontWeight.semibold)
                    .foregroundColor(JdToken.Color.foreground.color)
                    .multilineTextAlignment(.center)
                if let description {
                    Text(description)
                        .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                        .foregroundColor(JdToken.Color.muted.color)
                        .multilineTextAlignment(.center)
                }
            }
            .accessibilityElement(children: .combine)

            action()
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
