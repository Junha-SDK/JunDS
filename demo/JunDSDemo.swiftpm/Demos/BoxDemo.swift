import JunDS
import SwiftUI

// Box 데모 — 레시피형 (04 §10.1: core는 신규 컴포넌트를 만들지 않는다).
// 웹 <jd-box>는 스타일 프롭(p/bg/radius/border…) 원형 컨테이너 — iOS 번역은
// "토큰 모디파이어 체인"이 곧 Box다. 스테이지가 체인을 실물로 보여주고 recipe가 정본 스니펫.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(bg 값 primary-light 등, 04 §3).

enum BoxDemo {
    static let demo = ComponentDemo(
        id: "Box",
        controls: [
            .options("p", "p", ["xs", "sm", "md", "lg", "xl"], initial: "md"),
            .options("bg", "bg", ["none", "card", "primary-light"], initial: "card"),
            .options("radius", "radius", ["none", "sm", "md", "lg", "xl"], initial: "md"),
            .toggle("border", "border"),
        ],
        swiftUI: { state in AnyView(BoxStage(state: state)) },
        recipe: """
            // Box = 토큰 모디파이어 체인 (04 §10.1 — 신규 컴포넌트 없음)
            content
                .padding(JdGap.md.value)                       // p
                .background(JdToken.Color.card.color)          // bg
                .cornerRadius(JdToken.Radius.md)               // radius
                .overlay(                                      // border
                    RoundedRectangle(cornerRadius: JdToken.Radius.md)
                        .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
                )
            """
    )
}

private struct BoxStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let radius = boxRadius(state.string("radius"))
        JdText("토큰 모디파이어 체인이 곧 Box다", size: .sm)
            .padding(boxPadding(state.string("p")).value)
            .background(boxBackground(state.string("bg")))
            .cornerRadius(radius)
            .overlay(
                RoundedRectangle(cornerRadius: radius)
                    .stroke(
                        state.bool("border") ? JdToken.Color.border.color : .clear,
                        lineWidth: JdToken.Border.thin)
            )
            .padding(JdToken.Space.s6)
    }
}

// p 옵션(웹 named spacing) → JdGap
private func boxPadding(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "sm": return .sm
    case "lg": return .lg
    case "xl": return .xl
    default: return .md
    }
}

// bg 옵션(웹 color 리터럴) → SwiftUI Color. "none" = bg 미지정 동형
private func boxBackground(_ option: String) -> Color {
    switch option {
    case "card": return JdToken.Color.card.color
    case "primary-light": return JdToken.Color.primaryLight.color
    default: return .clear
    }
}

// radius 옵션 → JdToken.Radius (계약 고정 — 웹 v2 radius 리터럴과 값이 다른 건 G2 재심의 사항)
private func boxRadius(_ option: String) -> CGFloat {
    switch option {
    case "none": return JdToken.Radius.none
    case "sm": return JdToken.Radius.sm
    case "lg": return JdToken.Radius.lg
    case "xl": return JdToken.Radius.xl
    default: return JdToken.Radius.md
    }
}
