import JunDSCore
import UIKit

// 웹 jd-badge 동형 — 상태·카테고리 라벨. A8 명명 규칙 Jd<이름>View.
// 웹처럼 count 모드가 children을 대체한다(병용 금지) → 모드는 init에서 확정되고 이후 바뀌지
// 않는다(웹의 attribute 토글보다 강한 계약 — 잘못된 조합을 표면에서 제거).
public final class JdBadgeView: UIView {

    public var text: String {
        didSet { applyContent() }
    }

    public var variant: JdBadgeVariant {
        didSet { resolveAndApply() }
    }

    public var size: JdDisplaySize {
        didSet { resolveAndApply() }
    }

    // 웹 dot attribute 동형 — 앞머리 6pt 점(카운트 모드에선 무시)
    public var showsDot: Bool {
        didSet { applyContent() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let contentLabel = UILabel()
    let dotView = UIView()

    private let stack = UIStackView()
    private let isCountMode: Bool
    private var spec: JdBadgeSpec

    public init(
        _ text: String,
        variant: JdBadgeVariant = .default,
        size: JdDisplaySize = .md,
        showsDot: Bool = false
    ) {
        self.text = text
        self.variant = variant
        self.size = size
        self.showsDot = showsDot
        self.isCountMode = false
        self.spec = JdBadgeSpec.resolve(variant: variant, size: size)
        super.init(frame: .zero)
        setUp()
    }

    /// 웹 count 모드 — 원형 18pt·danger 고정이라 variant/size 축을 받지 않는다.
    public init(count: Int, maxCount: Int = 99) {
        self.text = JdBadgeSpec.countText(count, maxCount: maxCount)
        self.variant = .danger
        self.size = .sm
        self.showsDot = false
        self.isCountMode = true
        self.spec = JdBadgeSpec.resolve(variant: .danger, size: .sm)
        super.init(frame: .zero)
        setUp()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let content = stack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        if isCountMode {
            // 웹 min-width 18 · height 18 · padding 0 space-1 — 한 자리면 정원, 여러 자리면 알약
            let width = max(JdBadgeSpec.countDiameter, content.width + JdToken.Space.s1 * 2)
            let height = max(JdBadgeSpec.countDiameter, content.height)
            return CGSize(width: width, height: height)
        }
        return CGSize(
            width: content.width + spec.hPadding * 2,
            height: content.height + spec.vPadding * 2)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 카운트 모드는 알약(웹 radius-full) — 렌더 시점 높이의 절반이 곧 반지름.
        // 텍스트 모드 반지름은 스펙 고정값이라 applyStyle에서 이미 정해져 있다.
        if isCountMode {
            layer.cornerRadius = min(bounds.width, bounds.height) / 2
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private func setUp() {
        dotView.jd.layout {
            $0.width.equal(spec.dotSize)
            $0.height.equal(spec.dotSize)
        }
        dotView.isAccessibilityElement = false  // 장식 (04 §7.1)

        contentLabel.adjustsFontForContentSizeCategory = true
        contentLabel.numberOfLines = 1  // 웹 white-space: nowrap
        contentLabel.textAlignment = .center

        stack.axis = .horizontal
        stack.alignment = .center
        stack.spacing = JdToken.Space.s1  // 웹 gap: var(--jd-space-1)
        stack.isUserInteractionEnabled = false
        stack.addArrangedSubview(dotView)
        stack.addArrangedSubview(contentLabel)
        addSubview(stack)

        // 고정 크기 금지 — 하한 + 중앙 정렬로 Dynamic Type에서 자란다 (04 §7.2)
        stack.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(hInset)
            $0.top.greaterThanOrEqualToSuperview().inset(vInset)
        }

        layer.cornerCurve = .continuous
        applyContent()
        applyStyle()
    }

    private var hInset: CGFloat { isCountMode ? JdToken.Space.s1 : spec.hPadding }
    private var vInset: CGFloat { isCountMode ? 0 : spec.vPadding }

    private func resolveAndApply() {
        guard !isCountMode else { return }  // 카운트 모드는 danger·18pt 고정
        spec = JdBadgeSpec.resolve(variant: variant, size: size)
        dotView.jd.update {
            $0.width.equal(spec.dotSize)
            $0.height.equal(spec.dotSize)
        }
        stack.jd.update {
            $0.leading.greaterThanOrEqualToSuperview().inset(hInset)
            $0.top.greaterThanOrEqualToSuperview().inset(vInset)
        }
        applyStyle()
        setNeedsLayout()
        invalidateIntrinsicContentSize()
    }

    private func applyContent() {
        contentLabel.text = text
        dotView.isHidden = isCountMode || !showsDot
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        if isCountMode {
            contentLabel.font = JdFontBridge.scaledFont(
                size: JdBadgeSpec.countFontSize,
                weight: JdToken.FontWeight.semibold,
                compatibleWith: traitCollection)
            // 웹 #fff — 스펙에 카운트 전경색이 없어 시스템 흰색을 쓴다(notes 보고분)
            contentLabel.textColor = .white
            backgroundColor = JdToken.Color.danger.uiColor
            layer.borderWidth = 0
            layer.borderColor = nil
            return
        }

        contentLabel.font = JdFontBridge.scaledFont(
            size: spec.fontSize,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        contentLabel.textColor = spec.foreground.uiColor
        // 웹은 variant마다 도트 색을 따로 주지만 값이 전경색과 같은 계열이라 스펙 전경색을 쓴다
        dotView.backgroundColor = spec.foreground.uiColor
        dotView.layer.cornerRadius = spec.dotSize / 2
        backgroundColor = spec.background.uiColor
        layer.cornerRadius = spec.radius
        if let border = spec.border {
            layer.borderWidth = JdToken.Border.thin
            layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        } else {
            layer.borderWidth = 0
            layer.borderColor = nil
        }
    }
}
