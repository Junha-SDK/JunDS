import XCTest
import SwiftUI
import JunDS

// SwiftUI: UIHostingController 호스팅 스모크(sizeThatFits > 0) + 크기 축 단조성 (DESIGN-2 §C).
final class JdAvatarKbdHostTests: XCTestCase {

    private func fittingSize<V: View>(_ view: V,
                                      in bounds: CGSize = CGSize(width: 320, height: 320)) -> CGSize {
        UIHostingController(rootView: view).sizeThatFits(in: bounds)
    }

    func test_jdAvatar_hosts_and_follows_size_ramp() {
        let size = fittingSize(JdAvatar(name: "Ada Lovelace", size: .md, status: .online))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        // 원 지름은 스펙 고정 치수 — xs < xl
        let xs = fittingSize(JdAvatar(name: "Ada", size: .xs))
        let xl = fittingSize(JdAvatar(name: "Ada", size: .xl))
        XCTAssertLessThan(xs.width, xl.width)
        XCTAssertLessThan(xs.height, xl.height)
    }

    func test_jdSpinner_hosts_and_follows_size_ramp() {
        let size = fittingSize(JdSpinner())
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)

        let sm = fittingSize(JdSpinner(size: .sm))
        let lg = fittingSize(JdSpinner(size: .lg, label: "저장 중", color: JdToken.Color.muted))
        XCTAssertLessThan(sm.width, lg.width)
    }

    func test_jdKbd_hosts_and_grows_with_key_count() {
        let single = fittingSize(JdKbd("⌘"))
        XCTAssertGreaterThan(single.width, 0)
        XCTAssertGreaterThan(single.height, 0)

        // 공백 제거 후에도 키가 늘면 폭이 는다("⌘ K" → "⌘K")
        let combo = fittingSize(JdKbd("Ctrl + Shift + P"))
        XCTAssertGreaterThan(combo.width, single.width)
    }

    func test_jdKeyCap_hosts_and_respects_minimum_box() {
        let spec = JdKeyCapSpec.resolve(variant: .default, size: .md)
        let size = fittingSize(JdKeyCap("⌘"))
        XCTAssertGreaterThanOrEqual(size.width, spec.minWidth)
        XCTAssertGreaterThanOrEqual(size.height, spec.height)

        // variant/pressed 조합 전수 호스팅 — 눌림은 오프셋만 바꾸므로 크기는 유지된다
        for variant in JdKeyCapVariant.allCases {
            for pressed in [false, true] {
                let cell = fittingSize(JdKeyCap("A", variant: variant, size: .lg, isPressed: pressed))
                XCTAssertGreaterThan(cell.width, 0)
                XCTAssertGreaterThan(cell.height, 0)
            }
        }
    }
}
