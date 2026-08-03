import JunDS
import SwiftUI
import XCTest

final class JdSwiftUISmokeTests: XCTestCase {

    func test_jdButton_hosts_and_sizes() {
        let view = JdButton("저장", variant: .primary, size: .md) {}
        let host = UIHostingController(rootView: view)
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 200))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThanOrEqual(size.height, 40)
    }

    func test_jdTextField_hosts() {
        let view = JdTextField(
            "이메일", placeholder: "you@example.com",
            text: .constant(""), error: "필수 입력입니다")
        let host = UIHostingController(rootView: view)
        let size = host.sizeThatFits(in: CGSize(width: 320, height: 400))
        XCTAssertGreaterThan(size.height, 40)
    }

    func test_jdModal_modifier_composes() {
        let view = Text("본문").jdModal(isPresented: .constant(false), persistent: true) {
            Text("모달")
        }
        let host = UIHostingController(rootView: view)
        XCTAssertNotNil(host.view)
    }

    // 우산 제품 표면: import JunDS 하나로 3계층 심벌이 모두 보인다 (04 §2.2)
    func test_umbrella_exports_all_layers() {
        XCTAssertEqual(JdButtonVariant.primary.rawValue, "primary")  // Core
        let uikitButton = JdButtonView(title: "확인")  // UIKit
        XCTAssertEqual(uikitButton.accessibilityLabel, "확인")
        _ = JdButton("확인") {}  // SwiftUI
    }
}
