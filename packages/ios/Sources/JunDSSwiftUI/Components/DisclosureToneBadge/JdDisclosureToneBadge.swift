import SwiftUI
import JunDSCore

// 웹 jd-disclosure-tone-badge 동형 — DART 공시 톤 라벨. (DEC-047)
//
// 분류 로직(disclosureTone.ts)은 앱의 몫이고 이 뷰는 **표시 전용**이다 — 웹 v3와 같은
// 계약(DEC-019). compact은 표 행에서 톤만 남긴다.
public struct JdDisclosureToneBadge: View {
    private let tone: JdDisclosureTone
    private let category: JdDisclosureCategory
    private let confidence: Double
    private let spec: JdDisclosureToneBadgeSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(tone: JdDisclosureTone,
                category: JdDisclosureCategory = .other,
                confidence: Double = 0,
                compact: Bool = false) {
        self.tone = tone
        self.category = category
        self.confidence = confidence
        self.spec = JdDisclosureToneBadgeSpec.resolve(tone: tone, compact: compact)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            Text(tone.label)
                .font(JdSwiftUIFont.scaled(size: spec.toneFontSize,
                                           weight: JdToken.FontWeight.bold,
                                           category: sizeCategory))
            if spec.showsDetail {
                Text(category.label)
                    .font(JdSwiftUIFont.scaled(size: spec.categoryFontSize,
                                               weight: JdToken.FontWeight.bold,
                                               category: sizeCategory))
                    .opacity(spec.categoryOpacity)
                if let conf = JdDisclosureToneBadgeSpec.confidenceText(confidence) {
                    Text(conf)
                        .monospacedDigit()
                        .font(JdSwiftUIFont.scaled(size: spec.confidenceFontSize,
                                                   weight: JdToken.FontWeight.bold,
                                                   category: sizeCategory))
                        .opacity(spec.confidenceOpacity)
                }
            }
        }
        .foregroundColor(spec.foreground.color)
        .padding(.horizontal, spec.hPadding)
        .frame(minHeight: spec.height)   // 고정 height 금지 — XXXL에서 자란다 (04 §7.2)
        .background(spec.background.color)
        .clipShape(RoundedRectangle(cornerRadius: spec.cornerRadius, style: .continuous))
        // compact이 세부를 숨겨도 스크린리더는 전부 읽는다(웹 v2엔 접근 이름이 없었다)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(JdDisclosureToneBadgeSpec.accessibilityText(
            tone: tone, category: category, confidence: confidence)))
    }
}
