import XCTest
import SwiftUI
import JunDS

// SwiftUI 계층은 로직을 갖지 않는다(판정은 전부 Core) — 그래서 호스팅 스모크로
// "표면 파라미터가 전부 통과하고 레이아웃이 성립한다"까지만 본다 (04 §8.1).
final class JdSliderTextHostTests: XCTestCase {

    private let fit = CGSize(width: 320, height: 600)

    func test_jdSlider_hosts_and_sizes() {
        let host = UIHostingController(rootView: JdSlider(value: .constant(30)))
        let size = host.sizeThatFits(in: fit)
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // 표면 조합(색·크기·헤더·마크·포맷) 전량 통과 + 헤더/마크는 높이를 더한다
    func test_jdSlider_header_and_marks_add_height() {
        let bare = UIHostingController(rootView: JdSlider(value: .constant(30)))
            .sizeThatFits(in: fit).height
        let decorated = UIHostingController(rootView: JdSlider(
            value: .constant(30),
            in: 0...100,
            step: 5,
            color: .success,
            size: .sm,
            showsValue: true,
            marks: [JdSliderMark(value: 0, label: "0"), JdSliderMark(value: 100, label: "100")],
            format: { "\(Int($0))%" }
        )).sizeThatFits(in: fit).height
        XCTAssertGreaterThan(decorated, bare)
    }

    func test_jdRangeSlider_hosts_and_sizes() {
        let state = JdRangeState(bounds: 0...100, step: 5, lower: 20, upper: 80)
        let host = UIHostingController(rootView: JdRangeSlider(state: .constant(state)))
        let size = host.sizeThatFits(in: fit)
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    func test_jdRangeSlider_values_row_adds_height() {
        let state = JdRangeState(bounds: 0...100, step: 5, lower: 20, upper: 80)
        let bare = UIHostingController(rootView: JdRangeSlider(state: .constant(state)))
            .sizeThatFits(in: fit).height
        let withValues = UIHostingController(rootView: JdRangeSlider(
            state: .constant(state), showsValues: true, format: { "\(Int($0))점" }
        )).sizeThatFits(in: fit).height
        XCTAssertGreaterThan(withValues, bare)
    }

    func test_jdLabel_hosts_and_required_marker_adds_width() {
        let plain = UIHostingController(rootView: JdLabel("이메일"))
            .sizeThatFits(in: fit)
        let required = UIHostingController(rootView: JdLabel("이메일", isRequired: true))
            .sizeThatFits(in: fit)
        XCTAssertGreaterThan(plain.width, 0)
        XCTAssertGreaterThan(plain.height, 0)
        XCTAssertGreaterThan(required.width, plain.width)
    }

    func test_jdTextarea_hosts_and_rows_grow_height() {
        let host = UIHostingController(rootView: JdTextarea(
            text: .constant("본문"),
            placeholder: "메모",
            rows: 3,
            maxLength: 100,
            isError: true,
            showsCount: true
        ))
        let size = host.sizeThatFits(in: fit)
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // rows는 "최소" 높이 축이다. TextEditor는 세로로 탐욕적이라 여유를 주면 다 먹으므로,
        // 세로 제안을 최소로 눌러 rows가 만든 최소 높이만 비교한다.
        let tight = CGSize(width: 320, height: 1)
        let short = UIHostingController(rootView: JdTextarea(text: .constant(""), rows: 3))
            .sizeThatFits(in: tight).height
        let tall = UIHostingController(rootView: JdTextarea(text: .constant(""), rows: 12))
            .sizeThatFits(in: tight).height
        XCTAssertGreaterThan(tall, short)
    }
}
