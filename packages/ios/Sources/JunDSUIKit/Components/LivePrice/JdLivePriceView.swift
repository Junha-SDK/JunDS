import UIKit
import JunDSCore

// 웹 jd-live-price 동형 — 현재가 + 값 변화 플래시. (DEC-048)
//
// JdLivePriceTextView 상속: 포맷 골격을 그대로 쓰고 크기·플래시만 얹는다(웹의 class
// extends를 UIKit에서도 상속으로 — SwiftUI 쪽은 struct라 합성이다).
public final class JdLivePriceView: JdLivePriceTextView {

    public var size: JdLivePriceSize = .md {
        didSet { applyStyle() }
    }

    /// 웹 showFlash=true 기본. false면 값이 바뀌어도 번쩍이지 않는다.
    public var showsFlash = true

    private var spec = JdLivePriceSpec.resolve()
    private var flashWork: DispatchWorkItem?
    /// 직전 표시값 — 최초 표시에서는 nil이라 플래시가 켜지지 않는다
    private var previousValue: Double?

    public override var price: Double {
        didSet { flashIfNeeded(previous: oldValue) }
    }

    // MARK: 내부

    override func applyStyle() {
        spec = JdLivePriceSpec.resolve(size: size)
        font = JdFontBridge.scaledDigitFont(size: spec.fontSize,
                                           weight: spec.fontWeight,
                                           compatibleWith: traitCollection)
        textColor = spec.textColor.uiColor
        layer.cornerRadius = spec.cornerRadius
        layer.masksToBounds = true
    }

    private func flashIfNeeded(previous: Double) {
        // 최초 1회는 previousValue가 nil이라 건너뛴다(웹 #started 게이트 동형)
        defer { previousValue = price }
        guard showsFlash, previousValue != nil,
              JdMotion.duration(JdLivePriceSpec.flashDuration) > 0,
              let trend = JdLivePriceSpec.flashTrend(previous: previous, current: price) else { return }

        flashWork?.cancel()
        backgroundColor = JdLivePriceSpec.flashColor(trend).uiColor
        let work = DispatchWorkItem { [weak self] in
            guard let self else { return }
            UIView.animate(withDuration: JdToken.Duration.slow) { self.backgroundColor = .clear }
        }
        flashWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + JdLivePriceSpec.flashDuration, execute: work)
    }

    deinit { flashWork?.cancel() }
}
