import UIKit
import JunDSCore

// 웹 jd-hot-pct-chip 동형 — "급등" 강조 알약. (DEC-040)
//
// 늘 상승 표기다("↑ n%") — 부호·색 분기가 없는 것이 정체성이다. 세로 그라디언트도 그렇다:
// 웹 v2는 위를 밝게 뒀다가 흰 글자 대비가 부족해 v3가 뒤집었고, iOS는 교정본을 따른다.
//
// 알약 반경은 리터럴이 아니라 **높이의 절반**이다 — Dynamic Type에서 높이가 자라도
// 알약 모양이 유지된다(SwiftUI 쪽 Capsule과 같은 계약).
public final class JdHotPctChipView: UIView {

    public var pct: Double {
        didSet { applyContent() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let valueLabel = UILabel()

    private let gradient = CAGradientLayer()
    private var spec: JdHotPctChipSpec

    public init(pct: Double) {
        self.pct = pct
        self.spec = JdHotPctChipSpec.resolve()
        super.init(frame: .zero)

        valueLabel.adjustsFontForContentSizeCategory = true
        valueLabel.numberOfLines = 1
        valueLabel.textAlignment = .center

        gradient.startPoint = CGPoint(x: 0.5, y: 0)
        gradient.endPoint = CGPoint(x: 0.5, y: 1)
        layer.insertSublayer(gradient, at: 0)
        layer.masksToBounds = true

        addSubview(valueLabel)
        valueLabel.jd.layout {
            $0.top.equalToSuperview().inset(spec.vPadding)
            $0.bottom.equalToSuperview().inset(spec.vPadding)
            $0.leading.equalToSuperview().inset(spec.hPadding)
            $0.trailing.equalToSuperview().inset(spec.hPadding)
        }

        applyStyle()
        applyContent()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        gradient.frame = bounds
        // 알약 — 높이 기준이라 폰트가 자라도 모양이 유지된다
        layer.cornerRadius = bounds.height / 2
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // CAGradientLayer는 다이내믹 컬러를 자동 해석하지 않는다 — trait로 직접 해석해 다시 넣는다
        applyStyle()
    }

    // MARK: 내부

    private func applyStyle() {
        valueLabel.textColor = spec.foreground.uiColor
        valueLabel.font = JdFontBridge.scaledDigitFont(size: spec.fontSize,
                                                      weight: spec.fontWeight,
                                                      compatibleWith: traitCollection)
        gradient.colors = [
            spec.gradientTop.uiColor.resolvedColor(with: traitCollection).cgColor,
            spec.gradientBottom.uiColor.resolvedColor(with: traitCollection).cgColor,
        ]
    }

    private func applyContent() {
        valueLabel.text = JdHotPctChipSpec.text(pct)
        // "↑"는 VoiceOver가 읽지 않거나 "위쪽 화살표"로 읽는다 — 뜻을 말로 준다
        accessibilityLabel = "급등 " + JdFinanceFormat.percentText(pct,
                                                                  decimals: 2,
                                                                  showSign: false,
                                                                  withPercent: true)
    }

    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }
}
