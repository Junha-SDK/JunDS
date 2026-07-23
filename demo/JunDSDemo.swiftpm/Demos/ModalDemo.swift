import SwiftUI
import JunDS

// Modal 데모 — ButtonDemo(정본) 구조 복제: ComponentDemo 하나 + 스테이지 뷰 2개.
// persistent = 웹 백드롭 클릭 무시의 iOS 번역(interactiveDismissDisabled, DEC-012-4).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum ModalDemo {
    static let demo = ComponentDemo(
        id: "Modal",
        controls: [
            .options("size", "size", JdModalSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("persistent", "persistent"),
        ],
        swiftUI: { state in AnyView(ModalStageSwiftUI(state: state)) },
        uikit: { state in AnyView(ModalStageUIKit(state: state)) }
    )
}

private struct ModalStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var closeCount = 0

    private var persistent: Bool { state.bool("persistent") }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("모달 열기", variant: .secondary) {
                isPresented = true
            }

            Text("닫힘 횟수: \(closeCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
        // onClose는 시트 dismiss 완료 시점 1회 — 스와이프/닫기 버튼 어느 경로든 동일하게 센다.
        .jdModal(isPresented: $isPresented,
                 size: JdModalSize(rawValue: state.string("size")) ?? .md,
                 persistent: persistent,
                 onClose: { closeCount += 1 }) {
            VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                Text("jdModal")
                    .font(.headline)
                Text(persistent
                     ? "persistent — 스와이프로 닫히지 않는다. 닫기 버튼만 동작한다(웹 백드롭 무시와 동일 의미론)."
                     : "스와이프 다운으로 닫힌다 — 웹 백드롭 경로의 iOS 번역.")
                JdButton("닫기", variant: .primary) {
                    isPresented = false
                }
            }
        }
    }
}

private struct ModalStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        // 호스트 컨트롤러가 스스로 모달을 띄우므로 스테이지에는 높이만 확보한다.
        UIKitModalHostRep(
            size: JdModalSize(rawValue: state.string("size")) ?? .md,
            persistent: state.bool("persistent")
        )
        .frame(minHeight: 120)
    }
}
