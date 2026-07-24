import UIKit
import JunDSCore

// 웹 jd-label 동형 — 폼 라벨 (DESIGN-2 §B1). A8 명명 규칙 Jd<이름>View(UILabel 서브클래스).
// required 표식은 웹이 CSS ::after로 그려 AT에 아무것도 알리지 않는다(순수 시각 표식) —
// iOS는 표식을 장식으로 두지 않고 접근성 라벨에 "필수"로 합류시켜 그 결함을 보정한다.
// 표시 텍스트의 단일 소스는 rawText이고, 표식은 attributedText 런으로만 붙인다.
public final class JdLabelView: UILabel {

    // 웹 required attribute 동형 — "*" 표식 + 접근성 라벨 합류
    public var isRequired: Bool {
        didSet { applyStyle() }
    }

    // 표식 부착 전 원문 — 표시 텍스트의 단일 소스
    private var rawText: String

    /// 웹 리터럴 "*"가 뜻하는 바 — AT에 읽히는 말
    private static let requiredWord = "필수"
    private static let requiredMarker = "*"

    public init(_ text: String, isRequired: Bool = false) {
        self.rawText = text
        self.isRequired = isRequired
        super.init(frame: .zero)

        numberOfLines = 0
        adjustsFontForContentSizeCategory = true
        isAccessibilityElement = true
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 소비자가 UILabel API로 텍스트를 바꿔도 표식·접근성 계약이 깨지지 않게 세터를 가로챈다
    public override var text: String? {
        get { super.text }
        set {
            rawText = newValue ?? ""
            applyStyle()
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    private func applyStyle() {
        let spec = JdLabelSpec.resolve()
        let scaled = JdFontBridge.scaledFont(size: spec.fontSize,
                                             weight: spec.fontWeight,
                                             compatibleWith: traitCollection)
        font = scaled
        textColor = JdToken.Color.foreground.uiColor

        if isRequired {
            let body = NSMutableAttributedString(
                string: rawText,
                attributes: [.font: scaled, .foregroundColor: JdToken.Color.foreground.uiColor]
            )
            // 표식 앞 여백(웹 margin-inline-start 2px)은 마지막 글자의 커닝으로 만든다.
            // 문자 단위 범위라 서로게이트 페어(이모지)를 쪼개지 않는다.
            if let last = rawText.indices.last {
                body.addAttribute(.kern,
                                  value: spec.markerSpacing,
                                  range: NSRange(last..<rawText.endIndex, in: rawText))
            }
            body.append(NSAttributedString(
                string: Self.requiredMarker,
                attributes: [.font: scaled, .foregroundColor: JdToken.Color.danger.uiColor]
            ))
            attributedText = body
            accessibilityLabel = rawText.isEmpty
                ? Self.requiredWord
                : "\(rawText) \(Self.requiredWord)"
        } else {
            attributedText = nil
            super.text = rawText
            accessibilityLabel = rawText
        }
    }
}
