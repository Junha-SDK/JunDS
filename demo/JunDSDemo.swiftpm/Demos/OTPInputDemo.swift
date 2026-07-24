import SwiftUI
import UIKit
import JunDS

// OTPInput 데모 — **별도 타입이 없다**. 웹 <jd-otp-input>의 iOS 대응은 JdPinInput의
// 설정 변형이다(R12 Switch=Toggle 선례 · DESIGN-3 §A):
//   length 6 고정 + alphanumeric=false + .textContentType(.oneTimeCode)
// 시스템이 이미 하는 일(문자 메시지 코드 자동완성)을 새 타입으로 감싸지 않는다(04 §10).
// JdPinInput/JdPinInputView는 내부 프록시 필드에 .oneTimeCode를 이미 걸어 두므로
// 이 데모는 그 설정 조합이 곧 OTP임을 보이는 것이 전부다 — 컨트롤도 masked 하나뿐이다.
// UIKit 랩은 이 파일 안 private — UIKitRepresentables.swift는 다른 배치 소유라 건드리지 않는다.

enum OTPInputDemo {
    /// 웹 <jd-otp-input>의 고정 자리수 — 컨트롤로 열지 않는다(설정 변형의 정의 자체다)
    private static let otpLength = 6

    static let demo = ComponentDemo(
        id: "OTPInput",
        controls: [
            .toggle("masked", "masked"),
        ],
        swiftUI: { state in AnyView(OTPInputStageSwiftUI(state: state, length: otpLength)) },
        uikit: { state in AnyView(OTPInputStageUIKit(state: state, length: otpLength)) }
    )
}

private struct OTPInputStageSwiftUI: View {
    @ObservedObject var state: DemoState
    let length: Int
    @State private var value = ""
    @State private var completeCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdPinInput(
                value: $value,
                length: length,
                masked: state.bool("masked"),
                alphanumeric: false, // OTP는 숫자 전용 — 자동완성이 붙는 조건이기도 하다
                isError: false,
                accessibilityLabel: "인증 번호"
            ) { _ in
                completeCount += 1
            }
            // 컴포넌트 내부 프록시 필드가 이미 걸어 둔 것과 같은 계약을 표면에서도 명시한다 —
            // 문자 메시지로 온 코드를 키보드 상단에서 바로 채우는 시스템 경로(자동완성)
            .textContentType(.oneTimeCode)

            VStack(spacing: JdToken.Space.s1) {
                Text("value: \(value.isEmpty ? "없음" : value) · \(value.count)/\(length)자리")
                Text("완료 콜백 호출: \(completeCount)회")
                Text("OTPInput은 별도 컴포넌트가 아니다 — JdPinInput의 설정 변형(length 6 · 숫자 전용 · .oneTimeCode)")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct OTPInputStageUIKit: View {
    @ObservedObject var state: DemoState
    let length: Int
    @State private var value = ""
    @State private var completeCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            OTPInputViewRep(
                value: $value,
                length: length,
                masked: state.bool("masked")
            ) {
                completeCount += 1
            }

            VStack(spacing: JdToken.Space.s1) {
                Text("value: \(value.isEmpty ? "없음" : value) · \(value.count)/\(length)자리")
                Text("완료 콜백 호출: \(completeCount)회")
                Text("JdPinInputView도 내부 필드에 textContentType = .oneTimeCode를 걸어 둔다 — OTP는 설정 변형")
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
// alphanumeric은 노출하지 않는다(OTP 변형은 숫자 전용으로 고정).
private struct OTPInputViewRep: UIViewRepresentable {
    @Binding var value: String
    var length: Int
    var masked: Bool
    var onComplete: () -> Void

    final class Coordinator {
        var value: Binding<String>
        var onComplete: () -> Void
        init(value: Binding<String>, onComplete: @escaping () -> Void) {
            self.value = value
            self.onComplete = onComplete
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value, onComplete: onComplete)
    }

    func makeUIView(context: Context) -> JdPinInputView {
        let view = JdPinInputView(
            value: value,
            length: length,
            masked: masked,
            alphanumeric: false,
            isError: false,
            accessibilityLabel: "인증 번호"
        )
        let coordinator = context.coordinator
        view.onValueChange = { coordinator.value.wrappedValue = $0 }
        view.onComplete = { _ in coordinator.onComplete() }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdPinInputView, context: Context) {
        context.coordinator.value = $value
        context.coordinator.onComplete = onComplete
        if view.length != length { view.length = length }
        if view.masked != masked { view.masked = masked }
        if view.value != value { view.value = value }
    }
}
