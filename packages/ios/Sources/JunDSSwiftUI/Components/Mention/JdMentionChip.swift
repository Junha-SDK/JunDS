import SwiftUI
import JunDSCore

// 웹 jd-mention-chip 동형 — `@handle` 표시용 링크 칩 (DESIGN-3 §C).
//
// ⚠️ 타입명이 **JdMentionLabel**인 이유: Core에 이미 `enum JdMentionChip`(displayText 규칙)이
//    있고 우산 타겟이 함께 재수출하므로 같은 이름이면 소비처에서 모호해진다. Core 우선 —
//    뷰가 이름을 양보한다(UIKit 사본은 JdMentionLabelView).
//
// 표시 문자열은 **전부 Core의 JdMentionChip.displayText**다(label 폴백 규칙 재구현 금지).
public struct JdMentionLabel: View {
    private let handle: String
    private let label: String
    private let isVerified: Bool
    private let destination: URL?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(handle: String,
                label: String = "",
                isVerified: Bool = false,
                destination: URL? = nil) {
        self.handle = handle
        self.label = label
        self.isVerified = isVerified
        self.destination = destination
    }

    private var displayText: String {
        JdMentionChip.displayText(handle: handle, label: label)
    }

    private var accessibilityText: String {
        isVerified ? "\(displayText), \(JdMentionStyle.verifiedLabel)" : displayText
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
        HStack(spacing: JdToken.Space.s0_5) { // 웹 gap: var(--jd-space-0-5)
            Text(displayText)
                .fontWeight(.medium) // 웹 font-weight: var(--jd-weight-medium)
            if isVerified {
                // 웹은 텍스트 "✓" + aria-label — iOS는 SF Symbol로 옮기고 의미는 라벨이 싣는다
                Image(systemName: "checkmark.seal.fill")
                    .font(JdSwiftUIFont.scaled(size: JdMentionStyle.markFontSize,
                                               weight: JdToken.FontWeight.medium,
                                               category: sizeCategory))
                    .accessibilityHidden(true)
            }
        }
        .foregroundColor(JdToken.Color.primary.color)
    }
}

// 멘션·해시태그 공용 문구/치수 — UIKit 계층에 동형 사본이 있다(DEC-010으로 공유 불가).
enum JdMentionStyle {
    /// 웹 verifiedLabel/trendingLabel 기본값 리터럴 승계
    static let verifiedLabel = "인증됨"
    static let trendingLabel = "인기 태그"

    /// 웹 보조 요소(✓·🔥·카운트)는 11pt — 대응 토큰이 없어 JdTextSpec xs(12)로 옮긴다(notes 보고분)
    static var markFontSize: CGFloat { JdTextSpec.resolve(size: .xs).fontSize }
}
