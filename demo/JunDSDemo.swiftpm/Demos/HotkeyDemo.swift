import JunDS
import SwiftUI

// useHotkeys 데모 — **Core 유틸 실동작**(뷰 없음). iOS에선 UIKeyCommand가 실제 처리를 하지만,
// 코드 정규화(별칭 통일 + 수식키 정렬)는 순수 계산이라 Core `JdHotkey.normalize`에 있다.
// 데모는 정규화를 재구현하지 않는다 — 자유 입력 chord를 그대로 normalize에 넘겨 정규 문자열을 보이고,
// 비교 대상과의 동치(서로 다른 표기가 같은 정규형이 됨)를 라이브로 판정한다. ledger id "useHotkeys".

enum HotkeyDemo {
    static let demo = ComponentDemo(
        id: "useHotkeys",
        controls: [
            .text("target", "비교 대상", placeholder: "예: Cmd+Shift+K", initial: "Cmd+Shift+K")
        ],
        swiftUI: { state in AnyView(HotkeyStage(state: state)) }
    )
}

@MainActor
private func hotkeyTarget(_ state: DemoState) -> String {
    state.string("target", fallback: "Cmd+Shift+K")
}

private let hotkeyPresets = [
    "Cmd+Shift+K", "shift+meta+k", "ctrl-alt-del", "escape", "Option+Enter",
]

private struct HotkeyStage: View {
    @ObservedObject var state: DemoState
    @State private var input = "shift+meta+k"

    private var normalizedInput: String { JdHotkey.normalize(input) }
    private var normalizedTarget: String { JdHotkey.normalize(hotkeyTarget(state)) }
    private var matches: Bool { !input.isEmpty && normalizedInput == normalizedTarget }

    var body: some View {
        VStack(spacing: JdToken.Space.s5) {
            JdTextField("chord 입력", placeholder: "예: Cmd+Shift+K", text: $input)

            VStack(spacing: JdToken.Space.s1) {
                JdText("정규화 결과", size: .xs, dimmed: true)
                JdText(
                    normalizedInput.isEmpty ? "—" : normalizedInput,
                    size: .xl2, weight: JdToken.FontWeight.semibold, mono: true, lineLimit: 1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, JdToken.Space.s4)
            .background(JdToken.Color.cardHover.color)
            .cornerRadius(JdToken.Radius.lg)

            HStack(spacing: JdToken.Space.s2) {
                Image(systemName: matches ? "equal.circle.fill" : "notequal.circle")
                    .foregroundColor((matches ? JdToken.Color.success : JdToken.Color.muted).color)
                JdText(
                    matches ? "비교 대상과 동일한 정규형" : "비교 대상: \(normalizedTarget)",
                    size: .sm, mono: true, lineLimit: 1)
            }

            // 프리셋 — 서로 다른 표기가 같은 정규형으로 접힘을 보인다
            HStack(spacing: JdToken.Space.s2) {
                ForEach(hotkeyPresets, id: \.self) { preset in
                    JdButton(preset, variant: .ghost, size: .sm) { input = preset }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .fixedSize(horizontal: false, vertical: true)

            Text(
                "normalize는 cmd/meta/mod/super를 meta로 접고, 수식키를 [ctrl,alt,shift,meta] 고정 순서로 정렬한다 — "
                    + "\"Cmd+Shift+K\"와 \"shift+meta+k\"가 같은 \"shift+meta+k\"가 된다(웹 normalizeChord 승계)."
            )
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
