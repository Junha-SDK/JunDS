import JunDSCore
import UIKit

// 웹 jd-slider 동형 — UISlider 위임 + 헤더 행 + 마크 (DESIGN-2 §B1).
// 웹이 네이티브 input[type=range]에 위임했듯 여기도 시스템 컨트롤을 쓴다(04 §10.1).
// step 양자화·정규화는 Core JdRangeState가 단일 소스 — 이 파일은 좌표/이벤트만 다룬다
// (04 §4.2 규칙 3). 웹 이벤트 대응: onValueChange = jd-input, onCommit = jd-change.
public final class JdSliderView: UIView {

    // 저장값은 항상 Core가 양자화한 결과 — 세터가 곧 클램프 지점이다
    public var value: Double {
        get { storedValue }
        set {
            storedValue = axis.value(atFraction: axis.fraction(of: newValue))
            applyValue()
        }
    }

    // 웹 show-value 동형 — 상단 헤더 행 노출
    public var showsValue: Bool {
        didSet { headerStack.isHidden = !showsValue }
    }

    // 웹 marks 동형 — 트랙 아래 틱 + 라벨(장식이므로 접근성에서 제외)
    public var marks: [JdSliderMark] {
        didSet { applyMarks() }
    }

    // 웹 color 동형 — 채움 트랙 액센트
    public var color: JdSliderColor {
        didSet { applyStyle() }
    }

    // 웹 size 동형 — 스펙 재해결(값 글꼴 크기)
    public var size: JdToggleSize {
        didSet { resolveAndApply() }
    }

    public var isEnabled: Bool = true {
        didSet {
            slider.isEnabled = isEnabled
            alpha = isEnabled ? 1 : JdToken.Opacity.o50  // 웹 [disabled] opacity-50
        }
    }

    /// 웹 formatValue 동형 — 헤더 현재값·접근성 값 표기에만 쓴다(min/max 라벨은 원값)
    public var format: ((Double) -> String)? {
        didSet { applyValue() }
    }

    public var onValueChange: ((Double) -> Void)?
    public var onCommit: ((Double) -> Void)?

    private let slider = UISlider()
    private let minLabel = UILabel()
    private let displayLabel = UILabel()
    private let maxLabel = UILabel()
    private let headerStack = UIStackView()
    private let marksView: JdSliderMarksView
    private let rootStack = UIStackView()

    private let valueBounds: ClosedRange<Double>
    /// 값 축 계산 전용 — 손잡이 상태는 쓰지 않고 step 정규화·fraction·양자화만 빌린다
    private let axis: JdRangeState
    private var storedValue: Double
    private var spec: JdSliderSpec

