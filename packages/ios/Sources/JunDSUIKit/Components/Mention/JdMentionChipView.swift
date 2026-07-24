import UIKit
import JunDSCore

// 웹 jd-mention-chip 동형 — `@handle` 표시용 링크 칩. UILabel 기반(텍스트 런이라 인라인이 정본).
//
// ⚠️ 타입명이 **JdMentionLabelView**인 이유: Core에 이미 `enum JdMentionChip`(displayText 규칙)이
//    있고 우산 타겟이 Core/UIKit을 함께 재수출하므로 `JdMentionChipView`는 Core 타입과 한 글자
//    차이로 겹쳐 읽힌다. Core 우선 — 뷰가 이름을 양보한다(SwiftUI 사본은 JdMentionLabel).
//
// 표시 문자열은 **전부 Core의 JdMentionChip.displayText**다(label 폴백 규칙 재구현 금지).
public final class JdMentionLabelView: UILabel {

    public var handle: String {
        didSet { applyContent() }
    }

    /// 웹 label attribute 동형 — 비면 "@handle"로 폴백한다(판정은 Core)
    public var label: String {
        didSet { applyContent() }
    }

    public var isVerified: Bool {
        didSet { applyContent() }
    }

    /// 링크 열기는 소비자 몫(라우터·UIApplication.open) — 웹 href 자리다
    public var onTap: (() -> Void)?

    public init(handle: String,
                label: String = "",
                isVerified: Bool = false,
                onTap: (() -> Void)? = nil) {
        self.handle = handle
        self.label = label
        self.isVerified = isVerified
        self.onTap = onTap
        super.init(frame: .zero)

        numberOfLines = 0
        adjustsFontForContentSizeCategory = true
        isUserInteractionEnabled = true
        addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTap)))

        isAccessibilityElement = true
        accessibilityTraits = .link
        applyContent()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 심볼 첨부는 해석된 색으로 굽기 때문에(alwaysOriginal) 테마 전환 시 재구성이 필요하다
        applyContent()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private var displayText: String {
        JdMentionChip.displayText(handle: handle, label: label)
    }

    private func applyContent() {
        // UILabel은 상속 서체가 없어 본문 기본(JdTextView 기본과 같은 md) + 웹 medium 굵기
        let font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                           weight: JdToken.FontWeight.medium,
                                           compatibleWith: traitCollection)
        let result = NSMutableAttributedString(string: displayText, attributes: [
            .font: font,
            .foregroundColor: JdToken.Color.primary.uiColor,
        ])

        if isVerified {
            // 웹은 텍스트 "✓" + aria-label — iOS는 SF Symbol로 옮기고 의미는 라벨이 싣는다
            result.append(NSAttributedString(string: " "))
            result.append(JdMentionStyle.symbolRun("checkmark.seal.fill",
                                                   color: JdToken.Color.primary,
                                                   traits: traitCollection))
        }

        attributedText = result
        accessibilityLabel = isVerified
            ? "\(displayText), \(JdMentionStyle.verifiedLabel)"
            : displayText
        invalidateIntrinsicContentSize()
    }

    @objc private func didTap() {
        onTap?()
    }
}

// 멘션·해시태그 공용 문구/치수/심볼 — SwiftUI 계층에 동형 사본이 있다(DEC-010으로 공유 불가).
enum JdMentionStyle {
    /// 웹 verifiedLabel/trendingLabel 기본값 리터럴 승계
    static let verifiedLabel = "인증됨"
    static let trendingLabel = "인기 태그"

    /// 웹 보조 요소(✓·🔥·카운트)는 11pt — 대응 토큰이 없어 JdTextSpec xs(12)로 옮긴다(notes 보고분)
    static var markFontSize: CGFloat { JdTextSpec.resolve(size: .xs).fontSize }

    static func markFont(_ traits: UITraitCollection) -> UIFont {
        JdFontBridge.scaledFont(size: markFontSize,
                                weight: JdToken.FontWeight.medium,
                                compatibleWith: traits)
    }

    /// SF Symbol을 텍스트 런에 인라인으로 얹는다(웹의 인라인 span 동형).
    /// 첨부 이미지엔 다이나믹 컬러를 실을 수 없어 현재 트레이트로 해석해 굽는다 —
    /// 그래서 호출부는 traitCollectionDidChange에서 재구성한다.
    static func symbolRun(_ name: String,
                          color: JdDynamicColor,
                          traits: UITraitCollection) -> NSAttributedString {
        let font = markFont(traits)
        let configuration = UIImage.SymbolConfiguration(font: font)
        guard let image = UIImage(systemName: name, withConfiguration: configuration)?
            .withTintColor(color.uiColor.resolvedColor(with: traits), renderingMode: .alwaysOriginal) else {
            return NSAttributedString()
        }
        let attachment = NSTextAttachment()
        attachment.image = image
        // 첨부는 베이스라인 기준이라 디센더만큼 내려 글줄 중앙에 맞춘다
        attachment.bounds = CGRect(x: 0, y: font.descender,
                                   width: image.size.width, height: image.size.height)
        return NSAttributedString(attachment: attachment)
    }
}
