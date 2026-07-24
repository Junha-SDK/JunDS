import UIKit
import JunDSCore

// 웹 jd-kbd 동형 — 단축키 표기 칩. A8 명명 규칙 Jd<이름>View(UILabel 서브클래스).
// keys의 공백 제거는 Core가 한다("⌘ K" → "⌘K"). JdKbdSpec은 치수만 주므로 색은 웹 CSS
// 매핑대로 토큰에서 읽는다(배경 #f9fafb ≈ cardHover · 테두리 border · 글자 muted · mono medium).
// ⚠️ 웹의 미세 바닥 그림자(0 1px 0 1px rgba(0,0,0,.04))는 대응 토큰이 없어 생략 — 스펙 결손 보고.
// ⚠️ JdKbdSpec.gap(2)은 키를 개별 요소로 쪼갤 때의 간격이라 단일 라벨 구현엔 소비처가 없다.
public final class JdKbdView: UILabel {

    // 웹 keys attribute 동형 — 대입 시 정규화 재적용
    public var keys: String {
        didSet {
            text = JdKbdSpec.normalize(keys: keys)
            invalidateIntrinsicContentSize()
        }
    }

    private let spec = JdKbdSpec.resolve()

    public init(_ keys: String) {
        self.keys = keys
        super.init(frame: .zero)

        text = JdKbdSpec.normalize(keys: keys)
        textAlignment = .center
        adjustsFontForContentSizeCategory = true

        backgroundColor = JdToken.Color.cardHover.uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        layer.borderWidth = JdToken.Border.thin

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 padding 2/6 동형 — UILabel은 인셋 개념이 없어 intrinsic에 직접 더한다
    public override var intrinsicContentSize: CGSize {
        let base = super.intrinsicContentSize
        return CGSize(width: base.width + spec.hPadding * 2,
                      height: base.height + spec.vPadding * 2)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(테두리)와 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        font = JdFontBridge.scaledMonoFont(size: spec.fontSize,
                                           weight: JdToken.FontWeight.medium,
                                           compatibleWith: traitCollection)
        textColor = JdToken.Color.muted.uiColor
        layer.borderColor = JdToken.Color.border.uiColor
            .resolvedColor(with: traitCollection).cgColor
    }
}
