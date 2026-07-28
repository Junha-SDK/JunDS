import JunDS
import SwiftUI

// Notification 데모 — **자체 인라인 카드**(아이콘 + 제목 + 설명 + extra 액션 + 닫기). 자체 구현(04 §10.1).
// 30% 테두리 + 5% 틴트. extra는 추가 버튼 슬롯(ViewBuilder). 색은 JdFeedbackVariant.color(Core)만.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum NotificationDemo {
    static let demo = ComponentDemo(
        id: "Notification",
        controls: [
            .options(
                "variant", "variant", JdFeedbackVariant.allCases.map(\.rawValue), initial: "info"),
            .toggle("dismissible", "dismissible", initial: true),
            .toggle("extra", "extra 버튼", initial: true),
        ],
        swiftUI: { state in AnyView(NotificationStage(state: state)) }
    )
}

@MainActor
private func notificationVariant(_ state: DemoState) -> JdFeedbackVariant {
    JdFeedbackVariant(rawValue: state.string("variant")) ?? .info
}

private struct NotificationStage: View {
    @ObservedObject var state: DemoState
    @State private var isShown = true
    @State private var extraCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            if isShown {
                JdNotification(
                    title: "새 댓글이 달렸습니다",
                    description: "홍길동님이 회원님의 글에 댓글을 남겼습니다.",
                    variant: notificationVariant(state),
                    systemImage: "bell.badge",
                    isDismissible: state.bool("dismissible"),
                    onDismiss: { isShown = false }
                ) {
                    if state.bool("extra") {
                        JdButton("자세히 보기", variant: .ghost, size: .sm) { extraCount += 1 }
                    }
                }
            } else {
                JdButton("알림 복원", variant: .secondary, size: .sm) { isShown = true }
            }

            Text("extra 탭 횟수: \(extraCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
