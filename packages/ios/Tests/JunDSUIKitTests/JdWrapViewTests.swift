import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// JdWrapView 배치 계약 (DEC-041).
//
// 이 뷰가 메우는 공백: UIStackView는 줄바꿈을 못 하고, 그래서 "칩 N개를 폭에 맞춰 흘린다"가
// iOS에서는 컴파지셔널 레이아웃 한 채였다. 따라서 여기서 보는 것은 **줄바꿈이 실제로
// 일어나는가**와 **높이 보고가 배치와 일치하는가**다 — 둘이 어긋나면 부모 Auto Layout이
// 잘리거나 빈 공간을 남긴다.
@MainActor
final class JdWrapViewTests: XCTestCase {

    /// 고정 크기 자식 — sizeThatFits가 항상 같은 값을 돌려주게 해서 배치만 검증한다
    private final class FixedBox: UIView {
        private let size: CGSize
        init(_ w: CGFloat, _ h: CGFloat) {
            size = CGSize(width: w, height: h)
            super.init(frame: .zero)
        }
        required init?(coder: NSCoder) { fatalError() }
        override var intrinsicContentSize: CGSize { size }
        override func sizeThatFits(_ s: CGSize) -> CGSize { size }
    }

    private func laidOut(_ wrap: JdWrapView, width: CGFloat) -> JdWrapView {
        wrap.frame = CGRect(
            x: 0, y: 0, width: width,
            height: wrap.sizeThatFits(
                CGSize(width: width, height: .greatestFiniteMagnitude)
            ).height)
        wrap.layoutSubviews()
        return wrap
    }

    // MARK: - 흐름 배치 (고유 폭)

    func test_items_flow_on_one_line_when_they_fit() {
        let wrap = JdWrapView(
            itemSpacing: 10, [FixedBox(40, 20), FixedBox(40, 20), FixedBox(40, 20)])
        laidOut(wrap, width: 200)  // 40*3 + 10*2 = 140 ≤ 200
        let ys = wrap.arrangedViews.map(\.frame.minY)
        XCTAssertEqual(Set(ys).count, 1, "한 줄에 들어가는데 줄바꿈이 일어났다")
        XCTAssertEqual(wrap.arrangedViews[0].frame.minX, 0)
        XCTAssertEqual(wrap.arrangedViews[1].frame.minX, 50)
        XCTAssertEqual(wrap.arrangedViews[2].frame.minX, 100)
    }

    func test_items_wrap_to_next_line_when_they_do_not_fit() {
        let wrap = JdWrapView(
            itemSpacing: 10, [FixedBox(80, 20), FixedBox(80, 20), FixedBox(80, 20)])
        laidOut(wrap, width: 180)  // 80+10+80 = 170 ≤ 180, 세 번째는 넘친다
        let frames = wrap.arrangedViews.map(\.frame)
        XCTAssertEqual(frames[0].minY, frames[1].minY, "첫 두 개는 같은 줄")
        XCTAssertGreaterThan(frames[2].minY, frames[1].minY, "세 번째는 다음 줄로 내려가야 한다")
        XCTAssertEqual(frames[2].minX, 0, "새 줄은 왼쪽에서 시작한다")
    }

    // 컨테이너보다 넓은 자식은 한 줄을 혼자 쓰고 폭이 줄어든다(넘쳐 흐르지 않는다)
    func test_oversized_item_is_clamped_to_container_width() {
        let wrap = JdWrapView(itemSpacing: 8, [FixedBox(500, 20), FixedBox(40, 20)])
        laidOut(wrap, width: 100)
        XCTAssertEqual(wrap.arrangedViews[0].frame.width, 100)
        XCTAssertGreaterThan(wrap.arrangedViews[1].frame.minY, wrap.arrangedViews[0].frame.minY)
    }

    // 행 안 세로 중앙 정렬 (웹 align-items: center)
    func test_line_centers_items_vertically() {
        let wrap = JdWrapView(itemSpacing: 8, [FixedBox(40, 40), FixedBox(40, 20)])
        laidOut(wrap, width: 200)
        let tall = wrap.arrangedViews[0].frame
        let short = wrap.arrangedViews[1].frame
        XCTAssertEqual(tall.midY, short.midY, accuracy: 0.001, "행 안에서 중앙이 안 맞는다")
    }

    // 보고 높이와 실제 배치가 일치해야 부모가 자르거나 남기지 않는다
    func test_reported_height_matches_placed_content() {
        let wrap = JdWrapView(
            itemSpacing: 10, lineSpacing: 6,
            [FixedBox(80, 20), FixedBox(80, 30), FixedBox(80, 20)])
        let reported = wrap.sizeThatFits(
            CGSize(width: 180, height: CGFloat.greatestFiniteMagnitude)
        ).height
        laidOut(wrap, width: 180)
        let placedBottom = wrap.arrangedViews.map(\.frame.maxY).max() ?? 0
        XCTAssertEqual(
            reported, placedBottom, accuracy: 0.001,
            "보고 높이(\(reported))와 배치 하단(\(placedBottom))이 다르다")
        // 2행: max(20,30)=30 + 6 + 20 = 56
        XCTAssertEqual(reported, 56, accuracy: 0.001)
    }

