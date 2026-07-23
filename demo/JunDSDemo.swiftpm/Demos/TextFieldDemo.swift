import SwiftUI
import JunDS

// TextField 데모 — ButtonDemo(정본) 구조 복제: ComponentDemo 하나 + 스테이지 뷰 2개.
// ledger id는 "Input"(웹 <jd-text-field>의 원장 표기) — 파일·타입명은 iOS 표면(TextField)을 따른다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).
// error 토글은 웹 error attribute의 불리언 번역 — 켜지면 스테이지가 고정 메시지를 전달한다.

enum TextFieldDemo {
    static let demo = ComponentDemo(
        id: "Input",
        controls: [
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("error", "error"),
            .toggle("disabled", "disabled"),
            .text("label", "라벨", placeholder: "라벨 텍스트", initial: "이메일"),
            .text("placeholder", "placeholder", placeholder: "플레이스홀더 텍스트", initial: "you@example.com"),
        ],
        swiftUI: { state in AnyView(TextFieldStageSwiftUI(state: state)) },
        uikit: { state in AnyView(TextFieldStageUIKit(state: state)) }
    )
}

// 입력 문자열은 스테이지 로컬 @State — 컨트롤 패널(DemoState)은 구성만 소유하고 입력값은 소유하지 않는다.
private struct TextFieldStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var text = ""

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdTextField(
                state.string("label", fallback: "이메일"),
                placeholder: state.string("placeholder", fallback: "you@example.com"),
                text: $text,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                error: state.bool("error") ? "필수 입력입니다" : nil
            )
            .disabled(state.bool("disabled"))

            Text("value: \(text)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct TextFieldStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var text = ""

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdTextFieldViewRep(
                label: state.string("label", fallback: "이메일"),
                placeholder: state.string("placeholder", fallback: "you@example.com"),
                text: $text,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                error: state.bool("error") ? "필수 입력입니다" : nil,
                disabled: state.bool("disabled")
            )

            Text("value: \(text)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}
