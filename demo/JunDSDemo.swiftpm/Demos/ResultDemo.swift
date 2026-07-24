import SwiftUI
import JunDS

// Result 데모 — **자체**(EmptyState 파생, status별 64pt 대형 심볼). 자체 구현(04 §10.1).
// status 6종은 Core JdResultStatus(success/error/warning/info/404/403 — 심볼·색 단일 소스).
// action은 ViewBuilder 슬롯(선택). 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum ResultDemo {
    static let demo = ComponentDemo(
        id: "Result",
        controls: [
            .options("status", "status", JdResultStatus.allCases.map(\.rawValue), initial: "success"),
        ],
        swiftUI: { state in AnyView(ResultStage(state: state)) }
    )
}

@MainActor
private func resultStatus(_ state: DemoState) -> JdResultStatus {
    JdResultStatus(rawValue: state.string("status")) ?? .success
}

@MainActor
private func resultTitle(_ state: DemoState) -> String {
    switch resultStatus(state) {
    case .success: return "완료되었습니다"
    case .error: return "문제가 발생했습니다"
    case .warning: return "확인이 필요합니다"
    case .info: return "안내드립니다"
    case .notFound: return "페이지를 찾을 수 없습니다"
    case .forbidden: return "접근 권한이 없습니다"
    }
}

private struct ResultStage: View {
    @ObservedObject var state: DemoState
    @State private var actionCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdResult(status: resultStatus(state),
                     title: resultTitle(state),
                     description: "status(=\(resultStatus(state).rawValue))가 64pt 심볼과 색을 정한다.") {
                JdButton("돌아가기", variant: .secondary, size: .sm) { actionCount += 1 }
            }

            Text("action 탭 횟수: \(actionCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
