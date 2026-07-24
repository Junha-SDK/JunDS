import SwiftUI
import UIKit
import JunDS

// Highlight 데모 — 실컴포넌트 JdHighlightText(SwiftUI)/JdHighlightTextView(UIKit).
// 웹 <jd-highlight> 동형. 컨트롤 키·값은 웹 attribute 리터럴(text/query/color).
//
// ⚠️ 타입명이 Jd**Highlight**가 아니라 Jd**HighlightText**인 이유: Core에 이미 구간 계산
//    `enum JdHighlight`가 있고 우산 타겟이 함께 재수출하므로 뷰가 이름을 양보했다.
//
// 매칭 구간은 **전부 Core JdHighlight.segments**의 결과다 — 두 계층도, 이 데모도 자체 매칭을
// 하지 않고 같은 함수를 불러 결과만 보여준다 (04 §4.2 규칙 2).

enum HighlightDemo {
    static let demo = ComponentDemo(
        id: "Highlight",
        controls: [
            .text("text", "text", placeholder: "본문",
                  initial: "디자인 시스템은 디자인 토큰 한 벌에서 시작한다 — 웹과 iOS가 같은 토큰을 읽는다."),
            .text("query", "query", placeholder: "검색어", initial: "디자인"),
            .options("color", "color", JdMarkColor.allCases.map(\.rawValue), initial: "yellow"),
        ],
        swiftUI: { state in AnyView(HighlightStageSwiftUI(state: state)) },
        uikit: { state in AnyView(HighlightStageUIKit(state: state)) }
    )
}

private let highlightDefaultText = "디자인 시스템은 디자인 토큰 한 벌에서 시작한다 — 웹과 iOS가 같은 토큰을 읽는다."

@MainActor
private func highlightText(_ state: DemoState) -> String {
    state.string("text", fallback: highlightDefaultText)
}

@MainActor
private func highlightQuery(_ state: DemoState) -> String {
    state.string("query")
}

@MainActor
private func highlightColor(_ state: DemoState) -> JdMarkColor {
    JdMarkColor(rawValue: state.string("color")) ?? .yellow
}

// 구간 판정은 데모도 Core에 물어본다 — 규칙을 여기서 다시 쓰지 않는다
@MainActor
private func highlightSegmentNote(_ state: DemoState) -> String {
    let segments = JdHighlight.segments(text: highlightText(state), query: highlightQuery(state))
    let matches = segments.filter(\.isMatch).count
    return "JdHighlight.segments → 구간 \(segments.count)개 · 매칭 \(matches)개 "
        + "(대소문자 무시 전수 매칭, query가 비면 전체가 비매칭 1구간)."
}

private let highlightNote = "칠하는 일만 뷰가 한다 — 매칭 규칙은 Core 단일 소스다. "
    + "낭독은 조각으로 쪼개지 않고 원문 전체가 라벨 1개로 나간다(04 §7.1)."

private struct HighlightStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdHighlightText(highlightText(state),
                            query: highlightQuery(state),
                            color: highlightColor(state))

            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                Text(highlightSegmentNote(state))
                Text(highlightNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct HighlightStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            HighlightViewRep(text: highlightText(state),
                             query: highlightQuery(state),
                             color: highlightColor(state))
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                Text(highlightSegmentNote(state))
                Text(highlightNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct HighlightViewRep: UIViewRepresentable {
    var text: String
    var query: String
    var color: JdMarkColor

    func makeUIView(context: Context) -> JdHighlightTextView {
        let view = JdHighlightTextView(text, query: query, color: color)
        // 줄바꿈이 있는 본문이라 가로로 늘어나지 않게 압축 저항을 낮춘다
        view.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        return view
    }

    func updateUIView(_ view: JdHighlightTextView, context: Context) {
        // 원문은 attributedText를 매번 다시 구우므로 content가 소스다
        if view.content != text { view.content = text }
        if view.query != query { view.query = query }
        if view.color != color { view.color = color }
    }

    func sizeThatFits(_ proposal: ProposedViewSize, uiView: JdHighlightTextView, context: Context) -> CGSize? {
        // 폭이 정해지지 않은 제안이면 줄바꿈 없이 재는 것이 UILabel의 자연 크기다
        let width = proposal.width ?? .greatestFiniteMagnitude
        return uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
    }
}
