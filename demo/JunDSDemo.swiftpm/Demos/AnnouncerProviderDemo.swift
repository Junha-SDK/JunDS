import JunDS
import SwiftUI

// AnnouncerProvider 데모 — **뷰 없음** (04 §10.1). 웹은 polite/assertive 라이브 리전 노드를
// DOM에 심지만 iOS는 OS가 라이브 리전을 소유한다 — 남는 것은 Core 함수 하나뿐이다:
// JdAnnouncer.announce(_:priority:).
//
// 화면 변화 없이 일어난 사건(복사됨·업로드 실패 등)을 AT에 알리는 자리다.

enum AnnouncerProviderDemo {
    static let demo = ComponentDemo(
        id: "AnnouncerProvider",
        controls: [
            .text("message", "message", placeholder: "알릴 문구", initial: "복사됨")
        ],
        swiftUI: { state in AnyView(AnnouncerStage(state: state)) },
        recipe: """
            // AnnouncerProvider = Core 함수 하나 (04 §10.1 — 뷰 없음)
            JdAnnouncer.announce("복사됨")                             // 기본 polite
            JdAnnouncer.announce("업로드 실패", priority: .assertive)   // 진행 중 발화를 끊고 즉시

            // 내부적으로 polite → UIAccessibility .announcement
            //              assertive → .screenChanged
            // 빈 문자열은 무시된다.
            """
    )
}

@MainActor
private func announcerMessage(_ state: DemoState) -> String {
    state.string("message", fallback: "복사됨")
}

private let announcerNote =
    "VoiceOver가 실제로 켜져 있어야 들린다 — 꺼져 있으면 호출은 성공하지만 "
    + "아무 일도 일어나지 않는다(아래 호출 횟수만 올라간다). 웹이 같은 문구를 다시 읽히려고 노드를 "
    + "비웠다 채우던 해킹은 이식하지 않았다: iOS는 동일 문자열도 매번 다시 읽는다."

private let announcerPriorityNote =
    "polite는 진행 중인 발화가 끝난 뒤에 이어 읽고(.announcement), "
    + "assertive는 화면이 바뀐 것으로 처리해 즉시 끼어든다(.screenChanged)."

private struct AnnouncerStage: View {
    @ObservedObject var state: DemoState
    @State private var politeCount = 0
    @State private var assertiveCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdText("\"\(announcerMessage(state))\"", size: .md, mono: true, lineLimit: 2)

            HStack(spacing: JdToken.Space.s3) {
                JdButton("polite", variant: .secondary) {
                    JdAnnouncer.announce(announcerMessage(state))
                    politeCount += 1
                }
                JdButton("assertive", variant: .danger) {
                    JdAnnouncer.announce(announcerMessage(state), priority: .assertive)
                    assertiveCount += 1
                }
            }

            JdText(
                "호출 — polite \(politeCount)회 · assertive \(assertiveCount)회", size: .sm, mono: true)

            VStack(spacing: JdToken.Space.s1) {
                Text(announcerPriorityNote)
                Text(announcerNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
