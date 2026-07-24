import SwiftUI
import UIKit
import JunDS

// Toggle 데모 — 실컴포넌트 JdToggle(SwiftUI)/JdToggleView(UIKit).
// ButtonDemo(정본) 구조 복제: ComponentDemo 하나 + 스테이지 뷰 2개.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum ToggleDemo {
    static let demo = ComponentDemo(
        id: "Toggle",
        controls: [
            .options("size", "size", JdToggleSize.allCases.map(\.rawValue), initial: "md"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: "알림 받기"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(ToggleStageSwiftUI(state: state)) },
        uikit: { state in AnyView(ToggleStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func toggleLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

@MainActor
private func toggleSize(_ state: DemoState) -> JdToggleSize {
    JdToggleSize(rawValue: state.string("size")) ?? .md
}

// 켬/끔은 스테이지 로컬 @State — 컨트롤 패널(DemoState)은 구성만 소유하고 입력값은 소유하지 않는다.
private struct ToggleStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isOn = true

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdToggle(toggleLabel(state), isOn: $isOn, size: toggleSize(state))
                .disabled(state.bool("disabled"))

            Text("isOn: \(isOn ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct ToggleStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var isOn = true

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            ToggleViewRep(
                label: toggleLabel(state),
                isOn: $isOn,
                size: toggleSize(state),
                disabled: state.bool("disabled")
            )
            .fixedSize()

            Text("isOn: \(isOn ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct ToggleViewRep: UIViewRepresentable {
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

    func makeUIView(context: Context) -> JdToggleView {
        let view = JdToggleView(label: label, isOn: isOn, size: size)
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.isOn.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdToggleView, context: Context) {
        context.coordinator.isOn = $isOn
        if view.label != label { view.label = label }
        if view.size != size { view.size = size }
        view.isOn = isOn
        view.isEnabled = !disabled
    }
}
