import JunDS
import SwiftUI
import UIKit

// StarRating 데모 — 실컴포넌트 JdStarRating(SwiftUI)/JdStarRatingView(UIKit).
// iOS에 시스템 대응이 없는 진짜 신규 컴포넌트다(DESIGN-3 §B).
//
// ⚠️ 이 데모의 관전 포인트는 외형이 아니라 **접근성 구조**다: 별 N개를 각각 버튼으로 노출하면
//    VoiceOver 사용자는 별들 사이를 훑을 뿐 값을 조절하지 못한다. 그래서 별은 전부 장식이고
//    컨트롤 하나가 .adjustable을 들고 위/아래 스와이프로 0.5씩 움직인다.
//    → 상세 화면의 "접근성 검사"를 UIKit 스테이지에서 열면 요소가 딱 하나(adjustable)만 보인다.
//
// 채움 판정·재탭 반값·클램프는 전부 Core(JunDSCore.JdStarRating · JdNumberInputRules) 소유다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum StarRatingDemo {
    static let demo = ComponentDemo(
        id: "StarRating",
        controls: [
            .slider("max", "max", 3...10, step: 1, initial: 5),
            .options("size", "size", JdIconSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("readOnly", "read-only"),
        ],
        swiftUI: { state in AnyView(StarRatingStageSwiftUI(state: state)) },
        uikit: { state in AnyView(StarRatingStageUIKit(state: state)) }
    )
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func starMax(_ state: DemoState) -> Int {
    Int(state.number("max", fallback: 5))
}

@MainActor
private func starSize(_ state: DemoState) -> JdIconSize {
    JdIconSize(rawValue: state.string("size")) ?? .md
}

private struct StarRatingStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var value: Double = 3

    var body: some View {
        let maxStars = starMax(state)
        let size = starSize(state)
        VStack(spacing: JdToken.Space.s4) {
            JdStarRating(
                value: $value,
                max: maxStars,
                size: size,
                isReadOnly: state.bool("readOnly")
            )
            // max·size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
            .id("\(maxStars)|\(size.rawValue)")

            starValueFootnote(value: value, max: maxStars)
            starAccessibilityFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

private struct StarRatingStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var value: Double = 3

    var body: some View {
        let maxStars = starMax(state)
        let size = starSize(state)
        VStack(spacing: JdToken.Space.s4) {
            StarRatingViewRep(
                value: $value,
                max: maxStars,
                size: size,
                readOnly: state.bool("readOnly")
            )
            .fixedSize()
            // max·size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다(value·isReadOnly는 var)
            .id("\(maxStars)|\(size.rawValue)")

            starValueFootnote(value: value, max: maxStars)
            starAccessibilityFootnote
        }
        .padding(JdToken.Space.s6)
    }
}

// 각주 1 — 현재 값. 표기는 Core(JdNumberFormat)가 단일 소스다.
@MainActor
private func starValueFootnote(value: Double, max: Int) -> some View {
    Text(
        "value \(JdNumberFormat.string(value: value, style: .decimal)) / \(max)"
            + " — 같은 별을 다시 탭하면 반값(0.5)으로 내려간다."
    )
    .font(.footnote)
    .foregroundColor(.secondary)
    .multilineTextAlignment(.center)
}

// 각주 2 — 이 컴포넌트의 본체.
private var starAccessibilityFootnote: some View {
    Text(
        "별 하나하나가 아니라 컨트롤 전체가 접근성 요소(.adjustable)다 — VoiceOver 위/아래 "
            + "스와이프로 0.5씩 조절된다. 위의 '접근성 검사'를 UIKit 스테이지에서 열면 별 개수와 무관하게 "
            + "요소가 하나(adjustable)만 잡히는 것을 확인할 수 있다."
    )
    .font(.footnote)
    .foregroundColor(.secondary)
    .multilineTextAlignment(.center)
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 프로그램 대입(value 세터)은 onValueChange를 발화시키지 않는 계약이라 되쓰기 루프가 없다.
private struct StarRatingViewRep: UIViewRepresentable {
    @Binding var value: Double
    var max: Int
    var size: JdIconSize
    var readOnly: Bool

    final class Coordinator {
        var value: Binding<Double>
        init(value: Binding<Double>) { self.value = value }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value)
    }

    func makeUIView(context: Context) -> JdStarRatingView {
        let view = JdStarRatingView(value: value, max: max, size: size, isReadOnly: readOnly)
        let coordinator = context.coordinator
        view.onValueChange = { newValue in coordinator.value.wrappedValue = newValue }
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdStarRatingView, context: Context) {
        context.coordinator.value = $value
        if view.isReadOnly != readOnly { view.isReadOnly = readOnly }
        if view.value != value { view.value = value }
    }
}
