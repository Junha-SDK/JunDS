import SwiftUI
import JunDS

// ActionSheet 데모 — 시스템 위임(.confirmationDialog). 선택지 목록은 Core JdActionItem 배열.
// 액션 3개 중 하나는 destructive(삭제). onSelect가 선택된 항목을 돌려준다. 컨트롤 리터럴은 웹 attribute 일치.

enum ActionSheetDemo {
    static let demo = ComponentDemo(
        id: "ActionSheet",
        controls: [
            .toggle("withMessage", "메시지 표시", initial: true),
        ],
        swiftUI: { state in AnyView(ActionSheetStage(state: state)) }
    )
}

// 액션 3개 — 마지막이 destructive(웹 destructive 플래그 동형)
private let actionSheetActions: [JdActionItem] = [
    JdActionItem(id: "share", label: "공유"),
    JdActionItem(id: "duplicate", label: "복제"),
    JdActionItem(id: "delete", label: "삭제", isDestructive: true),
]

private struct ActionSheetStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var selected = "—"

    private var message: String? {
        state.bool("withMessage") ? "이 항목에 적용할 작업을 고르세요" : nil
    }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("액션 시트 열기", variant: .secondary) { isPresented = true }

            Text("선택됨: \(selected)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
        .background(
            JdActionSheet(isPresented: $isPresented,
                          title: "항목 작업",
                          message: message,
                          actions: actionSheetActions,
                          onSelect: { item in selected = item.label })
        )
    }
}
