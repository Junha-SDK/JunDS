import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

@MainActor
final class JdSpacerViewTests: XCTestCase {

    // 웹 패리티의 핵심: padding 양측 → 차지 공간은 **2×size**

    func test_default_is_vertical_md_and_takes_double_gap() {
        let spacer = JdSpacerView()
        XCTAssertEqual(spacer.intrinsicContentSize.height, JdGap.md.value * 2)
        XCTAssertEqual(spacer.intrinsicContentSize.height, JdToken.Space.s4 * 2)
        XCTAssertEqual(spacer.intrinsicContentSize.width, UIView.noIntrinsicMetric)
    }

    // 축 전환: 고정되는 축이 바뀌고 교차축은 미지정으로 남는다
    func test_horizontal_axis_fixes_width_instead_of_height() {
        let spacer = JdSpacerView(.lg, axis: .horizontal)
        XCTAssertEqual(spacer.intrinsicContentSize.width, JdGap.lg.value * 2)
        XCTAssertEqual(spacer.intrinsicContentSize.height, UIView.noIntrinsicMetric)
    }

    func test_every_named_gap_doubles() {
        let gaps: [JdGap] = [.none, .xs, .sm, .md, .lg, .xl, .xl2, .xl3, .xl4]
        for gap in gaps {
            XCTAssertEqual(JdSpacerView(gap).intrinsicContentSize.height, gap.value * 2)
        }
    }

    func test_size_didSet_updates_intrinsic() {
        let spacer = JdSpacerView(.sm)
        XCTAssertEqual(spacer.intrinsicContentSize.height, JdGap.sm.value * 2)
        spacer.size = .xl
        XCTAssertEqual(spacer.intrinsicContentSize.height, JdGap.xl.value * 2)
        spacer.size = .custom(JdToken.Space.s3)
        XCTAssertEqual(spacer.intrinsicContentSize.height, JdToken.Space.s3 * 2)
    }

    // 웹 aria-hidden 고정 동형 — 장식이라 접근성 트리·터치 대상에서 빠진다
    func test_is_decorative() {
        let spacer = JdSpacerView()
        XCTAssertFalse(spacer.isAccessibilityElement)
        XCTAssertFalse(spacer.isUserInteractionEnabled)
        XCTAssertNil(spacer.accessibilityLabel)
    }

    // 스택 안에서 늘어나지 않도록 축 방향 hugging/압축저항이 높다
    func test_fixed_axis_resists_stretching() {
        let vertical = JdSpacerView()
        XCTAssertEqual(vertical.contentHuggingPriority(for: .vertical), UILayoutPriority(999))
        XCTAssertEqual(vertical.contentCompressionResistancePriority(for: .vertical), .required)

        let horizontal = JdSpacerView(axis: .horizontal)
        XCTAssertEqual(horizontal.contentHuggingPriority(for: .horizontal), UILayoutPriority(999))
        XCTAssertEqual(horizontal.contentCompressionResistancePriority(for: .horizontal), .required)
    }
}

@MainActor
final class JdAppShellControllerTests: XCTestCase {

    private var previousReduceMotion: (() -> Bool)!

    override func setUp() {
        super.setUp()
        // 폭 전환을 결정적으로 검증하려면 애니메이션이 없어야 한다 (JdMotion 단일 진입점)
        previousReduceMotion = JdMotion.isReduced
        JdMotion.isReduced = { true }
    }

    override func tearDown() {
        JdMotion.isReduced = previousReduceMotion
        super.tearDown()
    }

    private func makeShell(
        width: CGFloat, height: CGFloat = 768
    )
        -> (
            shell: JdAppShellController, sidebar: UIViewController, content: UIViewController,
            window: UIWindow
        )
    {
        let sidebar = UIViewController()
        let content = UIViewController()
        let shell = JdAppShellController(sidebar: sidebar, content: content)
        let window = UIWindow(frame: CGRect(x: 0, y: 0, width: width, height: height))
        window.rootViewController = shell
        window.isHidden = false
        flush(window)
        return (shell, sidebar, content, window)
    }

    // compact 판정은 첫 배치 뒤에 제약 상수를 바꾸므로 한 번 더 돌려 프레임을 확정한다
    private func flush(_ window: UIWindow) {
        window.layoutIfNeeded()
        window.layoutIfNeeded()
    }

