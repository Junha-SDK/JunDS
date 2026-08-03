import JunDS
import SwiftUI
import UIKit

// SeverityBadge 데모 — 실컴포넌트 JdSeverityBadge(SwiftUI)/JdSeverityBadgeView(UIKit).
// 웹 <jd-severity-badge> 동형. 컨트롤 키·값은 웹 attribute 리터럴(severity/size/dot) — 04 §3.
//
// severity 명칭은 StatusDot과 **일부러 다르다**(ok/warn vs success/warning) — 웹 v2 표면을
// 그대로 승계한 지점이라 데모에서도 리터럴을 섞지 않는다.
// size는 웹이 sm | md 두 단계만 노출한다 — 공용 JdDisplaySize에서 lg를 빼고 보여 준다.

enum SeverityBadgeDemo {
    private static let sizeOptions = JdDisplaySize.allCases.filter { $0 != .lg }.map(\.rawValue)

    static let demo = ComponentDemo(
        id: "SeverityBadge",
        controls: [
            .options("severity", "severity", JdSeverity.allCases.map(\.rawValue), initial: "warn"),
            .options("size", "size", sizeOptions, initial: "md"),
            .toggle("dot", "dot (showsDot)", initial: true),
            .text("text", "text", placeholder: "뱃지 문구", initial: "지연 발생"),
        ],
        swiftUI: { state in AnyView(SeverityBadgeStageSwiftUI(state: state)) },
        uikit: { state in AnyView(SeverityBadgeStageUIKit(state: state)) }
    )
}

private let severityNote = "severity 명칭은 StatusDot과 다르다 — ok/warn vs success/warning(웹 표면 승계)."

@MainActor
private func severityKind(_ state: DemoState) -> JdSeverity {
    JdSeverity(rawValue: state.string("severity")) ?? .neutral
}

@MainActor
private func severitySize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func severityText(_ state: DemoState) -> String {
    state.string("text", fallback: "지연 발생")
}

private struct SeverityBadgeStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdSeverityBadge(
                severityText(state),
                severity: severityKind(state),
                size: severitySize(state),
                showsDot: state.bool("dot")
            )

            Text(severityNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct SeverityBadgeStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            SeverityBadgeViewRep(
                text: severityText(state),
                severity: severityKind(state),
                size: severitySize(state),
                showsDot: state.bool("dot")
            )
            .fixedSize()

            Text(severityNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct SeverityBadgeViewRep: UIViewRepresentable {
    var text: String
    var severity: JdSeverity
    var size: JdDisplaySize
    var showsDot: Bool

    func makeUIView(context: Context) -> JdSeverityBadgeView {
        JdSeverityBadgeView(text, severity: severity, size: size, showsDot: showsDot)
    }

    func updateUIView(_ view: JdSeverityBadgeView, context: Context) {
        if view.text != text { view.text = text }
        if view.severity != severity { view.severity = severity }
        if view.size != size { view.size = size }
        if view.showsDot != showsDot { view.showsDot = showsDot }
    }

    // 내부 스택 제약으로만 크기가 나오는 뷰라 압축 적합 크기를 직접 알려 준다
    func sizeThatFits(
        _ proposal: ProposedViewSize, uiView: JdSeverityBadgeView, context: Context
    ) -> CGSize? {
        uiView.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
    }
}
