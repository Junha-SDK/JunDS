import JunDS
import SwiftUI
import UIKit

// Heading 데모 — 실컴포넌트 JdHeading(SwiftUI)/JdHeadingView(UIKit).
// 웹 <jd-heading level/truncate>의 레벨 램프(L1~L6)와 truncate를 시연.
// L6는 uppercase(표시만) — VoiceOver는 원문으로 읽는다.

enum HeadingDemo {
    static let demo = ComponentDemo(
        id: "Heading",
        controls: [
            .slider("level", "level", 1...6, step: 1, initial: 2),
            .toggle("truncate", "truncate"),
            .text(
                "text", "제목", placeholder: "제목",
                initial: "크로스플랫폼 디자인 시스템의 긴 제목 예시입니다"),
        ],
        swiftUI: { state in AnyView(HeadingStageSwiftUI(state: state)) },
        uikit: { state in AnyView(HeadingStageUIKit(state: state)) }
    )
}

@MainActor
private func headingLevel(_ state: DemoState) -> JdHeadingLevel {
    JdHeadingLevel(rawValue: Int(state.number("level", fallback: 2))) ?? .h2
}

private struct HeadingStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        JdHeading(
            state.string("text", fallback: "제목"),
            level: headingLevel(state),
            truncate: state.bool("truncate")
        )
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct HeadingStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        HeadingViewRep(
            text: state.string("text", fallback: "제목"),
            level: headingLevel(state),
            truncate: state.bool("truncate")
        )
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct HeadingViewRep: UIViewRepresentable {
    var text: String
    var level: JdHeadingLevel
    var truncate: Bool

    func makeUIView(context: Context) -> JdHeadingView {
        let view = JdHeadingView(text, level: level)
        // UILabel의 intrinsic 가로폭은 한 줄 전체다 — 압축 저항을 낮춰야
        // SwiftUI가 준 폭으로 접히며 numberOfLines=0의 줄바꿈이 실제로 일어난다.
        view.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        return view
    }

    func updateUIView(_ view: JdHeadingView, context: Context) {
        if view.text != text { view.text = text }
        if view.level != level { view.level = level }
        view.numberOfLines = truncate ? 1 : 0
        view.lineBreakMode = truncate ? .byTruncatingTail : .byWordWrapping
    }
}