    public init(
        value: Double = 0,
        in bounds: ClosedRange<Double> = 0...100,
        step: Double = 1,
        color: JdSliderColor = .primary,
        size: JdToggleSize = .md,
        showsValue: Bool = false,
        marks: [JdSliderMark] = []
    ) {
        let axis = JdRangeState(bounds: bounds, step: step)
        self.valueBounds = bounds
        self.axis = axis
        self.storedValue = axis.value(atFraction: axis.fraction(of: value))
        self.color = color
        self.size = size
        self.showsValue = showsValue
        self.marks = marks
        self.spec = JdSliderSpec.resolve(size: size)
        self.marksView = JdSliderMarksView(axis: axis)
        super.init(frame: .zero)

        for label in [minLabel, displayLabel, maxLabel] {
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 1
        }
        minLabel.textAlignment = .left
        displayLabel.textAlignment = .center
        maxLabel.textAlignment = .right

        headerStack.axis = .horizontal
        headerStack.alignment = .firstBaseline
        headerStack.distribution = .fillEqually
        headerStack.spacing = JdToken.Space.s2
        headerStack.isHidden = !showsValue
        // 슬라이더 자신이 값·최소·최대를 낭독하므로 헤더는 시각 중복 — 장식 처리 (04 §7.1)
        headerStack.isAccessibilityElement = false
        headerStack.accessibilityElementsHidden = true
        headerStack.addArrangedSubview(minLabel)
        headerStack.addArrangedSubview(displayLabel)
        headerStack.addArrangedSubview(maxLabel)

        slider.minimumValue = Float(bounds.lowerBound)
        slider.maximumValue = Float(bounds.upperBound)
        slider.isContinuous = true
        slider.addTarget(self, action: #selector(sliderChanged), for: .valueChanged)
        slider.addTarget(self, action: #selector(sliderCommitted), for: .touchUpInside)
        slider.addTarget(self, action: #selector(sliderCommitted), for: .touchUpOutside)

        rootStack.axis = .vertical
        rootStack.alignment = .fill
        rootStack.spacing = JdToken.Space.s1_5  // 웹 헤더 margin-bottom
        rootStack.addArrangedSubview(headerStack)
        rootStack.addArrangedSubview(slider)
        rootStack.addArrangedSubview(marksView)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        applyMarks()
        applyStyle()
        applyValue()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    private func resolveAndApply() {
        spec = JdSliderSpec.resolve(size: size)
        applyStyle()
    }

    private func applyStyle() {
        let font = JdFontBridge.scaledFont(
            size: spec.valueFontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        minLabel.font = font
        maxLabel.font = font
        displayLabel.font = JdFontBridge.scaledFont(
            size: spec.valueFontSize,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        minLabel.textColor = JdToken.Color.muted.uiColor
        maxLabel.textColor = JdToken.Color.muted.uiColor
        displayLabel.textColor = JdToken.Color.foreground.uiColor

        slider.minimumTrackTintColor = JdSliderSpec.accent(color).uiColor
        slider.maximumTrackTintColor = JdSliderSpec.railColor.uiColor
        // 썸은 시스템 스킨(흰 원)이 웹 #fff 썸과 같은 어휘 — 별도 착색하지 않는다
    }

    private func applyValue() {
        let clamped = Float(storedValue)
        if slider.value != clamped { slider.value = clamped }
        minLabel.text = Self.plain(valueBounds.lowerBound)
        maxLabel.text = Self.plain(valueBounds.upperBound)
        displayLabel.text = display(storedValue)
        slider.accessibilityValue = display(storedValue)
    }

    private func applyMarks() {
        marksView.marks = marks
        marksView.isHidden = marks.isEmpty
    }

    @objc private func sliderChanged() {
        let snapped = axis.value(atFraction: axis.fraction(of: Double(slider.value)))
        guard snapped != storedValue else {
            // 양자화 결과가 같으면 썸 위치만 되돌린다(스텝 사이 미끄러짐 방지)
            applyValue()
            return
        }
        storedValue = snapped
        applyValue()
        onValueChange?(snapped)
    }

    @objc private func sliderCommitted() {
        onCommit?(storedValue)
    }

    private func display(_ value: Double) -> String {
        if let format { return format(value) }
        return Self.plain(value)
    }

    /// 웹 String(value) 동형 — 정수 값은 소수점 없이 표기
    private static func plain(_ value: Double) -> String {
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}

// MARK: - 마크 행 (웹 .jd-slider__marks 동형 — 절대 배치 + aria-hidden)

private final class JdSliderMarksView: UIView {

    var marks: [JdSliderMark] = [] {
        didSet { rebuild() }
    }

    private let axis: JdRangeState
    private var items: [UIView] = []
    private var labels: [UILabel] = []

    init(axis: JdRangeState) {
        self.axis = axis
        super.init(frame: .zero)
        isUserInteractionEnabled = false
        // 웹 aria-hidden="true" 동형 — 값은 슬라이더가 이미 낭독한다 (04 §7.1 장식 규칙)
        isAccessibilityElement = false
        accessibilityElementsHidden = true
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override var intrinsicContentSize: CGSize {
        let height = items.reduce(CGFloat(0)) { partial, item in
            max(partial, item.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height)
        }
        return CGSize(width: UIView.noIntrinsicMetric, height: height)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        let width = bounds.width
        for (index, item) in items.enumerated() {
            guard index < marks.count else { break }
            let size = item.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
            let center = width * CGFloat(axis.fraction(of: marks[index].value))
            item.frame = CGRect(
                x: center - size.width / 2, y: 0,
                width: size.width, height: size.height)
        }
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyFonts()
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    private func rebuild() {
        items.forEach { $0.removeFromSuperview() }
        items.removeAll()
        labels.removeAll()

        for mark in marks {
            let stack = UIStackView()
            stack.axis = .vertical
            stack.alignment = .center
            stack.spacing = JdToken.Space.s0_5

            // 틱 — 웹 2×6px. 전용 스펙 부재분을 토큰 조합으로 표기(Border.medium × Space.s1_5).
            let tick = UIView()
            tick.backgroundColor = JdSliderSpec.railColor.uiColor
            tick.jd.layout {
                $0.width.equal(JdToken.Border.medium)
                $0.height.equal(JdToken.Space.s1_5)
            }
            stack.addArrangedSubview(tick)

            if let text = mark.label {
                let label = UILabel()
                label.text = text
                label.textColor = JdToken.Color.muted.uiColor
                label.adjustsFontForContentSizeCategory = true
                label.numberOfLines = 1
                stack.addArrangedSubview(label)
                labels.append(label)
            }

            addSubview(stack)
            items.append(stack)
        }

        applyFonts()
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    private func applyFonts() {
        let font = JdFontBridge.scaledFont(
            size: JdTextSpec.resolve(size: .xs2).fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        for label in labels {
            label.font = font
        }
    }
}
