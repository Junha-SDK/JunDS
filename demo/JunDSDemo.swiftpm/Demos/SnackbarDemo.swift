import JunDS
import SwiftUI

// Snackbar 데모 — **자체 단일 바**(스택 아님, 위치 4종, 자동 닫힘). 자체 구현(04 §10.1).
// isPresented 바인딩으로 스스로 뜨고 duration 뒤 닫힌다(hover/focus 중 정지). action은 선택 표면.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum SnackbarDemo {
    static let demo = ComponentDemo(
        id: "Snackbar",
        controls: [
            .options(
                "position", "position", JdToastPosition.allCases.map(\.rawValue), initial: "bottom"),
            .options(
                "variant", "variant", JdFeedbackVariant.allCases.map(\.rawValue), initial: "info"),
            .toggle("action", "action 버튼"),
        ],
        swiftUI: { state in AnyView(SnackbarStage(state: state)) }
    )
}

@MainActor
private func snackbarPosition(_ state: DemoState) -> JdToastPosition {
    JdToastPosition(rawValue: state.string("position")) ?? .bottom
}

@MainActor
private func snackbarVariant(_ state: DemoState) -> JdFeedbackVariant {
    JdFeedbackVariant(rawValue: state.string("variant")) ?? .info
}

private struct SnackbarStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var actionCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("스낵바 표시", variant: .primary) { isPresented = true }

            Text("action 탭 횟수: \(actionCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 220)
        .padding(JdToken.Space.s6)
        .overlay(
            // 단일 바 — position에 맞춰 스스로 정렬한다
            JdSnackbar(
                isPresented: $isPresented,
                message: "변경 사항이 저장되었습니다",
                variant: snackbarVariant(state),
                position: snackbarPosition(state),
                actionLabel: state.bool("action") ? "실행 취소" : nil,
                onAction: state.bool("action") ? { actionCount += 1 } : nil)
        )
    }
}
