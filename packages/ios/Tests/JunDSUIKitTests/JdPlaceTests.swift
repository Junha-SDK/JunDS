import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 한 줄 배치 (DEC-053). 요점은 **addSubview를 스스로 한다**는 것 —
// 그래서 순서를 틀려 크래시할 여지가 문법적으로 없다.
@MainActor
final class JdPlaceTests: XCTestCase {

    private var host: UIView!

    override func setUp() {
        super.setUp()
        host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 480))
    }

    func test_center_adds_subview_itself() {
        let child = UIView()
        XCTAssertNil(child.superview)
        child.jdCenter(in: host).jdSize(40)
        XCTAssertEqual(child.superview, host)
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.midX, 160, accuracy: 0.5)
        XCTAssertEqual(child.frame.midY, 240, accuracy: 0.5)
    }

    func test_center_offset() {
        let child = UIView()
        child.jdCenter(in: host, offsetX: 20, offsetY: -30).jdSize(10)
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.midX, 180, accuracy: 0.5)
        XCTAssertEqual(child.frame.midY, 210, accuracy: 0.5)
    }

    func test_fill_with_token_padding() {
        let child = UIView()
        child.jdFill(host, padding: .md)  // 16
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 304, accuracy: 0.5)
        XCTAssertEqual(child.frame.minY, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 464, accuracy: 0.5)
    }

    // bottom/trailing 부호 반전을 소비자가 적지 않아야 한다 — -16을 손으로 쓰는 순간
    // 부호를 틀리는 사람이 반드시 나온다.
    func test_pin_subset_reverses_sign_for_trailing_and_bottom() {
        let child = UIView()
        child.jdPin(to: host, edges: [.leading, .trailing, .bottom], padding: .md)
        child.jdHeight(50)
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 304, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 464, accuracy: 0.5)
    }

    func test_pin_leaves_unlisted_edges_free() {
        let child = UIView()
        child.jdPin(to: host, edges: [.top, .leading])
        child.jdSize(30)
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 0, accuracy: 0.5)
        XCTAssertEqual(child.frame.minY, 0, accuracy: 0.5)
        XCTAssertEqual(child.frame.width, 30, accuracy: 0.5)
    }

    func test_pin_does_not_re_add_when_already_child() {
        let child = UIView()
        child.jdPin(to: host, edges: [.top])
        child.jdPin(to: host, edges: [.leading])
        XCTAssertEqual(host.subviews.count, 1, "같은 부모에 두 번 붙었다")
    }

    func test_below_uses_siblings_parent() {
        let header = UIView()
        header.jdPin(to: host, edges: [.top, .leading, .trailing])
        header.jdHeight(44)

        let body = UIView()
        body.jdBelow(header, gap: .md).jdPin(to: host, edges: [.leading, .trailing])
        body.jdHeight(100)

        XCTAssertEqual(body.superview, host, "형제의 부모를 그대로 써야 한다")
        host.layoutIfNeeded()
        XCTAssertEqual(body.frame.minY, 44 + 16, accuracy: 0.5)
    }

    func test_after_places_on_trailing_side() {
        let left = UIView()
        left.jdPin(to: host, edges: [.top, .leading])
        left.jdSize(40)

        let right = UIView()
        right.jdAfter(left, gap: .sm).jdPin(to: host, edges: [.top])
        right.jdSize(40)

        host.layoutIfNeeded()
        XCTAssertEqual(right.frame.minX, 40 + 8, accuracy: 0.5)
    }

    func test_aspect_ratio() {
        let media = UIView()
        media.jdPin(to: host, edges: [.top, .leading, .trailing])
        media.jdAspect(16.0 / 9.0)
        host.layoutIfNeeded()
        XCTAssertEqual(media.frame.width, 320, accuracy: 0.5)
        XCTAssertEqual(media.frame.height, 320 * 9.0 / 16.0, accuracy: 0.5)
    }

    // 체이닝이 성립해야 한 줄로 쓸 수 있다
    func test_chaining_returns_self() {
        let child = UIView()
        let returned = child.jdCenter(in: host).jdSize(24).jdAspect(1)
        XCTAssertTrue(returned === child)
    }
}
