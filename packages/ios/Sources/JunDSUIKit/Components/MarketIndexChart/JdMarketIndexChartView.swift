import JunDSCore
import UIKit

// 웹 MarketIndexChart 동형 — 타임프레임 pill + MA 범례 + 캔들 차트. (DEC-049)
//
// 웹은 타임프레임별 mock 캔들을 컴포넌트 안에서 생성했지만, iOS는 데이터 생성이
// 라이브러리 밖이므로(DEC-019) **타임프레임별 캔들을 인자로 받는다**. 웹의 bm-card
// 래퍼는 소비자의 몫이다. pill·범례는 컨트롤이라 뷰이고, 차트 본체는 JdCandleChartView
// 재사용이다(웹도 CandleChart를 합성한다).
public final class JdMarketIndexChartView: UIView {

    public var timeframes: [JdMarketIndexTimeframe] {
        didSet { rebuildPills() }
    }

    public private(set) var selectedIndex: Int

    /// 사용자 조작만 발화한다 — 프로그램 대입(`select(_:)`)은 콜백을 부르지 않는다(웹 계약)
    public var onSelect: ((Int) -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let chartView: JdCandleChartView
    let pillStack = JdStackView.horizontal(gap: .sm, [])

    private let headerStack: JdStackView
    private let legendStack = JdStackView.horizontal(gap: .sm, [])
    private let rootStack: JdStackView
    private var pillButtons: [PillButton] = []

    public init(
        timeframes: [JdMarketIndexTimeframe],
        selectedIndex: Int = 0,
        width: CGFloat = 1000,
        height: CGFloat = 360,
        label: String? = nil
    ) {
        self.timeframes = timeframes
        self.selectedIndex = timeframes.indices.contains(selectedIndex) ? selectedIndex : 0
        let initial = timeframes.indices.contains(selectedIndex)
            ? timeframes[selectedIndex] : timeframes.first
        self.chartView = JdCandleChartView(
            candles: initial?.candles ?? [],
            width: width,
            height: height,
            separatorIndex: initial?.separatorIndex,
            xLabels: initial?.xLabels ?? [],
            showsVolume: true,
            label: label)
        self.headerStack = JdStackView.horizontal(gap: .sm, [])
        self.rootStack = JdStackView(axis: .vertical, gap: .xs, alignment: .leading)
        super.init(frame: .zero)

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        headerStack.addArrangedSubview(pillStack)
        headerStack.addArrangedSubview(spacer)
        headerStack.addArrangedSubview(legendStack)
        rootStack.addArrangedSubview(headerStack)
        rootStack.addArrangedSubview(chartView)
        rootStack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(rootStack)
        NSLayoutConstraint.activate([
            rootStack.topAnchor.constraint(equalTo: topAnchor),
            rootStack.leadingAnchor.constraint(equalTo: leadingAnchor),
            rootStack.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor),
            rootStack.bottomAnchor.constraint(equalTo: bottomAnchor),
            headerStack.widthAnchor.constraint(equalTo: chartView.widthAnchor),
        ])

        buildLegend()
        rebuildPills()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 프로그램 선택 — 콜백 없이 상태만 바꾼다
    public func select(_ index: Int) {
        guard timeframes.indices.contains(index) else { return }
        selectedIndex = index
        applySelection()
    }

    // MARK: 내부

    private func rebuildPills() {
        pillButtons.forEach { $0.removeFromSuperview() }
        pillButtons = []
        if !timeframes.indices.contains(selectedIndex) { selectedIndex = 0 }
        for (index, timeframe) in timeframes.enumerated() {
            let button = PillButton(title: timeframe.label)
            button.tag = index
            button.addTarget(self, action: #selector(pillTapped(_:)), for: .touchUpInside)
            pillStack.addArrangedSubview(button)
            pillButtons.append(button)
        }
        applySelection()
    }

    @objc private func pillTapped(_ sender: UIControl) {
        guard sender.tag != selectedIndex else { return }
        select(sender.tag)
        onSelect?(sender.tag)
    }

    private func applySelection() {
        for (index, button) in pillButtons.enumerated() {
            button.apply(
                spec: JdMarketIndexChartSpec.pill(selected: index == selectedIndex),
                selected: index == selectedIndex)
        }
        guard timeframes.indices.contains(selectedIndex) else { return }
        let timeframe = timeframes[selectedIndex]
        chartView.candles = timeframe.candles
        chartView.separatorIndex = timeframe.separatorIndex
        chartView.xLabels = timeframe.xLabels
    }

    private func buildLegend() {
        for entry in JdMarketIndexChartSpec.maLegend {
            let swatch = UIView()
            swatch.backgroundColor = entry.color.uiColor
            swatch.layer.cornerRadius = 2
            NSLayoutConstraint.activate([
                swatch.widthAnchor.constraint(equalToConstant: 10),
                swatch.heightAnchor.constraint(equalToConstant: 10),
            ])
            let text = UILabel()
            text.text = "\(entry.period)"
            text.font = JdFontBridge.scaledDigitFont(
                size: JdMarketIndexChartSpec.pillFontSize,
                weight: JdToken.FontWeight.medium)
            text.adjustsFontForContentSizeCategory = true
            text.textColor = JdChartTheme.axis.uiColor
            legendStack.addArrangedSubview(JdStackView.horizontal(gap: .xs, [swatch, text]))
        }
        // 범례는 장식 — 색 자체를 낭독할 방법이 없고 기간 숫자만 남으면 소음이다
        legendStack.isAccessibilityElement = false
        legendStack.accessibilityElementsHidden = true
    }
}

// MARK: - 타임프레임 pill (웹 bm-pill + aria-pressed)

private final class PillButton: UIControl {
    private let titleLabel = UILabel()

    init(title: String) {
        super.init(frame: .zero)
        titleLabel.text = title
        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        addSubview(titleLabel)
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: JdToken.Space.s1),
            titleLabel.bottomAnchor.constraint(
                equalTo: bottomAnchor, constant: -JdToken.Space.s1),
            titleLabel.leadingAnchor.constraint(
                equalTo: leadingAnchor, constant: JdToken.Space.s2),
            titleLabel.trailingAnchor.constraint(
                equalTo: trailingAnchor, constant: -JdToken.Space.s2),
        ])
        isAccessibilityElement = true
        accessibilityLabel = title
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        // 알약 반경은 리터럴이 아니라 높이의 절반 — Dynamic Type에서 모양이 유지된다
        layer.cornerRadius = bounds.height / 2
    }

    func apply(spec: JdMarketIndexChartSpec.Pill, selected: Bool) {
        backgroundColor = spec.background.uiColor
        titleLabel.textColor = spec.foreground.uiColor
        titleLabel.font = JdFontBridge.scaledFont(
            size: JdMarketIndexChartSpec.pillFontSize, weight: spec.fontWeight)
        // 웹 aria-pressed 대응
        accessibilityTraits = selected ? [.button, .selected] : .button
    }
}
