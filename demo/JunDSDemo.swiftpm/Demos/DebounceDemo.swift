import SwiftUI
import JunDS

// useDebounce 데모 — **Core 유틸 실동작**(뷰 없음, 04 §4.2). 웹 훅의 iOS 대응은 라이브러리 컴포넌트가
// 아니라 Core의 순수 타이밍 타입 `JdDebouncer`다. 데모는 디바운스를 재구현하지 않는다 — 키 입력마다
// debouncer.call을 걸고, 마지막 입력 뒤 delay가 지나야 확정 콜백이 1회 도는 것을 두 카운터로 보인다.
// ledger id 는 정확히 "useDebounce".

enum DebounceDemo {
    static let demo = ComponentDemo(
        id: "useDebounce",
        controls: [
            .slider("delay", "delay (ms)", 100...1500, step: 100, initial: 500),
        ],
        swiftUI: { state in AnyView(DebounceStage(state: state)) }
    )
}

@MainActor
private func debounceDelaySeconds(_ state: DemoState) -> TimeInterval {
    state.number("delay", fallback: 500) / 1000
}

// 원시 입력 수 vs 확정(디바운스 통과) 수를 들고 있는 모델. delay가 바뀌면 디바운서를 새로 만든다.
// 타이머 주입은 렌더 계층 몫(JdBehaviors 주석) — Core는 딜레이 판정만, 이 모델이 그걸 구동한다.
@MainActor
private final class DebounceModel: ObservableObject {
    @Published var rawCount = 0
    @Published var settledCount = 0
    @Published var settledValue = ""

    private var debouncer = JdDebouncer(delay: 0.5)
    private var currentDelay: TimeInterval = 0.5

    func type(_ value: String, delay: TimeInterval) {
        if delay != currentDelay {
            debouncer.cancel()
            debouncer = JdDebouncer(delay: delay)
            currentDelay = delay
        }
        rawCount += 1
        debouncer.call { [weak self] in
            self?.settledCount += 1
            self?.settledValue = value
        }
    }

    func reset() {
        debouncer.cancel()
        rawCount = 0
        settledCount = 0
        settledValue = ""
    }
}

private struct DebounceStage: View {
    @ObservedObject var state: DemoState
    @StateObject private var model = DebounceModel()
    @State private var text = ""

    var body: some View {
        VStack(spacing: JdToken.Space.s5) {
            JdTextField("검색어", placeholder: "빠르게 타이핑해 보세요", text: $text)
                .onChange(of: text) { newValue in
                    model.type(newValue, delay: debounceDelaySeconds(state))
                }

            HStack(spacing: JdToken.Space.s8) {
                counter("입력 횟수", model.rawCount, dimmed: true)
                counter("확정 횟수", model.settledCount, dimmed: false)
            }

            JdText(model.settledValue.isEmpty ? "확정된 값이 여기 나옵니다" : "확정: \(model.settledValue)",
                   size: .sm, dimmed: model.settledValue.isEmpty, mono: true, lineLimit: 1)

            JdButton("초기화", variant: .secondary, size: .sm) { model.reset(); text = "" }

            Text("입력이 멈추고 delay가 지나야 확정 카운터가 1 오른다 — 키를 연타하면 입력 횟수만 늘고 "
                 + "확정은 마지막 입력 기준으로 한 번만 오른다(웹 useDebounce 동형).")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }

    private func counter(_ label: String, _ value: Int, dimmed: Bool) -> some View {
        VStack(spacing: JdToken.Space.s1) {
            JdText("\(value)", size: .xl2, weight: JdToken.FontWeight.semibold, dimmed: dimmed, mono: true)
            JdText(label, size: .xs, dimmed: true)
        }
    }
}
