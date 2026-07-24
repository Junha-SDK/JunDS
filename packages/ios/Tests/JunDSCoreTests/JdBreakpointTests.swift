import XCTest
import JunDSCore

// JdBreakpoint.isVisible / JdContainerSize.maxWidth는 순수 함수라 전수 검증한다
// (04 §4.2 규칙 1·3 — 렌더 계층은 이 판정을 다시 구현하지 않는다).
final class JdBreakpointTests: XCTestCase {

    // MARK: rawValue · 값 대응

    func test_rawValues_match_web_media_query_names() {
        XCTAssertEqual(JdBreakpoint.sm.rawValue, "sm")
        XCTAssertEqual(JdBreakpoint.md.rawValue, "md")
        XCTAssertEqual(JdBreakpoint.lg.rawValue, "lg")
        XCTAssertEqual(JdBreakpoint.xl.rawValue, "xl")
        XCTAssertEqual(JdBreakpoint.xl2.rawValue, "2xl")
        XCTAssertEqual(JdBreakpoint.allCases.count, 5)
    }

    func test_width_is_token_breakpoint() {
        XCTAssertEqual(JdBreakpoint.sm.width, JdToken.Breakpoint.sm)
        XCTAssertEqual(JdBreakpoint.md.width, JdToken.Breakpoint.md)
        XCTAssertEqual(JdBreakpoint.lg.width, JdToken.Breakpoint.lg)
        XCTAssertEqual(JdBreakpoint.xl.width, JdToken.Breakpoint.xl)
        XCTAssertEqual(JdBreakpoint.xl2.width, JdToken.Breakpoint.xl2)
    }

    func test_width_ramp_is_strictly_ascending() {
        let widths = JdBreakpoint.allCases.map(\.width)
        for (lower, upper) in zip(widths, widths.dropFirst()) {
            XCTAssertLessThan(lower, upper)
        }
    }

    // MARK: isVisible — 경계값 전수

    // 조건 없음 = 상시 표시 (웹 속성 없는 jd-show 동형)
    func test_no_bounds_is_always_visible() {
        for width in [CGFloat(0), 1, 320, 640, 768, 1024, 1536, 4096] {
            XCTAssertTrue(JdBreakpoint.isVisible(width: width, above: nil, below: nil))
        }
    }

    // above만: w >= X (경계 정확히 같은 값은 **표시**)
    func test_above_only_boundary_for_every_breakpoint() {
        for breakpoint in JdBreakpoint.allCases {
            let edge = breakpoint.width
            XCTAssertFalse(JdBreakpoint.isVisible(width: edge - 0.01, above: breakpoint, below: nil),
                           "\(breakpoint.rawValue): 경계 미만은 숨김")
            XCTAssertTrue(JdBreakpoint.isVisible(width: edge, above: breakpoint, below: nil),
                          "\(breakpoint.rawValue): 경계와 같으면 표시(>=)")
            XCTAssertTrue(JdBreakpoint.isVisible(width: edge + 0.01, above: breakpoint, below: nil),
                          "\(breakpoint.rawValue): 경계 초과는 표시")
        }
    }

    // below만: w < Y (경계 정확히 같은 값은 **숨김**)
    func test_below_only_boundary_for_every_breakpoint() {
        for breakpoint in JdBreakpoint.allCases {
            let edge = breakpoint.width
            XCTAssertTrue(JdBreakpoint.isVisible(width: edge - 0.01, above: nil, below: breakpoint),
                          "\(breakpoint.rawValue): 경계 미만은 표시")
            XCTAssertFalse(JdBreakpoint.isVisible(width: edge, above: nil, below: breakpoint),
                           "\(breakpoint.rawValue): 경계와 같으면 숨김(<)")
            XCTAssertFalse(JdBreakpoint.isVisible(width: edge + 0.01, above: nil, below: breakpoint),
                           "\(breakpoint.rawValue): 경계 초과는 숨김")
        }
    }

    // 둘 다: AND 결합 — [above, below) 반개구간
    func test_both_bounds_are_half_open_interval() {
        let above = JdBreakpoint.sm   // 640
        let below = JdBreakpoint.lg   // 1024
        XCTAssertFalse(JdBreakpoint.isVisible(width: above.width - 0.01, above: above, below: below))
        XCTAssertTrue(JdBreakpoint.isVisible(width: above.width, above: above, below: below))
        XCTAssertTrue(JdBreakpoint.isVisible(width: below.width - 0.01, above: above, below: below))
        XCTAssertFalse(JdBreakpoint.isVisible(width: below.width, above: above, below: below))
    }

