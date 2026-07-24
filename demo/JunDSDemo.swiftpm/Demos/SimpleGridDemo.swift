import SwiftUI
import JunDS

// SimpleGrid 데모 — 레시피형 (04 §10.1). 웹 <jd-simple-grid>는 <jd-grid-layout>·<jd-grid>와
// 단일 구현 + 별칭(R12)이고, 그 중 min-child-width 표면만 노출하는 얼굴이다.
// iOS 번역은 GridItem(.adaptive(minimum:)) 하나 — 웹 repeat(auto-fill, minmax(N, 1fr)) 동형.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(min-child-width, gap).

enum SimpleGridDemo {
    static let demo = ComponentDemo(
        id: "SimpleGrid",
        controls: [
            .slider("min-child-width", "min-child-width", 80...200, step: 10, initial: 120),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "md"),
        ],
        swiftUI: { state in AnyView(SimpleGridStage(state: state)) },
        recipe: """
        // SimpleGrid = LazyVGrid adaptive 관용구 (04 §10.1 — 신규 컴포넌트 없음, R12 별칭)
        // 웹 grid-template-columns: repeat(auto-fill, minmax(min-child-width, 1fr)) 동형
        LazyVGrid(
            columns: [GridItem(.adaptive(minimum: 120), spacing: JdGap.md.value)],
            spacing: JdGap.md.value
        ) { cells }

        // 열 수를 직접 정하고 싶으면 Grid/GridLayout 쪽 cols 레시피(.flexible() N개)를 쓴다.
        """
    )

    static let cellCount = 9
}

// gap 옵션(웹 named gap) → JdGap
private func simpleGridGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}

private struct SimpleGridStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = simpleGridGap(state.string("gap"))
        let minChildWidth = CGFloat(state.number("min-child-width", fallback: 120))

        VStack(alignment: .leading, spacing: JdToken.Space.s3) {
            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: minChildWidth), spacing: gap.value)],
                spacing: gap.value
            ) {
                ForEach(0..<SimpleGridDemo.cellCount, id: \.self) { index in
                    RoundedRectangle(cornerRadius: JdToken.Radius.md)
                        .fill((index.isMultiple(of: 2) ? JdToken.Color.primaryLight : JdToken.Color.successLight).color)
                        .frame(height: JdToken.Space.s12)
                        .overlay(JdText("\(index + 1)", size: .xs, dimmed: true))
                }
            }

            Text("min-child-width=\(Int(minChildWidth))pt — 열 수는 폭이 정한다. "
                 + "값을 키우면 열이 줄고, 줄이면 늘어난다(웹 auto-fill 동형).")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}
