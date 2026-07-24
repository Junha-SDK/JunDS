import SwiftUI
import UIKit
import JunDS

// NumberInput 데모 — 실컴포넌트 JdNumberInput(SwiftUI)/JdNumberInputView(UIKit).
//
// ⚠️ 이 컴포넌트의 계약은 **클램프 타이밍**이다(DESIGN-3 §A · JdNumberInputRules):
//    타이핑 중에는 클램프하지 않고 커밋(포커스 종료)·스텝 버튼에서만 Core의 clamp/stepped를
//    부른다. min 슬라이더를 10으로 올린 뒤 "50"을 쳐 보면 계약이 눈에 보인다 —
//    v2는 매 키 입력마다 클램프해 "5"가 즉시 "10"으로 덮여 50을 입력할 수 없었다.
// ⚠️ 크기 램프는 컨트롤(32/40/48)이 아니라 JdNumberInputSize(32/36/44)다 — size 옵션이
//    JdControlSize가 아닌 이유.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum NumberInputDemo {
    static let demo = ComponentDemo(
        id: "NumberInput",
        controls: [
            .options("size", "size", JdNumberInputSize.allCases.map(\.rawValue), initial: "md"),
            .slider("min", "min", 0...50, step: 1, initial: 0),
            .slider("max", "max", 50...100, step: 1, initial: 100),
            .options("step", "step", ["1", "5", "10"], initial: "1"),
            .toggle("hideControls", "hideControls"),
            .toggle("error", "error"),
        ],
        swiftUI: { state in AnyView(NumberInputStageSwiftUI(state: state)) },
        uikit: { state in AnyView(NumberInputStageUIKit(state: state)) }
    )
}

// 문자열 옵션 → 스텝 폭 (컨트롤 리터럴은 3플랫폼 동일 — 웹 step attribute 문자열)
@MainActor
private func numberDemoStep(_ state: DemoState) -> Double {
    Double(state.string("step", fallback: "1")) ?? 1
}

// 표기는 Core 포맷터가 만든다 — 렌더가 구분자 규칙을 다시 판단하지 않는다(04 §4.2 규칙 3)
private func numberDemoValueText(_ value: Double?) -> String {
    guard let value else { return "없음(빈 값)" }
    return JdNumberFormat.string(value: value)
}

private struct NumberInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    /// 입력값은 스테이지 로컬 — 컨트롤 패널(DemoState)은 구성만 소유한다
    @State private var value: Double? = 10

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdNumberInput(
                value: $value,
                min: state.number("min", fallback: 0),
                max: state.number("max", fallback: 100),
                step: numberDemoStep(state),
                size: JdNumberInputSize(rawValue: state.string("size")) ?? .md,
                isError: state.bool("error"),
                hidesControls: state.bool("hideControls"),
                placeholder: "수량",
                accessibilityLabel: "수량"
            )

            VStack(spacing: JdToken.Space.s1) {
                Text("현재 값: \(numberDemoValueText(value))")
                Text("타이핑 중엔 클램프하지 않고 커밋(포커스 종료)·스텝 버튼에서만 클램프한다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct NumberInputStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value: Double? = 10

    var body: some View {
        let size = JdNumberInputSize(rawValue: state.string("size")) ?? .md
        VStack(spacing: JdToken.Space.s4) {
            NumberInputViewRep(
                value: $value,
                minValue: state.number("min", fallback: 0),
                maxValue: state.number("max", fallback: 100),
                step: numberDemoStep(state),
                size: size,
                isError: state.bool("error"),
                hidesControls: state.bool("hideControls"),
                placeholder: "수량"
            )
            // size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id(size.rawValue)

            VStack(spacing: JdToken.Space.s1) {
                Text("현재 값: \(numberDemoValueText(value))")
                Text("타이핑 중엔 클램프하지 않고 커밋(포커스 종료)·스텝 버튼에서만 클램프한다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct NumberInputViewRep: UIViewRepresentable {
    @Binding var value: Double?
    var minValue: Double?
    var maxValue: Double?
    var step: Double
    var size: JdNumberInputSize
    var isError: Bool
    var hidesControls: Bool
    var placeholder: String

    final class Coordinator {
        var value: Binding<Double?>
        init(value: Binding<Double?>) { self.value = value }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value)
    }

    func makeUIView(context: Context) -> JdNumberInputView {
        let view = JdNumberInputView(
            value: value,
            min: minValue,
            max: maxValue,
            step: step,
            size: size,
            isError: isError,
            hidesControls: hidesControls,
            placeholder: placeholder,
            accessibilityLabel: placeholder
        )
        let coordinator = context.coordinator
        // 타이핑 중 값 + 커밋 클램프 결과 — 둘 다 같은 바인딩으로 흘린다
        view.onValueChange = { coordinator.value.wrappedValue = $0 }
        view.onCommit = { coordinator.value.wrappedValue = $0 }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdNumberInputView, context: Context) {
        context.coordinator.value = $value
        // 편집 중 되쓰기는 뷰 쪽 가드가 막는다(부분 입력 보호) — 여기선 차이만 넘긴다
        if view.value != value { view.value = value }
        if view.minValue != minValue { view.minValue = minValue }
        if view.maxValue != maxValue { view.maxValue = maxValue }
        if view.step != step { view.step = step }
        if view.isError != isError { view.isError = isError }
        if view.hidesControls != hidesControls { view.hidesControls = hidesControls }
        if view.placeholder != placeholder { view.placeholder = placeholder }
    }
}
