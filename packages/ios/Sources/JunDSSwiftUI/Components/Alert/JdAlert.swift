import SwiftUI
import UIKit
import JunDSCore

// 웹 jd-alert의 SwiftUI 번역 — 좌측 강조선 + 5% 틴트의 인라인 피드백 (DESIGN-4 §B).
// iOS 시스템 대응(.alert)은 모달 다이얼로그라 다르다 → 인라인 블록은 자체 구현이 정본.
// role은 danger/warning만 라이브 리전으로 올린다(웹 판정 승계) — 나머지는 조용한 정보 블록.
public struct JdAlert<Content: View>: View {
    private let title: String
    private let variant: JdFeedbackVariant
    private let isDismissible: Bool
    private let onDismiss: (() -> Void)?
    private let content: () -> Content

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ title: String,
                variant: JdFeedbackVariant = .info,
                isDismissible: Bool = false,
                onDismiss: (() -> Void)? = nil,
                @ViewBuilder content: @escaping () -> Content = { EmptyView() }) {
        self.title = title
        self.variant = variant
        self.isDismissible = isDismissible
        self.onDismiss = onDismiss
        self.content = content
    }

    // danger/warning만 어시스티브/폴라이트로 낭독한다 (Core announcePriority가 단일 소스)
    private var isAssertiveRole: Bool {
        variant == .danger || variant == .warning
    }

    public var body: some View {
        HStack(alignment: .top, spacing: 0) {
            // 좌측 3pt 강조선 — HStack 행 높이를 채운다
            Rectangle()
                .fill(variant.color.color)
                .frame(width: JdToken.Border.thick)

            VStack(alignment: .leading, spacing: JdToken.Space.s2) {
                Text(title)
                    .jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                    .foregroundColor(JdToken.Color.foreground.color)
                    // 웹 판정 승계: danger/warning는 정적 텍스트로 표식(라이브 리전 낭독은 onAppear)
                    .accessibilityAddTraits(isAssertiveRole ? .isStaticText : [])
                content()
                    .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.normal)
                    .foregroundColor(JdToken.Color.muted.color)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(JdToken.Space.s4)

            if isDismissible {
                Button {
                    onDismiss?()
                } label: {
                    Image(systemName: "xmark")
                        .jdFont(size: JdToken.FontSize.sm, weight: JdToken.FontWeight.medium)
                }
                .foregroundColor(JdToken.Color.muted.color)
                .padding(JdToken.Space.s3)
                .accessibilityLabel(Text("닫기"))
            }
        }
        .background(variant.color.color.opacity(JdToken.Opacity.o5))
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
        .accessibilityElement(children: .contain)
        .onAppear {
            // 시각 신호만으로는 AT에 닿지 않는다 — danger/warning만 라이브 리전으로 낭독 (04 §7.1)
            if isAssertiveRole {
                JdAnnouncer.announce(title, priority: variant.announcePriority)
            }
        }
    }
}
