import SwiftUI
import JunDS

// AspectRatioBox 데모 — 레시피형 (04 §10.1). 웹 <jd-aspect-ratio-box ratio>는
// CSS aspect-ratio + overflow:hidden이고, iOS 관용구는 .aspectRatio(_:contentMode:) + .clipped().
// 신규 타입 없음 — 스테이지가 관용구를 실물로 보여주고 recipe가 정본 스니펫이다.
// 컨트롤 값 리터럴은 웹 attribute와 일치("16/9" 형식).

enum AspectRatioBoxDemo {
    static let demo = ComponentDemo(
        id: "AspectRatioBox",
        controls: [
            .options("ratio", "ratio", ["16/9", "4/3", "1/1"], initial: "16/9"),
        ],
        swiftUI: { state in AnyView(AspectRatioBoxStage(state: state)) },
        recipe: """
        // AspectRatioBox = .aspectRatio 관용구 (04 §10.1 — 신규 컴포넌트 없음)
        content
            .aspectRatio(16.0 / 9.0, contentMode: .fill)   // 웹 기본 16/9
            .clipped()                                      // 웹 overflow: hidden

        // 내용물을 자르지 않고 비율 상자 자체를 보이려면 contentMode: .fit
        // UIKit: child.jd.layout { $0.width.equal(to: child.jd.height).multiplier(16.0 / 9.0) }
        """
    )

    // 비율 차이가 보이도록 무대를 고정한다 — 토큰 파생(80×3 × 80×2)
    static let stageWidth = JdToken.Space.s20 * 3
    static let stageHeight = JdToken.Space.s20 * 2
}

// ratio 옵션(웹 "가로/세로" 리터럴) → CGFloat
private func aspectRatioValue(_ option: String) -> CGFloat {
    switch option {
    case "4/3": return 4.0 / 3.0
    case "1/1": return 1
    default: return 16.0 / 9.0
    }
}

private struct AspectRatioBoxStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let option = state.string("ratio")
        let ratio = aspectRatioValue(option)

        VStack(spacing: JdToken.Space.s3) {
            RoundedRectangle(cornerRadius: JdToken.Radius.lg)
                .fill(JdToken.Color.primaryLight.color)
                .aspectRatio(ratio, contentMode: .fit)
                .overlay(JdText("ratio=\(option)", size: .sm, dimmed: true))
                // 회색 무대 안에서 상자만 비율대로 줄었다 늘었다 한다
                .frame(width: AspectRatioBoxDemo.stageWidth,
                       height: AspectRatioBoxDemo.stageHeight)
                .background(JdToken.Color.borderLight.color)
                .cornerRadius(JdToken.Radius.lg)
                .clipped()

            Text("무대 \(Int(AspectRatioBoxDemo.stageWidth))×\(Int(AspectRatioBoxDemo.stageHeight)) 안에서 "
                 + ".fit이 비율을 지키며 들어간다 — .fill이면 무대를 덮고 넘치는 쪽이 잘린다(웹 overflow:hidden).")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
