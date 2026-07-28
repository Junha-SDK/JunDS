import JunDS
import SwiftUI
import UIKit

// VStack 데모 — 웹 <jd-vstack>(column·gap md·align stretch)의 iOS 번역.
// SwiftUI = VStack 관용구(레시피형, 웹 stretch 기본 주의 — .frame(maxWidth:.infinity)),
// UIKit = JdStackView.vertical(실컴포넌트, alignment .fill = 웹 stretch 동형).

enum VStackDemo {
    static let demo = ComponentDemo(
        id: "VStack",
        controls: [
            .options("gap", "gap", ["xs", "sm", "md", "lg", "xl"], initial: "md"),
            .toggle("stretch", "stretch (교차축 채움)", initial: true),
        ],
        swiftUI: { state in AnyView(VStackStageSwiftUI(state: state)) },
        uikit: { state in AnyView(VStackStageUIKit(state: state)) },
        recipe: """
            // 웹 jd-vstack 기본: column · gap md(16) · align stretch
            // ⚠️ SwiftUI VStack 기본 교차축은 center — 웹 stretch를 원하면 자식에
            //    .frame(maxWidth: .infinity) 를 준다 (04 §10.1)
            VStack(spacing: JdGap.md.value) {
                rowA.frame(maxWidth: .infinity)
                rowB.frame(maxWidth: .infinity)
            }
            // UIKit은 JdStackView.vertical(gap: .md, rows) — alignment .fill이 곧 stretch
            """
    )
}

private func vstackGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    case "xl": return .xl
    default: return .md
    }
}

private struct VStackRow: View {
    let color: JdDynamicColor
    let stretch: Bool

    var body: some View {
        RoundedRectangle(cornerRadius: JdToken.Radius.md)
            .fill(color.color)
            .frame(width: stretch ? nil : JdToken.Space.s20, height: JdToken.Space.s8)
            .frame(maxWidth: stretch ? .infinity : nil)
    }
}

private struct VStackStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let stretch = state.bool("stretch")
        VStack(spacing: vstackGap(state.string("gap")).value) {
            VStackRow(color: JdToken.Color.primary, stretch: stretch)
            VStackRow(color: JdToken.Color.accent, stretch: stretch)
            VStackRow(color: JdToken.Color.info, stretch: stretch)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct VStackStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStackRep(
            gap: vstackGap(state.string("gap")),
            alignment: state.bool("stretch") ? .fill : .center
        )
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct VStackRep: UIViewRepresentable {
    var gap: JdGap
    var alignment: UIStackView.Alignment

    func makeUIView(context: Context) -> JdStackView {
        let rows = [
            colorRow(JdToken.Color.primary),
            colorRow(JdToken.Color.accent),
            colorRow(JdToken.Color.info),
        ]
        let stack = JdStackView(axis: .vertical, gap: gap, alignment: alignment, arranged: rows)
        return stack
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        stack.gap = gap
        stack.alignment = alignment
    }

    private func colorRow(_ color: JdDynamicColor) -> UIView {
        let view = UIView()
        view.backgroundColor = color.uiColor
        view.layer.cornerRadius = JdToken.Radius.md
        view.jd.layout {
            $0.height.equal(JdToken.Space.s8)
            // 교차축 center일 때 너비가 보이도록 하한 폭 제공
            $0.width.greaterThanOrEqual(JdToken.Space.s20)
        }
        return view
    }
}
