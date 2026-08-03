import JunDS
import SwiftUI
import UIKit

// Switch 데모 — **별칭**이다. 웹은 두 태그(<jd-toggle>·<jd-switch>, Switch가 Toggle의 서브클래스)지만
// iOS는 같은 시스템 컨트롤이라 단일 구현 + 별칭(R12, DESIGN-2 §B1):
//   public typealias JdSwitch = JdToggle
//   public typealias JdSwitchView = JdToggleView
// 원장이 두 항목을 요구하므로 데모도 두 화면을 두되, 스테이지는 별칭 타입명(JdSwitch/JdSwitchView)으로
// 쓴다 — 소비자가 어느 이름으로 불러도 같은 실체가 나온다는 점을 보이는 것이 이 화면의 목적이다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum SwitchDemo {
    static let demo = ComponentDemo(
        id: "Switch",
        controls: [
            .options("size", "size", JdToggleSize.allCases.map(\.rawValue), initial: "md"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: "기내 모드"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(SwitchStageSwiftUI(state: state)) },
        uikit: { state in AnyView(SwitchStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func switchLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

@MainActor
private func switchSize(_ state: DemoState) -> JdToggleSize {
    JdToggleSize(rawValue: state.string("size")) ?? .md
}

private struct SwitchStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isOn = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // 별칭 표면 — JdToggle과 같은 타입이다
            JdSwitch(switchLabel(state), isOn: $isOn, size: switchSize(state))
                .disabled(state.bool("disabled"))

            Text("isOn: \(isOn ? "true" : "false") · JdSwitch = JdToggle")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct SwitchStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var isOn = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            SwitchViewRep(
                label: switchLabel(state),
                isOn: $isOn,
                size: switchSize(state),
                disabled: state.bool("disabled")
            )
            .fixedSize()

            Text("isOn: \(isOn ? "true" : "false") · JdSwitchView = JdToggleView")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주). 별칭 타입명으로 선언한다.
private struct SwitchViewRep: UIViewRepresentable {
    var label: String?
    @Binding var isOn: Bool
    var size: JdToggleSize
    var disabled: Bool

    final class Coordinator {
        var isOn: Binding<Bool>
        init(isOn: Binding<Bool>) { self.isOn = isOn }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(isOn: $isOn)
    }

    func makeUIView(context: Context) -> JdSwitchView {
        let view = JdSwitchView(label: label, isOn: isOn, size: size)
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.isOn.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdSwitchView, context: Context) {
        context.coordinator.isOn = $isOn
        if view.label != label { view.label = label }
        if view.size != size { view.size = size }
        view.isOn = isOn
        view.isEnabled = !disabled
    }
}
