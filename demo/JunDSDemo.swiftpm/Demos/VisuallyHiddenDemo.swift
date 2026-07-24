import SwiftUI
import JunDS

// VisuallyHidden 데모 — **컴포넌트 없음** (04 §10.1). 웹 .jd-visually-hidden(1px로 잘라 화면 밖에
// 두는 클래스)의 대응물은 새 뷰가 아니라 접근성 모디파이어다: 시각 표현은 그대로 두고
// AT가 읽는 문자열만 갈아끼운다.
//
// 스테이지에는 숫자만 보이지만 낭독은 "읽지 않은 알림, 42개"다 — 위 환경 섹션의 "접근성 검사"로
// 라벨·값·힌트를 확인한다.

enum VisuallyHiddenDemo {
    static let demo = ComponentDemo(
        id: "VisuallyHidden",
        controls: [
            .slider("count", "읽지 않은 알림 수", 0...99, step: 1, initial: 42),
        ],
        swiftUI: { state in AnyView(VisuallyHiddenStage(state: state)) },
        recipe: """
        // VisuallyHidden = 접근성 모디파이어 (04 §10.1 — 신규 컴포넌트 없음)
        // SwiftUI — 실뷰에 라벨을 싣는 것이 1순위
        JdText("42", size: .lg)
            .accessibilityLabel(Text("읽지 않은 알림"))
            .accessibilityValue(Text("42개"))
            .accessibilityHint(Text("두 번 탭하면 알림함이 열립니다"))

        // 시각 요소 없이 AT 전용 문구가 정말 필요할 때만 — 0×0 뷰
        Color.clear
            .frame(width: 0, height: 0)
            .accessibilityElement()
            .accessibilityLabel(Text("정렬 기준: 날짜 내림차순"))

        // UIKit
        label.isAccessibilityElement = true
        label.accessibilityLabel = "읽지 않은 알림"
        label.accessibilityValue = "42개"

        // ⚠️ .hidden() · isHidden = true · alpha = 0 은 대체재가 아니다 — 셋 다 접근성 트리에서도
        //    요소를 제거한다(웹 display:none 함정과 동형).
        """
    )
}

@MainActor
private func visuallyHiddenCount(_ state: DemoState) -> Int {
    Int(state.number("count", fallback: 42))
}

private let visuallyHiddenWarning = "⚠️ .hidden() · isHidden = true · alpha = 0 은 대체재가 아니다 — "
    + "셋 다 접근성 트리에서도 요소를 제거한다(웹 display:none 함정과 동형). 남는 길은 크기를 0으로 "
    + "줄이는 쪽뿐이고, 0×0 요소는 VoiceOver 스와이프 순서에만 걸리므로 남용하지 않는다."

private let visuallyHiddenNote = "SwiftUI는 보조기술이 실제로 켜져 있을 때만 접근성 트리를 만든다 — "
    + "\"접근성 검사\" 시트가 비어 보여도 요소가 없다는 뜻은 아니다. VoiceOver를 켜고 스와이프하면 "
    + "숫자가 아니라 라벨·값이 읽힌다."

private struct VisuallyHiddenStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let count = visuallyHiddenCount(state)

        return VStack(spacing: JdToken.Space.s4) {
            // 화면에는 숫자만 — 낭독은 라벨 + 값이다
            JdText("\(count)", size: .xl3, weight: JdToken.FontWeight.semibold)
                .padding(.horizontal, JdToken.Space.s4)
                .padding(.vertical, JdToken.Space.s2)
                .background(JdToken.Color.dangerLight.color)
                .cornerRadius(JdToken.Radius.full)
                .accessibilityElement()
                .accessibilityLabel(Text("읽지 않은 알림"))
                .accessibilityValue(Text("\(count)개"))
                .accessibilityHint(Text("두 번 탭하면 알림함이 열립니다"))

            JdText("보이는 것: \"\(count)\" · 낭독: \"읽지 않은 알림, \(count)개\"", size: .xs, mono: true, lineLimit: 2)

            // 시각 요소 없이 AT 전용 문구가 정말 필요할 때 — 0×0 뷰(스와이프 순서에만 걸린다)
            Color.clear
                .frame(width: 0, height: 0)
                .accessibilityElement()
                .accessibilityLabel(Text("정렬 기준: 날짜 내림차순"))

            VStack(spacing: JdToken.Space.s1) {
                Text(visuallyHiddenWarning)
                Text(visuallyHiddenNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
