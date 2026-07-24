import SwiftUI
import UIKit
import JunDS

// Divider(primitives) 데모 — **별칭**이다.
// R12 단일 정본 — core CoreDivider와 같은 구현(JdDivider / JdDividerView)을 가리킨다.
// 레저에 primitives "Divider" 항목이 따로 있지만 신규 태그·신규 타입은 없고,
// 무여백 기본 차이는 어댑터 매핑에서 흡수한다(alias-of: CoreDivider, DEC-018-5).
// 그래서 이 스테이지는 CoreDivider 데모와 같은 표면(orientation/label)을 그대로 보여 준다 —
// 두 항목이 서로 다른 컴포넌트처럼 보이지 않는 것이 이 데모의 요점이다.

enum DividerPrimitiveDemo {
    static let demo = ComponentDemo(
        id: "Divider",
        controls: [
            .options("orientation", "orientation", JdOrientation.allCases.map(\.rawValue), initial: "horizontal"),
            .text("label", "label", placeholder: "라벨 (빈 값 = 없음)", initial: "또는"),
        ],
        swiftUI: { state in AnyView(DividerPrimitiveStageSwiftUI(state: state)) },
        uikit: { state in AnyView(DividerPrimitiveStageUIKit(state: state)) }
    )
}

private let dividerAliasNote = "R12 단일 정본 — core의 CoreDivider와 같은 구현이다(별칭, 신규 타입 없음)."

@MainActor
private func dividerPrimitiveOrientation(_ state: DemoState) -> JdOrientation {
    JdOrientation(rawValue: state.string("orientation")) ?? .horizontal
}

// 빈 문자열 = 라벨 없음(웹 attribute 제거 동형)
@MainActor
private func dividerPrimitiveLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

private struct DividerPrimitiveStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = dividerPrimitiveOrientation(state)
        VStack(spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("위 문단", size: .sm, dimmed: true)
                JdDivider(orientation: .horizontal, label: dividerPrimitiveLabel(state))
                JdText("아래 문단", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("왼쪽", size: .sm, dimmed: true)
                    JdDivider(orientation: .vertical, label: dividerPrimitiveLabel(state))
                    JdText("오른쪽", size: .sm, dimmed: true)
                }
                .frame(height: JdToken.Space.s16)
            }

            Text(dividerAliasNote)
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct DividerPrimitiveStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = dividerPrimitiveOrientation(state)
        VStack(spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("위 문단", size: .sm, dimmed: true)
                DividerPrimitiveViewRep(orientation: .horizontal, label: dividerPrimitiveLabel(state))
                    .frame(maxWidth: .infinity)
                JdText("아래 문단", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("왼쪽", size: .sm, dimmed: true)
                    DividerPrimitiveViewRep(orientation: .vertical, label: dividerPrimitiveLabel(state))
                        .frame(height: JdToken.Space.s16)
                    JdText("오른쪽", size: .sm, dimmed: true)
                }
            }

            Text(dividerAliasNote)
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
        // orientation은 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
        .id(orientation.rawValue)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct DividerPrimitiveViewRep: UIViewRepresentable {
    var orientation: JdOrientation
    var label: String?

    func makeUIView(context: Context) -> JdDividerView {
        JdDividerView(orientation: orientation, label: label)
    }

    func updateUIView(_ view: JdDividerView, context: Context) {
        if view.label != label { view.label = label }
    }
}
