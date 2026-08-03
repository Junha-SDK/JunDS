import JunDS
import SwiftUI

// Page 데모 — 레시피형 (04 §10.1). 웹 <jd-page>/<jd-page-header>/<jd-page-body>는
// iOS에서 NavigationStack + ScrollView 관용구로 번역된다(신규 컴포넌트 없음).
// 미니 페이지 프리뷰로 제목(JdHeading h1)·설명(JdText dimmed)·본문 섹션을 조립해 보인다.

enum PageDemo {
    static let demo = ComponentDemo(
        id: "Page",
        controls: [
            .options("maxWidth", "max-width", ["sm", "md", "lg", "xl", "full"], initial: "xl")
        ],
        swiftUI: { state in AnyView(PageStage(state: state)) },
        recipe: """
            // 웹 jd-page(중앙 정렬·max-width·반응형 패딩)의 iOS 번역 = ScrollView 루트 (04 §10.1)
            NavigationStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: JdGap.lg.value) {
                        // jd-page-header
                        VStack(alignment: .leading, spacing: JdGap.xs.value) {
                            JdHeading("페이지 제목", level: .h1)
                            JdText("페이지 설명", size: .md, dimmed: true)
                        }
                        // jd-page-body: 섹션들 (gap md~lg)
                        sectionA; sectionB
                    }
                    .padding(JdToken.Space.s4)           // 웹 16px, regular-width 24px
                    .frame(maxWidth: 1280)                // max-width xl 프리셋
                    .frame(maxWidth: .infinity)           // margin-inline auto (중앙 정렬)
                }
            }
            """
    )

    // 웹 max-width 프리셋(px) — 콘텐츠 폭 상한
    static func maxWidth(_ option: String) -> CGFloat? {
        switch option {
        case "sm": return 640
        case "md": return 768
        case "lg": return 1024
        case "xl": return 1280
        default: return nil  // full
        }
    }
}

private struct PageStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let cap = PageDemo.maxWidth(state.string("maxWidth"))
        ScrollView {
            VStack(alignment: .leading, spacing: JdToken.Space.s6) {
                // jd-page-header
                VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                    JdHeading("월간 리포트", level: .h1)
                    JdText("2026년 7월 · 가계부 요약", size: .md, dimmed: true)
                }
                // jd-page-body
                PageSectionCard(title: "지출", detail: "이번 달 총 지출은 예산 대비 92%입니다.")
                PageSectionCard(title: "저축", detail: "저축 목표의 68%를 달성했습니다.")
            }
            .padding(JdToken.Space.s4)
            .frame(maxWidth: cap, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct PageSectionCard: View {
    let title: String
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s2) {
            JdHeading(title, level: .h4)
            JdText(detail, size: .sm, dimmed: true)
        }
        .padding(JdToken.Space.s4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(JdToken.Color.card.color)
        .overlay(
            RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous)
                .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
        )
        .cornerRadius(JdToken.Radius.xl)
    }
}
