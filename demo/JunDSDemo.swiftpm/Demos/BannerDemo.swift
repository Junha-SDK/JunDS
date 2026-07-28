import JunDS
import SwiftUI

// Banner 데모 — **자체 인라인 피드백**(폭 꽉 찬 알림 바). variant.color 배경 + 흰 글자. 자체 구현(04 §10.1).
// action(선택)·dismissible(선택) 표면. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum BannerDemo {
    static let demo = ComponentDemo(
        id: "Banner",
        controls: [
            .options(
                "variant", "variant", JdFeedbackVariant.allCases.map(\.rawValue), initial: "info"),
            .toggle("action", "action 버튼"),
            .toggle("dismissible", "dismissible"),
        ],
        swiftUI: { state in AnyView(BannerStage(state: state)) }
    )
}

@MainActor
private func bannerVariant(_ state: DemoState) -> JdFeedbackVariant {
    JdFeedbackVariant(rawValue: state.string("variant")) ?? .info
}

private struct BannerStage: View {
    @ObservedObject var state: DemoState
    @State private var isShown = true
    @State private var actionCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            if isShown {
                JdBanner(
                    "새 버전을 사용할 수 있습니다",
                    variant: bannerVariant(state),
                    actionLabel: state.bool("action") ? "업데이트" : nil,
                    onAction: state.bool("action") ? { actionCount += 1 } : nil,
                    isDismissible: state.bool("dismissible"),
                    onDismiss: { isShown = false })
            } else {
                JdButton("배너 복원", variant: .secondary, size: .sm) { isShown = true }
            }

            Text("action 탭 횟수: \(actionCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
