import JunDSCore
import SwiftUI
import UIKit

// 웹 jd-banner의 SwiftUI 번역 — 폭 꽉 찬 알림 바 (DESIGN-4 §B).
// 배경 = variant.color, 흰 글자. variant.color(info 등)는 밝아 흰 글자 대비가 약하므로
// resolvedColor 후 foreground 20%를 혼합해 눌러준다(대비 확보).
// ⚠️ Core에 온-액센트(흰) 전경 토큰이 없어 흰 글자는 시스템 상수 Color.white를 쓴다(notes 참조).
public struct JdBanner: View {
    private let message: String
    private let variant: JdFeedbackVariant
    private let actionLabel: String?
    private let onAction: (() -> Void)?
    private let isDismissible: Bool
    private let onDismiss: (() -> Void)?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ message: String,
        variant: JdFeedbackVariant = .info,
        actionLabel: String? = nil,
        onAction: (() -> Void)? = nil,
        isDismissible: Bool = false,
        onDismiss: (() -> Void)? = nil
    ) {
        self.message = message
        self.variant = variant
        self.actionLabel = actionLabel
        self.onAction = onAction
        self.isDismissible = isDismissible
        self.onDismiss = onDismiss
    }

    public var body: some View {
        HStack(spacing: JdToken.Space.s3) {
            Text(message)
                .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.medium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)

            if let actionLabel, let onAction {
                Button(action: onAction) {
                    Text(actionLabel)
                        .jdFont(size: JdToken.FontSize.md, weight: JdToken.FontWeight.semibold)
                        .foregroundColor(.white)
                }
                .accessibilityLabel(Text(actionLabel))
            }

            if isDismissible {
                Button {
                    onDismiss?()
                } label: {
                    Image(systemName: "xmark")
                        .jdFont(size: JdToken.FontSize.sm, weight: JdToken.FontWeight.medium)
                        .foregroundColor(.white)
                }
                .accessibilityLabel(Text("닫기"))
            }
        }
        .padding(.horizontal, JdToken.Space.s4)
        .padding(.vertical, JdToken.Space.s3)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(JdBannerPalette.background(variant).color)
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
        .accessibilityElement(children: .contain)
    }
}

// resolvedColor 후 혼합 — 다이나믹 프로바이더 안에서 트레이트별로 풀고 섞어 라이트/다크를 함께 지킨다.
// UIKit 계층(JdBannerView)에 동형 사본이 있다(DEC-010으로 공유 불가).
enum JdBannerPalette {
    static func background(_ variant: JdFeedbackVariant) -> JdBannerResolvedColor {
        JdBannerResolvedColor(variant: variant)
    }
}

struct JdBannerResolvedColor {
    let variant: JdFeedbackVariant

    var color: Color { Color(uiColor) }

    var uiColor: UIColor {
        UIColor { trait in
            let base = variant.color.uiColor.resolvedColor(with: trait)
            let fg = JdToken.Color.foreground.uiColor.resolvedColor(with: trait)
            return JdBannerBlend.mix(base, fg, ratio: CGFloat(JdToken.Opacity.o20))
        }
    }
}

enum JdBannerBlend {
    static func mix(_ base: UIColor, _ overlay: UIColor, ratio: CGFloat) -> UIColor {
        var r1: CGFloat = 0
        var g1: CGFloat = 0
        var b1: CGFloat = 0
        var a1: CGFloat = 0
        var r2: CGFloat = 0
        var g2: CGFloat = 0
        var b2: CGFloat = 0
        var a2: CGFloat = 0
        base.getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
        overlay.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)
        let t = ratio
        return UIColor(
            red: r1 * (1 - t) + r2 * t,
            green: g1 * (1 - t) + g2 * t,
            blue: b1 * (1 - t) + b2 * t,
            alpha: a1 * (1 - t) + a2 * t)
    }
}
