import JunDSCore
import SwiftUI

// 웹 jd-hashtag 동형 — `#tag` 링크 칩 (DESIGN-3 §C).
//
// ⚠️ 타입명이 **JdHashtagLabel**인 이유: Core에 이미 `enum JdHashtag`(displayText/countText)가
//    있고 우산 타겟이 함께 재수출하므로 같은 이름이면 소비처에서 모호해진다. Core 우선 —
//    뷰가 이름을 양보한다(UIKit 사본은 JdHashtagLabelView).
//
// 표시 문자열·카운트 축약은 **전부 Core**다(JdHashtag.displayText / countText — 자체 포맷 금지).
public struct JdHashtagLabel: View {
    private let tag: String
    private let count: Int?
    private let isTrending: Bool
    private let destination: URL?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        tag: String,
        count: Int? = nil,
        isTrending: Bool = false,
        destination: URL? = nil
    ) {
        self.tag = tag
        self.count = count
        self.isTrending = isTrending
        self.destination = destination
    }

    private var displayText: String { JdHashtag.displayText(tag: tag) }

    /// 웹 `(${formatCount(count)})` — 숫자 자체는 Core가 만들고 괄호만 표기 규약이다
    private var countText: String? {
        count.map { "(\(JdHashtag.countText($0)))" }
    }

    private var accessibilityText: String {
        var parts = [displayText]
        if isTrending { parts.append(JdMentionStyle.trendingLabel) }
        if let count { parts.append(JdHashtag.countText(count)) }
        return parts.joined(separator: ", ")
    }

    @ViewBuilder
    public var body: some View {
        if let destination {
            Link(destination: destination) { run }
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text(accessibilityText))
                .accessibilityAddTraits(.isLink)
        } else {
            run
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text(accessibilityText))
        }
    }

    // MARK: 내부

    private var run: some View {
        HStack(spacing: JdToken.Space.s1) {  // 웹 gap: var(--jd-space-1)
            Text(displayText)
                .fontWeight(.medium)  // 웹 font-weight: var(--jd-weight-medium)
                .foregroundColor(JdToken.Color.primary.color)
            if isTrending {
                // 웹은 🔥 이모지 — SF Symbol로 옮기고 색은 토큰(warning)에서 읽는다
                Image(systemName: "flame.fill")
                    .font(markFont)
                    .foregroundColor(JdToken.Color.warning.color)
                    .accessibilityHidden(true)
            }
            if let countText {
                Text(countText)
                    .font(markFont)
                    .foregroundColor(JdToken.Color.muted.color)  // 웹 .jd-hashtag__count
                    .accessibilityHidden(true)
            }
        }
    }

    private var markFont: Font {
        JdSwiftUIFont.scaled(
            size: JdMentionStyle.markFontSize,
            weight: JdToken.FontWeight.normal,
            category: sizeCategory)
    }
}
