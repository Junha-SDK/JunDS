import SwiftUI
import JunDS

// GridLayout 데모 — 레시피형 (04 §10.1). 웹 <jd-grid-layout cols/auto-fit/gap>의
// iOS 번역은 LazyVGrid 관용구 — auto-fit은 GridItem(.adaptive)가 동형이다.
// 컨트롤 키는 웹 attribute와 일치(cols, auto-fit, gap).

enum GridLayoutDemo {
    static let demo = ComponentDemo(
        id: "GridLayout",
        controls: [
            .slider("cols", "cols", 1...4, initial: 2),
            .toggle("auto-fit", "auto-fit"),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "md"),
        ],
        swiftUI: { state in AnyView(GridLayoutStage(state: state)) },
        recipe: """
        // GridLayout = LazyVGrid 관용구 (04 §10.1 — 신규 컴포넌트 없음)
        // cols N → .flexible() N개, auto-fit → .adaptive(minimum:) 1개
        LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: JdGap.md.value), count: 2),
            spacing: JdGap.md.value
        ) { cells }

        LazyVGrid(
            columns: [GridItem(.adaptive(minimum: 120), spacing: JdGap.md.value)],
            spacing: JdGap.md.value
        ) { cells } // 웹 repeat(auto-fit, minmax(120px, 1fr)) 동형
        """
    )
}

private struct GridLayoutStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = gridLayoutGap(state.string("gap"))
        let cols = max(Int(state.number("cols", fallback: 2)), 1)
        // auto-fit: 웹 repeat(auto-fit, minmax(120px, 1fr)) 동형 — 120은 계약 고정 값
        // (DESIGN 데모 계약의 adaptive minimum, 토큰 사다리 밖 레이아웃 스펙)
        let columns: [GridItem] = state.bool("auto-fit")
            ? [GridItem(.adaptive(minimum: 120), spacing: gap.value)]
            : Array(repeating: GridItem(.flexible(), spacing: gap.value), count: cols)

        LazyVGrid(columns: columns, spacing: gap.value) {
            ForEach(0..<8, id: \.self) { index in
                RoundedRectangle(cornerRadius: JdToken.Radius.md)
                    .fill((index.isMultiple(of: 2) ? JdToken.Color.primaryLight : JdToken.Color.accentLight).color)
                    .frame(height: JdToken.Space.s16)
                    .overlay(JdText("\(index + 1)", size: .xs, dimmed: true))
            }
        }
        .padding(JdToken.Space.s6)
    }
}

// gap 옵션(웹 named gap) → JdGap
private func gridLayoutGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}
