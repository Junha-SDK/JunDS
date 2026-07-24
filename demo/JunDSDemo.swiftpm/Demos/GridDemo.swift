import SwiftUI
import JunDS

// Grid 데모 — 레시피형 (04 §10.1). 웹 <jd-grid>는 <jd-grid-layout>·<jd-simple-grid>와
// 함께 단일 구현 + 별칭이라(R12) iOS도 LazyVGrid 레시피 하나를 공유한다.
// cols=N → GridItem(.flexible()) N개, auto-fit → GridItem(.adaptive(minimum:)) 1개.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(cols, auto-fit, gap).

enum GridDemo {
    static let demo = ComponentDemo(
        id: "Grid",
        controls: [
            .slider("cols", "cols", 1...4, initial: 3),
            .toggle("auto-fit", "auto-fit"),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "md"),
        ],
        swiftUI: { state in AnyView(GridStage(state: state)) },
        recipe: """
        // Grid = LazyVGrid 관용구 (04 §10.1 — 신규 컴포넌트 없음, R12 별칭)
        // cols = N
        LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: JdGap.md.value), count: n),
            spacing: JdGap.md.value
        ) { cells }

        // auto-fit / auto-fill / min-child-width = N → 전부 adaptive로 수렴
        LazyVGrid(
            columns: [GridItem(.adaptive(minimum: 120), spacing: JdGap.md.value)],
            spacing: JdGap.md.value
        ) { cells }
        """
    )

    // 셀 12개 — cols 1~4에서 행 수 변화가 눈에 보이게
    static let cellCount = 12

    // 웹 repeat(auto-fit, minmax(120px, 1fr)) 동형 — 120은 데모 계약 고정 값
    // (토큰 사다리 밖의 레이아웃 스펙이라 JdGap로 환산하지 않는다)
    static let autoFitMinimum: CGFloat = 120
}

// gap 옵션(웹 named gap) → JdGap
private func gridGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}

private struct GridStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = gridGap(state.string("gap"))
        let cols = max(Int(state.number("cols", fallback: 3)), 1)
        let columns: [GridItem] = state.bool("auto-fit")
            ? [GridItem(.adaptive(minimum: GridDemo.autoFitMinimum), spacing: gap.value)]
            : Array(repeating: GridItem(.flexible(), spacing: gap.value), count: cols)

        VStack(alignment: .leading, spacing: JdToken.Space.s3) {
            LazyVGrid(columns: columns, spacing: gap.value) {
                ForEach(0..<GridDemo.cellCount, id: \.self) { index in
                    GridChip(index: index)
                }
            }
            Text(state.bool("auto-fit")
                 ? "auto-fit — 열 수는 폭이 정한다(최소 \(Int(GridDemo.autoFitMinimum))pt). cols 값은 무시된다."
                 : "cols=\(cols) — 고정 열 수, 각 열은 남는 폭을 균등 분배(.flexible).")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct GridChip: View {
    let index: Int

    var body: some View {
        RoundedRectangle(cornerRadius: JdToken.Radius.md)
            .fill((index.isMultiple(of: 2) ? JdToken.Color.primaryLight : JdToken.Color.accentLight).color)
            .frame(height: JdToken.Space.s12)
            .overlay(JdText("\(index + 1)", size: .xs, dimmed: true))
    }
}
