import JunDS
import SwiftUI
import UIKit

// Label 데모 — 실컴포넌트 JdLabel(SwiftUI)/JdLabelView(UIKit).
// 웹은 required 표식 "*"를 CSS ::after로 그려 AT에 아무것도 알리지 않는다(순수 시각 표식) —
// iOS는 그 결함을 보정해 접근성 라벨에 "필수"를 합류시킨다. 접근성 탭에서 차이를 확인할 수 있다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum LabelDemo {
    static let demo = ComponentDemo(
        id: "Label",
        controls: [
            .text("text", "text", placeholder: "라벨 텍스트", initial: "이메일 주소"),
            .toggle("isRequired", "required"),
        ],
        swiftUI: { state in AnyView(LabelStageSwiftUI(state: state)) },
        uikit: { state in AnyView(LabelStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)
@MainActor
private func labelText(_ state: DemoState) -> String {
    state.string("text", fallback: "이메일 주소")
}

private struct LabelStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdLabel(labelText(state), isRequired: state.bool("isRequired"))

            Text(state.bool("isRequired") ? "접근성 라벨에 \"필수\"가 합류한다" : "표식 없음")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct LabelStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            LabelViewRep(text: labelText(state), isRequired: state.bool("isRequired"))
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)

            Text(state.bool("isRequired") ? "접근성 라벨에 \"필수\"가 합류한다" : "표식 없음")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 표시 텍스트의 단일 소스는 뷰 내부 rawText이고 세터가 표식·접근성 계약을 다시 건다.
private struct LabelViewRep: UIViewRepresentable {
    var text: String
    var isRequired: Bool

    func makeUIView(context: Context) -> JdLabelView {
        let view = JdLabelView(text, isRequired: isRequired)
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdLabelView, context: Context) {
        if view.isRequired != isRequired { view.isRequired = isRequired }
        if view.text != text { view.text = text }
    }
}
