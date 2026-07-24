import UIKit
import JunDSCore

// 웹 jd-highlight 동형 — 검색어 강조. UILabel + NSAttributedString.
//
// ⚠️ 타입명이 **JdHighlightTextView**인 이유: Core에 이미 `enum JdHighlight`(segments 계산)가
//    있고 우산 타겟이 Core/UIKit을 함께 재수출하므로 `JdHighlightView`로는 소비처에서 두 이름이
//    가깝게 충돌한다. Core 우선 — 뷰가 이름을 양보한다(SwiftUI 사본은 JdHighlightText).
//
// 구간 계산은 **전부 Core의 JdHighlight.segments**다. 이 파일은 세그먼트 순서대로 range를
// 칠하기만 한다 (04 §4.2 규칙 2 — 자체 매칭 금지).
public final class JdHighlightTextView: UILabel {

    public var content: String {
        didSet { applyContent() }
    }

    // 웹 query attribute 동형 — 빈 문자열이면 전체가 비매치 1구간이다(Core 판정)
    public var query: String {
        didSet { applyContent() }
    }

    public var color: JdMarkColor {
        didSet { applyContent() }
    }

    public init(_ text: String, query: String, color: JdMarkColor = .yellow) {
        self.content = text
        self.query = query
        self.color = color
        super.init(frame: .zero)

        numberOfLines = 0
        adjustsFontForContentSizeCategory = true
        applyContent()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트와 속성 문자열은 수동 재구성
        applyContent()
        invalidateIntrinsicContentSize()
    }

    private func applyContent() {
        // UILabel은 상속 서체가 없어 본문 기본(JdTextView 기본과 같은 md)을 쓴다
        let font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        let result = NSMutableAttributedString()
        for segment in JdHighlight.segments(text: content, query: query) {
            var attributes: [NSAttributedString.Key: Any] = [.font: font]
            if segment.isMatch {
                attributes[.foregroundColor] = JdMarkPalette.foreground(color).uiColor
                attributes[.backgroundColor] = JdMarkPalette.background(color).uiColor
            } else {
                attributes[.foregroundColor] = JdToken.Color.foreground.uiColor
            }
            result.append(NSAttributedString(string: segment.text, attributes: attributes))
        }
        attributedText = result

        // 조각을 나눠 읽히지 않도록 원문 전체를 라벨 1개로 노출한다 (04 §7.1)
        isAccessibilityElement = true
        accessibilityLabel = content
        invalidateIntrinsicContentSize()
    }
}
