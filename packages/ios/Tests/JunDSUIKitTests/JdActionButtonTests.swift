import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 버튼 계열 7종(DESIGN-3 §B)의 상태·발화·접근성 표면 (04 §8.2).
// ⚠️ sendActions(for:)는 앱 호스트 없는 이 번들에서 무동작이다 — jdSendActions 헬퍼를 쓴다
//    (Tests/JunDSUIKitTests/Support/JdControlActionDispatch.swift).

private func jdActionDescendants<T: UIView>(_ root: UIView, of type: T.Type) -> [T] {
    var found: [T] = []
    for subview in root.subviews {
        if let match = subview as? T { found.append(match) }
        found.append(contentsOf: jdActionDescendants(subview, of: type))
    }
    return found
}

// MARK: - BookmarkButton

@MainActor
final class JdBookmarkButtonViewTests: XCTestCase {

    // 웹 aria-pressed + 라벨 교체 동형 — 상태는 트레이트, 동작은 라벨
    func test_tap_toggles_state_label_and_selected_trait() {
        let view = JdBookmarkButtonView(isBookmarked: false)
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        XCTAssertEqual(view.accessibilityLabel, "북마크")
        XCTAssertFalse(view.accessibilityTraits.contains(.selected))

        view.jdSendActions(for: .touchUpInside)

        XCTAssertTrue(view.isBookmarked)
        XCTAssertEqual(view.accessibilityLabel, "북마크 해제")
        XCTAssertTrue(view.accessibilityTraits.contains(.selected))
        XCTAssertTrue(view.accessibilityTraits.contains(.button))
        XCTAssertEqual(fired, [true])

        view.jdSendActions(for: .touchUpInside)

        XCTAssertFalse(view.isBookmarked)
        XCTAssertEqual(view.accessibilityLabel, "북마크")
        XCTAssertFalse(view.accessibilityTraits.contains(.selected))
        XCTAssertEqual(fired, [true, false])
    }

    // 프로그램 변경은 onChange를 발화시키지 않는다 (웹 jd-change 계약)
    func test_programmatic_state_does_not_fire_onChange() {
        let view = JdBookmarkButtonView()
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        view.isBookmarked = true

        XCTAssertTrue(view.accessibilityTraits.contains(.selected))
        XCTAssertTrue(fired.isEmpty)
    }

    // 크기 축은 아이콘 버튼 스펙에서만 온다 — 하드코딩 금지 (04 §4.2)
    func test_intrinsic_size_follows_icon_button_spec() {
        let view = JdBookmarkButtonView(size: .lg)
        let expected = JdIconButtonSpec.resolve(variant: .ghost, size: .lg).side
        XCTAssertGreaterThanOrEqual(view.intrinsicContentSize.width, expected)
        XCTAssertEqual(view.intrinsicContentSize.width, view.intrinsicContentSize.height)
    }
}

// MARK: - LikeButton

@MainActor
final class JdLikeButtonViewTests: XCTestCase {

    private func countLabel(_ view: JdLikeButtonView) throws -> UILabel {
        try XCTUnwrap(jdActionDescendants(view, of: UILabel.self).first)
    }

    func test_tap_toggles_state_label_and_selected_trait() {
        let view = JdLikeButtonView(isLiked: false)
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        XCTAssertEqual(view.accessibilityLabel, "좋아요")

        view.jdSendActions(for: .touchUpInside)

        XCTAssertTrue(view.isLiked)
        XCTAssertEqual(view.accessibilityLabel, "좋아요 취소")
        XCTAssertTrue(view.accessibilityTraits.contains(.selected))
        XCTAssertEqual(fired, [true])
    }

    // 카운트 표기는 JdNumberFormat.compactCount 단일 소스 — 렌더가 다시 세지 않는다
    func test_count_uses_core_compact_format() throws {
        let view = JdLikeButtonView(count: 1234)
        XCTAssertEqual(try countLabel(view).text, JdNumberFormat.compactCount(1234))
        XCTAssertEqual(view.accessibilityValue, JdNumberFormat.compactCount(1234))

        view.count = 999
        XCTAssertEqual(try countLabel(view).text, JdNumberFormat.compactCount(999))
        XCTAssertEqual(view.accessibilityValue, "999")
    }

    // nil이면 카운트 슬롯을 감춘다 (웹 count 미지정 동형)
    func test_nil_count_hides_slot() throws {
        let view = JdLikeButtonView(isLiked: true)
        XCTAssertTrue(try countLabel(view).isHidden)
        XCTAssertNil(view.accessibilityValue)
    }
}

// MARK: - FollowButton

