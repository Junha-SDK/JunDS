import JunDS
import SwiftUI
import UIKit

// finance 칩·톤 2종 데모 (DEC-047) — 웹 <jd-disclosure-tone-badge>·<jd-theme-tag-list> 동형.
//
// ThemeTagList는 JdWrapView(UIKit)/JdFlowLayout(SwiftUI) 위에 얹은 첫 실사용처다 —
// 스테이지 폭을 줄이면 칩이 다음 줄로 넘어간다.

private struct UIKitBox<V: UIView>: UIViewRepresentable {
    let make: () -> V
    func makeUIView(context: Context) -> V { make() }
    func updateUIView(_ uiView: V, context: Context) {}
}

// MARK: - DisclosureToneBadge

enum DisclosureToneBadgeDemo {
    static let demo = ComponentDemo(
        id: "DisclosureToneBadge",
        controls: [
            .options(
                "tone", "tone", JdDisclosureTone.allCases.map(\.rawValue), initial: "positive"),
            .options(
                "category", "category", JdDisclosureCategory.allCases.map(\.rawValue),
                initial: "earnings"),
            .text("confidence", "confidence", placeholder: "0~1 (0이면 숨김)", initial: "0.87"),
            .toggle("compact", "compact", initial: false),
        ],
        swiftUI: { state in AnyView(ToneStage(state: state)) },
        uikit: { state in AnyView(ToneStageUIKit(state: state)) }
    )
}

@MainActor private func tone(_ s: DemoState) -> JdDisclosureTone {
    JdDisclosureTone(rawValue: s.string("tone")) ?? .neutral
}
@MainActor private func category(_ s: DemoState) -> JdDisclosureCategory {
    JdDisclosureCategory(rawValue: s.string("category")) ?? .other
}
@MainActor private func confidence(_ s: DemoState) -> Double {
    Double(s.string("confidence")) ?? 0
}

private struct ToneStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdDisclosureToneBadge(
                tone: tone(state), category: category(state),
                confidence: confidence(state), compact: state.bool("compact"))
            Text(
                "compact은 톤만 남기지만 낭독은 “호재 · 실적 · 신뢰도 87%” 전부다.\n중립은 색이 아니라 무채 틴트 — 톤이 없다는 뜻을 색으로도 말한다."
            )
            .font(.caption)
            .foregroundColor(JdToken.Color.muted.color)
            .multilineTextAlignment(.center)
        }
    }
}

private struct ToneStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdDisclosureToneBadgeView(
                tone: tone(state), category: category(state),
                confidence: confidence(state), compact: state.bool("compact"))
        }
        .fixedSize()
    }
}

// MARK: - ThemeTagList

enum ThemeTagListDemo {
    static let demo = ComponentDemo(
        id: "ThemeTagList",
        controls: [
            .options("count", "칩 개수", ["3", "5", "8", "12"], initial: "8"),
            .options("width", "스테이지 폭", ["340", "260", "180"], initial: "340"),
        ],
        swiftUI: { state in AnyView(TagStage(state: state)) },
        uikit: { state in AnyView(TagStageUIKit(state: state)) }
    )
}

private let THEME_POOL = [
    "반도체", "2차전지", "바이오", "조선", "원전", "AI", "로봇", "우주",
    "방산", "수소", "엔터", "게임",
]

@MainActor private func themes(_ s: DemoState) -> [String] {
    Array(THEME_POOL.prefix(Int(s.string("count")) ?? 8))
}
@MainActor private func stageWidth(_ s: DemoState) -> CGFloat {
    CGFloat(Double(s.string("width")) ?? 340)
}

private struct TagStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdThemeTagList(themes: themes(state))
                .frame(width: stageWidth(state))
            Text("색은 인덱스 회전 팔레트 5종 — 6번째가 1번째 색으로 돌아온다.\n폭을 줄이면 다음 줄로 넘어간다(격자 정의 없음).")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct TagStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        let width = stageWidth(state)
        let list = JdThemeTagListView(themes: themes(state))
        let height = list.sizeThatFits(CGSize(width: width, height: .infinity)).height
        return VStack(spacing: JdToken.Space.s2) {
            UIKitBox { JdThemeTagListView(themes: themes(state)) }
                .frame(width: width, height: max(height, 1))
            Text("JdWrapView(흐름 모드) — 칩은 내용 폭을 쓰고 넘치면 다음 줄")
                .font(.caption2)
                .foregroundColor(JdToken.Color.muted.color)
        }
    }
}
