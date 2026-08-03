import JunDS
import SwiftUI
import UIKit

// Slider 데모 — 실컴포넌트 JdSlider(SwiftUI)/JdSliderView(UIKit).
// 웹이 네이티브 input[type=range]에 위임했듯 iOS도 시스템 Slider에 위임한다(04 §10.1).
// 값 축(0…100, step 1)은 데모에서 고정하고 표면(color·size·show-value·marks)만 흔든다 —
// bounds/step은 init 전용이라 흔들면 뷰 재생성이 필요하고, 이 화면의 관심사가 아니다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum SliderDemo {
    static let demo = ComponentDemo(
        id: "Slider",
        controls: [
            .options("color", "color", JdSliderColor.allCases.map(\.rawValue), initial: "primary"),
            // 웹 jd-slider의 size는 sm/md 두 단이다 (JdToggleSize 축의 부분집합)
            .options("size", "size", ["sm", "md"], initial: "md"),
            .toggle("showsValue", "show-value", initial: true),
            .toggle("marks", "marks"),
        ],
        swiftUI: { state in AnyView(SliderStageSwiftUI(state: state)) },
        uikit: { state in AnyView(SliderStageUIKit(state: state)) }
    )

    // marks 토글이 켜졌을 때 붙는 눈금 — 웹 marks property(JSON)의 iOS 등가
    static let marks: [JdSliderMark] = [
        JdSliderMark(value: 0, label: "0"),
        JdSliderMark(value: 25, label: "25"),
        JdSliderMark(value: 50, label: "50"),
        JdSliderMark(value: 75, label: "75"),
        JdSliderMark(value: 100, label: "100"),
    ]
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func sliderColor(_ state: DemoState) -> JdSliderColor {
    JdSliderColor(rawValue: state.string("color")) ?? .primary
}

@MainActor
private func sliderSize(_ state: DemoState) -> JdToggleSize {
    JdToggleSize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func sliderMarks(_ state: DemoState) -> [JdSliderMark] {
    state.bool("marks") ? SliderDemo.marks : []
}

// 값은 스테이지 로컬 @State — 컨트롤 패널(DemoState)은 구성만 소유하고 입력값은 소유하지 않는다.
private struct SliderStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var value: Double = 40

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdSlider(
                value: $value,
                color: sliderColor(state),
                size: sliderSize(state),
                showsValue: state.bool("showsValue"),
                marks: sliderMarks(state)
            )

            Text("value: \(Int(value))")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct SliderStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value: Double = 40

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            SliderViewRep(
                value: $value,
                color: sliderColor(state),
                size: sliderSize(state),
                showsValue: state.bool("showsValue"),
                marks: sliderMarks(state)
            )
            .frame(maxWidth: .infinity)

            Text("value: \(Int(value))")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입(value 세터)은 onValueChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct SliderViewRep: UIViewRepresentable {
    @Binding var value: Double
    var color: JdSliderColor
    var size: JdToggleSize
    var showsValue: Bool
    var marks: [JdSliderMark]

    final class Coordinator {
        var value: Binding<Double>
        init(value: Binding<Double>) { self.value = value }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value)
    }

    func makeUIView(context: Context) -> JdSliderView {
        let view = JdSliderView(
            value: value,
            color: color,
            size: size,
            showsValue: showsValue,
            marks: marks
        )
        let coordinator = context.coordinator
        view.onValueChange = { newValue in coordinator.value.wrappedValue = newValue }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdSliderView, context: Context) {
        context.coordinator.value = $value
        if view.color != color { view.color = color }
        if view.size != size { view.size = size }
        if view.showsValue != showsValue { view.showsValue = showsValue }
        if view.marks != marks { view.marks = marks }
        if view.value != value { view.value = value }
    }
}
