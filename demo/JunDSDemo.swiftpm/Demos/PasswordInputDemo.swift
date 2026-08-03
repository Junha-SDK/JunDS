import JunDS
import SwiftUI
import UIKit

// PasswordInput 데모 — 실컴포넌트 JdPasswordInput(SwiftUI)/JdPasswordInputView(UIKit).
//
// 강도·규칙 판정은 전부 JdPasswordStrength.evaluate다(점수·라벨·tone 포함) — 데모도
// 그 결과만 각주로 옮긴다. 규칙은 **5종**(8자 이상·대문자·소문자·숫자·특수문자)이고
// 강도 4단(취약/보통/양호/강력)은 정규화 점수 임계값 0.3/0.5/0.8로 갈린다.
// 막대 색은 tone(JdSeverity) → JdSeverityBadgeSpec 재사용 — 색 어휘를 새로 만들지 않는다.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum PasswordInputDemo {
    static let demo = ComponentDemo(
        id: "PasswordInput",
        controls: [
            .toggle("showsStrength", "showsStrength", initial: true),
            .toggle("showsRules", "showsRules", initial: true),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("error", "error"),
        ],
        swiftUI: { state in AnyView(PasswordInputStageSwiftUI(state: state)) },
        uikit: { state in AnyView(PasswordInputStageUIKit(state: state)) }
    )
}

// 각주 문구도 Core 판정만 읽는다 — 임계값·라벨을 데모가 다시 계산하지 않는다
private func passwordDemoSummary(_ text: String) -> String {
    guard !text.isEmpty else { return "빈 값에는 강도를 매기지 않는다(웹 level \"none\" 동형)" }
    let strength = JdPasswordStrength.evaluate(text)
    return "강도 \(strength.label) — 규칙 \(strength.score)/\(JdPasswordRule.allCases.count) 충족"
}

private struct PasswordInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    /// 입력값은 스테이지 로컬 — 컨트롤 패널(DemoState)은 구성만 소유한다
    @State private var text = "Junds3!"

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            JdPasswordInput(
                text: $text,
                placeholder: "비밀번호",
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                isError: state.bool("error"),
                showsStrength: state.bool("showsStrength"),
                showsRules: state.bool("showsRules"),
                accessibilityLabel: "비밀번호"
            )

            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                Text(passwordDemoSummary(text))
                Text(
                    "강도 4단(취약/보통/양호/강력)은 규칙 5종(8자 이상·대문자·소문자·숫자·특수문자) 충족 비율 80% + 길이 보너스 20%로 결정된다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct PasswordInputStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var text = "Junds3!"

    var body: some View {
        let size = JdControlSize(rawValue: state.string("size")) ?? .md
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            PasswordInputViewRep(
                text: $text,
                placeholder: "비밀번호",
                size: size,
                isError: state.bool("error"),
                showsStrength: state.bool("showsStrength"),
                showsRules: state.bool("showsRules")
            )
            // size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id(size.rawValue)

            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                Text(passwordDemoSummary(text))
                Text(
                    "강도 4단(취약/보통/양호/강력)은 규칙 5종(8자 이상·대문자·소문자·숫자·특수문자) 충족 비율 80% + 길이 보너스 20%로 결정된다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct PasswordInputViewRep: UIViewRepresentable {
    @Binding var text: String
    var placeholder: String
    var size: JdControlSize
    var isError: Bool
    var showsStrength: Bool
    var showsRules: Bool

    final class Coordinator {
        var text: Binding<String>
        init(text: Binding<String>) { self.text = text }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    func makeUIView(context: Context) -> JdPasswordInputView {
        let view = JdPasswordInputView(
            text: text,
            placeholder: placeholder,
            size: size,
            isError: isError,
            showsStrength: showsStrength,
            showsRules: showsRules,
            accessibilityLabel: placeholder
        )
        let coordinator = context.coordinator
        view.onTextChange = { coordinator.text.wrappedValue = $0 }
        view.onCommit = { coordinator.text.wrappedValue = $0 }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdPasswordInputView, context: Context) {
        context.coordinator.text = $text
        // IME 안전: 실제로 다를 때만 되쓴다 (뷰 setter와 같은 계약)
        if view.text != text { view.text = text }
        if view.placeholder != placeholder { view.placeholder = placeholder }
        if view.isError != isError { view.isError = isError }
        if view.showsStrength != showsStrength { view.showsStrength = showsStrength }
        if view.showsRules != showsRules { view.showsRules = showsRules }
    }
}
