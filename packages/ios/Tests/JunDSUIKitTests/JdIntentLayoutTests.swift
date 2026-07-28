import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 의도 기반 배치 (DEC-052) — 웹 jd-split / jd-switcher / jd-sidebar-layout 대응.
//
// 이 셋의 값어치는 "브레이크포인트를 고르지 않아도 반응형이 된다"에 있다. 그래서
// 테스트도 "특정 폭에서 어떤 축이 되나"가 아니라 **폭을 바꿔 가며 축이 따라오는가**를
// 본다 — 임계값 숫자를 테스트에 박으면 그 숫자를 지키는 테스트가 되어 버린다.
@MainActor
final class JdIntentLayoutTests: XCTestCase {

    private func box(_ side: CGFloat = 40) -> UIView {
        let v = UIView()
        v.jdSize(side)
        return v
    }

    // MARK: - Split

    func test_split_inserts_flex_spacer_between_items_only() {
        let split = JdSplitView {
            box(); box()
        }
        // [a, spacer, b] — 양끝에도 넣으면 가운데로 모인다
        XCTAssertEqual(split.arrangedSubviews.count, 3)
        XCTAssertTrue(split.arrangedSubviews[1] is JdFlexSpacerView)
        XCTAssertFalse(split.arrangedSubviews[0] is JdFlexSpacerView)
        XCTAssertFalse(split.arrangedSubviews[2] is JdFlexSpacerView)
    }

    func test_split_three_items_distributes_evenly() {
        let split = JdSplitView {
            box(); box(); box()
        }
        XCTAssertEqual(split.arrangedSubviews.count, 5)  // a _ b _ c
        XCTAssertEqual(split.arrangedSubviews.filter { $0 is JdFlexSpacerView }.count, 2)
    }

    func test_split_pushes_items_to_both_ends() {
        let split = JdSplitView {
            box(); box()
        }
        split.frame = CGRect(x: 0, y: 0, width: 300, height: 40)
        split.layoutIfNeeded()
        let first = split.arrangedSubviews[0]
        let last = split.arrangedSubviews[2]
        XCTAssertEqual(first.frame.minX, 0, accuracy: 0.5)
        XCTAssertEqual(last.frame.maxX, 300, accuracy: 0.5)
    }

    // MARK: - Switcher

    func test_switcher_flips_axis_with_available_width() {
        let switcher = JdSwitcherView(threshold: .sm) {
            box(); box()
        }

        switcher.frame = CGRect(x: 0, y: 0, width: JdBreakpoint.sm.width + 100, height: 80)
        switcher.layoutIfNeeded()
        XCTAssertFalse(switcher.isCompact, "임계값보다 넓으면 가로")

        switcher.frame = CGRect(x: 0, y: 0, width: JdBreakpoint.sm.width - 100, height: 80)
        switcher.layoutIfNeeded()
        XCTAssertTrue(switcher.isCompact, "임계값보다 좁으면 세로")

        // 되돌아오는가 — 한 번 접히면 못 펴지는 결함(jdShow에서 실제로 있었다)의 가드
        switcher.frame = CGRect(x: 0, y: 0, width: JdBreakpoint.sm.width + 100, height: 80)
        switcher.layoutIfNeeded()
        XCTAssertFalse(switcher.isCompact, "넓어졌는데 세로로 굳었다")
    }

    func test_switcher_threshold_uses_breakpoint_vocabulary() {
        // 웹 threshold="lg" / jdShow(above: .lg)와 같은 이름이 같은 폭을 뜻해야 한다
        let switcher = JdSwitcherView(threshold: .lg) {
            box(); box()
        }
        switcher.frame = CGRect(x: 0, y: 0, width: JdBreakpoint.lg.width - 1, height: 80)
        switcher.layoutIfNeeded()
        XCTAssertTrue(switcher.isCompact)
    }

    // MARK: - SidebarLayout

    func test_sidebar_stacks_when_content_cannot_meet_minimum() {
        let layout = JdSidebarLayoutView(sideWidth: 240, contentMin: 320, gap: .lg) {
            box(); box()
        }
        let needed = 240 + JdGap.lg.value + 320

        layout.frame = CGRect(x: 0, y: 0, width: needed + 40, height: 400)
        layout.layoutIfNeeded()
        XCTAssertFalse(layout.isStacked)
        XCTAssertEqual(layout.stack.axis, .horizontal)

        layout.frame = CGRect(x: 0, y: 0, width: needed - 40, height: 400)
        layout.layoutIfNeeded()
        XCTAssertTrue(layout.isStacked)
        XCTAssertEqual(layout.stack.axis, .vertical)
    }

    // 꺾이는 폭을 따로 관리하지 않는다는 것이 이 컴포넌트의 요점이다.
    // 사이드바 폭만 바꿔도 임계값이 따라와야 한다.
    func test_sidebar_threshold_follows_side_width() {
        let layout = JdSidebarLayoutView(sideWidth: 240, contentMin: 320, gap: .lg) {
            box(); box()
        }
        let width = 240 + JdGap.lg.value + 320 + 10
        layout.frame = CGRect(x: 0, y: 0, width: width, height: 400)
        layout.layoutIfNeeded()
        XCTAssertFalse(layout.isStacked, "여유가 있으므로 가로")

        layout.sideWidth = 320  // 사이드바를 넓히면 같은 폭에서도 본문이 최소치를 못 지킨다
        layout.layoutIfNeeded()
        XCTAssertTrue(layout.isStacked, "사이드바를 넓혔는데 임계값이 따라오지 않았다")
    }

    func test_sidebar_side_end_reverses_visual_order_only() {
        let side = box()
        let content = box()
        let layout = JdSidebarLayoutView(side: .end) {
            side; content
        }
        // 시각 순서는 뒤집히되(본문이 먼저 배치) 사이드바는 여전히 첫 인자다
        XCTAssertEqual(layout.stack.arrangedSubviews.first, content)
        XCTAssertEqual(layout.stack.arrangedSubviews.last, side)
    }

    func test_sidebar_width_constraint_is_released_when_stacked() {
        let layout = JdSidebarLayoutView(sideWidth: 240, contentMin: 320, gap: .lg) {
            box(); box()
        }
        layout.frame = CGRect(x: 0, y: 0, width: 200, height: 400)
        layout.layoutIfNeeded()
        XCTAssertTrue(layout.isStacked)
        // 쌓인 상태에서 폭 고정이 남아 있으면 사이드바가 240pt로 잘린 채 세로로 놓인다
        let sidebar = layout.stack.arrangedSubviews[0]
        sidebar.setNeedsLayout()
        layout.layoutIfNeeded()
        XCTAssertEqual(sidebar.frame.width, 200, accuracy: 1.0)
    }
}
