import JunDSCore
import SwiftUI

// 웹 jd-divider 동형 — 1px 구분선 (DESIGN §2.2).
// 웹의 수평 margin-block 16px은 이식하지 않는다 — 간격은 소비자 스택 spacing 몫.
// role=separator의 iOS 번역: 장식(라벨 없으면 accessibilityHidden, 라벨 있으면 그 텍스트만 노출).
public struct JdDivider: View {
    private let orientation: JdOrientation
    private let label: String?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(orientation: JdOrientation = .horizontal, label: String? = nil) {
        self.orientation = orientation
        self.label = label
    }

    public var body: some View {
        if let label, !label.isEmpty {
            labeled(label)
                // 라벨 텍스트만 노출 — separator는 장식이라 traits 없음
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(label))
        } else {
            line
                .accessibilityHidden(true)
        }
    }

    // 웹 line—label—line 동형, gap 12(--jd-space-3). 라벨 = footnote(sm 13pt)·muted.
    @ViewBuilder
    private func labeled(_ text: String) -> some View {
        let labelText = Text(text)
            .font(
                JdSwiftUIFont.scaled(
                    size: JdToken.FontSize.sm,
                    weight: JdToken.FontWeight.normal,
                    category: sizeCategory)
            )
            .foregroundColor(JdToken.Color.muted.color)
        switch orientation {
        case .horizontal:
            HStack(spacing: JdToken.Space.s3) {
                line
                labelText
                line
            }
        case .vertical:
            VStack(spacing: JdToken.Space.s3) {
                line
                labelText
                line
            }
        }
    }

    // 두께 JdToken.Border.thin(웹 1px 동형) 고정, 길이는 부모가 준 만큼 stretch
    @ViewBuilder
    private var line: some View {
        switch orientation {
        case .horizontal:
            Rectangle()
                .fill(JdToken.Color.border.color)
                .frame(height: JdToken.Border.thin)
                .frame(maxWidth: .infinity)
        case .vertical:
            Rectangle()
                .fill(JdToken.Color.border.color)
                .frame(width: JdToken.Border.thin)
                .frame(maxHeight: .infinity)
        }
    }
}
