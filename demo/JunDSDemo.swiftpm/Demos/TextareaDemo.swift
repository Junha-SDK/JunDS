import JunDS
import SwiftUI
import UIKit

// Textarea 데모 — 실컴포넌트 JdTextarea(SwiftUI)/JdTextareaView(UIKit).
// 웹 error는 **메시지 없는 boolean**이다(jd-text-field의 메시지 문자열과 표면이 다름 — v2 실태).
// 카운터(show-count)는 maxLength가 있을 때만 뜨는 시각 배지라 maxLength 0(무제한)이면 사라진다.
//
// ⚠️ UIKit의 rows는 init 전용 필드라 슬라이더로 바꾸면 뷰를 재생성해야 한다 → .id(rows).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum TextareaDemo {
    static let demo = ComponentDemo(
        id: "Textarea",
        controls: [
            .slider("rows", "rows", 2...6, step: 1, initial: 4),
            .slider("maxLength", "maxlength (0=무제한)", 0...200, step: 10, initial: 100),
            .toggle("isError", "error"),
            .toggle("showsCount", "show-count", initial: true),
            .text("placeholder", "placeholder", placeholder: "플레이스홀더 텍스트", initial: "의견을 적어주세요"),
        ],
        swiftUI: { state in AnyView(TextareaStageSwiftUI(state: state)) },
        uikit: { state in AnyView(TextareaStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func textareaRows(_ state: DemoState) -> Int {
    Int(state.number("rows", fallback: 4))
}

@MainActor
private func textareaMaxLength(_ state: DemoState) -> Int {
    Int(state.number("maxLength", fallback: 100))
}

@MainActor
private func textareaPlaceholder(_ state: DemoState) -> String {
    state.string("placeholder", fallback: "의견을 적어주세요")
}

// 입력 문자열은 스테이지 로컬 @State — 컨트롤 패널(DemoState)은 구성만 소유하고 입력값은 소유하지 않는다.
private struct TextareaStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var text = ""

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdTextarea(
                text: $text,
                placeholder: textareaPlaceholder(state),
                rows: textareaRows(state),
                maxLength: textareaMaxLength(state),
                isError: state.bool("isError"),
                showsCount: state.bool("showsCount")
            )

            Text("length: \(text.count)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct TextareaStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var text = ""

    var body: some View {
        let rows = textareaRows(state)
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            TextareaViewRep(
                text: $text,
                placeholder: textareaPlaceholder(state),
                rows: rows,
                maxLength: textareaMaxLength(state),
                isError: state.bool("isError"),
                showsCount: state.bool("showsCount")
            )
            .frame(maxWidth: .infinity)
            // rows는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id(rows)

            Text("length: \(text.count)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// text 세터는 IME 안전(다를 때만 되쓴다)이고 onTextChange를 발화시키지 않는다.
private struct TextareaViewRep: UIViewRepresentable {
    @Binding var text: String
    var placeholder: String
    var rows: Int
    var maxLength: Int
    var isError: Bool
    var showsCount: Bool

    final class Coordinator {
        var text: Binding<String>
        init(text: Binding<String>) { self.text = text }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    func makeUIView(context: Context) -> JdTextareaView {
        let view = JdTextareaView(
            placeholder: placeholder,
            rows: rows,
            maxLength: maxLength,
            isError: isError,
            showsCount: showsCount
        )
        let coordinator = context.coordinator
        view.onTextChange = { value in coordinator.text.wrappedValue = value }
        view.text = text
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdTextareaView, context: Context) {
        context.coordinator.text = $text
        if view.placeholder != placeholder { view.placeholder = placeholder }
        if view.maxLength != maxLength { view.maxLength = maxLength }
        if view.isError != isError { view.isError = isError }
        if view.showsCount != showsCount { view.showsCount = showsCount }
        if view.text != text { view.text = text }
    }
}
