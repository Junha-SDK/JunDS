import XCTest
import SwiftUI
import JunDS

// SwiftUI 계층은 호스팅 스모크로 계약을 지킨다 — 표면 파라미터 전부를 한 번씩 통과시키고
// 크기 축 단조성만 확인한다 (DESIGN-2 §C).
final class JdChipHostTests: XCTestCase {

    private let fit = CGSize(width: 320, height: 400)

    // IconButton — variant 3 × size 4 전 조합 호스팅 + 크기 램프 비감소
    func test_jdIconButton_hosts_all_combinations_and_ramps() {
        for variant in JdIconButtonVariant.allCases {
            for size in JdIconButtonSize.allCases {
                let host = UIHostingController(
                    rootView: JdIconButton(systemImage: "xmark",
                                           accessibilityLabel: "닫기",
                                           variant: variant,
                                           size: size,
                                           action: {})
                )
                let measured = host.sizeThatFits(in: fit)
                XCTAssertGreaterThan(measured.width, 0, "\(variant)/\(size)")
                XCTAssertGreaterThan(measured.height, 0, "\(variant)/\(size)")
            }
        }

        let heights = JdIconButtonSize.allCases.map { size in
            UIHostingController(rootView: JdIconButton(systemImage: "xmark",
                                                       accessibilityLabel: "닫기",
                                                       size: size,
                                                       action: {}))
                .sizeThatFits(in: fit).height
        }
        for (smaller, larger) in zip(heights, heights.dropFirst()) {
            XCTAssertLessThanOrEqual(smaller, larger)
        }
        XCTAssertGreaterThan(heights.last ?? 0, heights.first ?? 0)
    }

    // Badge — 텍스트 모드(variant × size × dot)와 카운트 모드 양쪽이 호스팅된다
    func test_jdBadge_hosts_text_and_count_modes() {
        for variant in JdBadgeVariant.allCases {
            for size in JdDisplaySize.allCases {
                let host = UIHostingController(rootView: JdBadge("상태", variant: variant, size: size))
                XCTAssertGreaterThan(host.sizeThatFits(in: fit).height, 0, "\(variant)/\(size)")
            }
        }

        let dotted = UIHostingController(rootView: JdBadge("배포됨", variant: .success, showsDot: true))
            .sizeThatFits(in: fit)
        let plain = UIHostingController(rootView: JdBadge("배포됨", variant: .success))
            .sizeThatFits(in: fit)
        XCTAssertGreaterThan(dotted.width, plain.width) // 도트 + gap 만큼 넓어진다

        // 카운트 모드는 원형 하한(18) 이상 — 자릿수가 늘면 알약으로 넓어진다
        let single = UIHostingController(rootView: JdBadge(count: 3)).sizeThatFits(in: fit)
        let overflow = UIHostingController(rootView: JdBadge(count: 150)).sizeThatFits(in: fit)
        XCTAssertGreaterThanOrEqual(single.height, JdBadgeSpec.countDiameter)
        XCTAssertGreaterThanOrEqual(single.width, JdBadgeSpec.countDiameter)
        XCTAssertGreaterThan(overflow.width, single.width)
    }

    // Tag — 8색 전부 + onRemove 유무. 닫기 버튼이 붙으면 폭이 늘어난다
    func test_jdTag_hosts_all_colors_with_and_without_remove() {
        for color in JdTagColor.allCases {
            let host = UIHostingController(rootView: JdTag("태그", color: color))
            XCTAssertGreaterThan(host.sizeThatFits(in: fit).height, 0, "\(color)")
        }

        let plain = UIHostingController(rootView: JdTag("SwiftUI")).sizeThatFits(in: fit)
        let closable = UIHostingController(rootView: JdTag("SwiftUI", onRemove: {})).sizeThatFits(in: fit)
        XCTAssertGreaterThan(closable.width, plain.width)
    }
}
