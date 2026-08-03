import JunDS
import SwiftUI
import UIKit

// PinInput 데모 — 실컴포넌트 JdPinInput(SwiftUI)/JdPinInputView(UIKit).
//
// 칸 표시·정리·포커스 인덱스·완료 판정은 전부 JdPinRules다(재구현 금지).
// ⚠️ 값을 쥔 입력 필드는 **하나**이고 칸은 파생 표시다 — 칸마다 필드를 두면 빈 칸의
//    Backspace가 관측되지 않고 붙여넣기가 칸별로 쪼개진다. 그래서 한 번에 붙여넣으면
//    sanitize가 전체를 채우고, 접근성 요소도 자연히 하나로 합쳐진다(값 = 입력된 자리수).
// 완료 콜백은 length를 채운 순간 한 번 — 아래 카운터가 그 호출을 센다.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum PinInputDemo {
    static let demo = ComponentDemo(
        id: "PinInput",
        controls: [
            .slider("length", "length", 4...8, step: 1, initial: 6),
            .toggle("masked", "masked"),
            .toggle("alphanumeric", "alphanumeric"),
            .toggle("error", "error"),
        ],
        swiftUI: { state in AnyView(PinInputStageSwiftUI(state: state)) },
        uikit: { state in AnyView(PinInputStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor여야 한다(DemoState가 @MainActor 격리)
@MainActor
private func pinDemoLength(_ state: DemoState) -> Int {
    Int(state.number("length", fallback: 6))
}

private struct PinInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var value = ""
    @State private var completeCount = 0

    var body: some View {
        let length = pinDemoLength(state)
        VStack(spacing: JdToken.Space.s4) {
            JdPinInput(
                value: $value,
                length: length,
                masked: state.bool("masked"),
                alphanumeric: state.bool("alphanumeric"),
                isError: state.bool("error"),
                accessibilityLabel: "인증 번호 입력"
            ) { _ in
                completeCount += 1
            }

            VStack(spacing: JdToken.Space.s1) {
                Text("value: \(value.isEmpty ? "없음" : value) · \(value.count)/\(length)자리")
                Text("완료 콜백 호출: \(completeCount)회")
                Text("한 번에 붙여넣어도 JdPinRules.sanitize가 전체를 채운다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct PinInputStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value = ""
    @State private var completeCount = 0

    var body: some View {
        let length = pinDemoLength(state)
        VStack(spacing: JdToken.Space.s4) {
            PinInputViewRep(
                value: $value,
                length: length,
                masked: state.bool("masked"),
                alphanumeric: state.bool("alphanumeric"),
                isError: state.bool("error"),
                accessibilityLabel: "인증 번호 입력"
            ) {
                completeCount += 1
            }

            VStack(spacing: JdToken.Space.s1) {
                Text("value: \(value.isEmpty ? "없음" : value) · \(value.count)/\(length)자리")
                Text("완료 콜백 호출: \(completeCount)회")
                Text("한 번에 붙여넣어도 JdPinRules.sanitize가 전체를 채운다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
// length·masked·alphanumeric·isError 전부 didSet 표면이라 .id 재생성이 필요 없다.
private struct PinInputViewRep: UIViewRepresentable {
    @Binding var value: String
    var length: Int
    var masked: Bool
    var alphanumeric: Bool
    var isError: Bool
    var accessibilityLabel: String
    var onComplete: () -> Void

    final class Coordinator {
        var value: Binding<String>
        var onComplete: () -> Void
        init(value: Binding<String>, onComplete: @escaping () -> Void) {
            self.value = value
            self.onComplete = onComplete
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value, onComplete: onComplete)
    }

    func makeUIView(context: Context) -> JdPinInputView {
        let view = JdPinInputView(
            value: value,
            length: length,
            masked: masked,
            alphanumeric: alphanumeric,
            isError: isError,
            accessibilityLabel: accessibilityLabel
        )
        let coordinator = context.coordinator
        view.onValueChange = { coordinator.value.wrappedValue = $0 }
        view.onComplete = { _ in coordinator.onComplete() }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdPinInputView, context: Context) {
        context.coordinator.value = $value
        context.coordinator.onComplete = onComplete
        if view.length != length { view.length = length }
        if view.masked != masked { view.masked = masked }
        if view.alphanumeric != alphanumeric { view.alphanumeric = alphanumeric }
        if view.isError != isError { view.isError = isError }
        // 대입도 Core 규칙(허용 문자·자리수)을 통과한다 — 차이가 있을 때만 넘긴다
        if view.value != value { view.value = value }
    }
}
