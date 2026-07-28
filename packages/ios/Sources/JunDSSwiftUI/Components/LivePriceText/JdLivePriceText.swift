import JunDSCore
import SwiftUI

// 웹 jd-live-price-text 동형 — 현재가 텍스트 리프 (DEC-040).
//
// **가격 렌더 계열의 골격 정본**. 값은 주입받고(DEC-019), price > 0이 아니면 fallback,
// 둘 다 없으면 em dash("—")를 그린다 — 판정은 Core가 소유한다.
//
// locale이 프롭인 이유: 웹 v2가 "ko-KR"을 하드코딩했다가 v3에서 프롭으로 열었고, Core의
// JdNumberFormat은 Locale.current를 **읽지 않는다**(같은 인자 → 같은 문자열 계약).
// 기기 지역 설정이 결과에 새면 스냅샷·테스트·디자인 대조가 전부 흔들린다.
public struct JdLivePriceText: View {
    private let price: Double
    private let fallback: Double
    private let decimals: Int
    private let locale: String

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

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
    }

    /// 확정 표시 문자열 — 파생·소비자 공용. 웹 `get formatted()` 동형.
    public var formatted: String {
        JdFinanceFormat.priceText(resolvedValue, decimals: decimals, locale: locale)
    }

    public var resolvedValue: Double {
        JdFinanceFormat.resolvedPrice(price: price, fallback: fallback)
    }

    public var body: some View {
        Text(formatted)
            .monospacedDigit()
            .font(
                JdSwiftUIFont.scaled(
                    size: JdTextSpec.resolve(size: .md).fontSize,
                    weight: JdToken.FontWeight.normal,
                    category: sizeCategory)
            )
            // em dash는 "가격 없음"이라는 뜻이지만 VoiceOver는 "대시"라고 읽는다 —
            // 웹엔 없는 보정이다(04 §7.1: 상태는 말로).
            .accessibilityLabel(Text(resolvedValue > 0 ? formatted : "가격 정보 없음"))
    }
}
