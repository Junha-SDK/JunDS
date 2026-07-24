import SwiftUI
import JunDS

// useCountUp 데모 — **Core 유틸 실동작**(뷰 없음). 웹 훅의 iOS 대응은 순수 이징 함수 `JdCountUp`다.
// 데모는 이징을 재구현하지 않는다 — 프레임마다 진행률 t(0…1)를 JdCountUp.value에 넘겨 값 위치를 받는다.
// 애니메이션 지속시간은 JdMotion.duration 경유(Reduce Motion이면 0 → 즉시 목표값). ledger id "useCountUp".

enum CountUpDemo {
    static let demo = ComponentDemo(
        id: "useCountUp",
        controls: [
            .slider("target", "target", 0...10000, step: 100, initial: 2500),
            .slider("duration", "duration (s)", 0.3...3.0, step: 0.1, initial: 1.5),
        ],
        swiftUI: { state in AnyView(CountUpStage(state: state)) }
    )
}

@MainActor
private func countUpTarget(_ state: DemoState) -> Double {
    state.number("target", fallback: 2500)
}

@MainActor
private func countUpDuration(_ state: DemoState) -> TimeInterval {
    JdMotion.duration(state.number("duration", fallback: 1.5))
}

// 프레임 루프는 렌더 계층 몫 — Core는 easeOutExpo 값 계산만 한다. 루프가 매 스텝 JdCountUp.value를 부른다.
@MainActor
private final class CountUpModel: ObservableObject {
    @Published var displayed: Double = 0
    @Published var progress: Double = 0
    private var task: Task<Void, Never>?

    func start(to target: Double, duration: TimeInterval) {
        task?.cancel()
        let start = Date()
        // duration 0(=Reduce Motion) 이면 즉시 목표값
        guard duration > 0 else {
            displayed = target
            progress = 1
            return
        }
        task = Task { [weak self] in
            while !Task.isCancelled {
                let t = min(Date().timeIntervalSince(start) / duration, 1)
                self?.progress = t
                self?.displayed = JdCountUp.value(from: 0, to: target, progress: t)
                if t >= 1 { break }
                try? await Task.sleep(nanoseconds: 16_000_000)
            }
        }
    }

    deinit { task?.cancel() }
}

private struct CountUpStage: View {
    @ObservedObject var state: DemoState
    @StateObject private var model = CountUpModel()

    var body: some View {
        VStack(spacing: JdToken.Space.s5) {
            JdText("\(Int(model.displayed.rounded()))",
                   size: .xl4, weight: JdToken.FontWeight.bold, mono: true, lineLimit: 1)
                .frame(maxWidth: .infinity)
                .padding(.vertical, JdToken.Space.s4)
                .background(JdToken.Color.cardHover.color)
                .cornerRadius(JdToken.Radius.lg)

            // 진행률 바 — easeOutExpo라 초반이 빠르고 끝이 느리다(감속)
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(JdToken.Color.border.color)
                    Capsule().fill(JdToken.Color.primary.color)
                        .frame(width: geo.size.width * model.progress)
                }
            }
            .frame(height: JdToken.Space.s1_5)

            JdButton("0 → \(Int(countUpTarget(state))) 카운트", variant: .primary) {
                model.start(to: countUpTarget(state), duration: countUpDuration(state))
            }

            Text("프레임마다 t(0…1)를 JdCountUp.value(from:to:progress:)에 넘겨 값을 받는다 — 이징(easeOutExpo)은 "
                 + "Core가, 프레임 구동은 데모가 한다. duration은 JdMotion.duration을 거쳐 Reduce Motion이면 즉시 도달한다.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
