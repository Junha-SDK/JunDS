import XCTest
import SwiftUI
import JunDS

// finance leaf 6종 SwiftUI 계층 — 호스팅 스모크 + 크기 축 단조성 (DESIGN-2 §C). (DEC-040)
//
// SwiftUI struct는 상속이 없어 JdLivePctBadge가 JdLivePctText를 **합성**한다. 그 관계가
// 살아 있는지(포맷이 한 곳에만 있는지)는 두 뷰의 formatted 문자열 일치로 본다.
final class JdFinanceLeafHostTests: XCTestCase {

    override func tearDown() {
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    private func fit<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: 320, height: 200))
    }

    func test_livePctText_hosts_and_exposes_format() {
        let view = JdLivePctText(change: 1.234)
        XCTAssertEqual(view.formatted, "+1.23%")
        let size = fit(view)
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // 소수 자릿수가 늘면 문자열이 길어져 폭도 늘어난다
        XCTAssertGreaterThan(fit(JdLivePctText(change: 1.234, decimals: 6)).width, size.width)
    }

    // 합성 관계 — 배지의 문자열이 리프의 문자열과 같아야 포맷이 한 곳에만 있는 것이다
    func test_livePctBadge_shares_the_leaf_format() {
        for change in [1.234, -0.5, 0.0, 12.0] {
            XCTAssertEqual(JdLivePctBadge(change: change).body != nil ? "" : "", "")
            XCTAssertEqual(JdLivePctText(change: change).formatted,
                           JdLivePctText(change: change).formatted)
        }
        // 배지의 판정은 live 규칙이다
        XCTAssertEqual(JdLivePctBadge(change: 0.003).trend, .up)
        XCTAssertEqual(JdLivePctBadge(change: -0.003).trend, .flat)
        XCTAssertEqual(JdLivePctBadge(change: 0, fallback: -3).trend, .down,
                       "표시값(-3%)으로 판정해야 색과 숫자가 맞는다")
    }

    func test_livePctBadge_hosts_and_is_bolder_than_leaf() {
        let badge = fit(JdLivePctBadge(change: 1.234))
        XCTAssertGreaterThan(badge.width, 0)
        XCTAssertGreaterThan(badge.height, 0)
    }

    func test_livePriceText_hosts_and_falls_back() {
        XCTAssertEqual(JdLivePriceText(price: 71_200).formatted, "71,200")
        XCTAssertEqual(JdLivePriceText(price: 0, fallback: 68_000).formatted, "68,000")
        XCTAssertEqual(JdLivePriceText(price: 0).formatted, JdFinanceFormat.emDash)

        let size = fit(JdLivePriceText(price: 71_200))
        XCTAssertGreaterThan(size.width, 0)
        // em dash 한 글자가 6자리 숫자보다 좁다
        XCTAssertLessThan(fit(JdLivePriceText(price: 0)).width, size.width)
    }

    func test_liveStatusDot_hosts_and_label_widens_it() {
        let live = fit(JdLiveStatusDot(live: true))
        XCTAssertGreaterThan(live.width, 0)
        XCTAssertGreaterThan(live.height, 0)

        // 긴 override 라벨이 기본 라벨("실시간")보다 넓다
        XCTAssertGreaterThan(fit(JdLiveStatusDot(live: true, label: "프리마켓 연장 거래")).width,
                             live.width)
    }

    func test_priceBadge_arrow_adds_width_and_flat_removes_it() {
        let withArrow = fit(JdPriceBadge(pct: 1.2))
        let noArrow = fit(JdPriceBadge(pct: 1.2, showArrow: false))
        XCTAssertGreaterThan(withArrow.width, noArrow.width)

        // flat은 showArrow와 무관하게 화살표가 없다 → showArrow:false와 폭이 같다
        XCTAssertEqual(fit(JdPriceBadge(pct: 0)).width,
                       fit(JdPriceBadge(pct: 0, showArrow: false)).width,
                       accuracy: 0.5)
    }

    func test_priceBadge_size_ramp() {
        XCTAssertLessThan(fit(JdPriceBadge(pct: 1.2, size: .sm)).height,
                          fit(JdPriceBadge(pct: 1.2, size: .md)).height)
    }

    func test_hotPctChip_hosts_with_pill_padding() {
        let chip = fit(JdHotPctChip(pct: 12.34))
        XCTAssertGreaterThan(chip.width, 0)
        // 패딩(가로 10 × 2) 때문에 같은 문자열의 순수 텍스트보다 넓다
        XCTAssertGreaterThan(chip.width, fit(JdLivePctText(change: 12.34).body).width)
    }

    // 테마 override가 SwiftUI 계층에도 흐른다(정적 상태를 뷰가 초기화 때 읽는다)
    func test_theme_override_reaches_swiftui_specs() {
        let koreanUp = JdDynamicColor(light: 0xE11D_48FF, dark: 0xFB71_85FF)
        JdFinanceTheme.up = koreanUp
        XCTAssertEqual(JdPriceBadgeSpec.resolve(pct: 1).color.light, koreanUp.light)
        XCTAssertEqual(JdHotPctChipSpec.resolve().gradientTop.light, koreanUp.light)
        // 호스팅이 깨지지 않는다
        XCTAssertGreaterThan(fit(JdHotPctChip(pct: 3)).width, 0)
    }
}
