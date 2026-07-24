import SwiftUI
import UIKit
import JunDS

// Hashtag 데모 — 실컴포넌트 JdHashtagLabel(SwiftUI)/JdHashtagLabelView(UIKit).
// 웹 <jd-hashtag> 동형. 컨트롤 키·값은 웹 attribute 리터럴(tag/count/trending).
//
// ⚠️ 타입명이 Jd**Hashtag**가 아니라 Jd**HashtagLabel**인 이유: Core에 이미 표시·축약 규칙
//    `enum JdHashtag`가 있고 우산 타겟이 함께 재수출하므로 뷰가 이름을 양보했다.
//    (UIKit 사본은 `tag` 프로퍼티가 UIView.tag와 충돌해 `hashtag`로 비켜나 있다.)
//
// 표시 문자열과 카운트 축약은 **전부 Core**다(JdHashtag.displayText / countText) —
// 천·만 사다리를 뷰도 데모도 다시 쓰지 않는다 (04 §4.2 규칙 2).

enum HashtagDemo {
    static let demo = ComponentDemo(
        id: "Hashtag",
        controls: [
            .text("tag", "tag", placeholder: "태그", initial: "디자인시스템"),
            .slider("count", "count", 0...5000, step: 50, initial: 1200),
            .toggle("trending", "trending (isTrending)"),
        ],
        swiftUI: { state in AnyView(HashtagStageSwiftUI(state: state)) },
        uikit: { state in AnyView(HashtagStageUIKit(state: state)) }
    )
}

@MainActor
private func hashtagTag(_ state: DemoState) -> String {
    state.string("tag", fallback: "디자인시스템")
}

@MainActor
private func hashtagCount(_ state: DemoState) -> Int {
    Int(state.number("count", fallback: 1200))
}

// 축약 판정도 데모가 Core에 물어본다 — 규칙을 여기서 다시 쓰지 않는다
@MainActor
private func hashtagCountNote(_ state: DemoState) -> String {
    let count = hashtagCount(state)
    return "JdHashtag.countText(\(count)) → \"\(JdHashtag.countText(count))\" "
        + "(JdNumberFormat.compactCount 재사용 — 1,000 미만은 그대로, 이상은 천·만 1자리)"
}

private let hashtagNote = "count가 nil이면 게시물 수를 아예 그리지 않는다(웹 NaN 동형) — 이 데모는 "
    + "슬라이더가 항상 값을 주므로 0도 \"(0)\"으로 표시된다. trending은 웹 🔥 이모지를 SF Symbol로 "
    + "옮긴 것이고 의미는 낭독 라벨이 \"인기 태그\"로 싣는다."

private struct HashtagStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdHashtagLabel(tag: hashtagTag(state),
                           count: hashtagCount(state),
                           isTrending: state.bool("trending"))

            VStack(spacing: JdToken.Space.s1) {
                Text(hashtagCountNote(state))
                Text(hashtagNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct HashtagStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            HashtagViewRep(tag: hashtagTag(state),
                           count: hashtagCount(state),
                           isTrending: state.bool("trending"))
                .fixedSize()

            VStack(spacing: JdToken.Space.s1) {
                Text(hashtagCountNote(state))
                Text(hashtagNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct HashtagViewRep: UIViewRepresentable {
    var tag: String
    var count: Int
    var isTrending: Bool

    func makeUIView(context: Context) -> JdHashtagLabelView {
        JdHashtagLabelView(tag: tag, count: count, isTrending: isTrending)
    }

    func updateUIView(_ view: JdHashtagLabelView, context: Context) {
        // UIView.tag(Int)와 충돌해 hashtag로 비켜난 이름이다
        if view.hashtag != tag { view.hashtag = tag }
        if view.count != count { view.count = count }
        if view.isTrending != isTrending { view.isTrending = isTrending }
    }
}
