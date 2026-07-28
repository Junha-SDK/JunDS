import JunDSCore
import UIKit

// 웹 jd-price-badge 동형 — 등락률 + 추세 화살표. (DEC-040)
//
// JdLivePctBadgeView와 판정 규칙이 다르다: 여기 flat은 **정확히 0**(확정된 일봉 등락률),
// live 쪽은 |v| < 0.005(잘게 흔들리는 실시간 틱)다. 웹도 상속하지 않고 독립 구현했다.
//
// 화살표는 SF Symbols다 — 웹 lucide 폴리라인의 번역이며 서드파티 0 규칙을 지킨다.
public final class JdPriceBadgeView: UIView {

    public var pct: Double {
        didSet { resolveAndApply() }
    }

    public var size: JdPriceBadgeSize {
        didSet { resolveAndApply() }
    }

    /// 웹 showArrow=true 기본. flat이면 값과 무관하게 화살표가 없다.
    public var showArrow: Bool {
        didSet { resolveAndApply() }
    }

    /// 웹 bold=true 기본. false면 굵기를 medium(500)으로 낮춘다.
    public var bold: Bool {
        didSet { resolveAndApply() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let arrow = UIImageView()
    let valueLabel = UILabel()

    private let contentStack: JdStackView
    private var spec: JdPriceBadgeSpec

    public init(
        pct: Double,
        size: JdPriceBadgeSize = .md,
        showArrow: Bool = true,
        bold: Bool = true
    ) {
        self.pct = pct
        self.size = size
        self.showArrow = showArrow
        self.bold = bold
        self.spec = JdPriceBadgeSpec.resolve(pct: pct, size: size, showArrow: showArrow, bold: bold)
        self.contentStack = JdStackView(
            axis: .horizontal,
            gap: .custom(spec.gap),
            alignment: .center)
        super.init(frame: .zero)

        arrow.contentMode = .scaleAspectFit
        arrow.isAccessibilityElement = false  // 추세는 아래 라벨이 말한다
        valueLabel.adjustsFontForContentSizeCategory = true
        valueLabel.numberOfLines = 1

        contentStack.addArrangedSubview(arrow)
        contentStack.addArrangedSubview(valueLabel)
        addSubview(contentStack)

        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public var trend: JdTrend {
        JdTrend.resolve(pct, policy: .exact)
    }

    /// 웹 표시 문자열 — 양수만 "+", 소수 2자리 고정(로케일 비의존)
    public var formatted: String {
        JdFinanceFormat.percentText(pct, decimals: 2, showSign: true, withPercent: true)
    }

    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부

    private func resolveAndApply() {
        spec = JdPriceBadgeSpec.resolve(pct: pct, size: size, showArrow: showArrow, bold: bold)
        applyStyle()
        applyContent()
    }

    private func applyStyle() {
        let color = spec.color.uiColor
        valueLabel.textColor = color
        valueLabel.font = JdFontBridge.scaledDigitFont(
            size: spec.fontSize,
            weight: spec.fontWeight,
            compatibleWith: traitCollection)
        arrow.tintColor = color
        // 심볼도 폰트 스케일을 따라가야 Dynamic Type에서 글자와 같이 자란다
        let symbolFont = JdFontBridge.scaledFont(
            size: spec.iconSize,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        arrow.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: symbolFont)
    }

    private func applyContent() {
        valueLabel.text = formatted
        if spec.showsArrow, let symbol = JdPriceBadgeSpec.symbolName(trend) {
            arrow.image = UIImage(systemName: symbol)
            arrow.isHidden = false
        } else {
            arrow.image = nil
            arrow.isHidden = true
        }
        accessibilityLabel = JdLivePctBadgeView.accessibilityText(
            trend: trend, formatted: formatted)
    }
}
