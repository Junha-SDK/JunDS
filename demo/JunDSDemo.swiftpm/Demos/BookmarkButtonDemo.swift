import SwiftUI
import UIKit
import JunDS

// BookmarkButton 데모 — 실컴포넌트 JdBookmarkButton(SwiftUI)/JdBookmarkButtonView(UIKit).
// 웹 <jd-bookmark-button> 동형: 심볼 토글 하나가 전부고, 기하는 JdIconButtonSpec(ghost) 재사용이라
// 표면은 size·disabled 두 축뿐이다. 켜짐 색은 warning 토큰(전용 색 신설 없음).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum BookmarkButtonDemo {
    static let demo = ComponentDemo(
        id: "BookmarkButton",
        controls: [
            .options("size", "size", JdIconButtonSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(BookmarkButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(BookmarkButtonStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func bookmarkSize(_ state: DemoState) -> JdIconButtonSize {
    JdIconButtonSize(rawValue: state.string("size")) ?? .md
}

// 토글 값은 스테이지 로컬 @State — 컨트롤 패널(DemoState)은 구성만 소유한다.
private struct BookmarkButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isBookmarked = false

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdBookmarkButton(
                isBookmarked: $isBookmarked,
                size: bookmarkSize(state),
                isEnabled: !state.bool("disabled")
            )

            Text("isBookmarked: \(isBookmarked ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            Text("VoiceOver 라벨은 상태가 아니라 다음 동작이다(북마크 ↔ 북마크 해제). "
                 + "켜짐은 라벨이 아니라 selected 트레이트로 실린다 — 웹 aria-pressed 동형.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct BookmarkButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var isBookmarked = false

    var body: some View {
        let size = bookmarkSize(state)
        VStack(spacing: JdToken.Space.s4) {
            BookmarkButtonViewRep(
                isBookmarked: $isBookmarked,
                size: size,
                disabled: state.bool("disabled")
            )
            .fixedSize()
            // size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id(size.rawValue)

            Text("isBookmarked: \(isBookmarked ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            Text("접근성 검사를 열면 label·selected 트레이트가 실제로 실려 있는 것을 볼 수 있다 "
                 + "(SwiftUI 스테이지는 VoiceOver가 꺼져 있으면 트리를 만들지 않는다).")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입(isBookmarked 세터)은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct BookmarkButtonViewRep: UIViewRepresentable {
    @Binding var isBookmarked: Bool
    var size: JdIconButtonSize
    var disabled: Bool

    final class Coordinator {
        var isBookmarked: Binding<Bool>
        init(isBookmarked: Binding<Bool>) { self.isBookmarked = isBookmarked }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(isBookmarked: $isBookmarked)
    }

    func makeUIView(context: Context) -> JdBookmarkButtonView {
        let view = JdBookmarkButtonView(isBookmarked: isBookmarked, size: size)
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.isBookmarked.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdBookmarkButtonView, context: Context) {
        context.coordinator.isBookmarked = $isBookmarked
        if view.isBookmarked != isBookmarked { view.isBookmarked = isBookmarked }
        if view.isEnabled != !disabled { view.isEnabled = !disabled }
    }
}
