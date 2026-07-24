import SwiftUI
import JunDS

// AlertDialog 데모 — 시스템 위임(.alert). 제목·설명·확인/취소. isDestructive면 확인 버튼이 destructive(danger).
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum AlertDialogDemo {
    static let demo = ComponentDemo(
        id: "AlertDialog",
        controls: [
            .toggle("danger", "danger (확인=파괴적)"),
        ],
        swiftUI: { state in AnyView(AlertDialogStage(state: state)) }
    )
}

private struct AlertDialogStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var result = "—"

    private var isDestructive: Bool { state.bool("danger") }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("얼럿 열기", variant: .secondary) { isPresented = true }

            Text("결과: \(result)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
        .background(
            JdAlertDialog(isPresented: $isPresented,
                          title: isDestructive ? "삭제하시겠습니까?" : "변경을 저장할까요?",
                          message: isDestructive ? "이 작업은 되돌릴 수 없습니다." : "저장하면 이전 값을 덮어씁니다.",
                          confirmLabel: isDestructive ? "삭제" : "저장",
                          cancelLabel: "취소",
                          isDestructive: isDestructive,
                          onConfirm: { result = "확인" },
                          onCancel: { result = "취소" })
        )
    }
}
