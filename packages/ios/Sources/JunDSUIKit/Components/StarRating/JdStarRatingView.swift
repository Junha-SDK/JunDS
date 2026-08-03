import JunDSCore
import UIKit

// 웹 jd-star-rating 동형 — iOS에 시스템 대응이 없는 진짜 신규 컴포넌트 (DESIGN-3 §B).
//
// ⚠️ **접근성이 이 컴포넌트의 본체다**: 별 N개를 각각 버튼으로 노출하면 VoiceOver 사용자는
//    별들 사이를 훑을 뿐 값을 조절하지 못한다. 그래서 별 이미지는 전부 장식(비접근성)이고
//    **컨트롤 하나**가 .adjustable 트레이트를 들고 accessibilityIncrement/Decrement로
//    0.5씩 움직인다(위/아래 스와이프로 별점 주기가 가능해야 한다 — 04 §7.1).
//
// 별 상태·탭 값·클램프는 전부 Core(JdStarRating · JdNumberInputRules) 소유다.
public final class JdStarRatingView: UIControl {

    /// 프로그램 변경은 onValueChange를 발화시키지 않는다 — 사용자 조작 전용 계약
    public var value: Double {
        didSet { applyValue() }
    }

    public var isReadOnly: Bool {
        didSet { applyAccessibility() }
    }

    public var onValueChange: ((Double) -> Void)?

    private let starCount: Int
    private let side: CGFloat
    private let label: String
    private var starViews: [UIImageView] = []
    private let contentStack = UIStackView()

    /// Core의 fill 판정이 0.5 단위이므로 조절 단위도 0.5다(웹 반별 토글과 같은 격자).
    private static let step: Double = 0.5

    public init(
        value: Double = 0,
        max: Int = 5,
        size: JdIconSize = .md,
        isReadOnly: Bool = false,
        accessibilityLabel: String = "별점"
    ) {
        self.value = value
        self.starCount = Swift.max(0, max)
        self.side = size.side
        self.isReadOnly = isReadOnly
        self.label = accessibilityLabel
        super.init(frame: .zero)

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = JdToken.Space.s1
        // 터치는 컨트롤이 전부 받는다 — 별은 히트 타깃이 아니다
        contentStack.isUserInteractionEnabled = false
        // 별은 장식 — 접근성 표면은 이 컨트롤 하나뿐 (04 §7.1)
        contentStack.isAccessibilityElement = false
        contentStack.accessibilityElementsHidden = true
        addSubview(contentStack)

        for _ in 0..<starCount {
            let star = UIImageView()
            star.contentMode = .center
            contentStack.addArrangedSubview(star)
            starViews.append(star)
        }

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        isAccessibilityElement = true
        self.accessibilityLabel = accessibilityLabel

        applyAccessibility()
        applyValue()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var isEnabled: Bool {
        didSet { alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50) }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 심볼은 수동 재적용
        applyValue()
    }

    // MARK: - 접근성 조절 (컨트롤 하나 = 요소 하나)

    public override func accessibilityIncrement() {
        adjust(by: Self.step)
    }

    public override func accessibilityDecrement() {
        adjust(by: -Self.step)
    }

    // MARK: - 탭 (별 위치 → Core가 값을 정한다)

    public override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        super.endTracking(touch, with: event)
        guard !isReadOnly, isEnabled, let point = touch?.location(in: self),
            let index = starIndex(at: point)
        else { return }
        // 같은 별 재탭 시 반값 — 규칙 전부 Core 소유
        let next = JdStarRating.value(forTappedIndex: index, current: value)
        guard next != value else { return }
        value = next
        onValueChange?(next)
    }

    private func starIndex(at point: CGPoint) -> Int? {
        guard !starViews.isEmpty else { return nil }
        for (index, star) in starViews.enumerated() {
            let frame = convert(star.bounds, from: star)
            if point.x <= frame.maxX { return index }
        }
        return starViews.count - 1
    }

    // MARK: - 내부

    private func adjust(by delta: Double) {
        guard !isReadOnly, isEnabled else { return }
        // 0…max 클램프도 Core 규칙 재사용
        let next = JdNumberInputRules.clamp(value + delta, min: 0, max: Double(starCount))
        guard next != value else { return }
        value = next
        onValueChange?(next)
    }

    private func applyAccessibility() {
        // 읽기 전용은 조절 불가 — 값만 읽어주는 정적 요소
        accessibilityTraits = isReadOnly ? .staticText : .adjustable
    }

    private func applyValue() {
        // SF Symbol은 폰트에 묶여 스케일된다 (04 §7.2)
        let font = JdFontBridge.scaledFont(
            size: side,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        let configuration = UIImage.SymbolConfiguration(font: font)
        for (index, star) in starViews.enumerated() {
            // 상태 판정은 Core — 임계값(0.5/1.0)을 여기서 다시 쓰지 않는다
            let fill = JdStarRating.fill(index: index, value: value)
            star.preferredSymbolConfiguration = configuration
            star.image = UIImage(systemName: Self.symbol(fill))
            star.tintColor = Self.tint(fill).uiColor
        }
        accessibilityValue = valueText
        invalidateIntrinsicContentSize()
    }

    /// 낭독 문자열 — 숫자 표기는 JdNumberFormat이 단일 소스다
    private var valueText: String {
        let current = JdNumberFormat.string(value: value, style: .decimal)
        let total = JdNumberFormat.string(value: Double(starCount), style: .decimal)
        return "\(total)점 만점에 \(current)점"
    }

    // MARK: - 심볼·색 (DESIGN-3 §B 지정)

    private static func symbol(_ fill: JdStarFill) -> String {
        switch fill {
        case .full: return "star.fill"
        case .half: return "star.leadinghalf.filled"
        case .empty: return "star"
        }
    }

    private static func tint(_ fill: JdStarFill) -> JdDynamicColor {
        switch fill {
        case .full, .half: return JdToken.Color.warning
        case .empty: return JdToken.Color.border
        }
    }
}
