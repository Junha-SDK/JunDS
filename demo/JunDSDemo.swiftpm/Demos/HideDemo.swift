import JunDS
import SwiftUI

// Hide 데모 — 실컴포넌트 **모디파이어** `.jdHide(above:below:)` (JunDSSwiftUI/Layout).
// Show와 동형이되 결합 규칙이 다르다: 웹 CSS가 attribute별 독립 숨김 규칙을 합성하므로
// above/below는 **OR**로 묶인다 — 그래서 jdHide는 jdShow의 단순 부정이 아니다.
// iOS 판정 근거는 뷰포트가 아니라 컨테이너 폭이라(04 §10) 현재 폭을 함께 노출한다.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(above/below, none = 미지정).

enum HideDemo {
    static let demo = ComponentDemo(
        id: "Hide",
        controls: [
            .options("above", "above", ["none", "sm", "md", "lg"], initial: "none"),
            .options("below", "below", ["none", "sm", "md", "lg"], initial: "sm"),
        ],
        swiftUI: { state in AnyView(HideStage(state: state)) }
    )
}

// "none" = attribute 미지정 동형
private func hideBreakpoint(_ option: String) -> JdBreakpoint? {
    JdBreakpoint(rawValue: option)
}

// 모디파이어와 같은 합성 — 각 숨김 규칙을 Core의 단일 축 호출로 얻어 OR로 묶는다
private func hideIsVisible(width: CGFloat, above: JdBreakpoint?, below: JdBreakpoint?) -> Bool {
    let hiddenByAbove =
        above.map { JdBreakpoint.isVisible(width: width, above: $0, below: nil) } ?? false
    let hiddenByBelow =
        below.map { JdBreakpoint.isVisible(width: width, above: nil, below: $0) } ?? false
    return !(hiddenByAbove || hiddenByBelow)
}

private func hideRuleText(above: JdBreakpoint?, below: JdBreakpoint?) -> String {
    var clauses: [String] = []
    if let above { clauses.append("폭 ≥ \(Int(above.width))(\(above.rawValue))") }
    if let below { clauses.append("폭 < \(Int(below.width))(\(below.rawValue))") }
    guard !clauses.isEmpty else { return "규칙 없음 — 상시 표시" }
    return clauses.joined(separator: " OR ") + " 일 때 숨김"
}

private struct HideStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let above = hideBreakpoint(state.string("above"))
        let below = hideBreakpoint(state.string("below"))

        GeometryReader { proxy in
            let width = proxy.size.width
            let visible = hideIsVisible(width: width, above: above, below: below)

            VStack(alignment: .leading, spacing: JdToken.Space.s3) {
                // 판정 근거 — 컨테이너 폭과 규칙, 그리고 두 규칙의 OR 결론
                VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                    JdText("컨테이너 폭 \(Int(width))pt", size: .sm)
                    JdText(hideRuleText(above: above, below: below), size: .xs, dimmed: true)
                    JdText("숨김 규칙 OR → \(visible ? "표시" : "숨김")", size: .xs, mono: true)
                }

                HideTargetBlock()
                    .jdHide(above: above, below: below)

                Text(
                    "above·below를 둘 다 주면 Show(AND)와 결과가 갈린다 — 웹 CSS가 attribute별 "
                        + "독립 규칙을 합성하는 것과 같은 의미론이라 jdHide는 jdShow의 부정이 아니다."
                )
                .font(.footnote)
                .foregroundColor(.secondary)

                Text(
                    "UIKit에는 대응 표면이 없다 — 폭을 아는 지점에서 JdBreakpoint.isVisible을 직접 부르고 "
                        + "isHidden을 토글하는 것이 iOS 관용구다."
                )
                .font(.footnote)
                .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct HideTargetBlock: View {
    var body: some View {
        JdText("jd-hide 대상 블록", size: .sm)
            .padding(JdToken.Space.s3)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(JdToken.Color.dangerLight.color)
            .cornerRadius(JdToken.Radius.md)
    }
}
