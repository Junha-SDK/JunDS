import SwiftUI
import JunDS

// Callout 데모 — **자체 문서 강조 블록**(이모지 + 좌측 강조선 5종). 자체 구현(04 §10.1).
// variant 5종은 Core JdCalloutVariant(note/tip/info/warning/danger — 이모지·색 단일 소스).
// isCollapsible이면 DisclosureGroup으로 접힌다. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum CalloutDemo {
    static let demo = ComponentDemo(
        id: "Callout",
        controls: [
            .options("variant", "variant", JdCalloutVariant.allCases.map(\.rawValue), initial: "note"),
            .toggle("collapsible", "collapsible"),
        ],
        swiftUI: { state in AnyView(CalloutStage(state: state)) }
    )
}

@MainActor
private func calloutVariant(_ state: DemoState) -> JdCalloutVariant {
    JdCalloutVariant(rawValue: state.string("variant")) ?? .note
}

@MainActor
private func calloutTitle(_ state: DemoState) -> String {
    switch calloutVariant(state) {
    case .note: return "참고"
    case .tip: return "팁"
    case .info: return "안내"
    case .warning: return "주의"
    case .danger: return "위험"
    }
}

private struct CalloutStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdCallout(calloutTitle(state),
                      variant: calloutVariant(state),
                      isCollapsible: state.bool("collapsible")) {
                Text("이모지(\(calloutVariant(state).emoji))와 좌측 강조선 색은 variant(=\(calloutVariant(state).rawValue))가 정한다. collapsible을 켜면 제목을 눌러 접고 편다.")
            }
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
