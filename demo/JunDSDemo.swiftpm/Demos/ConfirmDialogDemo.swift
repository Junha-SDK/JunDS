import SwiftUI
import JunDS

// ConfirmDialog 데모 — **별칭**이다(alias-of: AlertDialog). 웹은 별도 태그지만 iOS엔 신규 타입이 없다 —
// 제목·설명·확인/취소·danger를 갖춘 AlertDialog 그대로다(04 §10.1, DESIGN-4 A). 신규 표면을 만들지 않고
// JdAlertDialog를 확인/취소 형태로 쓴다. 원장이 두 항목을 요구하므로 데모는 두되, 스테이지는 AlertDialog를
// 재사용해 "같은 실체"임을 드러낸다. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum ConfirmDialogDemo {
    static let demo = ComponentDemo(
        id: "ConfirmDialog",
        controls: [
            .toggle("danger", "danger"),
        ],
        swiftUI: { state in AnyView(ConfirmDialogStage(state: state)) }
    )
}

private struct ConfirmDialogStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var result = "—"

    private var isDestructive: Bool { state.bool("danger") }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("확인 요청", variant: .secondary) { isPresented = true }

            Text("결과: \(result) · ConfirmDialog ≡ AlertDialog")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
        .background(
            // alias-of AlertDialog: 확인/취소 + danger 형태가 ConfirmDialog의 실체
            JdAlertDialog(isPresented: $isPresented,
                          title: "계속하시겠습니까?",
                          message: isDestructive ? "되돌릴 수 없는 작업입니다." : "선택한 작업을 진행합니다.",
                          confirmLabel: "계속",
                          cancelLabel: "취소",
                          isDestructive: isDestructive,
                          onConfirm: { result = "확인" },
                          onCancel: { result = "취소" })
        )
    }
}
