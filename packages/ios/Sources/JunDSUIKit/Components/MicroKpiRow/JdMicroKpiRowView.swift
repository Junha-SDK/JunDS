import UIKit
import JunDSCore

// 웹 jd-live-micro-kpi-row 동형 — 보조 KPI 소형 셀 묶음. (DEC-041)
//
// **배치를 스스로 소유한다.** 웹은 호스트를 display:contents로 두어 격자 정의를 소비자에게
// 넘겼고, UIKit에서 그 선택지는 "소비자가 UICollectionViewCompositionalLayout을 세운다"였다.
// 여기서는 JdWrapView(equalWidths)가 폭에 맞춰 열 수를 정하고 셀 높이를 행 단위로 맞춘다 —
// 소비자는 items만 넘긴다.
public final class JdMicroKpiRowView: UIView {

    public var items: [JdMicroKpiItem] {
        didSet { rebuild() }
    }

    /// 셀 최소 폭 — 이보다 좁아지면 한 행의 열 수가 줄어든다.
    /// 웹의 중단점 나열(`grid-cols-2 md:grid-cols-4`) 대신 최소 폭 하나로 정한다:
    /// iOS는 기기 폭이 연속적이라 최소 폭이 더 잘 맞는다.
    public var minCellWidth: CGFloat {
        didSet { wrap.minItemWidth = minCellWidth }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let wrap: JdWrapView

    public init(items: [JdMicroKpiItem],
                minCellWidth: CGFloat = 132,
                spacing: CGFloat = JdToken.Space.s2) {
        self.items = items
        self.minCellWidth = minCellWidth
        self.wrap = JdWrapView(itemSpacing: spacing,
                               equalWidths: true,
                               minItemWidth: minCellWidth)
        super.init(frame: .zero)

        addSubview(wrap)
        wrap.jd.layout {
            $0.edges.equalToSuperview()
        }
        rebuild()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 랩이 계산한 높이를 그대로 물려받는다 — 부모의 Auto Layout에 정상 참여한다
    public override var intrinsicContentSize: CGSize {
        CGSize(width: UIView.noIntrinsicMetric, height: wrap.sizeThatFits(bounds.size).height)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        invalidateIntrinsicContentSize()
    }

    public override func sizeThatFits(_ size: CGSize) -> CGSize {
        CGSize(width: size.width, height: wrap.sizeThatFits(size).height)
    }

    // MARK: 내부

    private func rebuild() {
        wrap.setItems(items.map { JdMicroKpiCellView(item: $0) })
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }
}

/// KPI 셀 한 칸. 목록 밖에서 단독으로도 쓸 수 있게 public이다.
public final class JdMicroKpiCellView: UIView {

    public var item: JdMicroKpiItem {
        didSet { resolveAndApply() }
    }

    // 테스트 표면 (@testable)
    let labelLabel = UILabel()
    let valueLabel = UILabel()
    let unitLabel = UILabel()
    let subLabel = UILabel()

    private let outerStack: JdStackView
    private let valueRow: JdStackView
    private var spec: JdMicroKpiCellSpec

    public init(item: JdMicroKpiItem) {
        self.item = item
        self.spec = JdMicroKpiCellSpec.resolve(item: item)
        // 값+단위는 한 줄 — 단위가 줄바꿈으로 떨어지면 숫자와 분리돼 읽힌다
        self.valueRow = JdStackView(axis: .horizontal, gap: .custom(2), alignment: .lastBaseline)
        self.outerStack = JdStackView(axis: .vertical, gap: .custom(2), alignment: .leading)
        super.init(frame: .zero)

        for label in [labelLabel, valueLabel, unitLabel, subLabel] {
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 1
        }
        valueRow.addArrangedSubview(valueLabel)
        valueRow.addArrangedSubview(unitLabel)
        outerStack.addArrangedSubview(labelLabel)
        outerStack.addArrangedSubview(valueRow)
        outerStack.addArrangedSubview(subLabel)
        addSubview(outerStack)

        outerStack.jd.layout {
            $0.top.equalToSuperview().inset(spec.vPadding)
            $0.bottom.equalToSuperview().inset(spec.vPadding)
            $0.leading.equalToSuperview().inset(spec.hPadding)
            $0.trailing.lessThanOrEqual(to: self.jd.trailing, offset: -spec.hPadding)
        }

        layer.masksToBounds = true
        layer.cornerRadius = spec.cornerRadius
        layer.borderWidth = JdToken.Border.thin

        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 라벨·값·보조가 따로 읽히면 관계가 사라진다 (04 §7.1)
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
        spec = JdMicroKpiCellSpec.resolve(item: item)
        applyStyle()
        applyContent()
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        backgroundColor = spec.background.uiColor
        layer.borderColor = spec.border.uiColor.resolvedColor(with: traitCollection).cgColor
        labelLabel.textColor = spec.labelColor.uiColor
        valueLabel.textColor = spec.valueColor.uiColor
        unitLabel.textColor = spec.valueColor.uiColor
        subLabel.textColor = spec.subColor.uiColor

        labelLabel.font = JdFontBridge.scaledFont(size: spec.labelFontSize,
                                                 weight: spec.labelFontWeight,
                                                 compatibleWith: traitCollection)
        valueLabel.font = JdFontBridge.scaledDigitFont(size: spec.valueFontSize,
                                                      weight: spec.valueFontWeight,
                                                      compatibleWith: traitCollection)
        unitLabel.font = JdFontBridge.scaledFont(size: spec.unitFontSize,
                                                weight: JdToken.FontWeight.semibold,
                                                compatibleWith: traitCollection)
        subLabel.font = JdFontBridge.scaledDigitFont(size: spec.subFontSize,
                                                    weight: spec.subFontWeight,
                                                    compatibleWith: traitCollection)
    }

    private func applyContent() {
        labelLabel.text = item.label
        valueLabel.text = item.value
        let unit = item.unit ?? ""
        unitLabel.text = unit
        unitLabel.isHidden = unit.isEmpty
        subLabel.text = JdMicroKpiCellSpec.subText(item: item)
        accessibilityLabel = JdMicroKpiCellSpec.accessibilityText(item: item)
    }
}
