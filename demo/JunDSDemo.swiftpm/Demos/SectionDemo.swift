import JunDS
import SwiftUI

// Section 데모 — 레시피형 (04 §10.1). 웹 <jd-section title/description/border/gap>은
// iOS에서 VStack + (border 시) RoundedRectangle stroke 관용구로 번역된다.
// 헤더(제목 h4 + 설명 dimmed) + 본문(gap 적용 VStack).

enum SectionDemo {
    static let demo = ComponentDemo(
        id: "Section",
        controls: [
            .toggle("border", "border"),
            .options("gap", "gap", ["sm", "md", "lg"], initial: "md"),
            .text("title", "title", placeholder: "섹션 제목", initial: "고정비"),
            .text("description", "description", placeholder: "설명", initial: "매달 반복되는 지출 항목"),
        ],
        swiftUI: { state in AnyView(SectionStage(state: state)) },
        recipe: """
            // 웹 jd-section의 iOS 번역 = VStack 조립 (04 §10.1 — 신규 컴포넌트 없음)
            VStack(alignment: .leading, spacing: JdGap.md.value) {
                // 헤더: 제목(h4) + 설명(dimmed)
                VStack(alignment: .leading, spacing: JdToken.Space.s0_5) {
                    JdHeading(title, level: .h4)
                    JdText(description, size: .sm, dimmed: true)
                }
                // 본문: gap 적용
                VStack(alignment: .leading, spacing: gap.value) { rows }
            }
            .padding(JdToken.Space.s4)
            // border 플래그 → radius xl(16) + border stroke
            .overlay(RoundedRectangle(cornerRadius: JdToken.Radius.xl2)
                .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin))
            """
    )
}

private func sectionGap(_ option: String) -> JdGap {
    switch option {
    case "sm": return .sm
    case "lg": return .lg
    default: return .md
    }
}

private struct SectionStage: View {
    @ObservedObject var state: DemoState

    private let rows = ["월세 620,000", "통신비 45,000", "보험료 130,000"]

    var body: some View {
        let hasBorder = state.bool("border")
        let title = state.string("title", fallback: "섹션")
        let description = state.string("description")

        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            // 헤더 — 제목·설명 둘 다 비면 숨김(웹 동형)
            if !title.isEmpty || !description.isEmpty {
                VStack(alignment: .leading, spacing: JdToken.Space.s0_5) {
                    if !title.isEmpty { JdHeading(title, level: .h4) }
                    if !description.isEmpty { JdText(description, size: .sm, dimmed: true) }
                }
            }
            // 본문 — gap 적용
            VStack(alignment: .leading, spacing: sectionGap(state.string("gap")).value) {
                ForEach(rows, id: \.self) { row in
                    JdText(row, size: .sm)
                }
            }
        }
        .padding(JdToken.Space.s4)
        .frame(maxWidth: .infinity, alignment: .leading)
        // 웹 [border]: 1px border + radius 16px(v2 xl2)
        .overlay(borderOverlay(hasBorder))
        .padding(JdToken.Space.s4)
    }

    @ViewBuilder
    private func borderOverlay(_ hasBorder: Bool) -> some View {
        if hasBorder {
            RoundedRectangle(cornerRadius: JdToken.Radius.xl2, style: .continuous)
                .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
