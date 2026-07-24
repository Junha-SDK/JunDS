import UIKit
import JunDSCore

// 웹 jd-code 동형 — 인라인 코드 칩. A8 명명 규칙 Jd<이름>View(UILabel 서브클래스).
// 계약(DESIGN-3 §C): mono 폰트 · 배경 = variant별 *Light 토큰 · 전경 = 해당 시맨틱 색 ·
// radius sm · padding 2/6.
//
// ⚠️ 웹 `.jd-code`의 1pt 테두리(color-mix 30%)는 계약 표면에 없고 대응 토큰도 없어 생략한다 —
//    스펙 결손 보고분(JdKbdView가 웹 미세 그림자를 같은 이유로 생략한 선례).
public final class JdCodeView: UILabel {

    // 웹 variant attribute 동형
    public var variant: JdCodeVariant {
        didSet { applyStyle() }
    }

    // size는 UILabel 계열 API와 헷갈리므로 codeSize (JdTextView.textSize 선례)
    public var codeSize: JdControlSize {
        didSet {
            metrics = JdCodeMetrics(size: codeSize)
            applyStyle()
            invalidateIntrinsicContentSize()
        }
    }

    private var metrics: JdCodeMetrics

    public init(_ text: String,
                variant: JdCodeVariant = .default,
                size: JdControlSize = .md) {
        self.variant = variant
        self.codeSize = size
        self.metrics = JdCodeMetrics(size: size)
        super.init(frame: .zero)

        self.text = text
        numberOfLines = 1 // 인라인 코드 — 웹 white-space 기본(줄바꿈 없이 한 줄 칩)
        textAlignment = .center
        adjustsFontForContentSizeCategory = true

        layer.cornerRadius = JdToken.Radius.sm
        layer.cornerCurve = .continuous
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // UILabel은 인셋 개념이 없어 intrinsic에 직접 더한다(JdKbdView와 동일 관용구)
    public override var intrinsicContentSize: CGSize {
        let base = super.intrinsicContentSize
        return CGSize(width: base.width + metrics.hPadding * 2,
                      height: base.height + metrics.vPadding * 2)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        font = JdFontBridge.scaledMonoFont(size: metrics.fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        textColor = JdCodeMetrics.foreground(variant).uiColor
        backgroundColor = JdCodeMetrics.background(variant).uiColor
    }
}

// 치수·색 결의 — SwiftUI 계층(JdCode)에 동형 사본이 있다(DEC-010으로 공유 불가).
// Core에 JdCodeSpec이 없어 토큰만으로 결의한다: 새 리터럴을 만들지 않는다.
struct JdCodeMetrics {
    let fontSize: CGFloat
    let hPadding: CGFloat
    let vPadding: CGFloat

    /// 웹 램프: sm 11pt·0/4 · md 12pt·2/6 · lg 13pt·4/8.
    /// 패딩은 토큰과 정확히 일치하고, 11·13pt만 대응 토큰이 없어 JdTextSpec 사다리
    /// (10/12/14 — JdBadgeSpec의 sm/md/lg 사다리와 동일)로 옮긴다(notes 보고분).
    init(size: JdControlSize) {
        switch size {
        case .sm:
            fontSize = JdTextSpec.resolve(size: .xs2).fontSize   // 10
            hPadding = JdToken.Space.s1                          // 4
            vPadding = JdToken.Space.s0                          // 0
        case .md:
            fontSize = JdTextSpec.resolve(size: .xs).fontSize    // 12
            hPadding = JdToken.Space.s1_5                        // 6 (계약 padding 2/6)
            vPadding = JdToken.Space.s0_5                        // 2
        case .lg:
            fontSize = JdTextSpec.resolve(size: .sm).fontSize    // 14
            hPadding = JdToken.Space.s2                          // 8
            vPadding = JdToken.Space.s1                          // 4
        }
    }

    /// default는 *Light 짝이 없다 — 웹 base(`--jd-color-card-hover`)를 그대로 쓴다.
    static func background(_ variant: JdCodeVariant) -> JdDynamicColor {
        switch variant {
        case .default: return JdToken.Color.cardHover
        case .primary: return JdToken.Color.primaryLight
        case .success: return JdToken.Color.successLight
        case .warning: return JdToken.Color.warningLight
        case .danger: return JdToken.Color.dangerLight
        }
    }

    static func foreground(_ variant: JdCodeVariant) -> JdDynamicColor {
        switch variant {
        case .default: return JdToken.Color.foreground
        case .primary: return JdToken.Color.primary
        case .success: return JdToken.Color.success
        case .warning: return JdToken.Color.warning
        case .danger: return JdToken.Color.danger
        }
    }
}
