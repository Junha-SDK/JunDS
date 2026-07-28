import JunDS
import SwiftUI
import UIKit

// Mark 데모 — 실컴포넌트 JdMark(SwiftUI)/JdMarkView(UIKit). 웹 <jd-mark> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(color/underline) — 3플랫폼 동일 (04 §3).
//
// underline을 켜면 표면이 통째로 바뀐다: 배경이 사라지고 밑줄 색만 팔레트를 따른다(웹 동형).

enum MarkDemo {
    static let demo = ComponentDemo(
        id: "Mark",
        controls: [
            .options("color", "color", JdMarkColor.allCases.map(\.rawValue), initial: "yellow"),
            .toggle("underline", "underline"),
            .text("text", "text", placeholder: "강조할 문구", initial: "형광펜"),
        ],
        swiftUI: { state in AnyView(MarkStageSwiftUI(state: state)) },
        uikit: { state in AnyView(MarkStageUIKit(state: state)) }
    )
}

private let markNote =
    "Core에 JdMarkSpec이 없어 팔레트는 JdTagSpec을 재사용한다 — yellow→orange, "
    + "pink→red는 인접 색상 근사다(리터럴 신설 금지). SwiftUI는 둘러싼 문단 서체를 상속하고, "
    + "UIKit UILabel은 상속 서체가 없어 본문 기본(md)을 쓴다."

@MainActor
private func markText(_ state: DemoState) -> String {
    state.string("text", fallback: "형광펜")
}

@MainActor
private func markColor(_ state: DemoState) -> JdMarkColor {
    JdMarkColor(rawValue: state.string("color")) ?? .yellow
}

private struct MarkStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // 텍스트 런이라 문단 안에서 어떻게 앉는지가 실제 쓰임이다
            HStack(spacing: JdToken.Space.s2) {
                JdText("이 문장에서", size: .md)
                JdMark(
                    markText(state),
                    color: markColor(state),
                    underline: state.bool("underline"))
                JdText("가 강조된다", size: .md)
            }

            Text(markNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct MarkStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            HStack(spacing: JdToken.Space.s2) {
                JdText("이 문장에서", size: .md)
                MarkViewRep(
                    text: markText(state),
                    color: markColor(state),
                    underline: state.bool("underline")
                )
                .fixedSize()
                JdText("가 강조된다", size: .md)
            }

            Text(markNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct MarkViewRep: UIViewRepresentable {
    var text: String
    var color: JdMarkColor
    var underline: Bool

    func makeUIView(context: Context) -> JdMarkView {
        JdMarkView(text, color: color, underline: underline)
    }

    func updateUIView(_ view: JdMarkView, context: Context) {
        // 원문은 attributedText를 매번 다시 구우므로 content가 소스다
        if view.content != text { view.content = text }
        if view.color != color { view.color = color }
        if view.underline != underline { view.underline = underline }
    }
}
