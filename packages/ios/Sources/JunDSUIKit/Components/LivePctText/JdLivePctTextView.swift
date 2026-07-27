import UIKit
import JunDSCore

// 웹 jd-live-pct-text 동형 — 등락률 텍스트 리프. A8 명명 규칙 Jd<이름>View. (DEC-040)
//
// 텍스트 리프이므로 UILabel 서브클래스다(JdTextView·JdMarkView 선례). 색을 스스로 정하지
// 않는다 — 웹 LivePctText가 색 없는 Fragment였던 것과 동형이며, 색은 파생
// JdLivePctBadgeView 또는 소비자 몫이다.
//
// 값은 주입받는다(DEC-019 — 시세 구독은 finance-data 스코프). change가 0이면 fallback으로
// 폴백하는 v2 분기는 Core(JdFinanceFormat)가 소유한다.
public class JdLivePctTextView: UILabel {

    public var change: Double {
        didSet { applyContent() }
    }

    /// SSR/시드 전 폴백값. change가 정확히 0일 때만 쓰인다(웹 `change !== 0`).
    public var fallback: Double {
        didSet { applyContent() }
    }

    public var decimals: Int {
        didSet { applyContent() }
    }

    /// 웹 showSign=true 기본. false면 양수 앞 "+"를 숨긴다.
    public var showSign: Bool {
        didSet { applyContent() }
    }

    /// 웹 withPercent=true 기본. false면 "%" 접미를 숨긴다.
    public var withPercent: Bool {
        didSet { applyContent() }
    }

    public init(change: Double,
                fallback: Double = 0,
                decimals: Int = 2,
                showSign: Bool = true,
                withPercent: Bool = true) {
        self.change = change
        self.fallback = fallback
        self.decimals = decimals
        self.showSign = showSign
        self.withPercent = withPercent
        super.init(frame: .zero)
        adjustsFontForContentSizeCategory = true
        numberOfLines = 1 // 웹 인라인 동형
        applyStyle()
        applyContent()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 표시값 — 추세 판정도 이 값으로 한다(원시 change가 아니라 화면의 숫자)
    public var resolvedValue: Double {
        JdFinanceFormat.resolvedChange(change: change, fallback: fallback)
    }

    /// 확정 표시 문자열 — 파생·소비자 공용. 웹 `get formatted()` 동형.
    public var formatted: String {
        JdFinanceFormat.percentText(resolvedValue,
                                    decimals: decimals,
                                    showSign: showSign,
                                    withPercent: withPercent)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 스케일 폰트는 수동 재적용 (JdTagView와 같은 규칙)
        applyStyle()
    }

    // MARK: 내부 — 파생 클래스가 확장한다

    func applyStyle() {
        font = JdFontBridge.scaledDigitFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
    }

    func applyContent() {
        text = formatted
    }
}
