import JunDS
import SwiftUI

// ScrollArea 데모 — 레시피형 (04 §10.1, RECIPES.md). 웹 <jd-scroll-area>가 노출하던 두 축
// (orientation · max-height)은 iOS에서 `ScrollView(_:)` + `.frame(maxHeight:)` 그 자체다.
// 신규 타입 없음 — 스테이지가 관용구를 실물로 보여주고 recipe가 정본 스니펫이다.
// 웹이 얹던 커스텀 스크롤바 CSS(폭·thumb 색·hover 확대)는 이식 대상이 아니다:
// iOS 인디케이터는 이미 얇고 자동으로 사라지며, 공개 API도 indicatorStyle 3값뿐이다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치("vertical"/"horizontal").

enum ScrollAreaDemo {
    static let demo = ComponentDemo(
        id: "ScrollArea",
        controls: [
            .options(
                "orientation", "orientation", JdOrientation.allCases.map(\.rawValue),
                initial: "vertical"),
            .slider("maxHeight", "max-height", 120...320, step: 20, initial: 240),
        ],
        swiftUI: { state in AnyView(ScrollAreaStage(state: state)) },
        recipe: """
            // ScrollArea = ScrollView 그 자체 (04 §10.1 — 신규 컴포넌트 없음)
            ScrollView(.vertical) {
                VStack(alignment: .leading, spacing: JdGap.sm.value) { rows }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(JdGap.md.value)
            }
            .frame(maxHeight: 240)                       // 웹 max-height
            .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))

            // orientation="horizontal"
            ScrollView(.horizontal) { HStack(spacing: JdGap.sm.value) { chips } }
                .scrollIndicators(.hidden)               // iOS 16+

            // UIKit
            let scroll = UIScrollView()
            scroll.alwaysBounceVertical = true
            scroll.showsHorizontalScrollIndicator = false
            """
    )

    static let rows = Array(1...24)
    static let chips = Array(1...16)
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func scrollOrientation(_ state: DemoState) -> JdOrientation {
    JdOrientation(rawValue: state.string("orientation")) ?? .vertical
}

@MainActor
private func scrollMaxHeight(_ state: DemoState) -> CGFloat {
    CGFloat(state.number("maxHeight", fallback: 240))
}

private struct ScrollAreaStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = scrollOrientation(state)
        let maxHeight = scrollMaxHeight(state)

        VStack(spacing: JdToken.Space.s3) {
            if orientation == .vertical {
                verticalArea(maxHeight: maxHeight)
            } else {
                horizontalArea
            }

            Text(
                orientation == .vertical
                    ? "max-height \(Int(maxHeight))pt — 웹의 max-height + overflow:auto가 그대로 "
                        + ".frame(maxHeight:)다. 인디케이터는 iOS가 알아서 얇게 그리고 사라진다."
                    : "가로 축은 ScrollView(.horizontal) 하나로 끝난다 — 인디케이터만 "
                        + ".scrollIndicators(.hidden)로 감췄다(iOS 16+)."
            )
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s4)
    }

    private func verticalArea(maxHeight: CGFloat) -> some View {
        ScrollView(.vertical) {
            VStack(alignment: .leading, spacing: JdGap.sm.value) {
                ForEach(ScrollAreaDemo.rows, id: \.self) { index in
                    JdText("행 \(index) — 세로 스크롤 영역", size: .sm)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(JdGap.md.value)
        }
        .frame(maxHeight: maxHeight)
        .background(JdToken.Color.card.color)
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
    }

    private var horizontalArea: some View {
        ScrollView(.horizontal) {
            HStack(spacing: JdGap.sm.value) {
                ForEach(ScrollAreaDemo.chips, id: \.self) { index in
                    JdText("칩 \(index)", size: .sm)
                        .padding(.horizontal, JdToken.Space.s3)
                        .padding(.vertical, JdToken.Space.s2)
                        .background(JdToken.Color.borderLight.color)
                        .clipShape(Capsule(style: .continuous))
                }
            }
            .padding(JdGap.md.value)
        }
        .scrollIndicators(.hidden)
        .background(JdToken.Color.card.color)
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
    }
}
