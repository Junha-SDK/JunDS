import JunDS
import SwiftUI

// BottomSheet 데모 — 시스템 위임(presentationDetents). draggable이 끌어 닫기(드래그 인디케이터) 표면이다.
// "열기" 버튼 + JdBottomSheet 프레젠테이션. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum BottomSheetDemo {
    static let demo = ComponentDemo(
        id: "BottomSheet",
        controls: [
            .options("size", "size", JdOverlaySize.allCases.map(\.rawValue), initial: "md"),
            .toggle("draggable", "draggable", initial: true),
        ],
        swiftUI: { state in AnyView(BottomSheetStage(state: state)) }
    )
}

@MainActor
private func bottomSheetSize(_ state: DemoState) -> JdOverlaySize {
    JdOverlaySize(rawValue: state.string("size")) ?? .md
}

private struct BottomSheetStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false

    private var draggable: Bool { state.bool("draggable") }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("바텀시트 열기", variant: .secondary) { isPresented = true }

            Text(
                draggable
                    ? "draggable — 드래그 인디케이터 표시 + 끌어 내려 닫기 허용"
                    : "draggable=false — 인디케이터 숨김 + 끌어 닫기 비활성(닫기 버튼만)"
            )
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
        .background(
            JdBottomSheet(
                isPresented: $isPresented,
                size: bottomSheetSize(state),
                draggable: draggable
            ) {
                VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                    Text("JdBottomSheet · size=\(bottomSheetSize(state).rawValue)")
                        .font(.headline)
                    Text("presentationDetents로 size별 높이를 잡고, draggable에 따라 드래그 인디케이터·끌어 닫기를 켠다.")
                        .font(.body)
                    JdButton("닫기", variant: .primary) { isPresented = false }
                }
                .padding(JdToken.Space.s4)
            }
        )
    }
}
