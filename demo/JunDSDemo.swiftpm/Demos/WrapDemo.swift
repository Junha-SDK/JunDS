import SwiftUI
import UIKit
import JunDS

// Wrap 데모 — **별칭**이다. 웹에서 <jd-wrap>은 <jd-group>과 표면 동형이라 단일 구현 +
// 별칭으로 처리되고(R12), iOS도 신규 타입을 만들지 않는다:
//   SwiftUI → JdFlowLayout(실컴포넌트, iOS 16 Layout 프로토콜, 좌→우 흐름 + 줄바꿈)
//   UIKit   → JdStackView.horizontal (UIStackView가 wrap을 지원하지 않아 no-wrap 폴백, 04 §10.1)
// 즉 Group 데모와 같은 구현을 가리키되, 이 화면은 Wrap 표면(가변 길이 태그의 줄바꿈)만 다룬다.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(gap).

enum WrapDemo {
    static let demo = ComponentDemo(
        id: "Wrap",
        controls: [
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "sm"),
        ],
        swiftUI: { state in AnyView(WrapStageSwiftUI(state: state)) },
        uikit: { state in AnyView(WrapStageUIKit(state: state)) }
    )

    // 길이가 제각각인 태그 8개 — 한 줄에 안 들어가 줄바꿈이 강제된다
    static let tags = [
        "Swift", "SwiftUI 레이아웃", "UIKit", "접근성 감사",
        "Dynamic Type", "토큰", "브레이크포인트 판정", "다크 모드",
    ]
}

// gap 옵션(웹 named gap) → JdGap — 웹 jd-wrap 기본 sm
private func wrapGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "md": return .md
    case "lg": return .lg
    default: return .sm
    }
}

private struct WrapTag: View {
    let label: String

    var body: some View {
        JdText(label, size: .xs, lineLimit: 1)
            .padding(.horizontal, JdToken.Space.s3)
            .padding(.vertical, JdToken.Space.s1_5)
            .background(JdToken.Color.accentLight.color)
            .cornerRadius(JdToken.Radius.full)
    }
}

private struct WrapStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = wrapGap(state.string("gap"))
        VStack(alignment: .leading, spacing: JdToken.Space.s3) {
            JdFlowLayout(spacing: gap.value) {
                ForEach(WrapDemo.tags, id: \.self) { WrapTag(label: $0) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Text("행이 꽉 차면 다음 행으로 흐른다 — gap을 키우면 행 수가 늘어난다(행 간격도 같은 gap).")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct WrapStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s3) {
            ScrollView(.horizontal, showsIndicators: false) {
                WrapStackRep(gap: wrapGap(state.string("gap")))
                    .fixedSize()
            }

            Text("UIStackView는 wrap을 지원하지 않는다 — JdStackView.horizontal no-wrap 폴백이라 "
                 + "줄바꿈 대신 가로 스크롤로 확인한다(04 §10.1). 줄바꿈이 필요하면 SwiftUI JdFlowLayout.")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct WrapStackRep: UIViewRepresentable {
    var gap: JdGap

    func makeUIView(context: Context) -> JdStackView {
        let tags = WrapDemo.tags.map { wrapTagView($0) }
        return JdStackView.horizontal(gap: gap, tags)
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        stack.gap = gap
    }
}

private func wrapTagView(_ label: String) -> UIView {
    let container = UIView()
    container.backgroundColor = JdToken.Color.accentLight.uiColor
    // CALayer는 SwiftUI cornerRadius처럼 반높이로 클램프하지 않는다 — 알약 근사는 xl(12)
    container.layer.cornerRadius = JdToken.Radius.xl
    container.clipsToBounds = true

    let text = JdTextView(label, size: .xs)
    text.numberOfLines = 1
    container.addSubview(text)
    text.jd.layout {
        $0.edges.equalToSuperview()
            .inset(NSDirectionalEdgeInsets(top: JdToken.Space.s1_5,
                                           leading: JdToken.Space.s3,
                                           bottom: JdToken.Space.s1_5,
                                           trailing: JdToken.Space.s3))
    }
    return container
}
