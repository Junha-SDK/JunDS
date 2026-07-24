import SwiftUI
import UIKit
import JunDS

// MentionChip 데모 — 실컴포넌트 JdMentionLabel(SwiftUI)/JdMentionLabelView(UIKit).
// 웹 <jd-mention-chip> 동형. 컨트롤 키·값은 웹 attribute 리터럴(handle/label/verified).
//
// ⚠️ 타입명이 Jd**MentionChip**이 아니라 Jd**MentionLabel**인 이유: Core에 이미 표시 규칙
//    `enum JdMentionChip`이 있고 우산 타겟이 함께 재수출하므로 뷰가 이름을 양보했다.
//
// 표시 문자열은 **전부 Core JdMentionChip.displayText**다 — label이 비면 "@handle" 폴백이고,
// 그 판정을 데모도 뷰도 다시 쓰지 않는다 (04 §4.2 규칙 2).

enum MentionChipDemo {
    static let demo = ComponentDemo(
        id: "MentionChip",
        controls: [
            .text("handle", "handle", placeholder: "핸들", initial: "junha"),
            .text("label", "label", placeholder: "표시명 (빈 값 = @handle 폴백)", initial: ""),
            .toggle("verified", "verified (isVerified)"),
        ],
        swiftUI: { state in AnyView(MentionStageSwiftUI(state: state)) },
        uikit: { state in AnyView(MentionStageUIKit(state: state)) }
    )
}

@MainActor
private func mentionHandle(_ state: DemoState) -> String {
    state.string("handle", fallback: "junha")
}

@MainActor
private func mentionLabel(_ state: DemoState) -> String {
    state.string("label")
}

// 폴백 판정도 데모가 Core에 물어본다 — 규칙을 여기서 다시 쓰지 않는다
@MainActor
private func mentionDisplayNote(_ state: DemoState) -> String {
    let display = JdMentionChip.displayText(handle: mentionHandle(state), label: mentionLabel(state))
    return "JdMentionChip.displayText → \"\(display)\" (label이 비면 @handle 폴백)"
}

private let mentionNote = "verified는 웹의 텍스트 \"✓\"를 SF Symbol로 옮긴 것이고, 의미는 낭독 라벨이 "
    + "\"인증됨\"으로 싣는다(심볼 자체는 AT에서 감춘다). 링크 열기는 소비자 몫이다 — SwiftUI는 "
    + "destination, UIKit은 onTap 자리다."

private struct MentionStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // 텍스트 런이라 문단 안에서 어떻게 앉는지가 실제 쓰임이다
            HStack(spacing: JdToken.Space.s2) {
                JdMentionLabel(handle: mentionHandle(state),
                               label: mentionLabel(state),
                               isVerified: state.bool("verified"))
                JdText("님이 답글을 남겼다", size: .md, dimmed: true)
            }

            VStack(spacing: JdToken.Space.s1) {
                Text(mentionDisplayNote(state))
                Text(mentionNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct MentionStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            HStack(spacing: JdToken.Space.s2) {
                MentionViewRep(handle: mentionHandle(state),
                               label: mentionLabel(state),
                               isVerified: state.bool("verified"))
                    .fixedSize()
                JdText("님이 답글을 남겼다", size: .md, dimmed: true)
            }

            VStack(spacing: JdToken.Space.s1) {
                Text(mentionDisplayNote(state))
                Text(mentionNote)
            }
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct MentionViewRep: UIViewRepresentable {
    var handle: String
    var label: String
    var isVerified: Bool

    func makeUIView(context: Context) -> JdMentionLabelView {
        JdMentionLabelView(handle: handle, label: label, isVerified: isVerified)
    }

    func updateUIView(_ view: JdMentionLabelView, context: Context) {
        if view.handle != handle { view.handle = handle }
        if view.label != label { view.label = label }
        if view.isVerified != isVerified { view.isVerified = isVerified }
    }
}
