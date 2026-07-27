import UIKit
import JunDSCore

// 웹 jd-live-stacked-cell 동형 — 현재가 + 등락률 2단 우측정렬 셀. (DEC-041)
//
// 리프를 조립하지 않고 독립 구현한다: 이 셀은 두 값을 **한 색으로 묶는다**(색 통로 하나).
// 판정은 `.gainOrEven` — 0%도 상승 쪽이다.
public final class JdLiveStackedCellView: UIView {

    public var price: Double { didSet { resolveAndApply() } }
    public var change: Double { didSet { resolveAndApply() } }
    public var priceFallback: Double { didSet { resolveAndApply() } }
    public var pctFallback: Double { didSet { resolveAndApply() } }
    public var priceDecimals: Int { didSet { applyContent() } }
    public var pctDecimals: Int { didSet { applyContent() } }
    public var locale: String { didSet { applyContent() } }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let priceLabel = UILabel()
    let pctLabel = UILabel()

    private let contentStack: JdStackView
    private var spec: JdLiveStackedCellSpec

    public init(price: Double,
                change: Double,
                priceFallback: Double = 0,
                pctFallback: Double = 0,
                priceDecimals: Int = 0,
                pctDecimals: Int = 2,
                locale: String = "ko-KR") {
        self.price = price
        self.change = change
        self.priceFallback = priceFallback
        self.pctFallback = pctFallback
        self.priceDecimals = priceDecimals
        self.pctDecimals = pctDecimals
        self.locale = locale
        self.spec = JdLiveStackedCellSpec.resolve(
            change: JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        )
        // 표 오른쪽 열에서 숫자 끝이 맞아야 읽힌다 — trailing 정렬이 계약이다
        self.contentStack = JdStackView(axis: .vertical, gap: .custom(0), alignment: .trailing)
        super.init(frame: .zero)

        for label in [priceLabel, pctLabel] {
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 1
            label.textAlignment = .right
        }
        contentStack.addArrangedSubview(priceLabel)
        contentStack.addArrangedSubview(pctLabel)
        addSubview(contentStack)
        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 두 줄의 확정 문자열 — 소비자·테스트 공용
    public var lines: (price: String, pct: String) {
        JdLiveStackedCellSpec.lines(price: price,
                                    change: change,
                                    priceFallback: priceFallback,
                                    pctFallback: pctFallback,
                                    priceDecimals: priceDecimals,
                                    pctDecimals: pctDecimals,
                                    locale: locale)
    }

    /// 두 줄이 따로 읽히면 가격과 등락률의 관계가 사라진다
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
        spec = JdLiveStackedCellSpec.resolve(
            change: JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        )
        applyStyle()
        applyContent()
    }

    private func applyStyle() {
        let color = spec.color.uiColor
        priceLabel.textColor = color
        pctLabel.textColor = color
        priceLabel.font = JdFontBridge.scaledDigitFont(size: spec.priceFontSize,
                                                      weight: spec.priceFontWeight,
                                                      compatibleWith: traitCollection)
        pctLabel.font = JdFontBridge.scaledDigitFont(size: spec.pctFontSize,
                                                    weight: spec.pctFontWeight,
                                                    compatibleWith: traitCollection)
    }

    private func applyContent() {
        let text = lines
        priceLabel.text = text.price
        pctLabel.text = text.pct
        accessibilityLabel = JdLiveStackedCellSpec.accessibilityText(
            price: text.price,
            pct: text.pct,
            change: JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        )
    }
}