    // 인접 브레이크포인트 전 구간 — 각 쌍의 반개구간이 서로 겹치지 않는다
    func test_adjacent_pairs_form_disjoint_bands() {
        let ordered = JdBreakpoint.allCases
        for (above, below) in zip(ordered, ordered.dropFirst()) {
            XCTAssertTrue(JdBreakpoint.isVisible(width: above.width, above: above, below: below))
            XCTAssertFalse(JdBreakpoint.isVisible(width: below.width, above: above, below: below))
        }
    }

    // 역전 구간(above > below)은 만족하는 폭이 없다
    func test_inverted_range_is_never_visible() {
        for width in [CGFloat(0), 320, 640, 767, 768, 1024, 1536, 4096] {
            XCTAssertFalse(JdBreakpoint.isVisible(width: width, above: .lg, below: .sm))
        }
    }

    // 같은 브레이크포인트를 above·below로 주면 공집합 (w >= X && w < X)
    func test_same_bound_on_both_sides_is_empty() {
        for breakpoint in JdBreakpoint.allCases {
            XCTAssertFalse(JdBreakpoint.isVisible(width: breakpoint.width, above: breakpoint, below: breakpoint))
            XCTAssertFalse(JdBreakpoint.isVisible(width: breakpoint.width - 1, above: breakpoint, below: breakpoint))
            XCTAssertFalse(JdBreakpoint.isVisible(width: breakpoint.width + 1, above: breakpoint, below: breakpoint))
        }
    }

    // 폭 0(미측정 상황의 원시값)은 above가 있으면 숨김, below만 있으면 표시
    func test_zero_width_edges() {
        XCTAssertFalse(JdBreakpoint.isVisible(width: 0, above: .sm, below: nil))
        XCTAssertTrue(JdBreakpoint.isVisible(width: 0, above: nil, below: .sm))
        XCTAssertTrue(JdBreakpoint.isVisible(width: 0, above: nil, below: nil))
    }
}

final class JdContainerSizeTests: XCTestCase {

    // 웹 jd-container size 프리셋 전수 — full만 상한 없음
    func test_maxWidth_matches_web_presets() {
        XCTAssertEqual(JdContainerSize.xs.maxWidth, 512)
        XCTAssertEqual(JdContainerSize.sm.maxWidth, 640)
        XCTAssertEqual(JdContainerSize.md.maxWidth, 768)
        XCTAssertEqual(JdContainerSize.lg.maxWidth, 1024)
        XCTAssertEqual(JdContainerSize.xl.maxWidth, 1280)
        XCTAssertEqual(JdContainerSize.xl2.maxWidth, 1536)
        XCTAssertNil(JdContainerSize.full.maxWidth)
        XCTAssertEqual(JdContainerSize.allCases.count, 7)
    }

    func test_rawValues_match_web_attribute() {
        XCTAssertEqual(JdContainerSize.xs.rawValue, "xs")
        XCTAssertEqual(JdContainerSize.sm.rawValue, "sm")
        XCTAssertEqual(JdContainerSize.md.rawValue, "md")
        XCTAssertEqual(JdContainerSize.lg.rawValue, "lg")
        XCTAssertEqual(JdContainerSize.xl.rawValue, "xl")
        XCTAssertEqual(JdContainerSize.xl2.rawValue, "2xl")
        XCTAssertEqual(JdContainerSize.full.rawValue, "full")
    }

    // full을 제외한 프리셋은 오름차순이고, sm 이상은 브레이크포인트 값과 같은 층이다
    func test_preset_ramp_is_ascending_and_shares_breakpoint_values() {
        let bounded = JdContainerSize.allCases.compactMap(\.maxWidth)
        XCTAssertEqual(bounded.count, 6)
        for (lower, upper) in zip(bounded, bounded.dropFirst()) {
            XCTAssertLessThan(lower, upper)
        }
        XCTAssertEqual(JdContainerSize.sm.maxWidth, JdBreakpoint.sm.width)
        XCTAssertEqual(JdContainerSize.md.maxWidth, JdBreakpoint.md.width)
        XCTAssertEqual(JdContainerSize.lg.maxWidth, JdBreakpoint.lg.width)
        XCTAssertEqual(JdContainerSize.xl.maxWidth, JdBreakpoint.xl.width)
        XCTAssertEqual(JdContainerSize.xl2.maxWidth, JdBreakpoint.xl2.width)
    }
}
