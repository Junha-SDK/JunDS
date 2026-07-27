import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// finance leaf 6종 UIKit 계층 (DEC-040).
//
// 보는 것: (1) 파생 상속 관계가 실제로 골격을 재사용하는가 (2) 색이 추세를 따라 흐르는가
// (3) 접근성 표면이 색·기호에만 의존하지 않는가 (4) 프롭 변경이 반영되는가.
final class JdFinanceLeafViewTests: XCTestCase {

    override func tearDown() {
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    // JdDynamicColor.uiColor는 매 접근마다 UIColor(dynamicProvider:)를 새로 만든다 —
    // 인스턴스 동일성으로는 절대 같아지지 않으므로 **해석된 색**으로 비교한다
    // (JdChipTests와 같은 관용구).
    private let light = UITraitCollection(userInterfaceStyle: .light)

    private func assertSameColor(_ actual: UIColor?,
                                 _ expected: JdDynamicColor,
                                 _ message: String = "",
                                 line: UInt = #line) {
        XCTAssertEqual(actual?.resolvedColor(with: light),
                       expected.uiColor.resolvedColor(with: light),
                       message,
                       line: line)
    }

    // MARK: - LivePctText (골격 정본)

    func test_livePctText_formats_and_falls_back() {
        let view = JdLivePctTextView(change: 1.234)
        XCTAssertEqual(view.text, "+1.23%")

        // change가 정확히 0이면 fallback (웹 change !== 0 분기)
        view.change = 0
        view.fallback = -2.5
        XCTAssertEqual(view.text, "-2.50%")

        view.showSign = false
        view.change = 3
        XCTAssertEqual(view.text, "3.00%")

        view.withPercent = false
        XCTAssertEqual(view.text, "3.00")
    }

    // 색을 스스로 정하지 않는다 — 웹 LivePctText가 색 없는 Fragment였던 것과 동형
    func test_livePctText_does_not_paint_trend_color() {
        let up = JdLivePctTextView(change: 5)
        let down = JdLivePctTextView(change: -5)
        XCTAssertEqual(up.textColor.resolvedColor(with: light),
                       down.textColor.resolvedColor(with: light),
                       "리프가 추세 색을 칠하면 파생 배지와 역할이 겹친다")
    }

    // 숫자 폭이 고정되어야 값이 갱신될 때 라벨이 흔들리지 않는다 (웹 tabular-nums)
    func test_livePctText_uses_tabular_digits() {
        let view = JdLivePctTextView(change: 1)
        let one = view.font.description
        view.change = 8.888
        XCTAssertEqual(view.font.description, one, "폰트가 값에 따라 바뀌면 안 된다")

        // monospacedDigit 폰트는 좁은 숫자(1)와 넓은 숫자(8)의 폭이 같다
        let attrs: [NSAttributedString.Key: Any] = [.font: view.font!]
        let w1 = ("11111" as NSString).size(withAttributes: attrs).width
        let w8 = ("88888" as NSString).size(withAttributes: attrs).width
        XCTAssertEqual(w1, w8, accuracy: 0.5, "숫자 폭이 등폭이 아니다")
    }

    // MARK: - LivePctBadge (파생 — 상속으로 골격 재사용)

    func test_livePctBadge_inherits_format_and_adds_color() {
        let badge = JdLivePctBadgeView(change: 1.234)
        XCTAssertTrue(badge is JdLivePctTextView, "파생 관계가 끊겼다 — 포맷이 중복 구현될 위험")
        XCTAssertEqual(badge.text, "+1.23%", "부모의 포맷 골격을 그대로 쓴다")
        assertSameColor(badge.textColor, JdFinanceTheme.color(.up))
    }

    // live 규칙: 아주 작은 양수는 상승색이고, 작은 음수는 보합색이다
    func test_livePctBadge_uses_live_trend_policy() {
        XCTAssertEqual(JdLivePctBadgeView(change: 0.003).trend, .up)
        XCTAssertEqual(JdLivePctBadgeView(change: -0.003).trend, .flat)
        XCTAssertEqual(JdLivePctBadgeView(change: -1).trend, .down)
    }

    // 판정은 원시 change가 아니라 fallback이 반영된 **표시값**으로 한다
    func test_livePctBadge_judges_the_displayed_number_not_the_raw_change() {
        let badge = JdLivePctBadgeView(change: 0, fallback: -3)
        XCTAssertEqual(badge.text, "-3.00%")
        XCTAssertEqual(badge.trend, .down, "화면엔 -3%인데 색이 보합이면 숫자와 색이 어긋난다")
    }

    // 색이 유일한 추세 신호가 되지 않게 말로도 붙인다
    func test_livePctBadge_speaks_the_trend() {
        XCTAssertEqual(JdLivePctBadgeView(change: 1.5).accessibilityLabel, "상승 +1.50%")
        XCTAssertEqual(JdLivePctBadgeView(change: -1.5).accessibilityLabel, "하락 -1.50%")
        XCTAssertEqual(JdLivePctBadgeView(change: 0).accessibilityLabel, "보합 0.00%")
    }

    func test_livePctBadge_follows_theme_override() {
        let koreanUp = JdDynamicColor(light: 0xE11D_48FF, dark: 0xFB71_85FF)
        JdFinanceTheme.up = koreanUp
        assertSameColor(JdLivePctBadgeView(change: 2).textColor, koreanUp)
    }

    // MARK: - LivePriceText

    func test_livePriceText_formats_and_falls_back() {
        let view = JdLivePriceTextView(price: 71_200)
        XCTAssertEqual(view.text, "71,200")

        // price > 0이 아니면 fallback (등락률과 규칙이 다르다 — 0도 폴백)
        view.price = 0
        view.fallback = 68_000
        XCTAssertEqual(view.text, "68,000")

        view.fallback = 0
        XCTAssertEqual(view.text, JdFinanceFormat.emDash)
        XCTAssertEqual(view.accessibilityLabel, "가격 정보 없음",
                       "em dash를 '대시'로 읽히게 두면 뜻이 사라진다")

        view.price = 1_234.5
        view.decimals = 2
        XCTAssertEqual(view.text, "1,234.50")
    }

    // MARK: - LiveStatusDot

    func test_liveStatusDot_default_labels_and_override() {
        let live = JdLiveStatusDotView(live: true)
        XCTAssertEqual(live.textLabel.text, "실시간")
        XCTAssertEqual(live.accessibilityLabel, "실시간")
        XCTAssertTrue(live.isAccessibilityElement, "점+라벨이 따로 읽히면 안 된다")

        let closed = JdLiveStatusDotView(live: false)
        XCTAssertEqual(closed.textLabel.text, "장마감")

        live.label = "프리마켓"
        XCTAssertEqual(live.textLabel.text, "프리마켓")
        XCTAssertEqual(live.accessibilityLabel, "프리마켓")

        // 빈 문자열은 override가 아니라 기본값으로 되돌아간다(웹 `label || 기본` 동형)
        live.label = ""
        XCTAssertEqual(live.textLabel.text, "실시간")
    }

    func test_liveStatusDot_colors_follow_session() {
        let live = JdLiveStatusDotView(live: true)
        assertSameColor(live.dot.backgroundColor, JdFinanceTheme.live)
        assertSameColor(live.textLabel.textColor, JdFinanceTheme.live)

        let closed = JdLiveStatusDotView(live: false)
        assertSameColor(closed.dot.backgroundColor, JdToken.Color.muted)
    }

    // 링은 라이브에서만 돌고, 비라이브에선 숨는다(멈춘 반투명 원이 남으면 점이 두 겹으로 보인다)
    func test_liveStatusDot_ring_only_exists_while_live() {
        let live = JdLiveStatusDotView(live: true)
        XCTAssertFalse(live.ring.isHidden)

        let closed = JdLiveStatusDotView(live: false)
        XCTAssertTrue(closed.ring.isHidden)
        XCTAssertNil(closed.ring.layer.animation(forKey: "jd.liveStatusDot.pulse"))
    }

    // MARK: - PriceBadge

    func test_priceBadge_uses_exact_trend_policy() {
        XCTAssertEqual(JdPriceBadgeView(pct: 0.003).trend, .up)
        // live 규칙이면 flat인 값이 여기서는 down이다 — 두 배지가 합쳐지지 않았다는 증거
        XCTAssertEqual(JdPriceBadgeView(pct: -0.003).trend, .down)
        XCTAssertEqual(JdPriceBadgeView(pct: 0).trend, .flat)
    }

    func test_priceBadge_arrow_visibility() {
        XCTAssertFalse(JdPriceBadgeView(pct: 0).arrow.isHidden == false, "flat엔 화살표가 없다")
        XCTAssertFalse(JdPriceBadgeView(pct: 1.2).arrow.isHidden)
        XCTAssertNotNil(JdPriceBadgeView(pct: 1.2).arrow.image)
        XCTAssertTrue(JdPriceBadgeView(pct: 1.2, showArrow: false).arrow.isHidden)
        XCTAssertNil(JdPriceBadgeView(pct: 0).arrow.image)
    }

    func test_priceBadge_reacts_to_prop_changes() {
        let badge = JdPriceBadgeView(pct: 1.2)
        XCTAssertEqual(badge.valueLabel.text, "+1.20%")
        assertSameColor(badge.valueLabel.textColor, JdFinanceTheme.color(.up))

        badge.pct = -4.56
        XCTAssertEqual(badge.valueLabel.text, "-4.56%")
        assertSameColor(badge.valueLabel.textColor, JdFinanceTheme.color(.down))
        XCTAssertEqual(badge.accessibilityLabel, "하락 -4.56%")

        badge.pct = 0
        XCTAssertTrue(badge.arrow.isHidden)
        assertSameColor(badge.valueLabel.textColor, JdFinanceTheme.color(.flat))
    }

    func test_priceBadge_size_ramp() {
        let sm = JdPriceBadgeView(pct: 1.2, size: .sm)
        let md = JdPriceBadgeView(pct: 1.2, size: .md)
        XCTAssertLessThan(sm.valueLabel.font.pointSize, md.valueLabel.font.pointSize)
    }

    // MARK: - HotPctChip

    func test_hotPctChip_is_always_upward() {
        let chip = JdHotPctChipView(pct: 12.345)
        XCTAssertEqual(chip.valueLabel.text, "↑ 12.35%")
        XCTAssertEqual(chip.accessibilityLabel, "급등 12.35%",
                       "↑는 낭독되지 않거나 '위쪽 화살표'로 읽힌다 — 뜻을 말로 줘야 한다")

        chip.pct = -3
        XCTAssertEqual(chip.valueLabel.text, "↑ -3.00%", "웹과 동형 — 부호 분기가 없다")
    }

    // 알약 반경은 리터럴이 아니라 높이의 절반 — Dynamic Type에서 모양이 유지된다
    func test_hotPctChip_corner_radius_tracks_height() {
        let chip = JdHotPctChipView(pct: 5)
        chip.frame = CGRect(x: 0, y: 0, width: 90, height: 24)
        chip.layoutSubviews()
        XCTAssertEqual(chip.layer.cornerRadius, 12, accuracy: 0.001)

        chip.frame = CGRect(x: 0, y: 0, width: 120, height: 40)
        chip.layoutSubviews()
        XCTAssertEqual(chip.layer.cornerRadius, 20, accuracy: 0.001)
    }
}
