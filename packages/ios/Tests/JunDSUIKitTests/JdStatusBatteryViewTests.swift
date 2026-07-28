import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 이 3종은 웹에 role·aria가 전무하다 — iOS 보정분(라벨/값)이 실제로 표면에 뜨는지가 핵심이다.

@MainActor
final class JdStatusDotViewTests: XCTestCase {

    // 웹은 라벨 없으면 AT에 아무것도 노출하지 않는다 — iOS는 상태명으로 보정한다
    func test_without_label_exposes_status_name() {
        for status in JdStatusKind.allCases {
            let view = JdStatusDotView(status)
            XCTAssertTrue(view.isAccessibilityElement)
            XCTAssertEqual(
                view.accessibilityLabel, JdStatusDotView.statusName(status),
                "상태명 미노출: \(status.rawValue)")
            XCTAssertFalse(view.accessibilityLabel?.isEmpty ?? true)
        }
    }

    // 라벨이 있으면 그 텍스트가 유일한 표면이다(상태명과 합성하지 않는다 — 04 §7.1)
    func test_with_label_uses_label_text_only() {
        let view = JdStatusDotView(.danger, label: "장애")
        XCTAssertEqual(view.accessibilityLabel, "장애")
        XCTAssertNil(view.accessibilityValue)
    }

    // 빈 문자열은 라벨 없음과 동일 취급 — 상태명으로 되돌아간다
    func test_label_didSet_toggles_between_text_and_status_name() {
        let view = JdStatusDotView(.success, label: "정상 가동")
        XCTAssertEqual(view.accessibilityLabel, "정상 가동")
        view.label = ""
        XCTAssertEqual(view.accessibilityLabel, JdStatusDotView.statusName(.success))
        view.label = nil
        XCTAssertEqual(view.accessibilityLabel, JdStatusDotView.statusName(.success))
        view.status = .warning
        XCTAssertEqual(view.accessibilityLabel, JdStatusDotView.statusName(.warning))
    }

    // 상태명 사전은 6종 전부 서로 다른 어휘여야 한다(중복은 상태 구분 실패)
    func test_status_names_are_distinct() {
        var seen = Set<String>()
        for status in JdStatusKind.allCases {
            XCTAssertTrue(
                seen.insert(JdStatusDotView.statusName(status)).inserted,
                "상태명 중복: \(status.rawValue)")
        }
    }
}

@MainActor
final class JdSeverityBadgeViewTests: XCTestCase {

    // 웹 [dot] 속성 동형 — 점은 스택에서 접혔다 펴진다(장식이라 접근성 표면은 불변)
    func test_dot_toggle() {
        let view = JdSeverityBadgeView("경고", severity: .warn)
        XCTAssertFalse(view.isDotVisible)

        view.showsDot = true
        XCTAssertTrue(view.isDotVisible)
        XCTAssertEqual(view.accessibilityLabel, "경고")

        view.showsDot = false
        XCTAssertFalse(view.isDotVisible)
    }

    func test_dot_visible_from_init() {
        let view = JdSeverityBadgeView("정상", severity: .ok, showsDot: true)
        XCTAssertTrue(view.isDotVisible)
    }

    // 색으로만 전달되던 심각도를 값으로 노출한다(웹 결함 보정). neutral은 기본값이라 무노출.
    func test_severity_exposed_as_accessibility_value() {
        let danger = JdSeverityBadgeView("P0", severity: .danger)
        XCTAssertTrue(danger.isAccessibilityElement)
        XCTAssertEqual(danger.accessibilityLabel, "P0")
        XCTAssertEqual(danger.accessibilityValue, JdSeverityBadgeView.severityName(.danger))

        let neutral = JdSeverityBadgeView("미정")
        XCTAssertNil(neutral.accessibilityValue)

        neutral.severity = .info
        XCTAssertEqual(neutral.accessibilityValue, JdSeverityBadgeView.severityName(.info))
    }

    func test_text_didSet_updates_label() {
        let view = JdSeverityBadgeView("이전")
        view.text = "이후"
        XCTAssertEqual(view.accessibilityLabel, "이후")
    }
}

@MainActor
final class JdBatteryIndicatorViewTests: XCTestCase {

    // 폭으로만 전달되던 값을 퍼센트로 노출한다(웹 결함 보정)
    func test_accessibilityValue_reads_percent() {
        let view = JdBatteryIndicatorView(value: 85)
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertEqual(view.accessibilityValue, "85 퍼센트")
    }

    // 클램프는 Core가 한다 — 범위 밖 입력도 표면은 0…100만 말한다
    func test_value_is_clamped_in_value_and_fraction() {
        let view = JdBatteryIndicatorView(value: 150)
        XCTAssertEqual(view.accessibilityValue, "100 퍼센트")
        XCTAssertEqual(view.fillFraction, 1, accuracy: 0.0001)

        view.value = -20
        XCTAssertEqual(view.accessibilityValue, "0 퍼센트")
        XCTAssertEqual(view.fillFraction, 0, accuracy: 0.0001)

        view.value = 42.4
        XCTAssertEqual(view.accessibilityValue, "42 퍼센트")
        XCTAssertEqual(view.fillFraction, 0.424, accuracy: 0.0001)
    }

    // 라벨이 없어도 이름이 필요하다 — 웹엔 없는 기본 이름을 iOS가 채운다
    func test_label_defaults_and_overrides_accessibility_name() {
        let unlabeled = JdBatteryIndicatorView(value: 50)
        XCTAssertEqual(
            unlabeled.accessibilityLabel,
            JdBatteryIndicatorView.defaultAccessibilityLabel)

        unlabeled.label = "노트북"
        XCTAssertEqual(unlabeled.accessibilityLabel, "노트북")

        unlabeled.label = ""
        XCTAssertEqual(
            unlabeled.accessibilityLabel,
            JdBatteryIndicatorView.defaultAccessibilityLabel)
    }

    // autoColor는 값이 바뀔 때마다 Core 임계로 재판정된다
    func test_autoColor_follows_value_thresholds() {
        let view = JdBatteryIndicatorView(value: 90, autoColor: true)
        XCTAssertEqual(JdBatterySpec.autoColor(for: view.value), .success)
        view.value = 50
        XCTAssertEqual(JdBatterySpec.autoColor(for: view.value), .warning)
        view.value = 10
        XCTAssertEqual(JdBatterySpec.autoColor(for: view.value), .danger)
    }

    // size didSet이 스펙 재결의까지 이어진다(본체가 커지면 채움 기준 폭도 커진다)
    func test_size_change_resolves_new_spec() {
        let view = JdBatteryIndicatorView(value: 100, size: .sm)
        view.setNeedsLayout()
        view.layoutIfNeeded()
        let smallWidth = view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).width

        view.size = .lg
        view.setNeedsLayout()
        view.layoutIfNeeded()
        let largeWidth = view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).width

        XCTAssertGreaterThan(largeWidth, smallWidth)
    }
}
