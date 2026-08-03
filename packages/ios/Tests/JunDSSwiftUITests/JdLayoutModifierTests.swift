import JunDS
import SwiftUI
import XCTest

final class JdSpacerTests: XCTestCase {

    private func size(
        of view: some View, in box: CGSize = CGSize(width: 320, height: 480)
    ) -> CGSize {
        return UIHostingController(rootView: view).sizeThatFits(in: box)
    }

    // 웹 패리티의 핵심: 양측 패딩 → 차지 공간은 2×size (탐욕적 Spacer()가 아니다)
    func test_vertical_spacer_takes_double_gap_on_height() {
        let measured = size(of: JdSpacer(.md))
        XCTAssertEqual(measured.height, JdGap.md.value * 2, accuracy: 0.5)
    }

    func test_horizontal_spacer_takes_double_gap_on_width() {
        let measured = size(of: JdSpacer(.md, axis: .horizontal))
        XCTAssertEqual(measured.width, JdGap.md.value * 2, accuracy: 0.5)
    }

    // 크기 축 단조성 — 큰 gap이 더 큰 공간을 차지한다
    func test_size_ramp_is_monotonic() {
        let small = size(of: JdSpacer(.sm)).height
        let medium = size(of: JdSpacer(.md)).height
        let large = size(of: JdSpacer(.lg)).height
        XCTAssertLessThan(small, medium)
        XCTAssertLessThan(medium, large)
    }

    // 탐욕적이지 않다: 스택 안에서 부모 폭을 부풀리지 않는다
    func test_spacer_does_not_stretch_parent_width() {
        let hugged = VStack(spacing: 0) {
            JdToken.Color.border.color.frame(width: 40, height: 10)
            JdSpacer(.lg)
        }
        .fixedSize()
        let measured = size(of: hugged)
        XCTAssertEqual(measured.width, 40, accuracy: 0.5)
        XCTAssertEqual(measured.height, 10 + JdGap.lg.value * 2, accuracy: 0.5)
    }
}

final class JdBreakpointVisibilityTests: XCTestCase {

    private func size(of view: some View, in box: CGSize) -> CGSize {
        return UIHostingController(rootView: view).sizeThatFits(in: box)
    }

    // 첫 측정 전 기본값은 "보임" — 웹의 무조건 렌더 후 CSS 숨김과 동형(깜빡임 방지)
    func test_jdShow_renders_before_first_measurement() {
        let measured = size(of: JdText("A").jdShow(above: .md), in: CGSize(width: 320, height: 100))
        XCTAssertGreaterThan(measured.height, 0)
    }

    func test_jdHide_renders_before_first_measurement() {
        let measured = size(of: JdText("A").jdHide(below: .md), in: CGSize(width: 320, height: 100))
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 조건 없는 호출·중첩 합성이 모두 호스팅된다 (show ∘ hide)
    func test_modifiers_compose() {
        let composed = JdText("A")
            .jdShow(above: .sm, below: .xl2)
            .jdHide(above: .xl)
        let measured = size(of: composed, in: CGSize(width: 800, height: 200))
        XCTAssertGreaterThanOrEqual(measured.height, 0)
    }

    func test_no_bounds_keeps_content() {
        let measured = size(of: JdText("A").jdShow(), in: CGSize(width: 320, height: 100))
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 컨테이너에 붙여도 계층이 성립한다 — 저작 규약(늘어나는 쪽에 붙인다) 스모크
    func test_applied_to_stretching_container() {
        let container = VStack(spacing: 0) {
            JdText("본문")
        }
        .frame(maxWidth: .infinity)
        .jdShow(above: .sm)
        let measured = size(of: container, in: CGSize(width: 900, height: 300))
        XCTAssertGreaterThan(measured.width, 0)
    }
}

final class JdAppShellTests: XCTestCase {

    private func size(of view: some View, in box: CGSize) -> CGSize {
        return UIHostingController(rootView: view).sizeThatFits(in: box)
    }

    // regular 폭 — 4슬롯 전부 채운 골격 호스팅 스모크
    func test_hosts_with_all_slots() {
        let shell = JdAppShell(collapsed: .constant(false), compactOpen: .constant(false)) {
            JdText("사이드바")
        } header: {
            JdText("헤더")
        } content: {
            JdText("본문")
        } footer: {
            JdText("푸터")
        }
        let measured = size(of: shell, in: CGSize(width: 1024, height: 768))
        XCTAssertGreaterThan(measured.width, 0)
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 접힌 레일도 같은 골격으로 호스팅된다
    func test_hosts_collapsed() {
        let shell = JdAppShell(collapsed: .constant(true), compactOpen: .constant(false)) {
            JdText("사이드바")
        } header: {
            EmptyView()
        } content: {
            JdText("본문")
        } footer: {
            EmptyView()
        }
        let measured = size(of: shell, in: CGSize(width: 1024, height: 768))
        XCTAssertGreaterThan(measured.width, 0)
    }

    // compact 폭 + 드로어 열림 — 딤/드로어 오버레이 경로 호스팅
    func test_hosts_compact_drawer_open() {
        let shell = JdAppShell(collapsed: .constant(false), compactOpen: .constant(true)) {
            JdText("사이드바")
        } header: {
            JdText("헤더")
        } content: {
            JdText("본문")
        } footer: {
            EmptyView()
        }
        let measured = size(of: shell, in: CGSize(width: 375, height: 812))
        XCTAssertGreaterThan(measured.width, 0)
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 사이드바 없는 구성(빈 슬롯) — 레일/드로어 없이 본문 열만
    func test_hosts_without_sidebar() {
        let shell = JdAppShell(collapsed: .constant(false), compactOpen: .constant(false)) {
            EmptyView()
        } header: {
            EmptyView()
        } content: {
            JdText("본문")
        } footer: {
            EmptyView()
        }
        let measured = size(of: shell, in: CGSize(width: 768, height: 1024))
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 사용자 지정 폭도 계약 표면대로 받는다
    func test_custom_widths_host() {
        let shell = JdAppShell(
            sidebarWidth: 300,
            collapsedWidth: JdToken.Space.s12,
            collapsed: .constant(true),
            compactOpen: .constant(false)
        ) {
            JdText("사이드바")
        } header: {
            EmptyView()
        } content: {
            JdText("본문")
        } footer: {
            EmptyView()
        }
        let measured = size(of: shell, in: CGSize(width: 1280, height: 800))
        XCTAssertGreaterThan(measured.width, 0)
    }
}
