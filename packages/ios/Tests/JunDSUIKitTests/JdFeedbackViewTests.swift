import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// 인라인 피드백 6종(Alert/Banner/Callout/Notification/EmptyState/Result)의 UIKit 뷰.
// 색은 Core variant/status가 단일 소스 — 뷰가 그 매핑을 실제 표면에 반영하는지, 그리고
// 버튼 배선·접근성 합치기가 실제로 걸렸는지를 고정한다.

// 라이트로 고정해 다이나믹 컬러를 구체 색으로 풀어 비교한다
private let lightTrait = UITraitCollection(userInterfaceStyle: .light)

private func rgba(_ color: UIColor?, _ trait: UITraitCollection) -> [CGFloat]? {
    guard let resolved = color?.resolvedColor(with: trait) else { return nil }
    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
    resolved.getRed(&r, green: &g, blue: &b, alpha: &a)
    return [r, g, b, a]
}

final class JdAlertViewTests: XCTestCase {

    // 좌측 3pt 강조선이 variant.color를 그대로 쓴다(색은 Core가 단일 소스)
    func test_accent_bar_uses_variant_color() {
        for variant in JdFeedbackVariant.allCases {
            let view = JdAlertView("제목", variant: variant)
            let expected = rgba(variant.color.uiColor, lightTrait)
            let actual = rgba(view.accentBar.backgroundColor, lightTrait)
            XCTAssertEqual(actual, expected, "강조선 색 불일치: \(variant.rawValue)")
        }
    }

    // 강조선 폭은 3pt(Border.thick) — 하드코딩이 아니라 토큰
    func test_accent_bar_width_is_token() {
        let view = JdAlertView("제목", variant: .info)
        let width = JdConstraintStore.of(view.accentBar).installedConstraint(for: .width)
        XCTAssertEqual(width?.constant, JdToken.Border.thick)
    }

    // danger/warning만 정적 텍스트로 표식(라이브 리전 낭독 대상)
    func test_assertive_roles_tag_static_text() {
        let danger = JdAlertView("위험", variant: .danger)
        XCTAssertTrue(danger.titleLabel.accessibilityTraits.contains(.staticText))
    }
}

final class JdBannerViewTests: XCTestCase {

    // 액션·닫기 버튼이 각각 자기 클로저를 발화한다
    func test_action_and_dismiss_fire() {
        var actionFired = false
        var dismissFired = false
        let banner = JdBannerView("저장되었습니다", variant: .info,
                                  actionLabel: "실행 취소", onAction: { actionFired = true },
                                  isDismissible: true, onDismiss: { dismissFired = true })

        XCTAssertNotNil(banner.actionButton)
        XCTAssertNotNil(banner.dismissButton)

        banner.actionButton?.jdSendActions(for: .touchUpInside)
        XCTAssertTrue(actionFired)
        XCTAssertFalse(dismissFired)

        banner.dismissButton?.jdSendActions(for: .touchUpInside)
        XCTAssertTrue(dismissFired)
    }

    // 라벨/닫기 미지정이면 버튼이 아예 없다(잘못된 조합을 표면에서 제거)
    func test_no_buttons_when_unset() {
        let banner = JdBannerView("정보", variant: .warning)
        XCTAssertNil(banner.actionButton)
        XCTAssertNil(banner.dismissButton)
    }

    // 흰 글자 대비 배경은 variant.color와 달라야 한다(foreground 20% 혼합이 실제로 걸렸는지)
    func test_background_differs_from_raw_variant_color() {
        let banner = JdBannerView("메시지", variant: .info)
        let raw = rgba(JdFeedbackVariant.info.color.uiColor, lightTrait)
        let mixed = rgba(banner.backgroundColor, lightTrait)
        XCTAssertNotEqual(mixed, raw)
    }
}

final class JdCalloutViewTests: XCTestCase {

    // 이모지는 Core JdCalloutVariant 매핑을 그대로 렌더한다
    func test_emoji_matches_core_for_all_variants() {
        for variant in JdCalloutVariant.allCases {
            let view = JdCalloutView("제목", variant: variant)
            XCTAssertEqual(view.emojiLabel.text, variant.emoji, "이모지 불일치: \(variant.rawValue)")
        }
    }