@MainActor
final class JdFollowButtonViewTests: XCTestCase {

    private func title(_ view: JdFollowButtonView) throws -> String? {
        try XCTUnwrap(jdActionDescendants(view, of: UILabel.self).first).text
    }

    // 두 변형 라벨 교체 — 웹 aria-pressed 동형 트레이트를 함께 본다
    func test_tap_swaps_label_and_variant() throws {
        let view = JdFollowButtonView(isFollowing: false)
        var fired: [Bool] = []
        view.onChange = { fired.append($0) }

        XCTAssertEqual(try title(view), "팔로우")
        XCTAssertEqual(view.accessibilityLabel, "팔로우")
        XCTAssertFalse(view.accessibilityTraits.contains(.selected))

        view.jdSendActions(for: .touchUpInside)

        XCTAssertTrue(view.isFollowing)
        XCTAssertEqual(try title(view), "팔로잉")
        XCTAssertEqual(view.accessibilityLabel, "팔로잉")
        XCTAssertTrue(view.accessibilityTraits.contains(.selected))
        XCTAssertEqual(fired, [true])
    }

    // 라벨 문자열은 주입 가능하다 (웹 attribute 동형)
    func test_custom_labels_are_used() throws {
        let view = JdFollowButtonView(
            isFollowing: true,
            followLabel: "구독",
            followingLabel: "구독 중")
        XCTAssertEqual(try title(view), "구독 중")
        view.isFollowing = false
        XCTAssertEqual(try title(view), "구독")
    }

    // 변형 색은 JdButtonSpec에서만 온다 — 팔로잉은 secondary(테두리 있음)
    func test_following_variant_draws_border() {
        let view = JdFollowButtonView(isFollowing: true)
        XCTAssertEqual(view.layer.borderWidth, JdToken.Border.thin)
        view.isFollowing = false  // primary — 테두리 없음
        XCTAssertEqual(view.layer.borderWidth, 0)
    }
}

// MARK: - StarRating

@MainActor
final class JdStarRatingViewTests: XCTestCase {

    // ⚠️ 이 배치의 승부처: 별 N개가 아니라 **컨트롤 하나**가 adjustable로 노출된다
    func test_exposes_single_adjustable_element_not_n_buttons() {
        let view = JdStarRatingView(value: 3, max: 5)
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertTrue(view.accessibilityTraits.contains(.adjustable))
        // 별 이미지는 전부 장식 — 접근성 요소로 새어 나오지 않는다
        let stars = jdActionDescendants(view, of: UIImageView.self)
        XCTAssertEqual(stars.count, 5)
        XCTAssertTrue(stars.allSatisfy { !$0.isAccessibilityElement })
    }

    // VoiceOver 위/아래 스와이프로 0.5씩 — 이게 되어야 별점을 줄 수 있다
    func test_accessibility_increment_and_decrement_move_by_half_star() {
        let view = JdStarRatingView(value: 3, max: 5)
        var fired: [Double] = []
        view.onValueChange = { fired.append($0) }

        view.accessibilityIncrement()
        XCTAssertEqual(view.value, 3.5, accuracy: 0.0001)

        view.accessibilityDecrement()
        XCTAssertEqual(view.value, 3.0, accuracy: 0.0001)

        XCTAssertEqual(fired, [3.5, 3.0])
    }

    // 경계는 Core 클램프(JdNumberInputRules)가 잡는다 — 0…max 밖으로 나가지 않는다
    func test_adjust_clamps_to_bounds() {
        let view = JdStarRatingView(value: 0, max: 5)
        view.accessibilityDecrement()
        XCTAssertEqual(view.value, 0, accuracy: 0.0001)

        view.value = 5
        view.accessibilityIncrement()
        XCTAssertEqual(view.value, 5, accuracy: 0.0001)
    }

    // 읽기 전용은 조절 불가 — 정적 요소로만 값을 읽어준다
    func test_read_only_is_static_and_ignores_adjustment() {
        let view = JdStarRatingView(value: 2.5, max: 5, isReadOnly: true)
        XCTAssertFalse(view.accessibilityTraits.contains(.adjustable))
        XCTAssertTrue(view.accessibilityTraits.contains(.staticText))

        view.accessibilityIncrement()
        XCTAssertEqual(view.value, 2.5, accuracy: 0.0001)
    }

    // 낭독 값의 숫자 표기는 JdNumberFormat 단일 소스
    func test_accessibility_value_uses_core_number_format() {
        let view = JdStarRatingView(value: 3.5, max: 5)
        let current = JdNumberFormat.string(value: 3.5, style: .decimal)
        let total = JdNumberFormat.string(value: 5, style: .decimal)
        XCTAssertEqual(view.accessibilityValue, "\(total)점 만점에 \(current)점")
        XCTAssertEqual(view.accessibilityLabel, "별점")
    }
}

