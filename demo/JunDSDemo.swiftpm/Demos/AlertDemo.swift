import JunDS
import SwiftUI

// Alert 데모 — **자체 인라인 피드백**(좌측 강조선 + variant 틴트). iOS 시스템 대응이 없어 자체 구현(04 §10.1).
// 프레젠테이션이 아니라 하이어라키에 그대로 놓이는 블록이다. isDismissible이면 닫기 버튼이 뜨고 onDismiss로 사라진다.
// 색은 JdFeedbackVariant.color(Core)만 쓴다. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum AlertDemo {
    static let demo = ComponentDemo(
        id: "Alert",
        controls: [
            .options(
                "variant", "variant", JdFeedbackVariant.allCases.map(\.rawValue), initial: "info"),
            .toggle("dismissible", "dismissible"),
        ],
        swiftUI: { state in AnyView(AlertStage(state: state)) }
    )
}

@MainActor
private func alertVariant(_ state: DemoState) -> JdFeedbackVariant {
    JdFeedbackVariant(rawValue: state.string("variant")) ?? .info
}

private struct AlertStage: View {
    @ObservedObject var state: DemoState
    @State private var isShown = true

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            if isShown {
                JdAlert(
                    "업데이트가 적용되었습니다",
                    variant: alertVariant(state),
                    isDismissible: state.bool("dismissible"),
                    onDismiss: { isShown = false }
                ) {
                    Text(
                        "좌측 강조선 색은 variant(=\(alertVariant(state).rawValue))가 정한다. danger·warning은 접근성 라이브 리전 우선순위가 올라간다."
                    )
                }
            } else {
                JdButton("다시 표시", variant: .secondary, size: .sm) { isShown = true }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
