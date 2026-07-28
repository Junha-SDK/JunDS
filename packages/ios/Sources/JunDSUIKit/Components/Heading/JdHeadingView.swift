import JunDSCore
import UIKit

// 웹 jd-heading 동형 — 레벨 램프는 JdHeadingSpec이 단일 소스 (DESIGN §2.1/2.3).
// uppercase 레벨(L6)은 표시만 대문자화 — 원문은 별도 보존해 레벨 변경 시 복원하고,
// VoiceOver는 원문으로 읽는다(웹 text-transform 동형).
public final class JdHeadingView: UILabel {

    public var level: JdHeadingLevel {
        didSet { applyStyle() }
    }

    // 대문자 변환 전 원문 — 표시 텍스트의 단일 소스
    private var rawText: String

    public init(_ text: String, level: JdHeadingLevel = .h2) {
        self.rawText = text
        self.level = level
        super.init(frame: .zero)

        numberOfLines = 0
        adjustsFontForContentSizeCategory = true
        isAccessibilityElement = true
        accessibilityTraits = .header
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 소비자가 UILabel API로 텍스트를 바꿔도 원문 보존이 깨지지 않게 세터를 가로챈다
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
        let spec = JdHeadingSpec.resolve(level: level)
        super.text = spec.uppercase ? rawText.uppercased() : rawText
        font = JdFontBridge.scaledFont(
            size: spec.fontSize, weight: spec.fontWeight, compatibleWith: traitCollection)
        textColor = JdToken.Color.foreground.uiColor
        accessibilityLabel = rawText  // 대문자 변환 전 원문으로 읽기
    }
}