// MARK: - CopyButton

@MainActor
final class JdCopyButtonViewTests: XCTestCase {

    private func title(_ view: JdCopyButtonView) throws -> String? {
        try XCTUnwrap(jdActionDescendants(view, of: UILabel.self).first).text
    }

    // 복사는 시스템(UIPasteboard)이 하고 라벨은 웹 동형으로 교체된다
    func test_tap_writes_pasteboard_and_swaps_label() throws {
        let view = JdCopyButtonView(text: "npm i @junds/ui")
        var fired: [String] = []
        view.onCopy = { fired.append($0) }

        XCTAssertEqual(try title(view), "복사")
        XCTAssertFalse(view.isCopied)

        // UIPasteboard.general은 호스트 없는 xctest에서 멈춘다 — 주입 훅으로 무엇이 복사됐는지 본다
        var copied: [String] = []
        let original = JdCopyButtonView.pasteboardWriter
        JdCopyButtonView.pasteboardWriter = { copied.append($0) }
        defer { JdCopyButtonView.pasteboardWriter = original }

        view.jdSendActions(for: .touchUpInside)

        XCTAssertEqual(copied, ["npm i @junds/ui"])
        XCTAssertTrue(view.isCopied)
        XCTAssertEqual(try title(view), "복사됨")
        XCTAssertEqual(view.accessibilityLabel, "복사됨")
        XCTAssertEqual(fired, ["npm i @junds/ui"])
    }

    // 라벨 문자열은 주입 가능하다 (웹 attribute 동형)
    func test_custom_labels_are_used() throws {
        let view = JdCopyButtonView(text: "abc", label: "코드 복사", copiedLabel: "복사 완료")
        XCTAssertEqual(try title(view), "코드 복사")

        view.jdSendActions(for: .touchUpInside)

        XCTAssertEqual(try title(view), "복사 완료")
    }
}

// MARK: - BackTop

@MainActor
final class JdBackTopButtonViewTests: XCTestCase {

    // 라벨 기본값은 Core 상수 — 렌더가 문자열을 새로 만들지 않는다
    func test_default_label_comes_from_core() {
        let view = JdBackTopButtonView()
        XCTAssertEqual(view.accessibilityLabel, JdBackTop.defaultLabel)
        XCTAssertTrue(view.accessibilityTraits.contains(.button))
    }

    func test_tap_fires_onTap() {
        let view = JdBackTopButtonView(label: "맨 위로")
        var fired = 0
        view.onTap = { fired += 1 }

        view.jdSendActions(for: .touchUpInside)

        XCTAssertEqual(fired, 1)
        XCTAssertEqual(view.accessibilityLabel, "맨 위로")
    }

    // 40pt 원형 — 치수는 아이콘 버튼 lg 스펙에서만 온다
    func test_size_follows_icon_button_lg_spec() {
        let view = JdBackTopButtonView()
        let expected = JdIconButtonSpec.resolve(variant: .outline, size: .lg).side
        XCTAssertGreaterThanOrEqual(view.intrinsicContentSize.height, expected)
    }
}

// MARK: - FileUploadZone

@MainActor
final class JdFileUploadZoneViewTests: XCTestCase {

    func test_tap_fires_onTap_and_description_is_the_label() {
        let view = JdFileUploadZoneView()
        var fired = 0
        view.onTap = { fired += 1 }

        XCTAssertEqual(view.accessibilityLabel, "파일을 선택하세요")
        XCTAssertTrue(view.accessibilityTraits.contains(.button))

        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(fired, 1)

        view.zoneDescription = "이미지를 올려주세요"
        XCTAssertEqual(view.accessibilityLabel, "이미지를 올려주세요")
    }

    // 선택된 파일은 행으로 그려지고 접근성 값으로 합류한다 (요소를 쪼개지 않는다)
    func test_file_names_render_rows_and_join_accessibility_value() {
        let view = JdFileUploadZoneView()
        XCTAssertNil(view.accessibilityValue)

        view.fileNames = ["a.png", "b.pdf"]

        let labels = jdActionDescendants(view, of: UILabel.self).compactMap(\.text)
        XCTAssertTrue(labels.contains("a.png"))
        XCTAssertTrue(labels.contains("b.pdf"))
        XCTAssertEqual(view.accessibilityValue, "a.png, b.pdf")

        view.fileNames = []
        XCTAssertNil(view.accessibilityValue)
    }
}
