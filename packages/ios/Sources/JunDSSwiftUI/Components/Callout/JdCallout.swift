import JunDSCore
import SwiftUI

// 웹 jd-callout의 SwiftUI 번역 — 문서 강조 블록 (DESIGN-4 §B).
// 이모지·색은 Core JdCalloutVariant가 단일 소스. collapsible은 시스템 DisclosureGroup에 위임한다
// (펼침 상태·회전 셰브런·애니메이션을 새로 만들지 않는다 — 04 §10 번역 원칙).
public struct JdCallout<Content: View>: View {
    private let title: String
    private let variant: JdCalloutVariant
    private let isCollapsible: Bool
    private let content: () -> Content

    @State private var isExpanded: Bool
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ title: String,
        variant: JdCalloutVariant = .note,
        isCollapsible: Bool = false,
        initiallyExpanded: Bool = true,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.variant = variant
        self.isCollapsible = isCollapsible
        self.content = content
        self._isExpanded = State(initialValue: initiallyExpanded)
    }

    private var header: some View {
        HStack(spacing: JdToken.Space.s2) {
            Text(variant.emoji)
                .accessibilityHidden(true)  // 이모지는 장식 — 제목이 유일한 표면
            Text(title)
                .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.semibold)
                .foregroundColor(JdToken.Color.foreground.color)
        }
    }

    public var body: some View {
        HStack(alignment: .top, spacing: 0) {
            // 좌측 3pt 강조선
            Rectangle()
                .fill(variant.color.color)
                .frame(width: JdToken.Border.thick)

            block
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(JdToken.Space.s4)
        }
        .background(variant.color.color.opacity(JdToken.Opacity.o5))
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
    }

    @ViewBuilder
    private var block: some View {
        if isCollapsible {
            DisclosureGroup(isExpanded: $isExpanded) {
                content()
                    .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                    .foregroundColor(JdToken.Color.foreground.color)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, JdToken.Space.s2)
            } label: {
                header
            }
            .tint(JdToken.Color.muted.color)  // 셰브런 색
        } else {
            VStack(alignment: .leading, spacing: JdToken.Space.s2) {
                header
                content()
                    .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                    .foregroundColor(JdToken.Color.foreground.color)
            }
        }
    }
}
