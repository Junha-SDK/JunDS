import JunDS
import SwiftUI
import UIKit

// Kbd 데모 — 실컴포넌트 JdKbd(SwiftUI)/JdKbdView(UIKit). 웹 <jd-kbd> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(keys) — 3플랫폼 동일 (04 §3).
//
// keys는 **공백이 전부 제거되어** 결합된다("⌘ K" → "⌘K"). 웹의 keys.join("") 등가이고
// 규칙 자체는 Core의 순수 함수 JdKbdSpec.normalize 하나가 갖는다 —
// 스테이지도 그 함수를 불러 결과를 보여 준다(데모가 규칙을 재구현하지 않는다).

enum KbdDemo {
    static let demo = ComponentDemo(
        id: "Kbd",
        controls: [
            .text("keys", "keys", placeholder: "예: ⌘ K", initial: "⌘ K")
        ],
        swiftUI: { state in AnyView(KbdStageSwiftUI(state: state)) },
        uikit: { state in AnyView(KbdStageUIKit(state: state)) }
    )
}

@MainActor
private func kbdKeys(_ state: DemoState) -> String {
    state.string("keys", fallback: "⌘ K")
}

@MainActor
private func kbdNote(_ state: DemoState) -> String {
    let raw = kbdKeys(state)
    return "공백은 전부 제거되어 결합된다 — \"\(raw)\" → \"\(JdKbdSpec.normalize(keys: raw))\""
}

private struct KbdStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdKbd(kbdKeys(state))

            Text(kbdNote(state))
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct KbdStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            KbdViewRep(keys: kbdKeys(state))
                .fixedSize()

            Text(kbdNote(state))
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct KbdViewRep: UIViewRepresentable {
    var keys: String

    func makeUIView(context: Context) -> JdKbdView {
        JdKbdView(keys)
    }

    func updateUIView(_ view: JdKbdView, context: Context) {
        if view.keys != keys { view.keys = keys }
    }
}
