import JunDS
import SwiftUI
import XCTest

// finance 조립 3종 SwiftUI 계층 — 호스팅 + 배치 반응 (DESIGN-2 §C). (DEC-041)
final class JdFinanceLayoutHostTests: XCTestCase {

    override func tearDown() {
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    private func fit<V: View>(_ view: V, width: CGFloat = 320, height: CGFloat = 400) -> CGSize {
        UIHostingController(rootView: view).sizeThatFits(in: CGSize(width: width, height: height))
    }

    // MARK: - LiveStackedCell

    func test_stacked_cell_hosts_and_exposes_lines() {
        let cell = JdLiveStackedCell(price: 71_200, change: 1.234)
        XCTAssertEqual(cell.lines.price, "71,200")
        XCTAssertEqual(cell.lines.pct, "+1.23%")

        let size = fit(cell)
        XCTAssertGreaterThan(size.width, 0)
        // 2단이므로 한 줄 텍스트보다 높다
        XCTAssertGreaterThan(size.height, fit(JdLivePriceText(price: 71_200)).height)
    }

    func test_stacked_cell_falls_back_per_value() {
        XCTAssertEqual(
            JdLiveStackedCell(
                price: 0, change: 0,
                priceFallback: 68_000, pctFallback: -2.5
            ).lines.price, "68,000")
        XCTAssertEqual(JdLiveStackedCell(price: 0, change: 0).lines.price, JdFinanceFormat.emDash)
    }

    // MARK: - PositionBar

    // 마커가 트랙보다 크므로 전체 높이는 마커 기준이다
    func test_position_bar_height_follows_marker() {
        let spec = JdPositionBarSpec.resolve(tone: .up)
        let size = fit(JdPositionBar(low: 0.2, high: 0.8, cur: 0.5))
        XCTAssertEqual(size.height, spec.markerHeight, accuracy: 0.5)
        XCTAssertGreaterThan(size.height, spec.trackHeight)
    }

    func test_position_bar_hosts_at_extremes_without_crashing() {
        for (l, h, c) in [(0.0, 1.0, 0.0), (0.0, 1.0, 1.0), (0.9, 0.2, 0.5), (-1.0, 5.0, 2.0)] {
            XCTAssertGreaterThan(
                fit(JdPositionBar(low: l, high: h, cur: c)).height, 0,
                "low=\(l) high=\(h) cur=\(c)")
        }
    }

    // MARK: - MicroKpiRow — 배치를 스스로 소유한다

    private var kpis: [JdMicroKpiItem] {
        [
            .init(label: "USD/KRW", value: "1,320", pct: -0.4, unit: "원"),
            .init(label: "외국인", value: "+1,204", pct: 1.2, hint: "순매수"),
            .init(label: "기관", value: "-820", pct: -0.8, hint: "순매도"),
            .init(label: "WTI", value: "78.2", pct: 1.1, unit: "$"),
        ]
    }

    // 좁은 폭에서 열이 줄어 높이가 늘어난다 — 소비자가 격자를 짜지 않아도 반응한다
    func test_kpi_row_reflows_as_width_shrinks() {
        let wide = fit(JdMicroKpiRow(items: kpis), width: 700, height: 600).height
        let narrow = fit(JdMicroKpiRow(items: kpis), width: 300, height: 600).height
        XCTAssertGreaterThan(narrow, wide, "폭이 좁아졌는데 높이가 늘지 않았다 — 재배치가 안 된다")
    }

    func test_kpi_row_grows_with_item_count() {
        let two = fit(JdMicroKpiRow(items: Array(kpis.prefix(2))), width: 300, height: 600).height
        let four = fit(JdMicroKpiRow(items: kpis), width: 300, height: 600).height
        XCTAssertGreaterThan(four, two)
    }

    func test_kpi_row_with_no_items_takes_no_height() {
        XCTAssertEqual(fit(JdMicroKpiRow(items: [])).height, 0, accuracy: 0.5)
    }

    func test_kpi_cell_fills_its_column_width() {
        // 셀은 격자 칸을 채우는 것이 계약이다(maxWidth: .infinity) — 그래서 내용 길이가
        // 아니라 **제안된 폭**이 폭을 정한다. 이게 열이 맞는 이유이고, 내용에 따라 폭이
        // 달라지면 격자가 들쭉날쭉해진다.
        XCTAssertEqual(fit(JdMicroKpiCell(item: kpis[0]), width: 320).width, 320, accuracy: 0.5)
        XCTAssertEqual(fit(JdMicroKpiCell(item: kpis[0]), width: 200).width, 200, accuracy: 0.5)
        XCTAssertGreaterThan(fit(JdMicroKpiCell(item: kpis[0])).height, 0)
    }

    // 단위·보조 문구가 길어지면 높이는 그대로고 폭도 칸을 지킨다(줄바꿈 없음)
    func test_kpi_cell_height_is_stable_across_content() {
        let short = fit(JdMicroKpiCell(item: .init(label: "L", value: "1", pct: 1)), width: 200)
            .height
        let long = fit(
            JdMicroKpiCell(
                item: .init(
                    label: "USD/KRW", value: "1,320",
                    pct: -0.4, unit: "원", hint: "순매수")),
            width: 200
        ).height
        XCTAssertEqual(short, long, accuracy: 0.5, "셀 높이가 내용에 따라 흔들리면 행이 어긋난다")
    }
}