    // lineSpacing 생략 시 itemSpacing과 같아진다(웹 단일 gap 동형)
    func test_line_spacing_defaults_to_item_spacing() {
        let a = JdWrapView(itemSpacing: 12, [FixedBox(80, 20), FixedBox(80, 20)])
        let b = JdWrapView(itemSpacing: 12, lineSpacing: 12, [FixedBox(80, 20), FixedBox(80, 20)])
        let width: CGFloat = 100  // 한 줄에 하나만 들어간다 → 2행
        XCTAssertEqual(
            a.sizeThatFits(CGSize(width: width, height: .infinity)).height,
            b.sizeThatFits(CGSize(width: width, height: .infinity)).height)
    }

    func test_empty_and_zero_width_are_safe() {
        XCTAssertEqual(
            JdWrapView(itemSpacing: 8, []).sizeThatFits(CGSize(width: 100, height: 100)).height, 0)
        let wrap = JdWrapView(itemSpacing: 8, [FixedBox(40, 20)])
        XCTAssertEqual(
            wrap.sizeThatFits(CGSize(width: 0, height: 100)).height, 0,
            "폭 0에서 높이를 만들면 안 된다(부모가 아직 폭을 안 준 상태)")
    }

    // MARK: - 격자 배치 (균등 분할)

    func test_grid_divides_width_equally() {
        let wrap = JdWrapView(
            itemSpacing: 10, equalWidths: true,
            [FixedBox(40, 20), FixedBox(40, 20)])
        laidOut(wrap, width: 210)  // (210 - 10) / 2 = 100
        for view in wrap.arrangedViews {
            XCTAssertEqual(view.frame.width, 100, accuracy: 0.001, "격자 폭이 균등하지 않다")
        }
        XCTAssertEqual(wrap.arrangedViews[1].frame.minX, 110, accuracy: 0.001)
    }

    // minItemWidth가 한 행 개수를 줄인다 — 좁은 화면에서 셀이 찌그러지지 않게
    func test_min_item_width_reduces_columns() {
        let boxes = (0..<4).map { _ in FixedBox(40, 20) }
        let wrap = JdWrapView(itemSpacing: 10, equalWidths: true, minItemWidth: 100, boxes)

        laidOut(wrap, width: 430)  // (4×100)+(3×10)=430 → 4열
        XCTAssertEqual(Set(wrap.arrangedViews.map(\.frame.minY)).count, 1)

        laidOut(wrap, width: 210)  // 2열만 들어간다 → 2행
        XCTAssertEqual(Set(wrap.arrangedViews.map(\.frame.minY)).count, 2)

        laidOut(wrap, width: 90)  // 1열도 최소폭 미달 → 최소 1열은 보장한다
        XCTAssertEqual(Set(wrap.arrangedViews.map(\.frame.minY)).count, 4)
    }

    func test_max_per_line_caps_columns() {
        let boxes = (0..<4).map { _ in FixedBox(40, 20) }
        let wrap = JdWrapView(itemSpacing: 10, equalWidths: true, maxPerLine: 2, boxes)
        laidOut(wrap, width: 1000)
        XCTAssertEqual(Set(wrap.arrangedViews.map(\.frame.minY)).count, 2, "2×2로 고정되어야 한다")
    }

    // 격자는 한 행의 셀 높이를 가장 큰 것으로 맞춘다 — 열이 들쭉날쭉해지지 않게
    func test_grid_equalizes_row_heights() {
        let wrap = JdWrapView(
            itemSpacing: 10, equalWidths: true,
            [FixedBox(40, 20), FixedBox(40, 44)])
        laidOut(wrap, width: 210)
        XCTAssertEqual(wrap.arrangedViews[0].frame.height, 44, accuracy: 0.001)
        XCTAssertEqual(wrap.arrangedViews[1].frame.height, 44, accuracy: 0.001)
    }

    // MARK: - 내용 교체

    func test_set_items_replaces_previous_children() {
        let wrap = JdWrapView(itemSpacing: 8, [FixedBox(40, 20), FixedBox(40, 20)])
        let fresh = FixedBox(40, 20)
        wrap.setItems([fresh])
        XCTAssertEqual(wrap.arrangedViews.count, 1)
        XCTAssertEqual(wrap.subviews.count, 1, "이전 자식이 뷰 트리에 남아 있다")
        XCTAssertTrue(wrap.subviews.first === fresh)
    }
}
