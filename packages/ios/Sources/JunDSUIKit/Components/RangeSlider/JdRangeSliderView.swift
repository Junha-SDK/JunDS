import UIKit
import JunDSCore

// 웹 jd-range-slider 동형 — 두 손잡이 범위 슬라이더 (DESIGN-2 §B1).
// 네이티브 컨트롤이 단일 값뿐이라 웹처럼 자체 드로잉 + 자체 트래킹이다(위임 예외).
// ⚠️ 클램프·양자화·최소 간격 유지는 **전부 Core JdRangeState**가 한다 — 이 파일은
// 터치 좌표를 fraction으로 바꿔 value(atFraction:)에 넘기고 결과 fraction만 그린다
// (04 §4.2 규칙 3). 손잡이 2개는 각각 접근성 요소(.adjustable)로 노출한다.
public final class JdRangeSliderView: UIControl {

    // 상태 갱신은 Core가 정규화한 값만 저장된다 — 세터가 곧 단일 진입점.
    // 이름이 rangeState인 이유: `state`는 UIControl.State가 이미 쓰고 있다
    // (JdTextView의 size → textSize와 같은 회피 — A8 명명 규칙의 UIKit 충돌 예외).
    public var rangeState: JdRangeState {
        didSet {
            guard rangeState != oldValue else { return }
            applyState()
        }
    }

    // 웹 show-values 동형 — 상단 값 행 노출
    public var showsValues: Bool {
        didSet { valuesStack.isHidden = !showsValues }
    }

    /// 웹에는 없는 표기 훅 — 값 행·접근성 값에만 쓴다(SwiftUI 표면과 동형)
    public var format: ((Double) -> String)? {
        didSet { applyState() }
    }

    /// 웹 jd-input/jd-change 통합 — 드래그 중·조정 직후 모두 통지한다
    public var onChange: ((JdRangeState) -> Void)?

    private let lowerValueLabel = UILabel()
    private let upperValueLabel = UILabel()
    private let valuesStack = UIStackView()
    private let trackContainer = UIView()
    private let rail = UIView()
    private let fill = UIView()
    private let lowerThumb: JdRangeThumbView
    private let upperThumb: JdRangeThumbView
    private let rootStack = UIStackView()

    private var activeHandle: JdRangeHandle?

    // 웹 트랙 히트 영역 1.25rem = 손잡이 지름과 동일. 손잡이 전용 치수가 스펙에 없어
    // 토큰으로 표기한다(Space.s5 = 20 — DESIGN-2가 고정한 20pt).
    private static let thumbSide = JdToken.Space.s5
    private static let trackHeight = JdSliderSpec.resolve(size: .md).trackHeight

