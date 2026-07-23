import SwiftUI
import JunDSCore

// 웹 jd-heading 동형 — 레벨 램프는 JdHeadingSpec이 단일 소스 (DESIGN §2.1/2.2).
// uppercase 레벨(L6)은 표시만 대문자화 — VoiceOver는 원문으로 읽는다(웹 text-transform 동형).
public struct JdHeading: View {
    private let text: String
    private let level: JdHeadingLevel
    private let spec: JdHeadingSpec
    private let truncate: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ text: String, level: JdHeadingLevel = .h2, truncate: Bool = false) {
        self.text = text
        self.level = level
        self.spec = JdHeadingSpec.resolve(level: level)
        self.truncate = truncate
    }

    public var body: some View {
        Text(spec.uppercase ? text.uppercased() : text)
            .font(JdSwiftUIFont.scaled(size: spec.fontSize, weight: spec.fontWeight, category: sizeCategory))
            .foregroundColor(JdToken.Color.foreground.color)
            .lineLimit(truncate ? 1 : nil) // truncate → 단일행 ellipsis (웹 동형)
            .truncationMode(.tail)
            .accessibilityAddTraits(.isHeader)
            .accessibilityHeading(headingLevel)
            .accessibilityLabel(Text(text)) // 대문자 변환 전 원문으로 읽기
    }

    // 웹 h1~h6 → SwiftUI 헤딩 레벨 매핑 (04 §7.1 — VoiceOver 로터 탐색용)
    private var headingLevel: AccessibilityHeadingLevel {
        switch level {
        case .h1: return .h1
        case .h2: return .h2
        case .h3: return .h3
        case .h4: return .h4
        case .h5: return .h5
        case .h6: return .h6
        }
    }
}
