import XCTest
import SwiftUI
import JunDS

final class JdTextHeadingTests: XCTestCase {

    func test_jdText_hosts_and_sizes() {
        let host = UIHostingController(rootView: JdText("본문 텍스트"))
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 400))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // dimmed·mono·lineLimit 조합 스모크 — 표면 파라미터 전부 통과
    func test_jdText_variants_host() {
        let view = VStack {
            JdText("흐린 본문", dimmed: true)
            JdText("let x = 1", mono: true)
            JdText("긴 본문 " + String(repeating: "반복 ", count: 40), lineLimit: 2)
        }
        let host = UIHostingController(rootView: view)
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 800))
        XCTAssertGreaterThan(size.height, 0)
    }

    // lineLimit → 말줄임 — 무제한 대비 높이가 줄어든다 (웹 lineClamp 동형)
    func test_jdText_lineLimit_caps_height() {
        let long = String(repeating: "가나다라마바사 ", count: 60)
        let unlimited = UIHostingController(rootView: JdText(long))
            .sizeThatFits(in: CGSize(width: 200, height: 3000))
        let clamped = UIHostingController(rootView: JdText(long, lineLimit: 2))
            .sizeThatFits(in: CGSize(width: 200, height: 3000))
        XCTAssertLessThan(clamped.height, unlimited.height)
    }

    func test_jdHeading_hosts_and_sizes() {
        let host = UIHostingController(rootView: JdHeading("섹션 제목"))
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // 레벨 램프 — 얕은 레벨일수록 호스팅 높이(=폰트 크기)가 커진다 (L2=L3 동률 허용)
    func test_jdHeading_deeper_levels_do_not_grow() {
        let fit = CGSize(width: 600, height: 400)
        let heights = JdHeadingLevel.allCases.map { level in
            UIHostingController(rootView: JdHeading("Title", level: level))
                .sizeThatFits(in: fit).height
        }
        for (upper, deeper) in zip(heights, heights.dropFirst()) {
            XCTAssertGreaterThanOrEqual(upper, deeper)
        }
        // 끝점끼리는 확실히 벌어진다 — L1(24pt) > L6(14pt)
        XCTAssertGreaterThan(heights.first ?? 0, heights.last ?? 0)
    }

    func test_jdHeading_truncate_hosts() {
        let long = String(repeating: "아주 긴 제목 ", count: 30)
        let host = UIHostingController(rootView: JdHeading(long, truncate: true))
        let size = host.sizeThatFits(in: CGSize(width: 240, height: 400))
        XCTAssertGreaterThan(size.height, 0)
    }
}
