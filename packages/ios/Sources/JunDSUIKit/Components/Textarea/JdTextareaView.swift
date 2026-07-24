import UIKit
import JunDSCore

// 웹 jd-textarea 동형 — UITextView 래핑 (DESIGN-2 §B1).
// 웹 error는 메시지 없는 boolean이다(jd-text-field의 메시지 문자열과 표면이 다름 — v2 실태).
// 웹은 aria-invalid를 달지 않아 AT가 오류를 알 수 없다 — iOS는 accessibilityValue("오류")로
// 보정한다(계약 명시). 카운터는 웹과 같이 시각 배지이므로 접근성에서 제외한다.
public final class JdTextareaView: UIView, UITextViewDelegate {

    public var text: String {
        get { textView.text ?? "" }
        set {
            // IME 안전: 실제로 다를 때만 되쓴다 (웹 update()와 동일 계약)
            if textView.text != newValue { textView.text = newValue }
            applyPlaceholder()
            applyCount()
            invalidateIntrinsicContentSize()
        }
    }

    public var placeholder: String {
        didSet {
            placeholderLabel.text = placeholder
            applyPlaceholder()
        }
    }

    // 웹 error 동형 — 메시지 없는 boolean(테두리 danger + 접근성 값)
    public var isError: Bool {
        didSet { applyError() }
    }

    // 웹 show-count 동형 — maxLength가 있을 때만 표시되는 시각 배지
    public var showsCount: Bool {
        didSet { applyCount() }
    }

    // 웹 auto-resize 동형 — 스크롤 대신 내용만큼 높이가 자란다
    public var autoResize: Bool {
        didSet {
            textView.isScrollEnabled = !autoResize
            invalidateIntrinsicContentSize()
        }
    }

    // 웹 maxlength 동형 — 사용자 입력만 자른다(프로그램 대입은 네이티브처럼 제한하지 않는다)
    public var maxLength: Int {
        didSet { applyCount() }
    }

    public var isEnabled: Bool = true {
        didSet {
            textView.isEditable = isEnabled
            alpha = isEnabled ? 1 : JdToken.Opacity.o40 // 웹 :disabled opacity-40
        }
    }

    public var onTextChange: ((String) -> Void)?
    public var onCommit: ((String) -> Void)?

    private let textView = UITextView()
    private let placeholderLabel = UILabel()
    private let countLabel = UILabel()
    private let spec: JdTextareaSpec
    private let rows: Int
    private var lastLayoutWidth: CGFloat = 0

    public init(placeholder: String = "",
                rows: Int = 4,
                maxLength: Int = 0,
                isError: Bool = false,
                showsCount: Bool = false,
                autoResize: Bool = false) {
        self.placeholder = placeholder
        self.rows = rows
        self.maxLength = maxLength
        self.isError = isError
        self.showsCount = showsCount
        self.autoResize = autoResize
        self.spec = JdTextareaSpec.resolve()
        super.init(frame: .zero)

        // lineFragmentPadding을 0으로 두면 본문·플레이스홀더가 같은 자리에서 시작한다
        textView.textContainerInset = UIEdgeInsets(top: spec.vPadding, left: spec.hPadding,
                                                   bottom: spec.vPadding, right: spec.hPadding)
        textView.textContainer.lineFragmentPadding = 0
        textView.backgroundColor = .clear
        textView.adjustsFontForContentSizeCategory = true
        textView.isScrollEnabled = !autoResize
        textView.delegate = self

        placeholderLabel.text = placeholder
        placeholderLabel.numberOfLines = 0
        placeholderLabel.adjustsFontForContentSizeCategory = true
        placeholderLabel.isAccessibilityElement = false
        placeholderLabel.accessibilityElementsHidden = true

        countLabel.adjustsFontForContentSizeCategory = true
        // 웹 aria-hidden="true" 동형 — 시각 배지 (04 §7.1 장식 규칙)
        countLabel.isAccessibilityElement = false
        countLabel.accessibilityElementsHidden = true

        addSubview(textView)
        addSubview(placeholderLabel)
        addSubview(countLabel)

        textView.jd.layout {
            $0.edges.equalToSuperview()
        }
        placeholderLabel.jd.layout {
            $0.top.equalToSuperview().inset(spec.vPadding)
            $0.leading.equalToSuperview().inset(spec.hPadding)
            $0.trailing.lessThanOrEqualToSuperview().inset(spec.hPadding)
        }
        countLabel.jd.layout {
            $0.trailing.equalToSuperview().inset(JdToken.Space.s3)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s2)
        }

        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        applyStyle()
        applyPlaceholder()
        applyCount()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        guard autoResize, bounds.width > 0 else {
            return CGSize(width: UIView.noIntrinsicMetric, height: minHeight)
        }
        let fitted = textView.sizeThatFits(CGSize(width: bounds.width,
                                                  height: .greatestFiniteMagnitude)).height
        return CGSize(width: UIView.noIntrinsicMetric, height: max(minHeight, ceil(fitted)))
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 폭이 바뀌면 autoResize 높이가 달라진다
        if autoResize, bounds.width != lastLayoutWidth {
            lastLayoutWidth = bounds.width
            invalidateIntrinsicContentSize()
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(테두리)와 스케일 폰트는 수동 재적용
        applyStyle()
    }

