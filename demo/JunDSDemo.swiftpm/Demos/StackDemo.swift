import SwiftUI
import UIKit
import JunDS

// Stack 데모 — 레시피형 (04 §10.1). 웹 <jd-stack>은 core <jd-vstack>과 같은 기본값
// (column · gap md · stretch)에 direction만 더한 표면이라 iOS는 신규 타입을 만들지 않는다.
// SwiftUI = VStack/HStack 관용구, UIKit = JdStackView(축만 교체).
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(direction=column/row, gap).

enum StackDemo {
    static let demo = ComponentDemo(
        id: "Stack",
        controls: [
            .options("direction", "direction", ["column", "row"], initial: "column"),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "md"),
        ],
        swiftUI: { state in AnyView(StackStageSwiftUI(state: state)) },
        uikit: { state in AnyView(StackStageUIKit(state: state)) },
        recipe: """
        // Stack = jd-vstack 기본값(column·gap md·stretch) + direction (04 §10.1 — 신규 컴포넌트 없음)
        // SwiftUI — direction=column(기본)
        VStack(spacing: JdGap.md.value) {
            rowA.frame(maxWidth: .infinity)   // 웹 stretch는 자식 쪽에서 (SwiftUI 기본 교차축은 center)
            rowB.frame(maxWidth: .infinity)
        }
        // direction=row
        HStack(spacing: JdGap.md.value) { rowA; rowB }

        // UIKit — 축만 바꾼 같은 래퍼(.fill이 곧 stretch)
        JdStackView(axis: .vertical,   gap: .md, alignment: .fill, arranged: [rowA, rowB])
        JdStackView(axis: .horizontal, gap: .md, alignment: .fill, arranged: [rowA, rowB])
        """
    )

    // 블록 3개 — 방향 전환과 gap 변화가 동시에 보이게
    static let labels = ["첫째", "둘째", "셋째"]
}

// gap 옵션(웹 named gap) → JdGap — 웹 jd-stack 기본 md
private func stackGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}

private struct StackBlock: View {
    let label: String

    var body: some View {
        JdText(label, size: .xs)
            .padding(.horizontal, JdToken.Space.s3)
            .padding(.vertical, JdToken.Space.s2)
            .frame(maxWidth: .infinity)
            .background(JdToken.Color.primaryLight.color)
            .cornerRadius(JdToken.Radius.md)
    }
}

private struct StackStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = stackGap(state.string("gap"))
        Group {
            if state.string("direction") == "row" {
                HStack(spacing: gap.value) {
                    ForEach(StackDemo.labels, id: \.self) { StackBlock(label: $0) }
                }
            } else {
                VStack(spacing: gap.value) {
                    ForEach(StackDemo.labels, id: \.self) { StackBlock(label: $0) }
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

private struct StackStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        StackRep(
            axis: state.string("direction") == "row" ? .horizontal : .vertical,
            gap: stackGap(state.string("gap"))
        )
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// axis·spacing 둘 다 UIStackView의 갱신 가능한 표면이라 뷰 재생성 없이 update로 끝난다.
private struct StackRep: UIViewRepresentable {
    var axis: NSLayoutConstraint.Axis
    var gap: JdGap

    func makeUIView(context: Context) -> JdStackView {
        let blocks = StackDemo.labels.map { stackBlockView($0) }
        return JdStackView(axis: axis, gap: gap, alignment: .fill, arranged: blocks)
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        stack.axis = axis
        stack.gap = gap
    }
}

private func stackBlockView(_ label: String) -> UIView {
    let container = UIView()
    container.backgroundColor = JdToken.Color.primaryLight.uiColor
    container.layer.cornerRadius = JdToken.Radius.md

    let text = JdTextView(label, size: .xs)
    container.addSubview(text)
    text.jd.layout {
        $0.edges.equalToSuperview()
            .inset(NSDirectionalEdgeInsets(top: JdToken.Space.s2,
                                           leading: JdToken.Space.s3,
                                           bottom: JdToken.Space.s2,
                                           trailing: JdToken.Space.s3))
    }
    return container
}
