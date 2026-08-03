import JunDS
import SwiftUI
import UIKit

// CurrencyInput 데모 — 실컴포넌트 JdCurrencyInput(SwiftUI)/JdCurrencyInputView(UIKit).
//
// 표기 전환 계약(웹 동형): **포커스 중엔 원시 숫자, 포커스 해제 시 통화 포맷**.
// 포맷 문자열은 전부 JdNumberFormat.string(style: .currency, …)가 만든다 — 통화별
// 소수 자릿수는 렌더가 판단하지 않고 통화 기본값에 위임한다(KRW 0 / USD·EUR 2 / JPY 0).
// v2가 `KRW ? 0 : 2`로 하드코딩해 JPY를 틀리게 그리던 것을 v3가 고쳤고, currency 옵션에
// JPY를 넣어 그 차이를 눈으로 확인할 수 있게 했다.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum CurrencyInputDemo {
    static let demo = ComponentDemo(
        id: "CurrencyInput",
        controls: [
            .options("currency", "currency", ["KRW", "USD", "JPY", "EUR"], initial: "KRW"),
            .options("locale", "locale", ["ko-KR", "en-US"], initial: "ko-KR"),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("error", "error"),
        ],
        swiftUI: { state in AnyView(CurrencyInputStageSwiftUI(state: state)) },
        uikit: { state in AnyView(CurrencyInputStageUIKit(state: state)) }
    )
}

// 각주 표기도 Core 포맷터를 통과시킨다 — 스테이지가 통화 규칙을 재구현하지 않는다
private func currencyDemoValueText(_ value: Double?, currency: String, locale: String) -> String {
    guard let value else { return "없음(빈 값)" }
    return JdNumberFormat.string(value: value, style: .currency, currency: currency, locale: locale)
}

private struct CurrencyInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var value: Double? = 12500

    var body: some View {
        let currency = state.string("currency", fallback: "KRW")
        let locale = state.string("locale", fallback: "ko-KR")
        VStack(spacing: JdToken.Space.s4) {
            JdCurrencyInput(
                value: $value,
                currency: currency,
                locale: locale,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                isError: state.bool("error"),
                placeholder: "금액",
                accessibilityLabel: "금액"
            )
            // currency·locale은 표시 문자열을 init에서 @State draft로 굳힌다 —
            // 값이 바뀌면 뷰를 재생성해 새 표기를 즉시 반영한다
            .id("\(currency)-\(locale)")

            VStack(spacing: JdToken.Space.s1) {
                Text("현재 값: \(currencyDemoValueText(value, currency: currency, locale: locale))")
                Text("통화별 소수 자릿수는 Core가 통화 기본값에 위임한다 — KRW·JPY 0자리, USD·EUR 2자리")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct CurrencyInputStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value: Double? = 12500

    var body: some View {
        let currency = state.string("currency", fallback: "KRW")
        let locale = state.string("locale", fallback: "ko-KR")
        let size = JdControlSize(rawValue: state.string("size")) ?? .md
        VStack(spacing: JdToken.Space.s4) {
            CurrencyInputViewRep(
                value: $value,
                currency: currency,
                locale: locale,
                size: size,
                isError: state.bool("error"),
                placeholder: "금액"
            )
            // size만 init 전용 표면 — currency·locale은 didSet이 표기를 다시 그린다
            .id(size.rawValue)

            VStack(spacing: JdToken.Space.s1) {
                Text("현재 값: \(currencyDemoValueText(value, currency: currency, locale: locale))")
                Text("통화별 소수 자릿수는 Core가 통화 기본값에 위임한다 — KRW·JPY 0자리, USD·EUR 2자리")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct CurrencyInputViewRep: UIViewRepresentable {
    @Binding var value: Double?
    var currency: String
    var locale: String
    var size: JdControlSize
    var isError: Bool
    var placeholder: String

    final class Coordinator {
        var value: Binding<Double?>
        init(value: Binding<Double?>) { self.value = value }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value)
    }

    func makeUIView(context: Context) -> JdCurrencyInputView {
        let view = JdCurrencyInputView(
            value: value,
            currency: currency,
            locale: locale,
            size: size,
            isError: isError,
            placeholder: placeholder,
            accessibilityLabel: placeholder
        )
        let coordinator = context.coordinator
        view.onValueChange = { coordinator.value.wrappedValue = $0 }
        view.onCommit = { coordinator.value.wrappedValue = $0 }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdCurrencyInputView, context: Context) {
        context.coordinator.value = $value
        // 편집 중 되쓰기는 뷰 쪽 가드가 막는다(입력 중 표기 전환 방지)
        if view.value != value { view.value = value }
        if view.currency != currency { view.currency = currency }
        if view.locale != locale { view.locale = locale }
        if view.isError != isError { view.isError = isError }
        if view.placeholder != placeholder { view.placeholder = placeholder }
    }
}
