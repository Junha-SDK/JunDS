import SwiftUI
import JunDS

// Show 데모 — 실컴포넌트 **모디파이어** `.jdShow(above:below:)` (JunDSSwiftUI/Layout).
// 웹 <jd-show>는 뷰포트 미디어 쿼리지만 iOS는 **컨테이너 폭** 기준이다(04 §10) — 그래서
// 이 스테이지는 GeometryReader로 현재 컨테이너 폭을 함께 띄워 판정 근거를 노출한다.
// 판정 자체는 Core의 JdBreakpoint.isVisible(width:above:below:) 하나다(above AND below).
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(above/below = 브레이크포인트 이름, none = 미지정).

enum ShowDemo {
    static let demo = ComponentDemo(
        id: "Show",
        controls: [
            .options("above", "above", ["none", "sm", "md", "lg"], initial: "sm"),
            .options("below", "below", ["none", "sm", "md", "lg"], initial: "none"),
        ],
        swiftUI: { state in AnyView(ShowStage(state: state)) }
    )
}

// "none" = attribute 미지정 동형 — JdBreakpoint의 rawValue가 아니므로 자연히 nil
private func showBreakpoint(_ option: String) -> JdBreakpoint? {
    JdBreakpoint(rawValue: option)
}

private func showRuleText(above: JdBreakpoint?, below: JdBreakpoint?) -> String {
    var clauses: [String] = []
    if let above { clauses.append("폭 ≥ \(Int(above.width))(\(above.rawValue))") }
    if let below { clauses.append("폭 < \(Int(below.width))(\(below.rawValue))") }
    guard !clauses.isEmpty else { return "규칙 없음 — 상시 표시" }
    return clauses.joined(separator: " AND ") + " 일 때 표시"
}

private struct ShowStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let above = showBreakpoint(state.string("above"))
        let below = showBreakpoint(state.string("below"))

        GeometryReader { proxy in
            let width = proxy.size.width
            let visible = JdBreakpoint.isVisible(width: width, above: above, below: below)

            VStack(alignment: .leading, spacing: JdToken.Space.s3) {
                // 판정 근거 — 컨테이너 폭과 규칙, 그리고 Core가 내린 결론
                VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                    JdText("컨테이너 폭 \(Int(width))pt", size: .sm)
                    JdText(showRuleText(above: above, below: below), size: .xs, dimmed: true)
                    JdText("JdBreakpoint.isVisible → \(visible ? "표시" : "숨김")", size: .xs, mono: true)
                }

                ShowTargetBlock()
                    .jdShow(above: above, below: below)

                Text("숨김은 뷰를 계층에서 제거한다(웹 display:none 등가) — 위 블록이 사라지면 "
                     + "자리도 함께 사라진다. 첫 측정 전에는 '보임'이 기본값이라 깜빡이지 않는다.")
                    .font(.footnote)
                    .foregroundColor(.secondary)

                Text("UIKit에는 대응 표면이 없다 — 폭을 아는 지점에서 JdBreakpoint.isVisible을 직접 부르고 "
                     + "isHidden을 토글하는 것이 iOS 관용구다.")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct ShowTargetBlock: View {
    var body: some View {
        JdText("jd-show 대상 블록", size: .sm)
            .padding(JdToken.Space.s3)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(JdToken.Color.successLight.color)
            .cornerRadius(JdToken.Radius.md)
    }
}
