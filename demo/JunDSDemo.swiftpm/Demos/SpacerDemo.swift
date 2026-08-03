import JunDS
import SwiftUI
import UIKit

// Spacer 데모 — 실컴포넌트 JdSpacer(SwiftUI) / JdSpacerView(UIKit).
// 웹 jd-spacer는 vertical=padding-block, horizontal=padding-inline로 **양쪽**에 패딩을 주므로
// 실제 차지 공간이 size의 2배다 — iOS도 그 값을 그대로 승계한다(DESIGN-2 §A).
// ⚠️ SwiftUI의 탐욕적 Spacer()가 아니다. 스테이지는 블록 두 개 사이에 넣어 총 2×size를 보여준다.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(size, axis=vertical/horizontal).

enum SpacerDemo {
    static let demo = ComponentDemo(
        id: "Spacer",
        controls: [
            .options("size", "size", ["xs", "sm", "md", "lg", "xl"], initial: "md"),
            .options("axis", "axis", JdSpacerAxis.allCases.map(\.rawValue), initial: "vertical"),
        ],
        swiftUI: { state in AnyView(SpacerStageSwiftUI(state: state)) },
        uikit: { state in AnyView(SpacerStageUIKit(state: state)) }
    )
}

// size 옵션(웹 named gap) → JdGap — 웹 jd-spacer 기본 md
private func spacerGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    case "xl": return .xl
    default: return .md
    }
}

// 각주 — 웹 양측 패딩 승계 규칙을 숫자로 노출
private func spacerFootnote(option: String, gap: JdGap) -> String {
    "size=\(option)(\(Int(gap.value))) → 차지 공간 \(Int(gap.value * 2))pt = 총 2×size (웹 양쪽 패딩 승계)"
}

private struct SpacerBlock: View {
    let axis: JdSpacerAxis

    // 세로 축이면 폭은 부모가 정하고, 가로 축이면 폭을 고정해야 간격이 눈에 띈다
    private var width: CGFloat? {
        axis == .horizontal ? JdToken.Space.s16 : nil
    }

    var body: some View {
        RoundedRectangle(cornerRadius: JdToken.Radius.sm)
            .fill(JdToken.Color.primaryLight.color)
            .frame(width: width, height: JdToken.Space.s8)
    }
}

private struct SpacerStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let option = state.string("size")
        let gap = spacerGap(option)
        let axis = JdSpacerAxis(rawValue: state.string("axis")) ?? .vertical

        VStack(spacing: JdToken.Space.s4) {
            // 스택 spacing은 0 — 블록 사이의 간격은 오직 JdSpacer가 만든다
            if axis == .vertical {
                VStack(spacing: JdGap.none.value) {
                    SpacerBlock(axis: .vertical)
                    JdSpacer(gap, axis: .vertical)
                    SpacerBlock(axis: .vertical)
                }
            } else {
                HStack(spacing: JdGap.none.value) {
                    SpacerBlock(axis: .horizontal)
                    JdSpacer(gap, axis: .horizontal)
                    SpacerBlock(axis: .horizontal)
                }
            }

            Text(spacerFootnote(option: option, gap: gap))
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

private struct SpacerStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let option = state.string("size")
        let gap = spacerGap(option)
        let axis = JdSpacerAxis(rawValue: state.string("axis")) ?? .vertical

        VStack(spacing: JdToken.Space.s4) {
            SpacerRep(size: gap, axis: axis)
                .fixedSize()
                // axis는 JdSpacerView의 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
                .id(axis.rawValue)

            Text(spacerFootnote(option: option, gap: gap))
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 스택 gap은 none이라 블록 사이 간격은 JdSpacerView의 intrinsicContentSize(2×size)가 전부다.
private struct SpacerRep: UIViewRepresentable {
    var size: JdGap
    var axis: JdSpacerAxis

    func makeUIView(context: Context) -> JdStackView {
        let views: [UIView] = [
            spacerBlockView(axis: axis),
            JdSpacerView(size, axis: axis),
            spacerBlockView(axis: axis),
        ]
        return JdStackView(
            axis: axis == .horizontal ? .horizontal : .vertical,
            gap: .none,
            alignment: .center,
            arranged: views)
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        for view in stack.arrangedSubviews {
            guard let spacer = view as? JdSpacerView else { continue }
            spacer.size = size
        }
    }
}

private func spacerBlockView(axis: JdSpacerAxis) -> UIView {
    let block = UIView()
    block.backgroundColor = JdToken.Color.primaryLight.uiColor
    block.layer.cornerRadius = JdToken.Radius.sm
    block.jd.layout {
        $0.width.equal(axis == .horizontal ? JdToken.Space.s16 : JdToken.Space.s24 * 2)
        $0.height.equal(JdToken.Space.s8)
    }
    return block
}
