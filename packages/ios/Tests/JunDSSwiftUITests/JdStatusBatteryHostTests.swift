import JunDS
import SwiftUI
import XCTest

// SwiftUI 계층은 호스팅 스모크 + 크기 축 단조성으로 확인한다 (DESIGN-2 §C).

final class JdStatusBatteryHostTests: XCTestCase {

    private func fit<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: 320, height: 200))
    }

    func test_jdStatusDot_hosts_and_sizes() {
        let size = fit(JdStatusDot(.pulse, label: "실시간", size: .md))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // 라벨이 없으면 점만 남아 더 좁다
        let dotOnly = fit(JdStatusDot(.pulse, size: .md))
        XCTAssertGreaterThan(size.width, dotOnly.width)

        // 크기 축 단조성 — sm 6 < lg 10
        let small = fit(JdStatusDot(.neutral, size: .sm))
        let large = fit(JdStatusDot(.neutral, size: .lg))
        XCTAssertGreaterThan(large.width, small.width)
    }

    func test_jdSeverityBadge_hosts_and_sizes() {
        let size = fit(JdSeverityBadge("위험", severity: .danger))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // 점을 켜면 gap+8pt만큼 넓어진다
        let withDot = fit(JdSeverityBadge("위험", severity: .danger, showsDot: true))
        XCTAssertGreaterThan(withDot.width, size.width)

        // 크기 축 단조성 — sm 패딩·폰트가 md보다 작다
        let small = fit(JdSeverityBadge("위험", severity: .danger, size: .sm))
        XCTAssertGreaterThan(size.width, small.width)
    }

    func test_jdBatteryIndicator_hosts_and_sizes() {
        let size = fit(JdBatteryIndicator(value: 64, size: .md))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // 라벨이 붙으면 넓어진다
        let labeled = fit(JdBatteryIndicator(value: 64, size: .md, label: "노트북"))
        XCTAssertGreaterThan(labeled.width, size.width)

        // 크기 축 단조성 — 본체 sm 40 < md 56 < lg 80
        let small = fit(JdBatteryIndicator(value: 64, size: .sm))
        let large = fit(JdBatteryIndicator(value: 64, size: .lg, autoColor: true))
        XCTAssertGreaterThan(size.width, small.width)
        XCTAssertGreaterThan(large.width, size.width)
    }

    // 범위 밖 값도 호스팅이 깨지지 않는다(클램프는 Core가 이미 처리)
    func test_jdBatteryIndicator_hosts_out_of_range_values() {
        for value in [-1000.0, -0.1, 0, 100, 100.1, 1000] {
            let size = fit(JdBatteryIndicator(value: value, size: .lg, autoColor: true))
            XCTAssertGreaterThan(size.width, 0, "value=\(value)")
        }
    }
}
