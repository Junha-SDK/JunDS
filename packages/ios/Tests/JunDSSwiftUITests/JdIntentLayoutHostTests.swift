import JunDS
import SwiftUI
import XCTest

// SwiftUI 의도 배치 3종 (DEC-052) — JdSplit · JdSwitcher · JdSidebarLayout.
//
// ## 무엇을 검증하나
// 이 셋은 `Layout` 프로토콜 구현이라 배치 규칙이 **폭 제안(proposal.width)의 함수**다.
// 즉 UIHostingController에 서로 다른 폭을 제안하면 규칙이 그대로 관측된다 —
// 스냅샷 없이도 "좁으면 접힌다"를 직접 확인할 수 있다.
//
// ## 왜 높이로 보나
// 가로 배치면 자식이 한 줄을 나눠 쓰므로 전체 높이는 **가장 높은 자식** 하나치다.
// 세로로 접히면 자식 높이의 **합**이 된다. 그래서 같은 콘텐츠에 폭만 바꿔 재면
// 접힘 여부가 높이 차이로 드러난다. 좌표를 직접 못 읽는 SwiftUI에서 가장 곧은 관측이다.
final class JdIntentLayoutHostTests: XCTestCase {

    /// 고정 크기 블록 — 자식 크기를 우리가 통제해야 높이 계산이 예측 가능하다
    private func block(_ height: CGFloat, color: Color = .gray) -> some View {
        color.frame(height: height)
    }

    private func height<V: View>(_ view: V, width: CGFloat) -> CGFloat {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: width, height: .greatestFiniteMagnitude))
            .height
    }

    private func width<V: View>(_ view: V, width proposed: CGFloat) -> CGFloat {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: proposed, height: .greatestFiniteMagnitude))
            .width
    }

    // MARK: - JdSwitcher

    // 핵심 계약: 임계값 **미만**이면 세로, 이상이면 가로. 브레이크포인트 어휘를 쓴다.
    func test_switcher_stacks_below_threshold_and_rows_above() {
        let spacing: CGFloat = 16
        let view = JdSwitcher(threshold: .md, spacing: spacing) {
            block(50)
            block(50)
        }

        let wide = height(view, width: JdBreakpoint.md.width + 100)
        let narrow = height(view, width: JdBreakpoint.md.width - 100)

        XCTAssertEqual(wide, 50, accuracy: 1.0, "임계값 이상이면 한 줄 — 높이는 자식 하나치")
        XCTAssertEqual(
            narrow, 50 * 2 + spacing, accuracy: 1.0,
            "임계값 미만이면 세로 — 높이는 자식 합 + 간격")
    }

    func test_switcher_threshold_uses_breakpoint_vocabulary() {
        // lg로 올리면 md 폭에서는 접혀야 한다 — 이름이 값을 실제로 바꾸는지
        let view = JdSwitcher(threshold: .lg, spacing: 0) {
            block(40); block(40)
        }
        XCTAssertEqual(height(view, width: JdBreakpoint.lg.width - 1), 80, accuracy: 1.0)
        XCTAssertEqual(height(view, width: JdBreakpoint.lg.width + 1), 40, accuracy: 1.0)
    }

    // 폭 제안이 없는 맥락(수평 스크롤뷰 안 등)에서 세로로 접히면 의도와 다르다.
    func test_switcher_treats_unbounded_width_as_horizontal() {
        let view = JdSwitcher(threshold: .xl, spacing: 0) {
            block(40); block(40)
        }
        let huge = CGFloat.greatestFiniteMagnitude
        let unbounded = UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: huge, height: huge)).height
        XCTAssertEqual(unbounded, 40, accuracy: 1.0, "폭 무제한인데 세로로 접혔다")
    }

    func test_switcher_divides_width_evenly_between_children() {
        let view = JdSwitcher(threshold: .sm, spacing: 20) {
            block(30); block(30)
        }
        // 가로 배치에서 자식은 (폭 - 간격) / n 씩 — 웹 flex-grow:1 · flex-basis:0 동형.
        // 전체 폭이 제안대로 나오는지로 간접 확인한다.
        XCTAssertEqual(width(view, width: 800), 800, accuracy: 1.0)
    }

    // MARK: - JdSplit

    // 양끝 배치는 **한 줄**이다 — 자식이 늘어도 높이는 가장 높은 자식 하나치여야 한다.
    func test_split_keeps_single_row() {
        let view = JdSplit(spacing: 8) {
            block(24)
            block(40)
            block(24)
        }
        XCTAssertEqual(
            height(view, width: 400), 40, accuracy: 1.0,
            "Split이 줄바꿈했다 — 한 줄 유지가 계약이다")
    }

    func test_split_fills_proposed_width() {
        let view = JdSplit {
            block(20); block(20)
        }
        XCTAssertEqual(
            width(view, width: 500), 500, accuracy: 1.0,
            "양끝으로 밀려면 제안된 폭을 다 써야 한다")
    }

    // MARK: - JdSidebarLayout

    // 꺾이는 폭을 적지 않는다 — sideWidth + spacing + contentMin에서 따라 나온다.
    func test_sidebar_stacks_when_content_cannot_meet_minimum() {
        let sideWidth: CGFloat = 240
        let contentMin: CGFloat = 320
        let spacing: CGFloat = 24
        let needed = sideWidth + spacing + contentMin

        let view = JdSidebarLayout(
            sideWidth: sideWidth, contentMin: contentMin,
            spacing: spacing
        ) {
            block(100)
            block(160)
        }

        XCTAssertEqual(
            height(view, width: needed + 40), 160, accuracy: 1.0,
            "여유가 있으면 나란히 — 높이는 더 높은 쪽")
        XCTAssertEqual(
            height(view, width: needed - 40), 100 + 160 + spacing, accuracy: 1.0,
            "본문이 최소 폭을 못 지키면 쌓인다")
    }

    // 사이드바 폭만 바꿔도 임계값이 따라와야 한다 — 이게 이 컴포넌트의 요점이다.
    func test_sidebar_threshold_follows_side_width() {
        let probe: CGFloat = 640
        func stacked(sideWidth: CGFloat) -> Bool {
            let view = JdSidebarLayout(sideWidth: sideWidth, contentMin: 320, spacing: 24) {
                block(100)
                block(100)
            }
            // 쌓이면 높이가 합(224), 나란히면 하나치(100)
            return height(view, width: probe) > 150
        }
        XCTAssertFalse(stacked(sideWidth: 240), "240 + 24 + 320 = 584 ≤ 640 이므로 나란히")
        XCTAssertTrue(stacked(sideWidth: 320), "320 + 24 + 320 = 664 > 640 이므로 쌓임")
    }

    // side: .end는 **시각 순서만** 뒤집는다 — 자식 순서(접근성·탭 순서)는 그대로다.
    // 배치가 뒤집혀도 전체 크기는 같아야 한다(같은 일을 좌우만 바꿔 한다).
    func test_sidebar_side_end_does_not_change_size() {
        func size(_ side: JdSidebarSide) -> CGFloat {
            height(
                JdSidebarLayout(sideWidth: 200, contentMin: 200, spacing: 16, side: side) {
                    block(80)
                    block(120)
                }, width: 600)
        }
        XCTAssertEqual(size(.start), size(.end), accuracy: 1.0)
    }
}
