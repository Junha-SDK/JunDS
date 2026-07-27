import SwiftUI
import UIKit
import JunDS

// Sparkline 데모 (DEC-049) — 웹 <jd-sparkline> 동형.
// 남은 차트 8종이 공유할 지오메트리(JdChartGeometry)의 첫 소비자다.

private struct UIKitBox<V: UIView>: UIViewRepresentable {
    let make: () -> V
    func makeUIView(context: Context) -> V { make() }
    func updateUIView(_ uiView: V, context: Context) {}
}

enum SparklineDemo {
    static let demo = ComponentDemo(
        id: "Sparkline",
        controls: [
            .options("shape", "데이터", ["상승", "하락", "평평", "톱니", "값 1개"], initial: "상승"),
            .toggle("fill", "면적 채움", initial: true),
            .toggle("baseline", "기준선", initial: false),
            .toggle("dot", "마지막 점", initial: true),
            .options("size", "크기", ["80×24", "140×40", "220×64"], initial: "140×40"),
        ],
        swiftUI: { state in AnyView(SparkStage(state: state)) },
        uikit: { state in AnyView(SparkStageUIKit(state: state)) }
    )
}

@MainActor private func series(_ s: DemoState) -> [Double] {
    switch s.string("shape") {
    case "하락": return [92, 88, 90, 81, 76, 78, 70, 64]
    case "평평": return [50, 50, 50, 50, 50, 50]
    case "톱니": return [10, 90, 20, 80, 30, 70, 40, 95]
    case "값 1개": return [42]
    default: return [12, 18, 15, 24, 22, 31, 29, 38]
    }
}

@MainActor private func box(_ s: DemoState) -> (CGFloat, CGFloat) {
    switch s.string("size") {
    case "80×24": return (80, 24)
    case "220×64": return (220, 64)
    default: return (140, 40)
    }
}

private struct SparkStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        let (w, h) = box(state)
        return VStack(spacing: JdToken.Space.s3) {
            JdSparkline(values: series(state), width: w, height: h,
                        showsFill: state.bool("fill"),
                        showsBaseline: state.bool("baseline"),
                        showsDot: state.bool("dot"),
                        label: "추세 스파크라인")
            Text("색은 첫 값 대비 마지막 값이 정한다 — 하락을 초록으로 그리면 정보가 거꾸로 간다.\n평평한 데이터도 0으로 나누지 않고 눕는다. 값 1개는 왼쪽 끝에 놓인다.")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct SparkStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        let (w, h) = box(state)
        return UIKitBox {
            JdSparklineView(values: series(state), width: w, height: h,
                            showsFill: state.bool("fill"),
                            showsBaseline: state.bool("baseline"),
                            showsDot: state.bool("dot"),
                            label: "추세 스파크라인")
        }
        .frame(width: w, height: h)
    }
}
