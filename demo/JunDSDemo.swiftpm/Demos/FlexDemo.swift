import JunDS
import SwiftUI

// Flex 데모 — 레시피형 (04 §10.1). 웹 <jd-flex direction/align/gap>의 iOS 번역은
// HStack/VStack 관용구 + JdGap — direction이 곧 스택 종류 선택이다.
// 컨트롤 값 리터럴은 웹 attribute와 일치(direction row/column, align start/center/end).

enum FlexDemo {
    static let demo = ComponentDemo(
        id: "Flex",
        controls: [
            .options("direction", "direction", ["row", "column"], initial: "row"),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "md"),
            .options("align", "align", ["start", "center", "end"], initial: "center"),
        ],
        swiftUI: { state in AnyView(FlexStage(state: state)) },
        recipe: """
            // Flex = 방향에 따라 HStack/VStack 관용구 (04 §10.1 — 신규 컴포넌트 없음)
            // direction row  → HStack(alignment: .top/.center/.bottom, spacing: JdGap.md.value)
            // direction column → VStack(alignment: .leading/.center/.trailing, spacing: JdGap.md.value)
            HStack(alignment: .center, spacing: JdGap.md.value) {
                chipA; chipB; chipC
            }
            """
    )
}

private struct FlexStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = flexGap(state.string("gap"))
        let align = state.string("align")
        VStack {
            if state.string("direction") == "column" {
                VStack(alignment: flexHorizontalAlign(align), spacing: gap.value) {
                    chips
                }
            } else {
                HStack(alignment: flexVerticalAlign(align), spacing: gap.value) {
                    chips
                }
            }
        }
        .padding(JdToken.Space.s6)
    }

    // 크기가 서로 다른 칩 3개 — align 변화가 눈에 보이게 (색은 JdToken만)
    @ViewBuilder
    private var chips: some View {
        FlexChip(color: JdToken.Color.primary, side: JdToken.Space.s8)
        FlexChip(color: JdToken.Color.accent, side: JdToken.Space.s12)
        FlexChip(color: JdToken.Color.info, side: JdToken.Space.s16)
    }
}

private struct FlexChip: View {
    let color: JdDynamicColor
    let side: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: JdToken.Radius.md)
            .fill(color.color)
            .frame(width: side, height: side)
    }
}

// gap 옵션(웹 named gap) → JdGap
private func flexGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}

// 웹 align(교차축) → row일 때 세로 정렬
private func flexVerticalAlign(_ option: String) -> VerticalAlignment {
    switch option {
    case "start": return .top
    case "end": return .bottom
    default: return .center
    }
}

// 웹 align(교차축) → column일 때 가로 정렬
private func flexHorizontalAlign(_ option: String) -> HorizontalAlignment {
    switch option {
    case "start": return .leading
    case "end": return .trailing
    default: return .center
    }
}
