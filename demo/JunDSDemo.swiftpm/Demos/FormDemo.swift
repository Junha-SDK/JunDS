import JunDS
import SwiftUI

// useForm 데모 — **Core 유틸 실동작**(뷰 없음). 웹 훅의 iOS 대응은 순수 검증 함수 `JdForm` +
// 규칙 열거 `JdFieldRule`다. 데모는 검증을 재구현하지 않는다 — 필드 값과 규칙 배열을 그대로
// JdForm.firstViolation에 넘기고, 위반 규칙의 message(label:)를 필드 에러로 라이브 노출한다.
// ledger id "useForm".

enum FormDemo {
    static let demo = ComponentDemo(
        id: "useForm",
        controls: [
            .slider("minLength", "이름 최소 길이", 0...8, step: 1, initial: 2)
        ],
        swiftUI: { state in AnyView(FormStage(state: state)) }
    )
}

@MainActor
private func formMinLength(_ state: DemoState) -> Int {
    Int(state.number("minLength", fallback: 2))
}

private struct FormStage: View {
    @ObservedObject var state: DemoState
    @State private var name = ""
    @State private var email = ""

    private var nameRules: [JdFieldRule] { [.required, .minLength(formMinLength(state))] }
    private var emailRules: [JdFieldRule] { [.required, .email] }

    // 위반 → message. Core가 판정·문구를 모두 준다 — 데모는 통과/실패를 그리기만.
    private func error(_ value: String, rules: [JdFieldRule], label: String) -> String? {
        JdForm.firstViolation(value, rules: rules)?.message(label: label)
    }

    private var allValid: Bool {
        JdForm.isValid(name, rules: nameRules) && JdForm.isValid(email, rules: emailRules)
    }

    var body: some View {
        VStack(spacing: JdToken.Space.s5) {
            JdTextField(
                "이름", placeholder: "홍길동", text: $name,
                error: error(name, rules: nameRules, label: "이름"))

            JdTextField(
                "이메일", placeholder: "you@example.com", text: $email,
                error: error(email, rules: emailRules, label: "이메일"))

            HStack(spacing: JdToken.Space.s2) {
                Image(systemName: allValid ? "checkmark.circle.fill" : "exclamationmark.circle")
                    .foregroundColor((allValid ? JdToken.Color.success : JdToken.Color.muted).color)
                JdText(
                    allValid ? "제출 가능" : "검증 실패 항목이 있습니다",
                    size: .sm, weight: JdToken.FontWeight.medium)
            }

            Text(
                "각 필드는 규칙 배열([.required, .minLength(n)] / [.required, .email])을 그대로 "
                    + "JdForm.firstViolation에 넘긴다. 첫 위반에서 멈추는 순서(required → minLength)까지 웹 useForm과 동형이다."
            )
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
