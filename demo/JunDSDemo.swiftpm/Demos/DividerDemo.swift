import SwiftUI
import UIKit
import JunDS

// CoreDivider 데모 — 실컴포넌트 JdDivider(SwiftUI)/JdDividerView(UIKit).
// 웹 <jd-divider> 단일 정본(R12·DEC-014-5) — orientation·label 표면을 그대로 시연.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum DividerDemo {
    static let demo = ComponentDemo(
        id: "CoreDivider",
        controls: [
            .options("orientation", "orientation", JdOrientation.allCases.map(\.rawValue), initial: "horizontal"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: ""),
        ],
        swiftUI: { state in AnyView(DividerStageSwiftUI(state: state)) },
        uikit: { state in AnyView(DividerStageUIKit(state: state)) }
    )
}

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func dividerLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

private struct DividerStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = JdOrientation(rawValue: state.string("orientation")) ?? .horizontal
        VStack(spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("위 문단", size: .sm, dimmed: true)
                JdDivider(orientation: .horizontal, label: dividerLabel(state))
                JdText("아래 문단", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("왼쪽", size: .sm, dimmed: true)
                    JdDivider(orientation: .vertical, label: dividerLabel(state))
                    JdText("오른쪽", size: .sm, dimmed: true)
                }
                .frame(height: JdToken.Space.s16)
            }
        }
        .padding(JdToken.Space.s6)
    }
}

private struct DividerStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = JdOrientation(rawValue: state.string("orientation")) ?? .horizontal
        VStack(spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("위 문단", size: .sm, dimmed: true)
                DividerViewRep(orientation: .horizontal, label: dividerLabel(state))
                    .frame(maxWidth: .infinity)
                JdText("아래 문단", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("왼쪽", size: .sm, dimmed: true)
                    DividerViewRep(orientation: .vertical, label: dividerLabel(state))
                        .frame(height: JdToken.Space.s16)
                    JdText("오른쪽", size: .sm, dimmed: true)
                }
            }
        }
        .padding(JdToken.Space.s6)
        // orientation은 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
        .id(orientation.rawValue)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct DividerViewRep: UIViewRepresentable {
    var orientation: JdOrientation
    var label: String?

    func makeUIView(context: Context) -> JdDividerView {
        JdDividerView(orientation: orientation, label: label)
    }

    func updateUIView(_ view: JdDividerView, context: Context) {
        if view.label != label { view.label = label }
    }
}
