import UIKit
import JunDSCore

// 웹 jd-link 동형 — 앵커 프리미티브. A8 명명 규칙 Jd<이름>View(UIControl 서브클래스).
// 실제 열기는 시스템이 한다(UIApplication.open). 소비자가 onTap을 주면 라우터 등이
// 가로챌 수 있고, 그때는 시스템 열기를 하지 않는다(웹의 라우터 가로채기 동형).
//
// ⚠️ UIControl이 소유한 이름(state/isEnabled/isSelected/isHighlighted)은 쓰지 않는다 — 실측 충돌 선례.
public final class JdLinkView: UIControl {

    public var text: String {
        didSet { applyContent() }
    }

    public var destination: URL?

    // 웹 external 동형 — 뒤에 심볼이 붙고 a11y 라벨에 안내가 합류한다
    public var isExternal: Bool {
        didSet { applyContent() }
    }

    // 웹 underline 동형(iOS엔 hover가 없어 always/none 2값으로 접힌다)
    public var underline: Bool {
        didSet { applyContent() }
    }

    /// 소비자 가로채기. 지정하면 destination 열기 대신 이 클로저만 실행된다.
    public var onTap: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let contentLabel = UILabel()
    let iconView = UIImageView()

    private let stack = UIStackView()
    private let variant: JdLinkVariant

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
        super.init(frame: .zero)

        contentLabel.adjustsFontForContentSizeCategory = true
        contentLabel.numberOfLines = 0
        iconView.contentMode = .center
        iconView.isAccessibilityElement = false // 장식 — 의미는 라벨이 싣는다 (04 §7.1)

        stack.axis = .horizontal
        stack.alignment = .firstBaseline
        stack.spacing = JdToken.Space.s1 // 웹 gap: var(--jd-space-1)
        stack.isUserInteractionEnabled = false
        stack.addArrangedSubview(contentLabel)
        stack.addArrangedSubview(iconView)
        addSubview(stack)

        stack.jd.layout {
            $0.edges.equalToSuperview()
        }

        isAccessibilityElement = true
        accessibilityTraits = .link
        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyContent()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트·심볼과 속성 문자열은 수동 재구성
        applyContent()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private func applyContent() {
        // UILabel은 상속 서체가 없어 본문 기본(JdTextView 기본과 같은 md)을 쓴다
        let font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        let tint = JdLinkStyle.foreground(variant).uiColor
        var attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: tint,
        ]
        if underline {
            attributes[.underlineStyle] = NSUnderlineStyle.single.rawValue
            attributes[.underlineColor] = tint
        }
        contentLabel.attributedText = NSAttributedString(string: text, attributes: attributes)

        let symbolFont = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .xs).fontSize,
                                                 weight: JdToken.FontWeight.medium,
                                                 compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: symbolFont)
        // 웹 외부 링크 SVG(↗) 대응
        iconView.image = isExternal ? UIImage(systemName: "arrow.up.right") : nil
        iconView.tintColor = tint
        iconView.isHidden = !isExternal

        accessibilityLabel = JdLinkStyle.accessibilityText(text, isExternal: isExternal)
        invalidateIntrinsicContentSize()
    }

    @objc private func didTap() {
        if let onTap {
            onTap() // 소비자 가로채기 우선(라우터 등)
            return
        }
        guard let destination else { return } // 웹: href 없는 <a>는 비활성
        UIApplication.shared.open(destination)
    }
}

// 링크 색·문구 — SwiftUI 계층(JdLink)에 동형 사본이 있다(DEC-010으로 공유 불가).
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
