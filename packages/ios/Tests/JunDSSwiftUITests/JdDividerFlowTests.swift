import JunDS
import SwiftUI
import XCTest

final class JdDividerFlowTests: XCTestCase {

    func test_jdDivider_hosts_and_sizes() {
        let host = UIHostingController(rootView: JdDivider())
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // 라벨 모드는 라벨 텍스트 높이만큼 선(1pt)보다 커진다
    func test_jdDivider_label_mode_grows_beyond_line() {
        let plain = UIHostingController(rootView: JdDivider())
            .sizeThatFits(in: CGSize(width: 320, height: 200))
        let labeled = UIHostingController(rootView: JdDivider(label: "또는"))
            .sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(labeled.height, plain.height)
    }

    func test_jdDivider_vertical_hosts() {
        let host = UIHostingController(rootView: JdDivider(orientation: .vertical))
        let size = host.sizeThatFits(in: CGSize(width: 200, height: 320))
        XCTAssertGreaterThan(size.width, 0)
    }

    // 좁은 폭에서 다음 행으로 줄바꿈 — 넓은 폭 대비 높이가 커진다 (웹 jd-group wrap 동형)
    func test_jdFlowLayout_wraps_when_narrow() {
        let content = JdFlowLayout {
            ForEach(0..<6, id: \.self) { _ in
                JdToken.Color.border.color
                    .frame(width: 80, height: 24)
            }
        }
        let wide = UIHostingController(rootView: content)
            .sizeThatFits(in: CGSize(width: 1000, height: 1000))
        let narrow = UIHostingController(rootView: content)
            .sizeThatFits(in: CGSize(width: 200, height: 1000))
        XCTAssertGreaterThan(wide.height, 0)
        XCTAssertGreaterThan(narrow.height, wide.height)
    }
}