    // MARK: 자식 VC 컨테인먼트 규약

    func test_child_containment() {
        let (shell, sidebar, content, _) = makeShell(width: 1024)
        XCTAssertEqual(shell.children.count, 2)
        XCTAssertTrue(sidebar.parent === shell)
        XCTAssertTrue(content.parent === shell)
        XCTAssertTrue(sidebar.view.superview === shell.sidebarContainer)
        XCTAssertTrue(content.view.superview === shell.contentContainer)
    }

    // MARK: regular — 레일 폭 전환

    func test_regular_width_places_rail_and_insets_content() {
        let (shell, _, _, window) = makeShell(width: 1024)
        XCTAssertFalse(shell.isCompact)
        XCTAssertEqual(shell.sidebarContainer.frame.width, 260)
        XCTAssertEqual(shell.sidebarContainer.frame.minX, 0)
        XCTAssertEqual(shell.contentContainer.frame.minX, 260)
        XCTAssertEqual(shell.contentContainer.frame.width, 1024 - 260)
        XCTAssertNotNil(window)
    }

    func test_isCollapsed_switches_rail_width() {
        let (shell, _, _, window) = makeShell(width: 1024)
        shell.isCollapsed = true
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.width, JdToken.Space.s16)  // 64
        XCTAssertEqual(shell.contentContainer.frame.minX, JdToken.Space.s16)

        shell.isCollapsed = false
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.width, 260)
        XCTAssertEqual(shell.contentContainer.frame.minX, 260)
    }

    func test_custom_widths_are_applied() {
        let (shell, _, _, window) = makeShell(width: 1024)
        shell.sidebarWidth = 300
        shell.collapsedWidth = JdToken.Space.s12  // 48
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.width, 300)
        shell.isCollapsed = true
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.width, JdToken.Space.s12)
    }

    // MARK: compact — 드로어 + 딤

    func test_compact_width_hides_drawer_offscreen() {
        let (shell, _, _, _) = makeShell(width: 375)
        XCTAssertTrue(shell.isCompact)
        // 본문은 전체 폭, 드로어는 화면 왼쪽 밖
        XCTAssertEqual(shell.contentContainer.frame.minX, 0)
        XCTAssertEqual(shell.contentContainer.frame.width, 375)
        XCTAssertEqual(shell.sidebarContainer.frame.maxX, 0)
        XCTAssertTrue(shell.sidebarContainer.accessibilityElementsHidden)
    }

    func test_compact_open_slides_drawer_in_and_isolates_background() {
        let (shell, _, _, window) = makeShell(width: 375)
        shell.isCompactOpen = true
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.minX, 0)
        XCTAssertEqual(shell.sidebarContainer.frame.width, 260)
        XCTAssertFalse(shell.sidebarContainer.accessibilityElementsHidden)
        XCTAssertTrue(shell.sidebarContainer.accessibilityViewIsModal)
        // 본문은 여전히 전체 폭 — 드로어는 오버레이다
        XCTAssertEqual(shell.contentContainer.frame.width, 375)
    }

    // compact에서 접힘은 드로어 폭에 영향을 주지 않는다(웹 --_jd-shell-drawer 동형)
    func test_collapsed_does_not_shrink_compact_drawer() {
        let (shell, _, _, window) = makeShell(width: 375)
        shell.isCollapsed = true
        shell.isCompactOpen = true
        flush(window)
        XCTAssertEqual(shell.sidebarContainer.frame.width, 260)
    }

    // regular 복귀 시 드로어는 닫힌다 (웹 #syncMobile 동형)
    func test_returning_to_regular_closes_drawer() {
        let (shell, _, _, window) = makeShell(width: 375)
        shell.isCompactOpen = true
        flush(window)
        XCTAssertTrue(shell.isCompactOpen)

        window.frame = CGRect(x: 0, y: 0, width: 1024, height: 768)
        flush(window)
        XCTAssertFalse(shell.isCompact)
        XCTAssertFalse(shell.isCompactOpen)
        XCTAssertEqual(shell.contentContainer.frame.minX, 260)
    }
}
