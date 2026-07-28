import JunDSCore
import UIKit

// 웹 jd-live-price-text 동형 — 현재가 텍스트 리프. (DEC-040)
//
// 값은 주입받고(DEC-019), price > 0이 아니면 fallback, 둘 다 없으면 em dash를 그린다.
// locale은 프롭이며 Core의 JdNumberFormat이 Locale.current를 읽지 않는다 — 기기 지역
// 설정이 결과에 새면 스냅샷·테스트가 흔들린다는 계약을 상속한다.
public class JdLivePriceTextView: UILabel {

    public var price: Double {
        didSet { applyContent() }
    }

    public var fallback: Double {
        didSet { applyContent() }
    }

    public var decimals: Int {
        didSet { applyContent() }
    }

    public var locale: String {
        didSet { applyContent() }
    }

    public init(
        price: Double,
        fallback: Double = 0,
        decimals: Int = 0,
        locale: String = "ko-KR"
    ) {
        self.price = price
        self.fallback = fallback
        self.decimals = decimals
        self.locale = locale
        super.init(frame: .zero)
        adjustsFontForContentSizeCategory = true
        numberOfLines = 1
        applyStyle()
        applyContent()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public var resolvedValue: Double {
        JdFinanceFormat.resolvedPrice(price: price, fallback: fallback)
    }

    /// 확정 표시 문자열 — 파생·소비자 공용
    public var formatted: String {
        JdFinanceFormat.priceText(resolvedValue, decimals: decimals, locale: locale)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부 — 파생 클래스가 확장한다

    func applyStyle() {
        font = JdFontBridge.scaledDigitFont(
            size: JdTextSpec.resolve(size: .md).fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
    }

    func applyContent() {
        text = formatted
        // em dash는 "가격 없음"이라는 뜻이지만 VoiceOver는 "대시"라고 읽는다 — 웹엔 없는 보정
        accessibilityLabel = resolvedValue > 0 ? formatted : "가격 정보 없음"
    }
}