    // collapsible 헤더 탭이 본문을 접었다 편다
    func test_collapsible_toggle_hides_and_shows_content() {
        let view = JdCalloutView("주의", message: "본문", variant: .warning,
                                 isCollapsible: true, initiallyExpanded: true)
        XCTAssertNotNil(view.headerButton)
        XCTAssertTrue(view.isExpanded)
        XCTAssertFalse(view.contentContainer.isHidden)

        view.headerButton?.jdSendActions(for: .touchUpInside)
        XCTAssertFalse(view.isExpanded)
        XCTAssertTrue(view.contentContainer.isHidden)

        view.headerButton?.jdSendActions(for: .touchUpInside)
        XCTAssertTrue(view.isExpanded)
        XCTAssertFalse(view.contentContainer.isHidden)
    }

    // initiallyExpanded=false는 접힌 상태로 시작한다
    func test_initially_collapsed_starts_hidden() {
        let view = JdCalloutView("참고", message: "본문", variant: .note,
                                 isCollapsible: true, initiallyExpanded: false)
        XCTAssertFalse(view.isExpanded)
        XCTAssertTrue(view.contentContainer.isHidden)
    }

    // 비-collapsible은 헤더 버튼이 없고 본문이 항상 보인다
    func test_non_collapsible_has_no_toggle() {
        let view = JdCalloutView("정보", message: "본문", variant: .info, isCollapsible: false)
        XCTAssertNil(view.headerButton)
        XCTAssertTrue(view.isExpanded)
        XCTAssertFalse(view.contentContainer.isHidden)
    }
}

final class JdNotificationViewTests: XCTestCase {

    // 닫기 버튼이 onDismiss를 발화한다
    func test_dismiss_fires() {
        var dismissed = false
        let view = JdNotificationView(title: "새 알림", description: "설명",
                                      variant: .info, systemImage: "bell",
                                      isDismissible: true, onDismiss: { dismissed = true })
        XCTAssertNotNil(view.dismissButton)
        view.dismissButton?.jdSendActions(for: .touchUpInside)
        XCTAssertTrue(dismissed)
    }

    // 닫기 미지정이면 버튼이 없다
    func test_no_dismiss_button_when_not_dismissible() {
        let view = JdNotificationView(title: "알림", variant: .success)
        XCTAssertNil(view.dismissButton)
    }
}

final class JdEmptyStateViewTests: XCTestCase {

    // 제목·설명을 하나의 접근성 요소로 합친다
    func test_title_and_description_are_merged() {
        let view = JdEmptyStateView(title: "결과 없음", description: "검색어를 바꿔보세요")
        XCTAssertTrue(view.textElement.isAccessibilityElement)
        XCTAssertEqual(view.textElement.accessibilityLabel, "결과 없음, 검색어를 바꿔보세요")
    }

    // 설명이 없으면 제목만 표면에 남는다(빈 구분자 잔재 없음)
    func test_merged_label_without_description_is_title_only() {
        let view = JdEmptyStateView(title: "항목 없음")
        XCTAssertEqual(view.textElement.accessibilityLabel, "항목 없음")
    }
}

final class JdResultViewTests: XCTestCase {

    // status별 심볼은 Core JdResultStatus.systemImage를 그대로 쓰고 실제 이미지가 존재한다
    func test_symbol_matches_core_for_all_statuses() {
        for status in JdResultStatus.allCases {
            let view = JdResultView(status: status, title: "제목")
            XCTAssertEqual(view.symbolName, status.systemImage, "심볼명 불일치: \(status.rawValue)")
            XCTAssertNotNil(view.iconView.image, "심볼 이미지 부재: \(status.rawValue)")
        }
    }

    // 심볼 색은 Core status.color를 그대로 쓴다
    func test_symbol_color_uses_status_color() {
        let view = JdResultView(status: .success, title: "완료")
        XCTAssertEqual(rgba(view.iconView.tintColor, lightTrait),
                       rgba(JdResultStatus.success.color.uiColor, lightTrait))
    }
}
