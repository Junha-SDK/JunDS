import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 선택 컨트롤 3종(Toggle/Checkbox/RadioGroup)의 상태·발화·접근성 표면 (04 §8.2).
// 행/트랙은 전부 구현 세부(private)라 뷰 계층을 훑어 찾는다 — 공개 표면을 테스트 편의로
// 넓히지 않는다.

private func jdDescendants<T: UIView>(_ root: UIView, of type: T.Type) -> [T] {
    var found: [T] = []
    for subview in root.subviews {
        if let match = subview as? T { found.append(match) }
        found.append(contentsOf: jdDescendants(subview, of: type))
    }
    return found
}

// MARK: - Toggle / Switch

@MainActor
final class JdToggleViewTests: XCTestCase {

    private func track(_ view: JdToggleView) throws -> UISwitch {
        try XCTUnwrap(jdDescendants(view, of: UISwitch.self).first)
    }

    // 프로그램 변경은 웹 jd-change를 발화시키지 않는다 (사용자 조작 전용 계약)
    func test_programmatic_isOn_updates_state_without_onChange() throws {
        let view = JdToggleView(label: "알림", isOn: false)
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        view.isOn = true

        XCTAssertTrue(view.isOn)
        XCTAssertTrue(try track(view).isOn)
        XCTAssertTrue(fired.isEmpty)
    }

    // 사용자 조작(스위치 값 변경)만 onChange를 발화한다
    func test_user_interaction_fires_onChange() throws {
        let view = JdToggleView(label: "알림", isOn: false)
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        let control = try track(view)
        control.setOn(true, animated: false)
        control.jdSendActions(for: .valueChanged)

        XCTAssertEqual(fired, [true])
        XCTAssertTrue(view.isOn)
    }

    // 라벨은 스위치의 accessibilityLabel로 합류한다 — 요소 2개로 쪼개지 않는다 (04 §7.1)
    func test_label_merges_into_switch_accessibility_label() throws {
        let view = JdToggleView(label: "알림", isOn: false)
        XCTAssertEqual(try track(view).accessibilityLabel, "알림")

        view.label = "푸시 알림"
        XCTAssertEqual(try track(view).accessibilityLabel, "푸시 알림")
    }

    // 라벨 미지정이면 텍스트 슬롯을 감춘다 (웹 text hidden 동형)
    func test_no_label_hides_text_slot() {
        let view = JdToggleView(isOn: true)
        let labels = jdDescendants(view, of: UILabel.self)
        XCTAssertTrue(labels.allSatisfy { $0.isHidden })
        XCTAssertTrue(view.isOn)
    }

    // 웹 disabled 동형 — 입력 차단 + 50% 불투명도
    func test_disabled_dims_and_blocks_switch() throws {
        let view = JdToggleView(label: "알림")
        view.isEnabled = false
        XCTAssertFalse(try track(view).isEnabled)
        XCTAssertEqual(view.alpha, CGFloat(JdToken.Opacity.o50), accuracy: 0.001)
    }

    // R12 — Switch는 별칭이지 별도 구현이 아니다
    func test_switch_is_alias_of_toggle() {
        XCTAssertTrue(JdSwitchView.self == JdToggleView.self)
    }
}

// MARK: - Checkbox

@MainActor
final class JdCheckboxViewTests: XCTestCase {

    // indeterminateAllowed면 3상태 순환 off → on → indeterminate → off
    func test_three_state_cycle_when_indeterminate_allowed() {
        let view = JdCheckboxView(label: "동의", state: .off, indeterminateAllowed: true)
        var fired: [JdCheckboxState] = []
        view.onChange = { fired.append($0) }

        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.isSelectedState, .on)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.isSelectedState, .indeterminate)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.isSelectedState, .off)

        XCTAssertEqual(fired, [.on, .indeterminate, .off])
    }

    // 기본(2상태)에서는 mixed를 만들지 않고, mixed로 시작해도 조작하면 checked로 확정된다
    func test_two_state_cycle_and_mixed_resolves_to_on() {
        let view = JdCheckboxView(state: .off)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.isSelectedState, .on)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(view.isSelectedState, .off)

        let mixed = JdCheckboxView(state: .indeterminate)
        mixed.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(mixed.isSelectedState, .on)
    }

    // 상태는 문자열 조합이 아니라 트레이트 + 값으로 노출한다 (04 §7.1)
    func test_accessibility_value_and_selected_trait_track_state() {
        let view = JdCheckboxView(label: "동의", state: .off, indeterminateAllowed: true)
        XCTAssertEqual(view.accessibilityLabel, "동의")
        XCTAssertEqual(view.accessibilityValue, "선택 안 됨")
        XCTAssertFalse(view.accessibilityTraits.contains(.selected))

        view.isSelectedState = .on
        XCTAssertEqual(view.accessibilityValue, "선택됨")
        XCTAssertTrue(view.accessibilityTraits.contains(.selected))

        view.isSelectedState = .indeterminate
        XCTAssertEqual(view.accessibilityValue, "부분 선택")
        XCTAssertFalse(view.accessibilityTraits.contains(.selected))
    }

    // 프로그램 변경은 onChange를 발화시키지 않는다
    func test_programmatic_state_does_not_fire_onChange() {
        let view = JdCheckboxView(state: .off)
        var fired: [JdCheckboxState] = []
        view.onChange = { fired.append($0) }

        view.isSelectedState = .on

        XCTAssertEqual(view.isSelectedState, .on)
        XCTAssertTrue(fired.isEmpty)
    }

    // 크기 축은 스펙 boxSize/labelFontSize로만 움직인다 (하드코딩 금지 — 04 §4.2)
    func test_size_change_reapplies_label_font_from_spec() {
        let view = JdCheckboxView(label: "동의", size: .sm)
        let labelView = jdDescendants(view, of: UILabel.self).first
        XCTAssertEqual(
            labelView?.font.pointSize,
            JdFontBridge.scaledFont(
                size: JdChoiceSpec.resolve(size: .sm).labelFontSize,
                weight: JdToken.FontWeight.normal,
                compatibleWith: view.traitCollection
            ).pointSize)
        view.size = .md
        XCTAssertEqual(
            labelView?.font.pointSize,
            JdFontBridge.scaledFont(
                size: JdChoiceSpec.resolve(size: .md).labelFontSize,
                weight: JdToken.FontWeight.normal,
                compatibleWith: view.traitCollection
            ).pointSize)
    }
}

