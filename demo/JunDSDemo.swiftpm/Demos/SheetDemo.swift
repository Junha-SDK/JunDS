import SwiftUI
import JunDS

// Sheet 데모 — **별칭**이다(alias-of: BottomSheet). 웹은 별도 태그지만 iOS엔 신규 타입이 없다 —
// Sheet = BottomSheet의 draggable(끌어 닫기) 형태다(04 §10.1, DESIGN-4 A). 신규 표면을 만들지 않고
// JdBottomSheet를 draggable=true로 그대로 쓴다. 원장이 두 항목을 요구하므로 데모는 두되, 스테이지는
// BottomSheet를 재사용해 "같은 실체"임을 드러낸다. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum SheetDemo {
    static let demo = ComponentDemo(
        id: "Sheet",
        controls: [
            .options("size", "size", JdOverlaySize.allCases.map(\.rawValue), initial: "md"),
        ],
        swiftUI: { state in AnyView(SheetStage(state: state)) }
    )
}

@MainActor
private func sheetSize(_ state: DemoState) -> JdOverlaySize {
    JdOverlaySize(rawValue: state.string("size")) ?? .md
}

private struct SheetStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("시트 열기", variant: .secondary) { isPresented = true }

            Text("Sheet = BottomSheet(draggable) — 별도 타입 없음. 끌어 내려 닫는다.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
        .background(
            // alias-of BottomSheet: draggable 고정 = 끌어 닫기 허용이 Sheet의 실체
            JdBottomSheet(isPresented: $isPresented,
                          size: sheetSize(state),
                          draggable: true) {
                VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                    Text("JdSheet ≡ JdBottomSheet(draggable: true)")
                        .font(.headline)
                    Text("웹의 Sheet 태그는 iOS에서 새 컴포넌트가 아니라 draggable 바텀시트다 — 소비자가 어느 이름으로 불러도 같은 시트가 나온다.")
                        .font(.body)
                    JdButton("닫기", variant: .primary) { isPresented = false }
                }
                .padding(JdToken.Space.s4)
            }
        )
    }
}
