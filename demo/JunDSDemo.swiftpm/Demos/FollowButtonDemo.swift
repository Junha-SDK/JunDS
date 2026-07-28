import JunDS
import SwiftUI
import UIKit

// FollowButton 데모 — 실컴포넌트 JdFollowButton(SwiftUI)/JdFollowButtonView(UIKit).
// 웹 <jd-follow-button> 동형: 미팔로우 = primary 채움 / 팔로잉 = secondary 외곽선.
// 두 변형 모두 JdButtonSpec을 그대로 재사용하고 모서리만 캡슐(Radius.full)로 바꾼다.
// iOS엔 호버가 없어 웹의 "팔로잉 → 언팔로우" 호버 문구 교체는 이식하지 않았다(눌림만).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum FollowButtonDemo {
    static let demo = ComponentDemo(
        id: "FollowButton",
        controls: [
            .options("size", "size", JdControlSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(FollowButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(FollowButtonStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func followSize(_ state: DemoState) -> JdControlSize {
    JdControlSize(rawValue: state.string("size")) ?? .md
}

private struct FollowButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isFollowing = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdFollowButton(
                isFollowing: $isFollowing,
                size: followSize(state),
                isEnabled: !state.bool("disabled")
            )

            Text("isFollowing: \(isFollowing ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            followFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

private struct FollowButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var isFollowing = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // size는 var(didSet에서 스펙 재해석)이라 뷰 재생성 없이 갱신된다
            FollowButtonViewRep(
                isFollowing: $isFollowing,
                size: followSize(state),
                disabled: state.bool("disabled")
            )
            .fixedSize()

            Text("isFollowing: \(isFollowing ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            followFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

// 각주 — 라벨 교체가 곧 상태 표기이고, 눌림 상태는 selected 트레이트로 함께 실린다.
private var followFootnote: some View {
    Text(
        "라벨 교체(팔로우 ↔ 팔로잉)가 곧 상태 표기다. 켜짐은 selected 트레이트로도 실려 "
            + "VoiceOver가 상태를 읽는다 — 웹 aria-pressed 동형."
    )
    .font(.footnote)
    .foregroundColor(.secondary)
    .multilineTextAlignment(.center)
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입(isFollowing 세터)은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct FollowButtonViewRep: UIViewRepresentable {
    @Binding var isFollowing: Bool
    var size: JdControlSize
    var disabled: Bool

    final class Coordinator {
        var isFollowing: Binding<Bool>
        init(isFollowing: Binding<Bool>) { self.isFollowing = isFollowing }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(isFollowing: $isFollowing)
    }

    func makeUIView(context: Context) -> JdFollowButtonView {
        let view = JdFollowButtonView(isFollowing: isFollowing, size: size)
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.isFollowing.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdFollowButtonView, context: Context) {
        context.coordinator.isFollowing = $isFollowing
        if view.isFollowing != isFollowing { view.isFollowing = isFollowing }
        if view.size != size { view.size = size }
        if view.isEnabled != !disabled { view.isEnabled = !disabled }
    }
}
