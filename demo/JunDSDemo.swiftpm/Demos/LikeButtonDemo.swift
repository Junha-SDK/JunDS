import SwiftUI
import UIKit
import JunDS

// LikeButton 데모 — 실컴포넌트 JdLikeButton(SwiftUI)/JdLikeButtonView(UIKit).
// 웹 <jd-like-button> 동형: 하트 토글 + 선택적 카운트. BookmarkButton과 같은 골격이고
// 켜짐 색만 danger 토큰이다. count가 nil이면 카운트 슬롯이 사라진다(웹 count 미지정 동형).
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum LikeButtonDemo {
    static let demo = ComponentDemo(
        id: "LikeButton",
        controls: [
            .options("size", "size", JdIconButtonSize.allCases.map(\.rawValue), initial: "md"),
            .slider("count", "count", 0...5000, step: 100, initial: 1200),
            .toggle("showCount", "show-count", initial: true),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(LikeButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(LikeButtonStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func likeSize(_ state: DemoState) -> JdIconButtonSize {
    JdIconButtonSize(rawValue: state.string("size")) ?? .md
}

/// show-count가 꺼지면 nil — 웹에서 count attribute를 지운 것과 같다
@MainActor
private func likeCount(_ state: DemoState) -> Int? {
    guard state.bool("showCount") else { return nil }
    return Int(state.number("count", fallback: 1200))
}

private struct LikeButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var isLiked = false

    var body: some View {
        let count = likeCount(state)
        VStack(spacing: JdToken.Space.s4) {
            JdLikeButton(
                isLiked: $isLiked,
                count: count,
                size: likeSize(state),
                isEnabled: !state.bool("disabled")
            )

            Text("isLiked: \(isLiked ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            countFootnote(count)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct LikeButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var isLiked = false

    var body: some View {
        let size = likeSize(state)
        let count = likeCount(state)
        VStack(spacing: JdToken.Space.s4) {
            LikeButtonViewRep(
                isLiked: $isLiked,
                count: count,
                size: size,
                disabled: state.bool("disabled")
            )
            .fixedSize()
            // size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다(count는 var라 그대로 갱신된다)
            .id(size.rawValue)

            Text("isLiked: \(isLiked ? "true" : "false")")
                .font(.footnote)
                .foregroundColor(.secondary)

            countFootnote(count)
        }
        .padding(JdToken.Space.s6)
    }
}

// 각주 — 축약 표기는 Core(JdNumberFormat.compactCount)가 단일 소스다.
// Foundation의 .compactName은 "1K/1M"이라 웹 문자열(천·만·억)과 어긋난다 → 렌더 계층에서
// NumberFormatter를 새로 만들지 않는다 (04 §4.2 규칙 3).
@ViewBuilder
private func countFootnote(_ count: Int?) -> some View {
    if let count {
        Text("count \(count) → \"\(JdNumberFormat.compactCount(count))\" — 자리수 축약은 "
             + "Core의 JdNumberFormat.compactCount가 단일 소스다(천·만·억 · Foundation의 1K/1M 아님).")
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
    } else {
        Text("show-count를 끄면 카운트 슬롯 자체가 사라지고 정사각 히트 타깃으로 돌아간다.")
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입(isLiked·count 세터)은 onChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct LikeButtonViewRep: UIViewRepresentable {
    @Binding var isLiked: Bool
    var count: Int?
    var size: JdIconButtonSize
    var disabled: Bool

    final class Coordinator {
        var isLiked: Binding<Bool>
        init(isLiked: Binding<Bool>) { self.isLiked = isLiked }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(isLiked: $isLiked)
    }

    func makeUIView(context: Context) -> JdLikeButtonView {
        let view = JdLikeButtonView(isLiked: isLiked, count: count, size: size)
        let coordinator = context.coordinator
        view.onChange = { value in coordinator.isLiked.wrappedValue = value }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdLikeButtonView, context: Context) {
        context.coordinator.isLiked = $isLiked
        if view.isLiked != isLiked { view.isLiked = isLiked }
        if view.count != count { view.count = count }
        if view.isEnabled != !disabled { view.isEnabled = !disabled }
    }
}
