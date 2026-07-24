import SwiftUI
import JunDSCore

// 웹 jd-link 동형 — 앵커 프리미티브 (DESIGN-3 §C).
// 실제 열기는 시스템이 한다(SwiftUI Link → openURL). destination이 nil이면 링크가 아니라
// 그냥 텍스트다(웹의 "href 없는 <a>는 비활성" 동형 — 탭 순서·접근성에서도 빠진다).
public struct JdLink: View {
    private let text: String
    private let destination: URL?
    private let variant: JdLinkVariant
    private let underline: Bool
    private let isExternal: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ text: String,
                destination: URL?,
                variant: JdLinkVariant = .default,
                underline: Bool = true,
                isExternal: Bool = false) {
        self.text = text
        self.destination = destination
        self.variant = variant
        self.underline = underline
        self.isExternal = isExternal
    }

    @ViewBuilder
    public var body: some View {
        if let destination {
            Link(destination: destination) { run }
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text(JdLinkStyle.accessibilityText(text, isExternal: isExternal)))
                .accessibilityAddTraits(.isLink)
        } else {
            run
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text(JdLinkStyle.accessibilityText(text, isExternal: isExternal)))
        }
    }

    // MARK: 내부

    private var run: some View {
        HStack(spacing: JdToken.Space.s1) { // 웹 gap: var(--jd-space-1)
            Text(text)
                .underline(underline, color: JdLinkStyle.foreground(variant).color)
            if isExternal {
                // 웹의 외부 링크 SVG 대응 — 장식이라 AT에서 감추고 의미는 라벨이 싣는다
                Image(systemName: "arrow.up.right")
                    .font(JdSwiftUIFont.scaled(size: JdTextSpec.resolve(size: .xs).fontSize,
                                               weight: JdToken.FontWeight.medium,
                                               category: sizeCategory))
                    .accessibilityHidden(true)
            }
        }
        .foregroundColor(JdLinkStyle.foreground(variant).color)
    }
}

// 링크 색·문구 — UIKit 계층(JdLinkView)에 동형 사본이 있다(DEC-010으로 공유 불가).
enum JdLinkStyle {
    /// ⚠️ Core JdLinkVariant는 `default/primary/muted`인데 웹 jd-link는 `default(primary 색)/
    ///    subtle(foreground)/muted/danger`다. 패리티 기준(웹 `.jd-link { color: primary }`)을
    ///    지켜 default를 primary로 해석하므로 **default와 primary가 같은 색으로 결의된다**.
    ///    어휘 재심의(둘 중 하나를 웹 subtle로 되돌릴지)는 Core 몫 — notes 보고분.
    static func foreground(_ variant: JdLinkVariant) -> JdDynamicColor {
        switch variant {
        case .default, .primary: return JdToken.Color.primary
        case .muted: return JdToken.Color.muted
        }
    }

    /// 웹은 외부 링크를 아이콘으로만 알린다(AT 무노출) — iOS는 라벨에 합류시켜 보정한다 (04 §7.1)
    static let externalHint = "새 창에서 열림"

    static func accessibilityText(_ text: String, isExternal: Bool) -> String {
        isExternal ? "\(text), \(externalHint)" : text
    }
}
