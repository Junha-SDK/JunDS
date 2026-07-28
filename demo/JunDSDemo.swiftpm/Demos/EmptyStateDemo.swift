import JunDS
import SwiftUI

// EmptyState 데모 — **자체 중앙 배치**(아이콘 칩 + 제목 + 설명 + 액션). ContentUnavailableView가 iOS17+라 자체 구현(04 §10.1).
// action은 ViewBuilder 슬롯(선택). 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum EmptyStateDemo {
    static let demo = ComponentDemo(
        id: "EmptyState",
        controls: [
            .options(
                "icon", "systemImage", ["tray", "magnifyingglass", "bell.slash", "folder"],
                initial: "tray"),
            .toggle("action", "action 버튼", initial: true),
        ],
        swiftUI: { state in AnyView(EmptyStateStage(state: state)) }
    )
}

@MainActor
private func emptyStateIcon(_ state: DemoState) -> String {
    state.string("icon", fallback: "tray")
}

private struct EmptyStateStage: View {
    @ObservedObject var state: DemoState
    @State private var actionCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdEmptyState(
                title: "아직 항목이 없습니다",
                description: "첫 항목을 추가하면 여기에 표시됩니다.",
                systemImage: emptyStateIcon(state)
            ) {
                if state.bool("action") {
                    JdButton("항목 추가", variant: .primary, size: .sm) { actionCount += 1 }
                }
            }

            Text("action 탭 횟수: \(actionCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
