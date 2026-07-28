import JunDSCore
import UIKit

// 웹 jd-text 동형 — 본문 텍스트. A8 명명 규칙 Jd<이름>View(UILabel 서브클래스 — UITextView 아님 주의).
// lineHeightMultiple(1.625)은 JdTextSpec에 보존하되 1차 구현은 UILabel 기본 행간
// (attributedText 미사용 — 계약 DESIGN §2.3, 한계는 DECISIONS 기록감).
public final class JdTextView: UILabel {

    // size는 UILabel 계열 API와 충돌 → textSize (DESIGN §2.3)
    public var textSize: JdTextSize {
        didSet { applyStyle() }
    }

    // 웹 dimmed attribute 동형 — muted 색 전환
    public var dimmed: Bool {
        didSet { applyStyle() }
    }

    // 웹 mono attribute 동형 — 모노스페이스 패밀리 전환
    public var mono: Bool {
        didSet { applyStyle() }
    }

    private let weight: CGFloat

    public init(
        _ text: String,
        size: JdTextSize = .md,
        weight: CGFloat = JdToken.FontWeight.normal,
        dimmed: Bool = false,
        mono: Bool = false
    ) {
        self.textSize = size
        self.weight = weight
        self.dimmed = dimmed
        self.mono = mono
        super.init(frame: .zero)

        self.text = text
        numberOfLines = 0  // 웹 p 동형 — 기본 다행
        adjustsFontForContentSizeCategory = true
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    private func applyStyle() {
        let spec = JdTextSpec.resolve(size: textSize)
        font =
            mono
            ? JdFontBridge.scaledMonoFont(
                size: spec.fontSize, weight: weight, compatibleWith: traitCollection)
            : JdFontBridge.scaledFont(
                size: spec.fontSize, weight: weight, compatibleWith: traitCollection)
        textColor = (dimmed ? JdToken.Color.muted : JdToken.Color.foreground).uiColor
    }
}
