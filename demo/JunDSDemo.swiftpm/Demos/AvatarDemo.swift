import SwiftUI
import UIKit
import JunDS

// Avatar 데모 — 실컴포넌트 JdAvatar(SwiftUI)/JdAvatarView(UIKit). 웹 <jd-avatar> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(name/size/status) — 3플랫폼 동일 (04 §3).
//
// 이미지는 일부러 주지 않는다 — 이니셜 폴백을 보이는 게 이 데모의 목적이다.
// 폴백 색은 **이름 해시**라 같은 이름이면 항상 같은 색이다(랜덤 아님 — §3.1-3 정합).
// 이름을 바꿔 가며 색이 이름을 따라 결정되는 걸 확인할 수 있다.

enum AvatarDemo {
    // 웹은 status attribute를 지우면 점이 사라진다 — 옵션 컨트롤엔 "없음" 값이 필요해
    // 센티널 "none"을 둔다(웹 리터럴 4종은 그대로 유지).
    private static let statusOptions = ["none"] + JdAvatarStatus.allCases.map(\.rawValue)

    static let demo = ComponentDemo(
        id: "Avatar",
        controls: [
            .options("size", "size", JdAvatarSize.allCases.map(\.rawValue), initial: "lg"),
            .text("name", "name", placeholder: "이름 (이니셜 원본)", initial: "Ada Lovelace"),
            .options("status", "status (none = 점 없음)", statusOptions, initial: "online"),
        ],
        swiftUI: { state in AnyView(AvatarStageSwiftUI(state: state)) },
        uikit: { state in AnyView(AvatarStageUIKit(state: state)) }
    )
}

private let avatarNote = "이미지 없이 이니셜 폴백 — 색은 이름 해시라 같은 이름이면 항상 같은 색이다."

@MainActor
private func avatarSize(_ state: DemoState) -> JdAvatarSize {
    JdAvatarSize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func avatarName(_ state: DemoState) -> String {
    state.string("name")
}

// "none" = 상태 없음(웹 attribute 제거 동형)
@MainActor
private func avatarStatus(_ state: DemoState) -> JdAvatarStatus? {
    JdAvatarStatus(rawValue: state.string("status"))
}

private struct AvatarStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdAvatar(
                name: avatarName(state),
                size: avatarSize(state),
                status: avatarStatus(state)
            )

            Text(avatarNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct AvatarStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let size = avatarSize(state)
        VStack(spacing: JdToken.Space.s4) {
            AvatarViewRep(
                name: avatarName(state),
                size: size,
                status: avatarStatus(state)
            )
            .fixedSize()

            Text(avatarNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
        // size는 init 전용 표면(원 지름·도트 치수 고정) — 값이 바뀌면 뷰를 재생성한다
        .id(size.rawValue)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct AvatarViewRep: UIViewRepresentable {
    var name: String
    var size: JdAvatarSize
    var status: JdAvatarStatus?

    func makeUIView(context: Context) -> JdAvatarView {
        JdAvatarView(name: name, size: size, status: status)
    }

    func updateUIView(_ view: JdAvatarView, context: Context) {
        if view.name != name { view.name = name }
        if view.status != status { view.status = status }
    }
}
