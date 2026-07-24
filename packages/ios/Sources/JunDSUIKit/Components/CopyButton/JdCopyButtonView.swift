import UIKit
import JunDSCore

// 웹 jd-copy-button 동형 — 복사는 시스템 API(UIPasteboard)가 하고 컴포넌트는 버튼만 얇게
// 얹는다 (DESIGN-3 §B, 04 §10 번역 원칙).
//
// a11y: 웹은 라벨 교체만으로 성공을 알렸지만 iOS는 포커스가 버튼에 있어도 라벨 변경이
//       자동 낭독되지 않는다 → JdAnnouncer로 보정한다(04 §7.1).
public final class JdCopyButtonView: UIControl {

    /// 클립보드에 실릴 원문
    public var text: String

    public var label: String {
        didSet { applyContent() }
    }

    public var copiedLabel: String {
        didSet { applyContent() }
    }

    public var onCopy: ((String) -> Void)?

    /// 복사 직후 true, copiedDuration 뒤 자동 복귀 (웹 동형)
    public private(set) var isCopied: Bool = false {
        didSet { applyContent() }
    }

    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let contentStack = UIStackView()
    private let spec: JdButtonSpec
    private var resetTask: Task<Void, Never>?

    /// 웹 동형의 복귀 지연. 토큰 사다리(Duration.slower = 0.5s)의 바깥 값이라
    /// DESIGN-3 §B에 명시된 2초를 그대로 상수로 둔다 — 토큰 신설은 하지 않는다.
    private static let copiedDuration: TimeInterval = 2

    public init(text: String,
                label: String = "복사",
                copiedLabel: String = "복사됨",
                variant: JdButtonVariant = .secondary,
                size: JdControlSize = .md) {
        self.text = text
        self.label = label
        self.copiedLabel = copiedLabel
        self.spec = JdButtonSpec.resolve(variant: variant, size: size)
        super.init(frame: .zero)

        iconView.contentMode = .center
        iconView.setContentHuggingPriority(.required, for: .horizontal)
        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.textAlignment = .center

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = JdToken.Space.s2
        contentStack.isUserInteractionEnabled = false
        contentStack.addArrangedSubview(iconView)
        contentStack.addArrangedSubview(titleLabel)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
            $0.top.greaterThanOrEqualToSuperview().inset(JdToken.Space.s1)
        }
        jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        isAccessibilityElement = true
        accessibilityTraits = .button

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    deinit {
        resetTask?.cancel()
    }

    public override var intrinsicContentSize: CGSize {
        let content = contentStack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        return CGSize(width: content.width + spec.hPadding * 2,
                      height: max(spec.minHeight, content.height + JdToken.Space.s1 * 2))
    }

    public override var isHighlighted: Bool {
        didSet { applyStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: - 내부

    private func applyStyle() {
        titleLabel.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                                  weight: spec.fontWeight,
                                                  compatibleWith: traitCollection)
        titleLabel.textColor = spec.foreground.uiColor
        iconView.tintColor = spec.foreground.uiColor
        backgroundColor = (isHighlighted ? spec.pressedBackground : spec.background).uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        if let border = spec.border {
            layer.borderWidth = JdToken.Border.thin
            layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        } else {
            layer.borderWidth = 0
            layer.borderColor = nil
        }
        alpha = isEnabled ? 1 : spec.disabledOpacity
        applyContent()
    }

    private func applyContent() {
        let title = isCopied ? copiedLabel : label
        titleLabel.text = title
        accessibilityLabel = title
        // SF Symbol은 폰트에 묶여 스케일된다 (04 §7.2)
        let font = JdFontBridge.scaledFont(size: spec.fontSize,
                                           weight: spec.fontWeight,
                                           compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: font)
        iconView.image = UIImage(systemName: isCopied ? "checkmark" : "doc.on.doc")
        invalidateIntrinsicContentSize()
    }

    /// 테스트 전용 주입 지점(internal — 공개 표면 아님).
    /// 앱 호스트 없이 도는 xctest 번들에서는 `UIPasteboard.general` 접근이 페이스트보드 데몬을
    /// 기다리며 **무한정 멈춘다**(실측: 테스트 러너가 이 지점에서 정지). 프로덕션 기본값은
    /// 시스템 그대로이고, 테스트만 이 훅을 갈아끼워 "무엇을 복사했는가"를 검증한다.
    static var pasteboardWriter: (String) -> Void = { UIPasteboard.general.string = $0 }

    @objc private func didTap() {
        // 복사는 시스템이 한다 — 자체 클립보드 추상화를 만들지 않는다
        Self.pasteboardWriter(text)
        isCopied = true
        // 복사 성공은 시각 신호(체크)만으로는 AT에 닿지 않는다
        JdAnnouncer.announce(copiedLabel)
        onCopy?(text)

        // 연타 시 이전 복귀 예약을 취소한다 — 타이머는 항상 취소 가능해야 한다
        resetTask?.cancel()
        resetTask = Task { [weak self] in
            let nanoseconds = UInt64(Self.copiedDuration * 1_000_000_000)
            try? await Task.sleep(nanoseconds: nanoseconds)
            guard !Task.isCancelled else { return }
            self?.isCopied = false
        }
    }
}
