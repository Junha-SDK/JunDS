import SwiftUI
import UIKit
import JunDS

// Code 데모 — 실컴포넌트 JdCode(SwiftUI)/JdCodeView(UIKit). 웹 <jd-code> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(variant/size) — 3플랫폼 동일 (04 §3).
//
// 인라인 코드 칩이라 한 줄로 고정된다(numberOfLines = 1). 배경은 variant별 *Light 토큰,
// 전경은 같은 이름의 시맨틱 색이고 default만 짝이 없어 cardHover를 쓴다.

enum CodeDemo {
    static let demo = ComponentDemo(
        id: "Code",
        controls: [
            .options("variant", "variant", JdCodeVariant.allCases.map(\.rawValue), initial: "default"),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .text("text", "text", placeholder: "코드 조각", initial: "npm run build"),
        ],
        swiftUI: { state in AnyView(CodeStageSwiftUI(state: state)) },
        uikit: { state in AnyView(CodeStageUIKit(state: state)) }
    )
}

private let codeNote = "폰트는 모노스페이스 고정, 램프는 sm 10 / md 12 / lg 14pt다 — 웹 11·13pt는 "
    + "대응 토큰이 없어 JdTextSpec 사다리로 옮겨졌다. 웹 .jd-code의 1pt 테두리(color-mix)는 "
    + "대응 토큰이 없어 두 계층 모두 생략한다."

@MainActor
private func codeText(_ state: DemoState) -> String {
    state.string("text", fallback: "npm run build")
}

@MainActor
private func codeVariant(_ state: DemoState) -> JdCodeVariant {
    JdCodeVariant(rawValue: state.string("variant")) ?? .default
}

@MainActor
private func codeSize(_ state: DemoState) -> JdControlSize {
    JdControlSize(rawValue: state.string("size")) ?? .md
}

private struct CodeStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // 텍스트 런이라 문단 안에서 어떻게 앉는지가 실제 쓰임이다
            HStack(spacing: JdToken.Space.s2) {
                JdText("실행:", size: .sm, dimmed: true)
                JdCode(codeText(state),
                       variant: codeVariant(state),
                       size: codeSize(state))
            }

            Text(codeNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct CodeStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            HStack(spacing: JdToken.Space.s2) {
                JdText("실행:", size: .sm, dimmed: true)
                CodeViewRep(text: codeText(state),
                            variant: codeVariant(state),
                            size: codeSize(state))
                    .fixedSize()
            }

            Text(codeNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct CodeViewRep: UIViewRepresentable {
    var text: String
    var variant: JdCodeVariant
    var size: JdControlSize

    func makeUIView(context: Context) -> JdCodeView {
        JdCodeView(text, variant: variant, size: size)
    }

    func updateUIView(_ view: JdCodeView, context: Context) {
        if view.text != text { view.text = text }
        if view.variant != variant { view.variant = variant }
        // size는 UILabel API와 겹쳐 codeSize로 비켜난 이름이다
        if view.codeSize != size { view.codeSize = size }
    }
}
