import SwiftUI
import JunDS

// DsToastProvider 데모 — **자체 큐 스택**(Core JdToastQueue 상태머신 + JdToastCenter). 자체 구현(04 §10.1).
// 앱 루트에 jdToastHost를 1회 부착하고, 어디서든 center.show로 토스트를 던진다(웹 toast() 싱글턴 동형).
// 데모는 크로스-데모 오염을 피해 .shared 대신 로컬 센터를 쓴다. duration>0이면 자동 닫힘.
// ledger id 는 정확히 "DsToastProvider". 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum DsToastProviderDemo {
    static let demo = ComponentDemo(
        id: "DsToastProvider",
        controls: [
            .options("position", "position", JdToastPosition.allCases.map(\.rawValue), initial: "top-right"),
            .options("variant", "variant", JdFeedbackVariant.allCases.map(\.rawValue), initial: "info"),
            .slider("duration", "duration (s)", 0...8, step: 1, initial: 4),
        ],
        swiftUI: { state in AnyView(DsToastProviderStage(state: state)) }
    )
}

@MainActor
private func toastPosition(_ state: DemoState) -> JdToastPosition {
    JdToastPosition(rawValue: state.string("position")) ?? .topRight
}

@MainActor
private func toastVariant(_ state: DemoState) -> JdFeedbackVariant {
    JdFeedbackVariant(rawValue: state.string("variant")) ?? .info
}

private struct DsToastProviderStage: View {
    @ObservedObject var state: DemoState
    @StateObject private var center = JdToastCenter()
    @State private var counter = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("토스트 추가", variant: .primary) {
                counter += 1
                center.show(JdToast(title: "토스트 #\(counter)",
                                    message: "\(toastVariant(state).rawValue) · duration \(Int(state.number("duration")))s",
                                    variant: toastVariant(state),
                                    duration: state.number("duration", fallback: 4)))
            }

            JdButton("모두 지우기", variant: .secondary, size: .sm) { center.clear() }

            Text("표시 중: \(center.queue.visible.count) / 최대 \(center.queue.maxVisible) — 초과분은 가장 오래된 것부터 축출된다(웹 max 동형). "
                 + "duration 0이면 수동 닫기 전용.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 260)
        .padding(JdToken.Space.s6)
        // 앱 루트 부착점의 데모 버전 — position별 정렬로 큐를 오버레이한다
        .jdToastHost(center, position: toastPosition(state))
    }
}
