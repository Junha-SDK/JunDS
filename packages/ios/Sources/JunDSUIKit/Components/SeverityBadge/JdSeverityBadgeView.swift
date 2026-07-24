import UIKit
import JunDSCore

// 웹 jd-severity-badge 동형 — 심각도 알약 뱃지. A8 명명 규칙 Jd<이름>View.
// 웹은 CSS 전용 렌더(JS 상태 0)라 심각도가 **색으로만** 전달된다(role·aria 전무) —
// iOS는 심각도명을 accessibilityValue로 얹어 보정한다 (04 §7.1: 상태는 문자열 조합이 아니라 값으로).
public final class JdSeverityBadgeView: UIView {

    public var text: String {
        didSet { applyText() }
    }

    public var severity: JdSeverity {
        didSet { resolveAndApply() }
    }

    public var size: JdDisplaySize {
        didSet { resolveAndApply() }
    }

    // 웹 [dot] 불리언 속성 동형 — 점은 장식이라 접근성 표면을 바꾸지 않는다
    public var showsDot: Bool {
        didSet { applyDot() }
    }

    private let dot = UIView()
    private let textLabel = UILabel()
    private let contentStack: JdStackView
    private var spec: JdSeverityBadgeSpec

    public init(_ text: String,
                severity: JdSeverity = .neutral,
                size: JdDisplaySize = .md,
                showsDot: Bool = false) {
        self.text = text
        self.severity = severity
        self.size = size
        self.showsDot = showsDot
        self.spec = JdSeverityBadgeSpec.resolve(severity: severity, size: size)
        // 웹 gap: var(--jd-space-1-5) — named JdGap에 없는 값이라 custom + 스펙 참조
        self.contentStack = JdStackView(axis: .horizontal,
                                        gap: .custom(spec.gap),
                                        alignment: .center)
        super.init(frame: .zero)

        dot.isUserInteractionEnabled = false
        textLabel.adjustsFontForContentSizeCategory = true
        textLabel.numberOfLines = 1 // 웹 white-space: nowrap

        contentStack.addArrangedSubview(dot)
        contentStack.addArrangedSubview(textLabel)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.edges.equalToSuperview().inset(contentInsets)
        }
        dot.jd.layout {
            $0.size.equal(CGSize(width: spec.dotSize, height: spec.dotSize))
        }

        // 뱃지 1개 = 요소 1개 — 자식 UILabel은 컨테이너 승격으로 트리에서 빠진다
        isAccessibilityElement = true

        applyStyle()
        applyText()
        applyDot()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 웹 border-radius: var(--jd-radius-full) — 스펙에 radius 필드가 없어 높이 절반(알약)으로 번역
        layer.cornerRadius = bounds.height / 2
        layer.cornerCurve = .continuous
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // 테스트 표면 — 점 토글이 실제 배치에 반영됐는지 (04 §8.2)
    var isDotVisible: Bool { !dot.isHidden }

    // MARK: 내부

    private var contentInsets: NSDirectionalEdgeInsets {
        NSDirectionalEdgeInsets(top: spec.vPadding, leading: spec.hPadding,
                                bottom: spec.vPadding, trailing: spec.hPadding)
    }

    private func resolveAndApply() {
        spec = JdSeverityBadgeSpec.resolve(severity: severity, size: size)
        contentStack.gap = .custom(spec.gap)
        contentStack.jd.update {
            $0.edges.equalToSuperview().inset(contentInsets)
        }
        dot.jd.update {
            $0.size.equal(CGSize(width: spec.dotSize, height: spec.dotSize))
        }
        applyStyle()
        applyText()
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        backgroundColor = spec.background.uiColor
        dot.backgroundColor = spec.dotColor.uiColor
        dot.layer.cornerRadius = spec.dotSize / 2
        dot.layer.cornerCurve = .continuous
        // 스펙에 fontWeight 필드가 없어 웹 --jd-weight-medium에 대응하는 토큰을 직접 읽는다
        textLabel.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                                 weight: JdToken.FontWeight.medium,
                                                 compatibleWith: traitCollection)
        textLabel.textColor = spec.foreground.uiColor
    }

    private func applyText() {
        textLabel.text = text
        accessibilityLabel = text
        // 색으로만 전달되던 심각도를 값으로 노출한다(웹 결함 보정). neutral은 기본값이라 무노출.
        accessibilityValue = JdSeverityBadgeView.severityName(severity)
        invalidateIntrinsicContentSize()
    }

    private func applyDot() {
        // UIStackView는 isHidden인 arranged subview의 자리와 간격을 함께 접는다
        dot.isHidden = !showsDot
        invalidateIntrinsicContentSize()
    }

    /// 심각도명 사전 — SwiftUI 계층(JdSeverityBadge)에 동형 사본이 있다(DEC-010으로 공유 불가).
    /// neutral은 심각도 신호가 아니라 기본값이라 값을 노출하지 않는다(잡음 방지).
    static func severityName(_ severity: JdSeverity) -> String? {
        switch severity {
        case .ok: return "정상"
        case .warn: return "주의"
        case .danger: return "위험"
        case .info: return "정보"
        case .neutral: return nil
        }
    }
}
