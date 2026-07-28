import JunDS
import SwiftUI
import UIKit

// StatusDot 데모 — 실컴포넌트 JdStatusDot(SwiftUI)/JdStatusDotView(UIKit). 웹 <jd-status-dot> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(status/label/size) — 3플랫폼 동일 (04 §3).
//
// pulse는 success 색 + 맥동이다. 웹은 opacity 키프레임을 reduced-motion에서 멈추고
// iOS도 같은 판정을 따르므로, 환경 섹션의 Reduce Motion을 켜면 맥동이 정지한다.
// label이 비면 점만 남는다(웹의 라벨 스팬 제거 동형).

enum StatusDotDemo {
    static let demo = ComponentDemo(
        id: "StatusDot",
        controls: [
            .options("status", "status", JdStatusKind.allCases.map(\.rawValue), initial: "success"),
            .options("size", "size", JdDisplaySize.allCases.map(\.rawValue), initial: "md"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 점만)", initial: "정상 동작"),
        ],
        swiftUI: { state in AnyView(StatusDotStageSwiftUI(state: state)) },
        uikit: { state in AnyView(StatusDotStageUIKit(state: state)) }
    )
}

private let statusDotNote = "pulse는 success 색 + 맥동 — 환경 섹션의 Reduce Motion을 켜면 멈춘다."

@MainActor
private func statusDotKind(_ state: DemoState) -> JdStatusKind {
    JdStatusKind(rawValue: state.string("status")) ?? .neutral
}

@MainActor
private func statusDotSize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func statusDotLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

private struct StatusDotStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdStatusDot(
                statusDotKind(state),
                label: statusDotLabel(state),
                size: statusDotSize(state)
            )

            Text(statusDotNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct StatusDotStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            StatusDotViewRep(
                status: statusDotKind(state),
                label: statusDotLabel(state),
                size: statusDotSize(state)
            )
            .fixedSize()

            Text(statusDotNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct StatusDotViewRep: UIViewRepresentable {
    var status: JdStatusKind
    var label: String?
    var size: JdDisplaySize

    func makeUIView(context: Context) -> JdStatusDotView {
        JdStatusDotView(status, label: label, size: size)
    }

    func updateUIView(_ view: JdStatusDotView, context: Context) {
        if view.status != status { view.status = status }
        if view.label != label { view.label = label }
        if view.size != size { view.size = size }
    }

    // 내부 스택 제약으로만 크기가 나오는 뷰라 압축 적합 크기를 직접 알려 준다
    func sizeThatFits(
        _ proposal: ProposedViewSize, uiView: JdStatusDotView, context: Context
    ) -> CGSize? {
        uiView.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
    }
}
