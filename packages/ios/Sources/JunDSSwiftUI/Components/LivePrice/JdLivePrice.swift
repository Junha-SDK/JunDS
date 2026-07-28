import JunDSCore
import SwiftUI

// 웹 jd-live-price 동형 — 현재가 + 값 변화 플래시. (DEC-048)
//
// JdLivePriceText 파생: 포맷 골격은 그대로 쓰고 (a) 크기 (b) 플래시 둘만 얹는다.
// 색은 방향과 무관하게 늘 상승색이다(웹 라이브 티커 관습) — 방향은 플래시 배경이 말한다.
//
// 최초 표시에서는 플래시가 켜지지 않는다. onChange는 변화에만 반응하므로 그 규칙이
// 구조적으로 지켜진다(웹은 #started 게이트로 같은 일을 한다).
public struct JdLivePrice: View {
    private let price: Double
    private let fallback: Double
    private let decimals: Int
    private let locale: String
    private let showsFlash: Bool
    private let spec: JdLivePriceSpec

    @Environment(\.sizeCategory) private var sizeCategory
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var flash: JdTrend?

    public init(
        price: Double,
        fallback: Double = 0,
        size: JdLivePriceSize = .md,
        decimals: Int = 0,
        locale: String = "ko-KR",
        showsFlash: Bool = true
    ) {
        self.price = price
        self.fallback = fallback
        self.decimals = decimals
        self.locale = locale
        self.showsFlash = showsFlash
        self.spec = JdLivePriceSpec.resolve(size: size)
    }

    public var formatted: String {
        JdFinanceFormat.priceText(
            JdFinanceFormat.resolvedPrice(price: price, fallback: fallback),
            decimals: decimals, locale: locale)
    }

    public var body: some View {
        Text(formatted)
            .monospacedDigit()
            .font(
                JdSwiftUIFont.scaled(
                    size: spec.fontSize,
                    weight: spec.fontWeight,
                    category: sizeCategory)
            )
            .foregroundColor(spec.textColor.color)
            .padding(.horizontal, flash != nil ? spec.flashPadding.h : 0)
            .padding(.vertical, flash != nil ? spec.flashPadding.v : 0)
            .background(flash.map { JdLivePriceSpec.flashColor($0).color } ?? .clear)
            .clipShape(RoundedRectangle(cornerRadius: spec.cornerRadius, style: .continuous))
            .animation(flashAnimation, value: flash)
            .onChange(of: price) { [old = price] new in
                guard showsFlash, !reduceMotion,
                    let trend = JdLivePriceSpec.flashTrend(previous: old, current: new)
                else { return }
                flash = trend
                // 0.6초 뒤 스스로 꺼진다 — 소비자가 끄는 책임을 지지 않는다
                DispatchQueue.main.asyncAfter(deadline: .now() + JdLivePriceSpec.flashDuration) {
                    if flash == trend { flash = nil }
                }
            }
            .accessibilityLabel(Text(formatted))
    }

    private var flashAnimation: Animation? {
        guard !reduceMotion else { return nil }
        let d = JdMotion.duration(JdToken.Duration.slow)
        guard d > 0 else { return nil }
        return .easeOut(duration: d)
    }
}
