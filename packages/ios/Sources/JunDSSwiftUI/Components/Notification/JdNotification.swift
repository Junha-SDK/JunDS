import SwiftUI
import JunDSCore

// 웹 jd-notification의 SwiftUI 번역 — 인라인 카드(아이콘+제목+설명+액션+닫기) (DESIGN-4 §B).
// 30% 테두리 + 5% 틴트로 variant를 색만이 아니라 형태로도 구분한다. 색은 Core variant.color가 단일 소스.
public struct JdNotification<Extra: View>: View {
    private let title: String?
    private let description: String?
    private let variant: JdFeedbackVariant
    private let systemImage: String?
    private let isDismissible: Bool
    private let onDismiss: (() -> Void)?
    private let extra: () -> Extra

    @Environment(\.sizeCategory) private var sizeCategory

    public init(title: String? = nil,
                description: String? = nil,
                variant: JdFeedbackVariant = .info,
                systemImage: String? = nil,
                isDismissible: Bool = false,
                onDismiss: (() -> Void)? = nil,
                @ViewBuilder extra: @escaping () -> Extra = { EmptyView() }) {
        self.title = title
        self.description = description
        self.variant = variant
        self.systemImage = systemImage
        self.isDismissible = isDismissible
        self.onDismiss = onDismiss
        self.extra = extra
    }

    public var body: some View {
        HStack(alignment: .top, spacing: JdToken.Space.s3) {
            if let systemImage {
                Image(systemName: systemImage)
                    .jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                    .foregroundColor(variant.color.color)
                    .accessibilityHidden(true) // 아이콘은 장식 — 제목/설명이 표면
            }

            VStack(alignment: .leading, spacing: JdToken.Space.s2) {
                if let title {
                    Text(title)
                        .jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                        .foregroundColor(JdToken.Color.foreground.color)
                }
                if let description {
                    Text(description)
                        .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                        .foregroundColor(JdToken.Color.muted.color)
                }
                extra()
                    .padding(.top, JdToken.Space.s1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            if isDismissible {
                Button {
                    onDismiss?()
                } label: {
                    Image(systemName: "xmark")
                        .jdFont(size: JdToken.FontSize.sm, weight: JdToken.FontWeight.medium)
                }
                .foregroundColor(JdToken.Color.muted.color)
                .accessibilityLabel(Text("닫기"))
            }
        }
        .padding(JdToken.Space.s4)
        .background(variant.color.color.opacity(JdToken.Opacity.o5))
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous)
                .strokeBorder(variant.color.color.opacity(JdToken.Opacity.o30),
                              lineWidth: JdToken.Border.thin)
        )
        .accessibilityElement(children: .contain)
    }
}
