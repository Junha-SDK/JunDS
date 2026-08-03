import JunDSCore
import SwiftUI

// 웹 jd-label 동형 — 폼 라벨 (DESIGN-2 §B1).
// 웹은 required 표식을 CSS ::after로 그려 AT에 아무것도 알리지 않는다(순수 시각 표식).
// iOS는 표식을 장식으로 두지 않고 접근성 라벨에 "필수"로 합류시켜 그 결함을 보정한다.
public struct JdLabel: View {
    private let text: String
    private let isRequired: Bool
    private let spec: JdLabelSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    /// 웹 리터럴 "*"가 뜻하는 바 — AT에 읽히는 말
    private static let requiredWord = "필수"

    public init(_ text: String, isRequired: Bool = false) {
        self.text = text
        self.isRequired = isRequired
        self.spec = JdLabelSpec.resolve()
    }

    public var body: some View {
        HStack(spacing: 0) {
            Text(text)
                .foregroundColor(JdToken.Color.foreground.color)
            if isRequired {
                Text(verbatim: "*")
                    .foregroundColor(JdToken.Color.danger.color)
                    // 웹 margin-inline-start var(--jd-space-0-5)
                    .padding(.leading, spec.markerSpacing)
            }
        }
        .font(
            JdSwiftUIFont.scaled(
                size: spec.fontSize,
                weight: spec.fontWeight,
                category: sizeCategory)
        )
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(accessibilityText))
    }

    private var accessibilityText: String {
        guard isRequired else { return text }
        return text.isEmpty ? Self.requiredWord : "\(text) \(Self.requiredWord)"
    }
}
