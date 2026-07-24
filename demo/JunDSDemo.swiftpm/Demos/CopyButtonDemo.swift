import SwiftUI
import UIKit
import JunDS

// CopyButton 데모 — 실컴포넌트 JdCopyButton(SwiftUI)/JdCopyButtonView(UIKit).
// 웹 <jd-copy-button> 동형이지만 **복사 자체는 시스템 API(UIPasteboard)**가 한다 —
// 컴포넌트는 버튼만 얇게 얹는다(04 §10 번역 원칙: 시스템이 이미 하는 일을 새 타입으로 감싸지 않는다).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum CopyButtonDemo {
    static let demo = ComponentDemo(
        id: "CopyButton",
        controls: [
            .text("text", "text", placeholder: "복사할 원문", initial: "npm i @junds/ui"),
            .options("variant", "variant", JdButtonVariant.allCases.map(\.rawValue), initial: "secondary"),
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
        ],
        swiftUI: { state in AnyView(CopyButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(CopyButtonStageUIKit(state: state)) }
    )

    static let fallbackText = "npm i @junds/ui"
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func copyText(_ state: DemoState) -> String {
    state.string("text", fallback: CopyButtonDemo.fallbackText)
}

@MainActor
private func copyVariant(_ state: DemoState) -> JdButtonVariant {
    JdButtonVariant(rawValue: state.string("variant")) ?? .secondary
}

@MainActor
private func copySize(_ state: DemoState) -> JdControlSize {
    JdControlSize(rawValue: state.string("size")) ?? .md
}

private struct CopyButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdCopyButton(
                copyText(state),
                variant: copyVariant(state),
                size: copySize(state)
            )

            copyFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

private struct CopyButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var copyCount = 0

    var body: some View {
        let variant = copyVariant(state)
        let size = copySize(state)
        VStack(spacing: JdToken.Space.s4) {
            CopyButtonViewRep(
                text: copyText(state),
                variant: variant,
                size: size
            ) {
                copyCount += 1
            }
            .fixedSize()
            // variant·size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다(text는 var)
            .id("\(variant.rawValue)|\(size.rawValue)")

            Text("복사 횟수: \(copyCount)")
                .font(.footnote)
                .foregroundColor(.secondary)

            copyFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

// 각주 — 복사 후 2초 라벨 전환(웹 동형)과 AT 보정.
private var copyFootnote: some View {
    Text("탭하면 라벨이 '복사됨'으로 바뀌고 2초 뒤 자동 복귀한다(웹 동형 · 연타하면 이전 복귀 예약은 취소). "
         + "iOS는 포커스가 버튼에 있어도 라벨 변경을 자동 낭독하지 않아 JdAnnouncer가 성공을 따로 알린다.")
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
private struct CopyButtonViewRep: UIViewRepresentable {
    var text: String
    var variant: JdButtonVariant
    var size: JdControlSize
    var onCopy: () -> Void

    func makeUIView(context: Context) -> JdCopyButtonView {
        let view = JdCopyButtonView(text: text, variant: variant, size: size)
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdCopyButtonView, context: Context) {
        if view.text != text { view.text = text }
        let onCopy = self.onCopy
        view.onCopy = { _ in onCopy() }
    }
}