    // 네이티브 위임 표면 — 포커스 편의 (웹 focus()와 동형)
    public override func becomeFirstResponder() -> Bool {
        return textView.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return textView.resignFirstResponder()
    }

    // MARK: - UITextViewDelegate

    public func textViewDidChange(_ textView: UITextView) {
        // 조합 중(마크드 텍스트)에는 자르지 않는다 — IME 안전
        if maxLength > 0, textView.markedTextRange == nil,
           let current = textView.text, current.count > maxLength {
            textView.text = String(current.prefix(maxLength))
        }
        applyPlaceholder()
        applyCount()
        invalidateIntrinsicContentSize()
        onTextChange?(text)
    }

    public func textViewDidBeginEditing(_ textView: UITextView) {
        applyBorder()
    }

    public func textViewDidEndEditing(_ textView: UITextView) {
        applyBorder()
        onCommit?(text)
    }

    // MARK: - 그리기

    /// 웹 rows 동형 — 행 수 × 기본 행간이 스펙 최소 높이보다 크면 그쪽을 쓴다
    private var minHeight: CGFloat {
        let lineHeight = spec.fontSize * JdToken.LineHeight.normal
        return max(spec.minHeight, CGFloat(max(rows, 0)) * lineHeight + spec.vPadding * 2)
    }

    private func applyStyle() {
        let font = JdFontBridge.scaledFont(size: spec.fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        textView.font = font
        textView.textColor = JdToken.Color.foreground.uiColor
        placeholderLabel.font = font
        placeholderLabel.textColor = JdToken.Color.mutedLight.uiColor
        countLabel.font = JdFontBridge.scaledFont(size: spec.countFontSize,
                                                  weight: JdToken.FontWeight.normal,
                                                  compatibleWith: traitCollection)
        // muted-light는 AA 미달 → muted (웹 DEC-027 동형)
        countLabel.textColor = JdToken.Color.muted.uiColor
        backgroundColor = JdToken.Color.card.uiColor
        applyError()
    }

    private func applyError() {
        textView.accessibilityValue = isError ? "오류" : nil
        applyBorder()
    }

    private func applyBorder() {
        let color: JdDynamicColor
        if isError {
            color = JdToken.Color.danger
        } else if textView.isFirstResponder {
            color = JdToken.Color.primary
        } else {
            color = JdToken.Color.border
        }
        layer.borderWidth = JdToken.Border.thin
        layer.borderColor = color.uiColor.resolvedColor(with: traitCollection).cgColor
    }

    private func applyPlaceholder() {
        placeholderLabel.isHidden = !text.isEmpty || placeholder.isEmpty
    }

    private func applyCount() {
        let visible = showsCount && maxLength > 0
        countLabel.isHidden = !visible
        countLabel.text = visible ? "\(text.count)/\(maxLength)" : nil
    }
}
