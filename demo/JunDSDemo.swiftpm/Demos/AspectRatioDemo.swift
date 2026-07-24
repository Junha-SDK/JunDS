import SwiftUI
import JunDS

// AspectRatio 데모 — **별칭(alias-of: AspectRatioBox)**. 원장 노트대로 웹은 <jd-aspect-ratio-box>
// 하나가 표면 전량을 덮고 신규 태그가 없으며(R12), iOS도 같은 레시피를 그대로 쓴다:
// CSS aspect-ratio + overflow:hidden ↔ .aspectRatio(_:contentMode:) + .clipped().
// 신규 타입 없음 — 이 화면은 AspectRatioBox와 같은 관용구를 별칭 id로 한 번 더 노출할 뿐이다.
// 컨트롤 값 리터럴은 웹 attribute와 일치("16/9" 형식).

enum AspectRatioDemo {
    static let demo = ComponentDemo(
        id: "AspectRatio",
        controls: [
            .options("ratio", "ratio", ["16/9", "4/3", "1/1"], initial: "16/9"),
        ],
        swiftUI: { state in AnyView(AspectRatioStage(state: state)) },
        recipe: """
        // AspectRatio = AspectRatioBox 별칭 — 레시피가 동일하다 (04 §10.1 · R12)
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

// ratio 옵션(웹 "가로/세로" 리터럴) → CGFloat.
// 이름을 AspectRatioBox 데모와 달리한 것은 같은 타깃 안의 파일 전용 헬퍼끼리 뜻을 구분하기 위함이다.
private func aspectRatioAliasValue(_ option: String) -> CGFloat {
    switch option {
    case "4/3": return 4.0 / 3.0
    case "1/1": return 1
    default: return 16.0 / 9.0
    }
}

private struct AspectRatioStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let option = state.string("ratio")
        let ratio = aspectRatioAliasValue(option)

        VStack(spacing: JdToken.Space.s3) {
            RoundedRectangle(cornerRadius: JdToken.Radius.lg)
                .fill(JdToken.Color.primaryLight.color)
                .aspectRatio(ratio, contentMode: .fit)
                .overlay(JdText("ratio=\(option)", size: .sm, dimmed: true))
                .frame(width: AspectRatioDemo.stageWidth,
                       height: AspectRatioDemo.stageHeight)
                .background(JdToken.Color.borderLight.color)
                .cornerRadius(JdToken.Radius.lg)
                .clipped()

            Text("AspectRatioBox와 동일한 레시피다 — 별칭이라 전용 구현도, 전용 컨트롤도 없다. "
                 + "무대 안에서 .fit이 비율을 지키며 들어가고, .fill이면 무대를 덮고 넘치는 쪽이 잘린다.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
