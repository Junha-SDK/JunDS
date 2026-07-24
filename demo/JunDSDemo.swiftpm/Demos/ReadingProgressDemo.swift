import SwiftUI
import JunDS

// useReadingProgress 데모 — **Core 유틸 실동작**(뷰 없음). 스크롤 오프셋·콘텐츠 높이·뷰포트 높이를
// Core `JdScrollProgress.reading`에 넘겨 0…1 진행률을 얻는다. 데모는 진행률 산식을 재구현하지 않는다 —
// GeometryReader로 세 값만 실측해 Core에 넘기고, 상단 바로 그린다. ledger id "useReadingProgress".

enum ReadingProgressDemo {
    static let demo = ComponentDemo(
        id: "useReadingProgress",
        controls: [
            .slider("paragraphs", "문단 수", 6...30, step: 2, initial: 14),
        ],
        swiftUI: { state in AnyView(ReadingProgressStage(state: state)) }
    )
}

@MainActor
private func readingParagraphs(_ state: DemoState) -> Int {
    Int(state.number("paragraphs", fallback: 14))
}

// 스크롤 콘텐츠의 상단 y(음수로 내려감)와 콘텐츠 높이를 한 번에 실어 나르는 프리퍼런스.
private struct ReadingMetricsKey: PreferenceKey {
    static var defaultValue: CGRect = .zero
    static func reduce(value: inout CGRect, nextValue: () -> CGRect) { value = nextValue() }
}

private let readingBody =
    "읽기 진행률은 렌더가 대신할 수 없는 순수 판정이라 Core에 둔다. 스크롤 위치를 스크롤 가능 높이로 나눈 "
    + "0…1 비율이고, 콘텐츠가 뷰포트보다 짧으면(스크롤 불가) 1 또는 0으로 clamp한다. 아래 글을 끝까지 내리면 "
    + "상단 바가 100%에 도달한다."

private struct ReadingProgressStage: View {
    @ObservedObject var state: DemoState
    @State private var progress: Double = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            // 상단 진행률 바
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(JdToken.Color.border.color)
                    Capsule().fill(JdToken.Color.primary.color)
                        .frame(width: geo.size.width * progress)
                }
            }
            .frame(height: JdToken.Space.s1_5)

            JdText("\(Int((progress * 100).rounded()))%",
                   size: .sm, weight: JdToken.FontWeight.semibold, mono: true)

            // 뷰포트 높이는 바깥 GeometryReader가, 오프셋·콘텐츠 높이는 안쪽 프리퍼런스가 준다
            GeometryReader { outer in
                ScrollView {
                    VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                        ForEach(0..<readingParagraphs(state), id: \.self) { index in
                            JdText("\(index + 1). \(readingBody)", size: .md, lineLimit: nil)
                        }
                    }
                    .padding(JdToken.Space.s4)
                    .background(
                        GeometryReader { inner in
                            Color.clear.preference(
                                key: ReadingMetricsKey.self,
                                value: inner.frame(in: .named("readingScroll"))
                            )
                        }
                    )
                }
                .coordinateSpace(name: "readingScroll")
                .onPreferenceChange(ReadingMetricsKey.self) { rect in
                    // rect.minY: 콘텐츠 상단이 스크롤 공간 원점 대비 얼마나 올라갔는가(음수) → 오프셋
                    progress = JdScrollProgress.reading(
                        offset: -rect.minY,
                        contentHeight: rect.height,
                        viewportHeight: outer.size.height
                    )
                }
            }
            .frame(height: 240)
            .background(JdToken.Color.cardHover.color)
            .cornerRadius(JdToken.Radius.lg)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
