import SwiftUI
import UIKit
import JunDS

// Text 데모 — 실컴포넌트 JdText(SwiftUI)/JdTextView(UIKit).
// 웹 <jd-text size/weight/dimmed/mono/line-clamp>의 표면을 그대로 시연.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치.

enum TextDemo {
    static let demo = ComponentDemo(
        id: "Text",
        controls: [
            .options("size", "size", JdTextSize.allCases.map(\.rawValue), initial: "md"),
            .options("weight", "weight", ["normal", "medium", "semibold", "bold"], initial: "normal"),
            .toggle("dimmed", "dimmed"),
            .toggle("mono", "mono"),
            .slider("lineLimit", "lineLimit (0=무제한)", 0...3, step: 1, initial: 0),
            .text("text", "본문", placeholder: "본문 텍스트",
                  initial: "JunDS는 웹과 iOS가 같은 토큰을 공유하는 크로스플랫폼 디자인 시스템이다."),
        ],
        swiftUI: { state in AnyView(TextStageSwiftUI(state: state)) },
        uikit: { state in AnyView(TextStageUIKit(state: state)) }
    )
}

@MainActor
private func textSize(_ state: DemoState) -> JdTextSize {
    JdTextSize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func textWeight(_ state: DemoState) -> CGFloat {
    switch state.string("weight") {
    case "medium": return JdToken.FontWeight.medium
    case "semibold": return JdToken.FontWeight.semibold
    case "bold": return JdToken.FontWeight.bold
    default: return JdToken.FontWeight.normal
    }
}

// 0 = 무제한(웹 line-clamp 0 동형)
@MainActor
private func textLineLimit(_ state: DemoState) -> Int? {
    let n = Int(state.number("lineLimit"))
    return n <= 0 ? nil : n
}

private struct TextStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        JdText(
            state.string("text", fallback: "본문"),
            size: textSize(state),
            weight: textWeight(state),
            dimmed: state.bool("dimmed"),
            mono: state.bool("mono"),
            lineLimit: textLineLimit(state)
        )
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct TextStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        TextViewRep(
            text: state.string("text", fallback: "본문"),
            size: textSize(state),
            weight: textWeight(state),
            dimmed: state.bool("dimmed"),
            mono: state.bool("mono"),
            lineLimit: textLineLimit(state)
        )
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct TextViewRep: UIViewRepresentable {
    var text: String
    var size: JdTextSize
    var weight: CGFloat
    var dimmed: Bool
    var mono: Bool
    var lineLimit: Int?

    // weight는 JdTextView init 전용 표면 → 값 변경 시 재생성 위해 makeUIView에서 전량 반영
    func makeUIView(context: Context) -> JdTextView {
        let view = JdTextView(text, size: size, weight: weight, dimmed: dimmed, mono: mono)
        view.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        return view
    }

    func updateUIView(_ view: JdTextView, context: Context) {
        if view.text != text { view.text = text }
        if view.textSize != size { view.textSize = size }
        if view.dimmed != dimmed { view.dimmed = dimmed }
        if view.mono != mono { view.mono = mono }
        view.numberOfLines = lineLimit ?? 0
    }
}
