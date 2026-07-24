import SwiftUI
import UIKit
import JunDS

// PhoneInput 데모 — 실컴포넌트 JdPhoneInput(SwiftUI)/JdPhoneInputView(UIKit).
//
// 마스킹은 전부 JdPhoneMask가 한다(format / fullNumber) — 국가별 그룹 규칙을 렌더도
// 데모도 다시 알지 않는다. value는 웹과 같이 **숫자만** 보관하고 하이픈은 표시 전용이다.
// country 컨트롤과 컴포넌트 안 시스템 Picker는 같은 바인딩을 공유한다 — 어느 쪽으로
// 바꿔도 다른 쪽이 따라온다(웹 country attribute ↔ jd-change 왕복 동형).
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum PhoneInputDemo {
    static let demo = ComponentDemo(
        id: "PhoneInput",
        controls: [
            .options("country", "country", JdPhoneCountry.allCases.map(\.rawValue), initial: "KR"),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("error", "error"),
        ],
        swiftUI: { state in AnyView(PhoneInputStageSwiftUI(state: state)) },
        uikit: { state in AnyView(PhoneInputStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor여야 한다(DemoState가 @MainActor 격리)
@MainActor
private func phoneDemoCountryBinding(_ state: DemoState) -> Binding<JdPhoneCountry> {
    let raw = state.stringBinding("country", fallback: "KR")
    return Binding(
        get: { JdPhoneCountry(rawValue: raw.wrappedValue) ?? .kr },
        set: { raw.wrappedValue = $0.rawValue }
    )
}

private struct PhoneInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    /// 숫자만 보관 — 하이픈은 JdPhoneMask.format이 표시 시점에 넣는다
    @State private var value = "01012345678"

    var body: some View {
        let country = phoneDemoCountryBinding(state)
        VStack(spacing: JdToken.Space.s4) {
            JdPhoneInput(
                value: $value,
                country: country,
                size: JdControlSize(rawValue: state.string("size")) ?? .md,
                isError: state.bool("error"),
                accessibilityLabel: "전화번호"
            )

            VStack(spacing: JdToken.Space.s1) {
                Text("마스킹: \(JdPhoneMask.format(value, country: country.wrappedValue))")
                Text("fullNumber: \(JdPhoneMask.fullNumber(value, country: country.wrappedValue))")
                Text("보관 값은 숫자만 — 하이픈·국가번호는 Core 마스크가 표시 시점에 만든다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct PhoneInputStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value = "01012345678"

    var body: some View {
        let country = phoneDemoCountryBinding(state)
        let size = JdControlSize(rawValue: state.string("size")) ?? .md
        VStack(spacing: JdToken.Space.s4) {
            PhoneInputViewRep(
                value: $value,
                country: country,
                size: size,
                isError: state.bool("error")
            )
            // size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id(size.rawValue)

            VStack(spacing: JdToken.Space.s1) {
                Text("마스킹: \(JdPhoneMask.format(value, country: country.wrappedValue))")
                Text("fullNumber: \(JdPhoneMask.fullNumber(value, country: country.wrappedValue))")
                Text("보관 값은 숫자만 — 하이픈·국가번호는 Core 마스크가 표시 시점에 만든다")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct PhoneInputViewRep: UIViewRepresentable {
    @Binding var value: String
    @Binding var country: JdPhoneCountry
    var size: JdControlSize
    var isError: Bool

    final class Coordinator {
        var value: Binding<String>
        var country: Binding<JdPhoneCountry>
        init(value: Binding<String>, country: Binding<JdPhoneCountry>) {
            self.value = value
            self.country = country
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value, country: $country)
    }

    func makeUIView(context: Context) -> JdPhoneInputView {
        let view = JdPhoneInputView(
            value: value,
            country: country,
            size: size,
            isError: isError,
            accessibilityLabel: "전화번호"
        )
        let coordinator = context.coordinator
        view.onValueChange = { coordinator.value.wrappedValue = $0 }
        view.onCommit = { coordinator.value.wrappedValue = $0 }
        // UIMenu에서 고른 국가가 컨트롤 패널로도 돌아온다 (웹 jd-change 동형)
        view.onCountryChange = { coordinator.country.wrappedValue = $0 }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdPhoneInputView, context: Context) {
        context.coordinator.value = $value
        context.coordinator.country = $country
        if view.value != value { view.value = value }
        if view.country != country { view.country = country }
        if view.isError != isError { view.isError = isError }
    }
}
