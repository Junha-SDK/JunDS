import SwiftUI
import UIKit
import JunDS

// RadioGroup 데모 — 실컴포넌트 JdRadioGroup(SwiftUI)/JdRadioGroupView(UIKit).
// 옵션 배열 + 단일 선택(웹 role=radiogroup 등가). iOS엔 라디오 관용구가 없어 SF Symbols 자체 드로잉.
// 옵션은 4개 고정이고 마지막 하나는 isDisabled: true — **그룹 disabled와 개별 옵션 비활성이
// 다른 축**임을 한 화면에서 보이기 위한 배치다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum RadioGroupDemo {
    static let demo = ComponentDemo(
        id: "RadioGroup",
        controls: [
            .options("axis", "axis", JdAxis.allCases.map(\.rawValue), initial: "vertical"),
            .options("size", "size", JdToggleSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(RadioGroupStageSwiftUI(state: state)) },
        uikit: { state in AnyView(RadioGroupStageUIKit(state: state)) }
    )

    // 4개 고정 — 마지막은 개별 비활성(그룹 disabled와 별개 축)
    static let options: [JdRadioOption] = [
        JdRadioOption(value: "standard", label: "표준 배송"),
        JdRadioOption(value: "express", label: "빠른 배송"),
        JdRadioOption(value: "pickup", label: "매장 수령"),
        JdRadioOption(value: "drone", label: "드론 배송 (준비 중)", isDisabled: true),
    ]
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func radioAxis(_ state: DemoState) -> JdAxis {
    JdAxis(rawValue: state.string("axis")) ?? .vertical
}

@MainActor
private func radioSize(_ state: DemoState) -> JdToggleSize {
    JdToggleSize(rawValue: state.string("size")) ?? .md
}

private struct RadioGroupStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var selection: String? = "standard"

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdRadioGroup(
                RadioGroupDemo.options,
                selection: $selection,
                axis: radioAxis(state),
                size: radioSize(state),
                isEnabled: !state.bool("disabled")
            )

            Text("selection: \(selection ?? "(없음)")")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct RadioGroupStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var selection: String? = "standard"

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            RadioGroupViewRep(
                options: RadioGroupDemo.options,
                selection: $selection,
                axis: radioAxis(state),
                size: radioSize(state),
                disabled: state.bool("disabled")
            )
            .frame(maxWidth: .infinity, alignment: .leading)

            Text("selection: \(selection ?? "(없음)")")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct RadioGroupViewRep: UIViewRepresentable {
    var options: [JdRadioOption]
    @Binding var selection: String?
    var axis: JdAxis
    var size: JdToggleSize
    var disabled: Bool

    final class Coordinator {
        var selection: Binding<String?>
        init(selection: Binding<String?>) { self.selection = selection }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(selection: $selection)
    }

    func makeUIView(context: Context) -> JdRadioGroupView {
        let view = JdRadioGroupView(
            options: options,
            selectedValue: selection,
            axis: axis,
            size: size
        )
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.selection.wrappedValue = value }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdRadioGroupView, context: Context) {
        context.coordinator.selection = $selection
        if view.options != options { view.options = options }
        if view.axis != axis { view.axis = axis }
        if view.size != size { view.size = size }
        if view.selectedValue != selection { view.selectedValue = selection }
        view.isEnabled = !disabled
    }
}