    public init(state: JdRangeState = JdRangeState(), showsValues: Bool = false) {
        self.rangeState = state
        self.showsValues = showsValues
        self.lowerThumb = JdRangeThumbView(label: JdRangeHandle.lower.label)
        self.upperThumb = JdRangeThumbView(label: JdRangeHandle.upper.label)
        super.init(frame: .zero)

        for label in [lowerValueLabel, upperValueLabel] {
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 1
            label.textColor = JdToken.Color.muted.uiColor
        }
        lowerValueLabel.textAlignment = .left
        upperValueLabel.textAlignment = .right

        valuesStack.axis = .horizontal
        valuesStack.distribution = .fillEqually
        valuesStack.spacing = JdToken.Space.s2
        valuesStack.isHidden = !showsValues
        // 손잡이가 각자 값을 낭독하므로 시각 중복 — 장식 처리 (04 §7.1)
        valuesStack.isAccessibilityElement = false
        valuesStack.accessibilityElementsHidden = true
        valuesStack.addArrangedSubview(lowerValueLabel)
        valuesStack.addArrangedSubview(upperValueLabel)

        rail.backgroundColor = JdSliderSpec.railColor.uiColor
        rail.layer.cornerRadius = Self.trackHeight / 2
        rail.layer.cornerCurve = .continuous
        rail.isUserInteractionEnabled = false
        fill.backgroundColor = JdToken.Color.primary.uiColor
        fill.layer.cornerRadius = Self.trackHeight / 2
        fill.layer.cornerCurve = .continuous
        fill.isUserInteractionEnabled = false

        trackContainer.addSubview(rail)
        trackContainer.addSubview(fill)
        trackContainer.addSubview(lowerThumb)
        trackContainer.addSubview(upperThumb)

        rootStack.axis = .vertical
        rootStack.alignment = .fill
        rootStack.spacing = JdToken.Space.s1 // 웹 값 행 margin-bottom
        rootStack.addArrangedSubview(valuesStack)
        rootStack.addArrangedSubview(trackContainer)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        trackContainer.jd.layout {
            $0.height.equal(Self.thumbSide)
        }

        // 컨테이너가 아니라 손잡이 2개가 접근성 요소다 (DESIGN-2 §B1)
        isAccessibilityElement = false
        lowerThumb.onAdjust = { [weak self] steps in self?.adjust(.lower, steps: steps) }
        upperThumb.onAdjust = { [weak self] steps in self?.adjust(.upper, steps: steps) }

        applyStyle()
        applyState()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var isEnabled: Bool {
        didSet {
            alpha = isEnabled ? 1 : JdToken.Opacity.o50 // 웹 [disabled] opacity-50
            lowerThumb.accessibilityTraits = isEnabled ? .adjustable : [.adjustable, .notEnabled]
            upperThumb.accessibilityTraits = isEnabled ? .adjustable : [.adjustable, .notEnabled]
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(테두리)와 스케일 폰트는 수동 재적용
        applyStyle()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 스택이 trackContainer의 bounds를 확정한 뒤에 프레임을 계산해야 한다 —
        // 확정 전에 계산하면 width 0으로 guard에 걸려 레일·채움·손잡이가 아예 안 그려진다(실측).
        rootStack.layoutIfNeeded()
        positionTrack()
    }

    // MARK: - 트래킹 (좌표 수집 → Core 호출 → 그리기)

    public override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard isEnabled else { return false }
        // 웹은 썸 위 pointerdown만 드래그를 시작한다 — 레일 탭으로 값이 튀지 않게 동형 유지
        guard let handle = handle(near: touch.location(in: trackContainer).x) else { return false }
        activeHandle = handle
        return true
    }

    public override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard let handle = activeHandle else { return false }
        apply(handle: handle, atX: touch.location(in: trackContainer).x)
        return true
    }

