import JunDS
import SwiftUI
import UIKit

// RangeSlider 데모 — 실컴포넌트 JdRangeSlider(SwiftUI)/JdRangeSliderView(UIKit).
// 네이티브 컨트롤이 단일 값뿐이라 웹처럼 자체 드로잉이고, 클램프·양자화·최소 간격은
// **전부 Core JdRangeState**가 소유한다(04 §4.2 규칙 3) — 상태 타입이 곧 JdRangeState다.
//
// ⚠️ step은 JdRangeState의 init 전용 필드라 컨트롤에서 바꾸면 상태를 새로 만들어야 한다 →
//    @State를 소유한 코어 뷰에 .id(step)을 걸어 재생성한다(값만 갈아끼우면 이전 양자화가 남는다).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum RangeSliderDemo {
    static let demo = ComponentDemo(
        id: "RangeSlider",
        controls: [
            .toggle("showsValues", "show-values", initial: true),
            .options("step", "step", ["1", "5", "10"], initial: "5"),
        ],
        swiftUI: { state in AnyView(RangeSliderStageSwiftUI(state: state)) },
        uikit: { state in AnyView(RangeSliderStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func rangeStep(_ state: DemoState) -> Double {
    Double(state.string("step")) ?? 1
}

private func makeRangeState(step: Double) -> JdRangeState {
    JdRangeState(bounds: 0...100, step: step, lower: 20, upper: 80)
}

private struct RangeSliderStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let step = rangeStep(state)
        RangeSliderCoreSwiftUI(step: step, showsValues: state.bool("showsValues"))
            // step 변경 = 상태 재생성 (JdRangeState의 step은 init 전용)
            .id(step)
    }
}

private struct RangeSliderCoreSwiftUI: View {
    let step: Double
    let showsValues: Bool
    @State private var rangeState: JdRangeState

    init(step: Double, showsValues: Bool) {
        self.step = step
        self.showsValues = showsValues
        _rangeState = State(initialValue: makeRangeState(step: step))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdRangeSlider(state: $rangeState, showsValues: showsValues)

            Text(
                "lower: \(Int(rangeState.lower)) · upper: \(Int(rangeState.upper)) · step: \(Int(step))"
            )
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct RangeSliderStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let step = rangeStep(state)
        RangeSliderCoreUIKit(step: step, showsValues: state.bool("showsValues"))
            .id(step)
    }
}

private struct RangeSliderCoreUIKit: View {
    let step: Double
    let showsValues: Bool
    @State private var rangeState: JdRangeState

    init(step: Double, showsValues: Bool) {
        self.step = step
        self.showsValues = showsValues
        _rangeState = State(initialValue: makeRangeState(step: step))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            RangeSliderViewRep(rangeState: $rangeState, showsValues: showsValues)
                .frame(maxWidth: .infinity)

            Text(
                "lower: \(Int(rangeState.lower)) · upper: \(Int(rangeState.upper)) · step: \(Int(step))"
            )
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로퍼티명이 rangeState인 이유: UIControl.state가 이미 `state`를 쓴다(A8 명명 충돌 회피).
// 프로그램 대입은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct RangeSliderViewRep: UIViewRepresentable {
    @Binding var rangeState: JdRangeState
    var showsValues: Bool

    final class Coordinator {
        var rangeState: Binding<JdRangeState>
        init(rangeState: Binding<JdRangeState>) { self.rangeState = rangeState }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(rangeState: $rangeState)
    }

    func makeUIView(context: Context) -> JdRangeSliderView {
        let view = JdRangeSliderView(state: rangeState, showsValues: showsValues)
        let coordinator = context.coordinator
        view.onChange = { newState in coordinator.rangeState.wrappedValue = newState }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdRangeSliderView, context: Context) {
        context.coordinator.rangeState = $rangeState
        if view.showsValues != showsValues { view.showsValues = showsValues }
        if view.rangeState != rangeState { view.rangeState = rangeState }
    }
}
