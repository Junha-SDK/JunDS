import JunDS
import SwiftUI
import UIKit

// HStack 데모 — 웹 <jd-hstack>(row·gap sm·align center)의 iOS 번역.
// SwiftUI = HStack 관용구(레시피형), UIKit = JdStackView.horizontal(실컴포넌트).
// 컨트롤 키·값은 웹 attribute와 일치(gap, alignment).

enum HStackDemo {
    static let demo = ComponentDemo(
        id: "HStack",
        controls: [
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "sm"),
            .options("alignment", "alignment", ["top", "center", "bottom"], initial: "center"),
        ],
        swiftUI: { state in AnyView(HStackStageSwiftUI(state: state)) },
        uikit: { state in AnyView(HStackStageUIKit(state: state)) },
        recipe: """
            // 웹 jd-hstack 기본: row · gap sm(8) · align center
            // SwiftUI는 신규 컴포넌트 없이 HStack 관용구 + JdGap (04 §10.1)
            HStack(alignment: .center, spacing: JdGap.sm.value) {
                chipA; chipB; chipC
            }
            // UIKit은 JdStackView.horizontal(gap: .sm, [chipA, chipB, chipC])
            """
    )
}

private func hstackGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "md": return .md
    case "lg": return .lg
    default: return .sm
    }
}

private func hstackVerticalAlign(_ option: String) -> VerticalAlignment {
    switch option {
    case "top": return .top
    case "bottom": return .bottom
    default: return .center
    }
}

private func hstackUIKitAlign(_ option: String) -> UIStackView.Alignment {
    switch option {
    case "top": return .top
    case "bottom": return .bottom
    default: return .center
    }
}

// 높이가 서로 다른 칩 3개 — alignment 변화가 눈에 보이게
private struct HStackChip: View {
    let color: JdDynamicColor
    let height: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: JdToken.Radius.md)
            .fill(color.color)
            .frame(width: JdToken.Space.s12, height: height)
    }
}

private struct HStackStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        HStack(
            alignment: hstackVerticalAlign(state.string("alignment")),
            spacing: hstackGap(state.string("gap")).value
        ) {
            HStackChip(color: JdToken.Color.primary, height: JdToken.Space.s8)
            HStackChip(color: JdToken.Color.accent, height: JdToken.Space.s16)
            HStackChip(color: JdToken.Color.info, height: JdToken.Space.s12)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

private struct HStackStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        HStackRep(
            gap: hstackGap(state.string("gap")),
            alignment: hstackUIKitAlign(state.string("alignment"))
        )
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct HStackRep: UIViewRepresentable {
    var gap: JdGap
    var alignment: UIStackView.Alignment

    func makeUIView(context: Context) -> JdStackView {
        let chips = [
            colorChip(JdToken.Color.primary, height: JdToken.Space.s8),
            colorChip(JdToken.Color.accent, height: JdToken.Space.s16),
            colorChip(JdToken.Color.info, height: JdToken.Space.s12),
        ]
        return JdStackView.horizontal(gap: gap, alignment: alignment, chips)
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        stack.gap = gap
        stack.alignment = alignment
    }

    private func colorChip(_ color: JdDynamicColor, height: CGFloat) -> UIView {
        let view = UIView()
        view.backgroundColor = color.uiColor
        view.layer.cornerRadius = JdToken.Radius.md
        view.jd.layout {
            $0.width.equal(JdToken.Space.s12)
            $0.height.equal(height)
        }
        return view
    }
}