// MARK: - RadioGroup

@MainActor
final class JdRadioGroupViewTests: XCTestCase {

    private let options = [
        JdRadioOption(value: "a", label: "매일"),
        JdRadioOption(value: "b", label: "주간"),
        JdRadioOption(value: "c", label: "사용 안 함", isDisabled: true),
    ]

    private func row(_ group: JdRadioGroupView, label: String) throws -> UIControl {
        let match = jdDescendants(group, of: UIControl.self).first {
            $0.accessibilityLabel == label
        }
        return try XCTUnwrap(match)
    }

    // 선택 이동 — 탭한 행의 value가 selectedValue가 되고 onChange가 1회 발화
    func test_tap_moves_selection_and_fires_onChange() throws {
        let group = JdRadioGroupView(options: options, selectedValue: "a")
        var fired: [String] = []
        group.onChange = { fired.append($0) }

        try row(group, label: "주간").jdSendActions(for: .touchUpInside)

        XCTAssertEqual(group.selectedValue, "b")
        XCTAssertEqual(fired, ["b"])
        XCTAssertTrue(try row(group, label: "주간").accessibilityTraits.contains(.selected))
        XCTAssertFalse(try row(group, label: "매일").accessibilityTraits.contains(.selected))
    }

    // disabled 옵션은 무시된다 (웹 update()의 input.disabled 동형)
    func test_disabled_option_is_ignored() throws {
        let group = JdRadioGroupView(options: options, selectedValue: "a")
        var fired: [String] = []
        group.onChange = { fired.append($0) }

        let disabledRow = try row(group, label: "사용 안 함")
        XCTAssertFalse(disabledRow.isEnabled)
        XCTAssertTrue(disabledRow.accessibilityTraits.contains(.notEnabled))

        disabledRow.jdSendActions(for: .touchUpInside)

        XCTAssertEqual(group.selectedValue, "a")
        XCTAssertTrue(fired.isEmpty)
    }

    // 그룹 disabled는 전 행을 비활성화한다
    func test_group_disabled_disables_every_row() throws {
        let group = JdRadioGroupView(options: options, selectedValue: "a")
        group.isEnabled = false
        for option in options {
            XCTAssertFalse(try row(group, label: option.label).isEnabled)
        }
    }

    // axis 전환 — 웹 direction attribute 동형
    func test_axis_switches_stack_orientation() throws {
        let group = JdRadioGroupView(options: options, axis: .vertical)
        let stack = try XCTUnwrap(jdDescendants(group, of: UIStackView.self).first)
        XCTAssertEqual(stack.axis, .vertical)

        group.axis = .horizontal
        XCTAssertEqual(stack.axis, .horizontal)

        group.axis = .vertical
        XCTAssertEqual(stack.axis, .vertical)
    }

    // 프로그램 변경은 onChange를 발화시키지 않는다
    func test_programmatic_selection_does_not_fire_onChange() throws {
        let group = JdRadioGroupView(options: options)
        var fired: [String] = []
        group.onChange = { fired.append($0) }

        group.selectedValue = "b"

        XCTAssertTrue(fired.isEmpty)
        XCTAssertTrue(try row(group, label: "주간").accessibilityTraits.contains(.selected))
    }

    // 옵션 교체 시 행이 재구축된다 (웹 #rebuild 동형)
    func test_options_replacement_rebuilds_rows() throws {
        let group = JdRadioGroupView(options: options)
        XCTAssertEqual(jdDescendants(group, of: UIControl.self).count, 3)

        group.options = [JdRadioOption(value: "x", label: "하나")]
        let rows = jdDescendants(group, of: UIControl.self)
        XCTAssertEqual(rows.count, 1)
        XCTAssertEqual(rows.first?.accessibilityLabel, "하나")
    }
}
