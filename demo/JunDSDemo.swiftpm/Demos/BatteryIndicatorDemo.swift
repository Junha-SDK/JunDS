import SwiftUI
import UIKit
import JunDS

// BatteryIndicator 데모 — 실컴포넌트 JdBatteryIndicator(SwiftUI)/JdBatteryIndicatorView(UIKit).
// 웹 <jd-battery-indicator> 동형. 컨트롤 키·값은 웹 attribute 리터럴
// (value/size/auto-color/color/label) — 3플랫폼 동일 (04 §3).
//
// auto-color를 켜면 수동 color는 무시되고 값 임계(>70 초록 / >30 주황 / 그 외 빨강)가 이긴다.
// 임계 판정도 Core의 순수 함수라 두 계층이 같은 색을 낸다.

enum BatteryIndicatorDemo {
    static let demo = ComponentDemo(
        id: "BatteryIndicator",
        controls: [
            .slider("value", "value", 0...100, step: 1, initial: 72),
            .options("size", "size", JdDisplaySize.allCases.map(\.rawValue), initial: "lg"),
            .toggle("auto-color", "auto-color (autoColor)"),
            .options("color", "color", JdBatteryColor.allCases.map(\.rawValue), initial: "primary"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: "배터리"),
        ],
        swiftUI: { state in AnyView(BatteryStageSwiftUI(state: state)) },
        uikit: { state in AnyView(BatteryStageUIKit(state: state)) }
    )
}

private let batteryNote = "퍼센트 텍스트는 lg에서만 보인다. auto-color를 켜면 값 임계(>70/>30)가 수동 color를 대체한다."

@MainActor
private func batteryValue(_ state: DemoState) -> Double {
    state.number("value", fallback: 72)
}

@MainActor
private func batterySize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func batteryColor(_ state: DemoState) -> JdBatteryColor {
    JdBatteryColor(rawValue: state.string("color")) ?? .primary
}

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func batteryLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

private struct BatteryStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdBatteryIndicator(
                value: batteryValue(state),
                size: batterySize(state),
                label: batteryLabel(state),
                autoColor: state.bool("auto-color"),
                color: batteryColor(state)
            )

            Text(batteryNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct BatteryStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            BatteryViewRep(
                value: batteryValue(state),
                size: batterySize(state),
                label: batteryLabel(state),
                autoColor: state.bool("auto-color"),
                color: batteryColor(state)
            )
            .fixedSize()

            Text(batteryNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct BatteryViewRep: UIViewRepresentable {
    var value: Double
    var size: JdDisplaySize
    var label: String?
    var autoColor: Bool
    var color: JdBatteryColor

    func makeUIView(context: Context) -> JdBatteryIndicatorView {
        JdBatteryIndicatorView(value: value, size: size, label: label, autoColor: autoColor, color: color)
    }

    func updateUIView(_ view: JdBatteryIndicatorView, context: Context) {
        if view.value != value { view.value = value }
        if view.size != size { view.size = size }
        if view.label != label { view.label = label }
        if view.autoColor != autoColor { view.autoColor = autoColor }
        if view.color != color { view.color = color }
    }

    // 내부 스택 제약으로만 크기가 나오는 뷰라 압축 적합 크기를 직접 알려 준다
    func sizeThatFits(_ proposal: ProposedViewSize, uiView: JdBatteryIndicatorView, context: Context) -> CGSize? {
        uiView.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
    }
}
