import UIKit
import JunDSCore

// 웹 jd-tag 동형 — 태그/칩. A8 명명 규칙 Jd<이름>View.
// 웹은 closable 어트리뷰트 + jd-remove 사후 통지지만, iOS는 콜백 유무가 곧 닫기 버튼 유무다
// (removal 자체는 소비자 몫 — 목록 상태는 앱이 소유한다는 웹 계약 그대로).
public final class JdTagView: UIView {

    /// 웹 닫기 버튼 aria-label 리터럴 — 3플랫폼 동일 문자열 (04 §3 규칙 1)
    static let removeLabel = "삭제"

    public var text: String {
        didSet { applyContent() }
    }

    public var color: JdTagColor {
        didSet { resolveAndApply() }
    }

    // nil이면 닫기 버튼 없음 — 웹 closable 어트리뷰트 동형
    public var onRemove: (() -> Void)? {
        didSet { applyContent() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let contentLabel = UILabel()
    let closeButton = UIButton(type: .system)

    private let stack = UIStackView()
    private var spec: JdTagSpec

    public init(_ text: String,
                color: JdTagColor = .gray,
                onRemove: (() -> Void)? = nil) {
        self.text = text
        self.color = color
        self.onRemove = onRemove
        self.spec = JdTagSpec.resolve(color: color)
        super.init(frame: .zero)
        setUp()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let content = stack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        return CGSize(width: content.width + spec.hPadding * 2,
                      height: content.height + spec.vPadding * 2)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트·심볼은 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private func setUp() {
        contentLabel.adjustsFontForContentSizeCategory = true
        contentLabel.numberOfLines = 1 // 웹 white-space: nowrap

        // ⚠️ 접근성 각주: 웹 승계 아이콘 12pt라 히트 타깃이 HIG 44pt에 크게 못 미친다.
        //    표면(크기)은 패리티 때문에 유지 — 삭제가 잦은 화면이면 소비자가 별도 액션을 제공한다.
        closeButton.accessibilityLabel = Self.removeLabel
        closeButton.setContentHuggingPriority(.required, for: .horizontal)
        closeButton.addTarget(self, action: #selector(didTapRemove), for: .touchUpInside)

        stack.axis = .horizontal
        stack.alignment = .center
        stack.spacing = spec.gap
        stack.addArrangedSubview(contentLabel)
        stack.addArrangedSubview(closeButton)
        addSubview(stack)

        // 고정 크기 금지 — 하한 + 중앙 정렬로 Dynamic Type에서 자란다 (04 §7.2)
        stack.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
            $0.top.greaterThanOrEqualToSuperview().inset(spec.vPadding)
        }

        layer.cornerCurve = .continuous
        applyContent()
        applyStyle()
    }

    private func resolveAndApply() {
        spec = JdTagSpec.resolve(color: color)
        stack.spacing = spec.gap
        stack.jd.update {
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
            $0.top.greaterThanOrEqualToSuperview().inset(spec.vPadding)
        }
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyContent() {
        contentLabel.text = text
        closeButton.isHidden = onRemove == nil
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        contentLabel.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                                    weight: spec.fontWeight,
                                                    compatibleWith: traitCollection)
        contentLabel.textColor = spec.foreground.uiColor

        // SF Symbol은 폰트에 묶여 스케일된다 — 웹 12px 닫기 아이콘을 스케일 폰트로 싣는다
        let iconFont = JdFontBridge.scaledFont(size: spec.closeIconSize,
                                               weight: JdToken.FontWeight.semibold,
                                               compatibleWith: traitCollection)
        closeButton.setImage(UIImage(systemName: "xmark",
                                     withConfiguration: UIImage.SymbolConfiguration(font: iconFont)),
                             for: .normal)
        closeButton.tintColor = spec.foreground.uiColor // 웹 color: inherit

        backgroundColor = spec.background.uiColor
        layer.cornerRadius = spec.radius
    }

    @objc private func didTapRemove() {
        onRemove?()
    }
}
