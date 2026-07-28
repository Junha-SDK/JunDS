import JunDS
import SwiftUI
import XCTest

// SwiftUI 선택 컨트롤 호스팅 스모크 — 04 §8.2 "UIHostingController sizeThatFits > 0".
// 렌더 내부(심볼·색)는 스냅샷 배치의 몫이고 여기서는 조립·크기 축 계약만 본다.
final class JdChoiceControlHostTests: XCTestCase {

    func test_jdToggle_hosts_and_sizes() {
        let host = UIHostingController(rootView: JdToggle("알림", isOn: .constant(true)))
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // R12 — JdSwitch는 별칭이므로 같은 표면으로 호스팅된다
        let alias = UIHostingController(rootView: JdSwitch("알림", isOn: .constant(true), size: .lg))
        XCTAssertGreaterThan(alias.sizeThatFits(in: CGSize(width: 320, height: 200)).height, 0)
    }

    func test_jdCheckbox_hosts_and_label_widens() {
        let bare = UIHostingController(rootView: JdCheckbox(state: .constant(.on)))
            .sizeThatFits(in: CGSize(width: 320, height: 200))
        let labeled = UIHostingController(
            rootView: JdCheckbox(
                "약관에 동의합니다",
                state: .constant(.indeterminate),
                indeterminateAllowed: true)
        )
        .sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(bare.width, 0)
        XCTAssertGreaterThan(bare.height, 0)
        // 라벨이 붙으면 심볼 단독보다 넓어진다 (gap + 텍스트)
        XCTAssertGreaterThan(labeled.width, bare.width)
    }

    func test_jdRadioGroup_hosts_and_axis_changes_shape() {
        let options = [
            JdRadioOption(value: "a", label: "매일"),
            JdRadioOption(value: "b", label: "주간"),
            JdRadioOption(value: "c", label: "사용 안 함", isDisabled: true),
        ]
        let vertical = UIHostingController(
            rootView: JdRadioGroup(options, selection: .constant("a"))
        )
        .sizeThatFits(in: CGSize(width: 320, height: 400))
        let horizontal = UIHostingController(
            rootView: JdRadioGroup(
                options,
                selection: .constant("a"),
                axis: .horizontal)
        )
        .sizeThatFits(in: CGSize(width: 320, height: 400))
        XCTAssertGreaterThan(vertical.height, 0)
        XCTAssertGreaterThan(horizontal.width, 0)
        // 세로 3행 vs 가로 흐름 — 같은 폭에서 세로 쪽이 더 높다
        XCTAssertGreaterThan(vertical.height, horizontal.height)
    }
}
