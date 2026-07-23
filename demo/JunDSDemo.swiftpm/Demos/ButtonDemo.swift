import SwiftUI
import JunDS

// Button 데모 — 스키마 구동 패턴의 정본. 새 데모는 이 파일 구조를 복제한다:
// 1) ComponentDemo 하나(컨트롤 정의 + 스테이지 클로저) 2) 스테이지 뷰(상태 관찰) 3) 등록은 DemoRegistry.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum ButtonDemo {
    static let demo = ComponentDemo(
        id: "Button",
        controls: [
            .options("variant", "variant", JdButtonVariant.allCases.map(\.rawValue), initial: "primary"),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("loading", "loading"),
            .toggle("disabled", "disabled"),
            .text("title", "제목", placeholder: "버튼 제목", initial: "저장하기"),
        ],
        swiftUI: { state in AnyView(ButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(ButtonStageUIKit(state: state)) }
    )
}

private struct ButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var tapCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton(
                state.string("title", fallback: "저장하기"),
                variant: JdButtonVariant(rawValue: state.string("variant")) ?? .primary,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                loading: state.bool("loading")
            ) {
                tapCount += 1
            }
            .disabled(state.bool("disabled"))

            Text("탭 횟수: \(tapCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct ButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var tapCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButtonViewRep(
                title: state.string("title", fallback: "저장하기"),
                variant: JdButtonVariant(rawValue: state.string("variant")) ?? .primary,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                loading: state.bool("loading"),
                disabled: state.bool("disabled")
            ) {
                tapCount += 1
            }
            .fixedSize()

            Text("탭 횟수: \(tapCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}
