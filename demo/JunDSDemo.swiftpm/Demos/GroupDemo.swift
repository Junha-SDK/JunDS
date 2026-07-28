import JunDS
import SwiftUI
import UIKit

// Group 데모 — 웹 <jd-group>(row·wrap·gap sm·align center)의 iOS 번역.
// SwiftUI = JdFlowLayout(실컴포넌트, 좁은 폭에서 줄바꿈), no-wrap이면 HStack.
// UIKit = JdStackView.horizontal no-wrap 폴백 — UIStackView는 wrap 미지원 (04 §10.1).
// 컨트롤 키는 웹 attribute와 일치(no-wrap, gap).

enum GroupDemo {
    static let demo = ComponentDemo(
        id: "Group",
        controls: [
            .toggle("no-wrap", "no-wrap"),
            .options("gap", "gap", ["xs", "sm", "md", "lg"], initial: "sm"),
        ],
        swiftUI: { state in AnyView(GroupStageSwiftUI(state: state)) },
        uikit: { state in AnyView(GroupStageUIKit(state: state)) }
    )

    // 길이가 제각각인 태그 8개 — 좁은 폭에서 줄바꿈이 눈에 보이게
    static let tags = ["가계부", "월간 예산", "구독", "고정비", "카드 대금", "저축 목표", "투자", "환율 알림"]
}

private struct GroupStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let gap = groupGap(state.string("gap"))
        VStack {
            if state.bool("no-wrap") {
                // no-wrap: 한 줄 고정 — 넘치면 가로 스크롤로 확인
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: gap.value) {
                        ForEach(GroupDemo.tags, id: \.self) { GroupChip(label: $0) }
                    }
                }
            } else {
                JdFlowLayout(spacing: gap.value) {
                    ForEach(GroupDemo.tags, id: \.self) { GroupChip(label: $0) }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(JdToken.Space.s6)
    }
}

private struct GroupChip: View {
    let label: String

    var body: some View {
        JdText(label, size: .xs)
            .padding(.horizontal, JdToken.Space.s3)
            .padding(.vertical, JdToken.Space.s1)
            .background(JdToken.Color.primaryLight.color)
            .cornerRadius(JdToken.Radius.full)
    }
}

private struct GroupStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            ScrollView(.horizontal, showsIndicators: false) {
                GroupStackRep(gap: groupGap(state.string("gap")))
                    .fixedSize()
            }
            // 각주: UIKit 계통의 wrap 부재는 설계상 폴백이다
            Text(
                "UIStackView는 wrap 미지원 — JdStackView.horizontal no-wrap 폴백 (04 §10.1). 줄바꿈이 필요하면 SwiftUI JdFlowLayout을 쓴다."
            )
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct GroupStackRep: UIViewRepresentable {
    var gap: JdGap

    func makeUIView(context: Context) -> JdStackView {
        let chips = GroupDemo.tags.map { JdTextView($0, size: .xs) }
        return JdStackView.horizontal(gap: gap, chips)
    }

    func updateUIView(_ stack: JdStackView, context: Context) {
        stack.gap = gap
    }
}

// gap 옵션(웹 named gap) → JdGap — 웹 jd-group 기본 sm
private func groupGap(_ option: String) -> JdGap {
    switch option {
    case "xs": return .xs
    case "md": return .md
    case "lg": return .lg
    default: return .sm
    }
}
