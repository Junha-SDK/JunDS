import JunDSCore
import UIKit

// 웹 jd-hashtag 동형 — `#tag` 링크 칩. UILabel 기반(텍스트 런이라 인라인이 정본).
//
// ⚠️ 타입명이 **JdHashtagLabelView**인 이유: Core에 이미 `enum JdHashtag`(displayText/countText)가
//    있고 우산 타겟이 Core/UIKit을 함께 재수출하므로 `JdHashtagView`는 Core 타입과 한 글자
//    차이로 겹쳐 읽힌다. Core 우선 — 뷰가 이름을 양보한다(SwiftUI 사본은 JdHashtagLabel).
//
// 표시 문자열·카운트 축약은 **전부 Core**다(JdHashtag.displayText / countText — 자체 포맷 금지).
public final class JdHashtagLabelView: UILabel {

    // ⚠️ `tag`는 UIView가 소유한 이름(Int)이라 오버라이드 충돌이다 — hashtag로 비킨다
    //    (JdTextView.textSize 선례). init 인자 라벨은 계약대로 `tag:`를 유지한다.
    public var hashtag: String {
        didSet { applyContent() }
    }

    /// nil이면 게시물 수를 표시하지 않는다(웹 NaN 동형)
    public var count: Int? {
        didSet { applyContent() }
    }

    public var isTrending: Bool {
        didSet { applyContent() }
    }

    /// 링크 열기는 소비자 몫(라우터·UIApplication.open) — 웹 href 자리다
    public var onTap: (() -> Void)?

    public init(
        tag: String,
        count: Int? = nil,
        isTrending: Bool = false,
        onTap: (() -> Void)? = nil
    ) {
        self.hashtag = tag
        self.count = count
        self.isTrending = isTrending
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

    private var displayText: String { JdHashtag.displayText(tag: hashtag) }

    /// 웹 `(${formatCount(count)})` — 숫자 자체는 Core가 만들고 괄호만 표기 규약이다
    private var countText: String? {
        count.map { "(\(JdHashtag.countText($0)))" }
    }

    private func applyContent() {
        // UILabel은 상속 서체가 없어 본문 기본(JdTextView 기본과 같은 md) + 웹 medium 굵기
        let font = JdFontBridge.scaledFont(
            size: JdTextSpec.resolve(size: .md).fontSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        let result = NSMutableAttributedString(
            string: displayText,
            attributes: [
                .font: font,
                .foregroundColor: JdToken.Color.primary.uiColor,
            ])

        if isTrending {
            // 웹은 🔥 이모지 — SF Symbol로 옮기고 색은 토큰(warning)에서 읽는다
            result.append(NSAttributedString(string: " "))
            result.append(
                JdMentionStyle.symbolRun(
                    "flame.fill",
                    color: JdToken.Color.warning,
                    traits: traitCollection))
        }

        if let countText {
            result.append(
                NSAttributedString(
                    string: " " + countText,
                    attributes: [
                        .font: JdFontBridge.scaledFont(
                            size: JdMentionStyle.markFontSize,
                            weight: JdToken.FontWeight.normal,
                            compatibleWith: traitCollection),
                        .foregroundColor: JdToken.Color.muted.uiColor,  // 웹 .jd-hashtag__count
                    ]))
        }

        attributedText = result
        accessibilityLabel = accessibilityText
        invalidateIntrinsicContentSize()
    }

    private var accessibilityText: String {
        var parts = [displayText]
        if isTrending { parts.append(JdMentionStyle.trendingLabel) }
        if let count { parts.append(JdHashtag.countText(count)) }
        return parts.joined(separator: ", ")
    }

    @objc private func didTap() {
        onTap?()
    }
}
