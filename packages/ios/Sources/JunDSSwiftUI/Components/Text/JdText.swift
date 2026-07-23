import SwiftUI
import JunDSCore

// 웹 jd-text 동형 — 본문 텍스트 (DESIGN §2.2).
// dimmed → JdToken.Color.muted (웹에선 스타일 prop color보다 우선 — iOS 표면엔 color prop이
// 없으므로 dimmed/기본(foreground) 2값), mono → 모노스페이스 패밀리, truncate/lineClamp → lineLimit.
public struct JdText: View {
    private let text: String
    private let spec: JdTextSpec
    private let weight: CGFloat
    private let dimmed: Bool
    private let mono: Bool
    private let lineLimit: Int?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ text: String,
                size: JdTextSize = .md,
                weight: CGFloat = JdToken.FontWeight.normal,
                dimmed: Bool = false,
                mono: Bool = false,
                lineLimit: Int? = nil) {
        self.text = text
        self.spec = JdTextSpec.resolve(size: size)
        self.weight = weight
        self.dimmed = dimmed
        self.mono = mono
        self.lineLimit = lineLimit
    }

    public var body: some View {
        Text(text)
            .font(font)
            .foregroundColor((dimmed ? JdToken.Color.muted : JdToken.Color.foreground).color)
            // 웹 line-height relaxed(1.625)의 근사 — (multiple−1)×fontSize (DESIGN §2.3)
            .lineSpacing((spec.lineHeightMultiple - 1) * spec.fontSize)
            .lineLimit(lineLimit)
            .truncationMode(.tail) // lineLimit 초과분은 웹 truncate/lineClamp 동형(말줄임)
    }

    private var font: Font {
        if mono {
            return JdSwiftUIFont.scaledMono(size: spec.fontSize, weight: weight, category: sizeCategory)
        }
        return JdSwiftUIFont.scaled(size: spec.fontSize, weight: weight, category: sizeCategory)
    }
}
