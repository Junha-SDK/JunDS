import JunDS
import SwiftUI
import UIKit

// Badge 데모 — 실컴포넌트 JdBadge(SwiftUI)/JdBadgeView(UIKit). 웹 <jd-badge> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(variant/size/dot/count) — 3플랫폼 동일 (04 §3).
//
// count 모드는 **별도 init(count:maxCount:)** 이라 variant/size/dot 축을 받지 않는다.
// 웹의 "count가 children을 대체한다(병용 금지)" 계약을 iOS는 init 분기로 굳혔다 —
// 데모도 같은 계약을 보이려고 countMode 토글에서 두 스테이지를 갈라 놓는다.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum BadgeDemo {
    static let demo = ComponentDemo(
        id: "Badge",
        controls: [
            .options(
                "variant", "variant", JdBadgeVariant.allCases.map(\.rawValue), initial: "primary"),
            .options("size", "size", JdDisplaySize.allCases.map(\.rawValue), initial: "md"),
            .toggle("dot", "dot (showsDot)"),
            .toggle("countMode", "count 모드 (별도 init)"),
            .slider("count", "count", 0...150, step: 1, initial: 3),
        ],
        swiftUI: { state in AnyView(BadgeStageSwiftUI(state: state)) },
        uikit: { state in AnyView(BadgeStageUIKit(state: state)) }
    )
}

@MainActor
private func badgeVariant(_ state: DemoState) -> JdBadgeVariant {
    JdBadgeVariant(rawValue: state.string("variant")) ?? .default
}

@MainActor
private func badgeSize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func badgeCount(_ state: DemoState) -> Int {
    Int(state.number("count"))
}

private let badgeCountNote =
    "count 모드는 danger·sm 고정 원형 — variant/size/dot 축이 없다. maxCount(99) 초과는 \"99+\"."
private let badgeTextNote = "텍스트는 현재 variant 이름 — 배경/글자 대비를 그대로 읽는다."

private struct BadgeStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            if state.bool("countMode") {
                JdBadge(count: badgeCount(state))
                Text(badgeCountNote)
            } else {
                JdBadge(
                    badgeVariant(state).rawValue,
                    variant: badgeVariant(state),
                    size: badgeSize(state),
                    showsDot: state.bool("dot")
                )
                Text(badgeTextNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct BadgeStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let countMode = state.bool("countMode")
        VStack(spacing: JdToken.Space.s4) {
            if countMode {
                BadgeCountViewRep(count: badgeCount(state))
                    .fixedSize()
                Text(badgeCountNote)
            } else {
                BadgeViewRep(
                    text: badgeVariant(state).rawValue,
                    variant: badgeVariant(state),
                    size: badgeSize(state),
                    showsDot: state.bool("dot")
                )
                .fixedSize()
                Text(badgeTextNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
        // 모드는 init에서 확정된다 — 토글되면 뷰를 재생성한다
        .id(countMode)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct BadgeViewRep: UIViewRepresentable {
    var text: String
    var variant: JdBadgeVariant
    var size: JdDisplaySize
    var showsDot: Bool

    func makeUIView(context: Context) -> JdBadgeView {
        JdBadgeView(text, variant: variant, size: size, showsDot: showsDot)
    }

    func updateUIView(_ view: JdBadgeView, context: Context) {
        if view.text != text { view.text = text }
        if view.variant != variant { view.variant = variant }
        if view.size != size { view.size = size }
        if view.showsDot != showsDot { view.showsDot = showsDot }
    }
}

private struct BadgeCountViewRep: UIViewRepresentable {
    var count: Int

    func makeUIView(context: Context) -> JdBadgeView {
        JdBadgeView(count: count)
    }

    func updateUIView(_ view: JdBadgeView, context: Context) {
        // 카운트 문자열 규칙은 Core의 순수 함수가 유일한 정본이다
        let next = JdBadgeSpec.countText(count, maxCount: 99)
        if view.text != next { view.text = next }
    }
}
