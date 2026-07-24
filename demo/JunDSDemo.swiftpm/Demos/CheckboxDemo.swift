import SwiftUI
import UIKit
import JunDS

// Checkbox 데모 — 실컴포넌트 JdCheckbox(SwiftUI)/JdCheckboxView(UIKit).
// iOS엔 체크박스 관용구가 없어 SF Symbols 자체 드로잉이다(04 §10.1 primitives).
// 3상태(JdCheckboxState off/on/indeterminate)는 네이티브 input.indeterminate 등가이고,
// indeterminateAllowed가 켜져야 순환에 indeterminate가 낀다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum CheckboxDemo {
    static let demo = ComponentDemo(
        id: "Checkbox",
        controls: [
            .options("size", "size", JdToggleSize.allCases.map(\.rawValue), initial: "md"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: "약관에 동의합니다"),
            .toggle("indeterminateAllowed", "indeterminateAllowed"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(CheckboxStageSwiftUI(state: state)) },
        uikit: { state in AnyView(CheckboxStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func checkboxLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

@MainActor
private func checkboxSize(_ state: DemoState) -> JdToggleSize {
    JdToggleSize(rawValue: state.string("size")) ?? .md
}

private struct CheckboxStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var checkState: JdCheckboxState = .off

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdCheckbox(
                checkboxLabel(state),
                state: $checkState,
                size: checkboxSize(state),
                indeterminateAllowed: state.bool("indeterminateAllowed")
            )
            .disabled(state.bool("disabled"))

            Text("state: \(checkState.rawValue)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct CheckboxStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var checkState: JdCheckboxState = .off

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            CheckboxViewRep(
                label: checkboxLabel(state),
                checkState: $checkState,
                size: checkboxSize(state),
                indeterminateAllowed: state.bool("indeterminateAllowed"),
                disabled: state.bool("disabled")
            )
            .fixedSize()

            Text("state: \(checkState.rawValue)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct CheckboxViewRep: UIViewRepresentable {
    var label: String?
    @Binding var checkState: JdCheckboxState
    var size: JdToggleSize
    var indeterminateAllowed: Bool
    var disabled: Bool

    final class Coordinator {
        var checkState: Binding<JdCheckboxState>
        init(checkState: Binding<JdCheckboxState>) { self.checkState = checkState }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(checkState: $checkState)
    }

    func makeUIView(context: Context) -> JdCheckboxView {
        let view = JdCheckboxView(
            label: label,
            state: checkState,
            size: size,
            indeterminateAllowed: indeterminateAllowed
        )
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.checkState.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdCheckboxView, context: Context) {
        context.coordinator.checkState = $checkState
        if view.label != label { view.label = label }
        if view.size != size { view.size = size }
        if view.isSelectedState != checkState { view.isSelectedState = checkState }
        view.indeterminateAllowed = indeterminateAllowed
        view.isEnabled = !disabled
    }
}