    public override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        if let handle = activeHandle, let x = touch?.location(in: trackContainer).x {
            apply(handle: handle, atX: x)
        }
        activeHandle = nil
    }

    public override func cancelTracking(with event: UIEvent?) {
        activeHandle = nil
    }

    private func apply(handle: JdRangeHandle, atX x: CGFloat) {
        let fraction = Double(x / max(trackContainer.bounds.width, 1))
        let value = rangeState.value(atFraction: fraction)
        var next = rangeState
        switch handle {
        case .lower: next.setLower(value)
        case .upper: next.setUpper(value)
        }
        commit(next)
    }

    private func adjust(_ handle: JdRangeHandle, steps: Int) {
        var next = rangeState
        let delta = rangeState.step * Double(steps)
        switch handle {
        case .lower: next.setLower(rangeState.lower + delta)
        case .upper: next.setUpper(rangeState.upper + delta)
        }
        commit(next)
    }

    private func commit(_ next: JdRangeState) {
        guard next != rangeState else { return }
        rangeState = next // didSet → applyState
        sendActions(for: .valueChanged)
        onChange?(next)
    }

    /// 손잡이 히트 판정 — 두 손잡이 중 가까운 쪽, 지름 밖이면 nil
    private func handle(near x: CGFloat) -> JdRangeHandle? {
        let width = max(trackContainer.bounds.width, 1)
        let clamped = min(max(x, 0), width)
        let lowerDistance = abs(clamped - width * CGFloat(rangeState.lowerFraction))
        let upperDistance = abs(clamped - width * CGFloat(rangeState.upperFraction))
        guard min(lowerDistance, upperDistance) <= Self.thumbSide else { return nil }
        return lowerDistance <= upperDistance ? .lower : .upper
    }

    // MARK: - 그리기

    private func applyStyle() {
        let font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .xs).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        lowerValueLabel.font = font
        upperValueLabel.font = font
        lowerThumb.applyStyle(traits: traitCollection)
        upperThumb.applyStyle(traits: traitCollection)
    }

    private func applyState() {
        lowerValueLabel.text = display(rangeState.lower)
        upperValueLabel.text = display(rangeState.upper)
        lowerThumb.accessibilityValue = display(rangeState.lower)
        upperThumb.accessibilityValue = display(rangeState.upper)
        setNeedsLayout()
        positionTrack()
    }

    private func positionTrack() {
        let width = trackContainer.bounds.width
        let height = trackContainer.bounds.height
        guard width > 0 else { return }
        let centerY = height / 2
        let lowerX = width * CGFloat(rangeState.lowerFraction)
        let upperX = width * CGFloat(rangeState.upperFraction)

        rail.frame = CGRect(x: 0, y: centerY - Self.trackHeight / 2,
                            width: width, height: Self.trackHeight)
        fill.frame = CGRect(x: lowerX, y: centerY - Self.trackHeight / 2,
                            width: max(0, upperX - lowerX), height: Self.trackHeight)
        // 웹 transform: translateX(-50%) 동형 — 손잡이 중심이 fraction 위치
        lowerThumb.frame = CGRect(x: lowerX - Self.thumbSide / 2, y: centerY - Self.thumbSide / 2,
                                  width: Self.thumbSide, height: Self.thumbSide)
        upperThumb.frame = CGRect(x: upperX - Self.thumbSide / 2, y: centerY - Self.thumbSide / 2,
                                  width: Self.thumbSide, height: Self.thumbSide)
    }

    private func display(_ value: Double) -> String {
        if let format { return format(value) }
        // 웹 String(value) 동형 — 정수 값은 소수점 없이 표기
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}

/// 두 손잡이 식별 + 웹 aria-label 리터럴("최솟값"/"최댓값") 동형.
/// DEC-010으로 SwiftUI 계층과 타입을 공유하지 않는다 — 리터럴만 같은 값을 쓴다.
private enum JdRangeHandle {
    case lower
    case upper

    var label: String {
        switch self {
        case .lower: return "최솟값"
        case .upper: return "최댓값"
        }
    }
}

/// 손잡이 1개 = 접근성 요소 1개(role=slider 동형). 증감은 step 단위로 부모에 위임한다.
private final class JdRangeThumbView: UIView {

    var onAdjust: ((Int) -> Void)?

    init(label: String) {
        super.init(frame: .zero)
        isUserInteractionEnabled = false // 트래킹은 부모 UIControl이 전담
        isAccessibilityElement = true
        accessibilityTraits = .adjustable
        accessibilityLabel = label
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 웹 썸: 20pt 흰 원 + 2pt primary 테두리. 흰색 리터럴 대신 card 토큰을 쓴다 —
    /// 라이트에서 #fff로 동일하고, 다크에서 순백 대비가 깨지는 웹 결함을 함께 보정한다.
    func applyStyle(traits: UITraitCollection) {
        backgroundColor = JdToken.Color.card.uiColor
        layer.cornerCurve = .continuous
        layer.borderWidth = JdToken.Border.medium
        layer.borderColor = JdToken.Color.primary.uiColor.resolvedColor(with: traits).cgColor
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        // 지름은 부모가 정한다(스펙 부재분) — 원형 유지만 여기서 책임진다
        layer.cornerRadius = bounds.height / 2
    }

    override func accessibilityIncrement() {
        onAdjust?(1)
    }

    override func accessibilityDecrement() {
        onAdjust?(-1)
    }
}
