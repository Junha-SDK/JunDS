import JunDSCore
import XCTest

// Core 순수 함수는 전수 검증한다 (04 §4.2 규칙 1·3, DESIGN-2 §C).
final class JdAvatarSpecInitialsTests: XCTestCase {

    // 웹 규칙: 공백 2어절 이상이면 각 어절 첫 글자, 아니면 앞 2글자 — 대문자화
    func test_two_words_take_first_letter_of_each() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "Ada Lovelace"), "AL")
        XCTAssertEqual(JdAvatarSpec.initials(from: "ada lovelace"), "AL")
    }

    // 웹 원본: parts[0][0] + parts[1][0] — 3어절이면 앞 두 어절이지 첫+끝이 아니다
    func test_three_words_use_only_first_two() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "Ada King Lovelace"), "AK")
    }

    func test_single_word_takes_first_two_letters() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "Ada"), "AD")
        XCTAssertEqual(JdAvatarSpec.initials(from: "x"), "X")
    }

    // 한글은 대문자 개념이 없어 그대로 유지된다(웹 toUpperCase와 동일 결과)
    func test_hangul_is_preserved() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "홍 길동"), "홍길")
        XCTAssertEqual(JdAvatarSpec.initials(from: "홍길동"), "홍길")
    }

    // 앞뒤·중간 공백은 어절 분리로 흡수된다
    func test_surrounding_whitespace_is_absorbed() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "  Ada   Lovelace  "), "AL")
        XCTAssertEqual(JdAvatarSpec.initials(from: "Ada\tLovelace"), "AL")
    }

    func test_empty_name_yields_empty_initials() {
        XCTAssertEqual(JdAvatarSpec.initials(from: ""), "")
    }

    // ⚠️ 공백만 있는 이름은 어절이 0이라 prefix(2) 경로로 떨어져 **공백 2칸**이 나온다.
    // Core 순수 함수의 실제 계약이므로 그대로 고정하고, 렌더 계층이 trim 후 "?" 폴백으로 보낸다
    // (JdAvatar / JdAvatarView의 initials 프로퍼티).
    // 웹은 split 전에 trim한다 — 공백만 있는 이름은 빈 이니셜이 되고 렌더가 "?"로 폴백한다
    func test_whitespace_only_name_yields_empty_initials() {
        XCTAssertEqual(JdAvatarSpec.initials(from: "   "), "")
        XCTAssertEqual(JdAvatarSpec.initials(from: "\n\t "), "")
        // 앞뒤 공백은 이니셜 계산에 영향을 주지 않는다
        XCTAssertEqual(JdAvatarSpec.initials(from: "  Ada Lovelace  "), "AL")
    }
}

final class JdAvatarSpecColorTests: XCTestCase {

    // 결정적 팔레트 — 같은 이름이면 항상 같은 색 (웹 해시 팔레트 동형, 랜덤 금지)
    func test_fallbackColor_is_stable_across_calls() {
        let first = JdAvatarSpec.fallbackColor(for: "Ada Lovelace")
        for _ in 0..<16 {
            let again = JdAvatarSpec.fallbackColor(for: "Ada Lovelace")
            XCTAssertEqual(first.light, again.light)
            XCTAssertEqual(first.dark, again.dark)
        }
    }

    func test_fallbackColor_is_always_from_palette() {
        for name in ["Ada Lovelace", "홍길동", "z", "", "   ", "Grace Hopper", "李"] {
            let color = JdAvatarSpec.fallbackColor(for: name)
            XCTAssertTrue(
                JdAvatarSpec.fallbackPalette.contains {
                    $0.light == color.light && $0.dark == color.dark
                },
                "팔레트 밖 색이 나왔다: \(name)")
        }
    }

    func test_empty_name_uses_first_palette_entry() {
        let color = JdAvatarSpec.fallbackColor(for: "")
        XCTAssertEqual(color.light, JdAvatarSpec.fallbackPalette[0].light)
    }

    // 팔레트가 1색으로 붕괴하지 않는지 — 서로 다른 이름이 최소 2색 이상을 만든다
    func test_palette_distributes_across_names() {
        let names = ["Ada", "Grace", "Alan", "Barbara", "Katherine", "Margaret", "홍길동", "김철수"]
        let distinct = Set(names.map { JdAvatarSpec.fallbackColor(for: $0).light })
        XCTAssertGreaterThan(distinct.count, 1)
    }

    func test_statusColor_maps_every_case() {
        XCTAssertEqual(JdAvatarSpec.statusColor(.online).light, JdToken.Color.success.light)
        XCTAssertEqual(JdAvatarSpec.statusColor(.away).light, JdToken.Color.warning.light)
        XCTAssertEqual(JdAvatarSpec.statusColor(.busy).light, JdToken.Color.danger.light)
        // offline은 토큰 부재분(v2 회색 리터럴 승계) — 다른 3종과 겹치지 않는다
        let offline = JdAvatarSpec.statusColor(.offline).light
        XCTAssertNotEqual(offline, JdToken.Color.success.light)
        XCTAssertNotEqual(offline, JdToken.Color.warning.light)
        XCTAssertNotEqual(offline, JdToken.Color.danger.light)
    }
}

final class JdAvatarSpecSizeTests: XCTestCase {

    // 사이즈 5종 단조 증가 — 웹 xs 24 / sm 32 / md 36 / lg 44 / xl 56
    func test_size_ramp_is_monotonic() {
        let ramp = JdAvatarSize.allCases.map { JdAvatarSpec.resolve(size: $0) }
        XCTAssertEqual(ramp.count, 5)
        for (previous, next) in zip(ramp, ramp.dropFirst()) {
            XCTAssertLessThan(previous.side, next.side)
            XCTAssertLessThan(previous.initialsFontSize, next.initialsFontSize)
            XCTAssertLessThan(previous.statusDotSize, next.statusDotSize)
            // 링 두께만 1/1.5/1.5/2/2로 평탄 구간이 있다
            XCTAssertLessThanOrEqual(previous.statusRingWidth, next.statusRingWidth)
        }
    }

    func test_size_ramp_matches_web_literals() {
        XCTAssertEqual(JdAvatarSpec.resolve(size: .xs).side, 24)
        XCTAssertEqual(JdAvatarSpec.resolve(size: .sm).side, 32)
        XCTAssertEqual(JdAvatarSpec.resolve(size: .md).side, 36)
        XCTAssertEqual(JdAvatarSpec.resolve(size: .lg).side, 44)
        XCTAssertEqual(JdAvatarSpec.resolve(size: .xl).side, 56)
    }

    // 도트는 항상 원 안에 들어간다(우하단 배치가 성립하는 최소 조건)
    func test_status_dot_fits_inside_circle() {
        for size in JdAvatarSize.allCases {
            let spec = JdAvatarSpec.resolve(size: size)
            XCTAssertLessThan(spec.statusDotSize, spec.side)
            XCTAssertLessThan(spec.statusRingWidth * 2, spec.statusDotSize)
        }
    }
}

final class JdKbdSpecTests: XCTestCase {

    // 웹은 공백을 전부 제거한다("⌘ K" → "⌘K")
    func test_normalize_removes_spaces() {
        XCTAssertEqual(JdKbdSpec.normalize(keys: "⌘ K"), "⌘K")
        XCTAssertEqual(JdKbdSpec.normalize(keys: "Ctrl + Shift + P"), "Ctrl+Shift+P")
    }

    func test_normalize_removes_tabs_and_newlines() {
        XCTAssertEqual(JdKbdSpec.normalize(keys: "⌘\tK"), "⌘K")
        XCTAssertEqual(JdKbdSpec.normalize(keys: "⌘\nK"), "⌘K")
        XCTAssertEqual(JdKbdSpec.normalize(keys: "  ⌘  K  "), "⌘K")
    }

    func test_normalize_is_identity_when_already_tight() {
        XCTAssertEqual(JdKbdSpec.normalize(keys: "⌘K"), "⌘K")
        XCTAssertEqual(JdKbdSpec.normalize(keys: ""), "")
        XCTAssertEqual(JdKbdSpec.normalize(keys: "   "), "")
    }

    func test_spec_values_match_web() {
        let spec = JdKbdSpec.resolve()
        XCTAssertEqual(spec.hPadding, JdToken.Space.s1_5)  // 6
        XCTAssertEqual(spec.vPadding, JdToken.Space.s0_5)  // 2
        XCTAssertEqual(spec.fontSize, 11)
        XCTAssertEqual(spec.radius, JdToken.Radius.sm)  // 4
    }
}

final class JdKeyCapSpecTests: XCTestCase {

    // sm 20 / md 24 / lg 32 — 높이·최소폭·패딩·글자 모두 단조 증가
    func test_size_ramp_is_monotonic() {
        let ramp = JdDisplaySize.allCases.map { JdKeyCapSpec.resolve(variant: .default, size: $0) }
        for (previous, next) in zip(ramp, ramp.dropFirst()) {
            XCTAssertLessThan(previous.height, next.height)
            XCTAssertLessThan(previous.minWidth, next.minWidth)
            XCTAssertLessThan(previous.hPadding, next.hPadding)
            XCTAssertLessThan(previous.fontSize, next.fontSize)
        }
    }

    // 입체 그림자는 default variant 전용(웹 primary/muted는 box-shadow:none)
    func test_only_default_variant_has_key_shadow() {
        XCTAssertTrue(JdKeyCapSpec.resolve(variant: .default, size: .md).hasKeyShadow)
        XCTAssertFalse(JdKeyCapSpec.resolve(variant: .primary, size: .md).hasKeyShadow)
        XCTAssertFalse(JdKeyCapSpec.resolve(variant: .muted, size: .md).hasKeyShadow)
    }

    func test_pressed_offset_matches_web_translate() {
        XCTAssertEqual(JdKeyCapSpec.pressedOffset, 1)
    }
}

final class JdSpinnerSpecTests: XCTestCase {

    func test_size_ramp_is_monotonic() {
        let ramp = JdDisplaySize.allCases.map { JdSpinnerSpec.resolve(size: $0) }
        for (previous, next) in zip(ramp, ramp.dropFirst()) {
            XCTAssertLessThan(previous.side, next.side)
            XCTAssertLessThanOrEqual(previous.lineWidth, next.lineWidth)
        }
    }

    // 선 두께가 반지름을 넘으면 링이 원으로 뭉개진다 — 자체 드로잉의 최소 조건
    func test_line_width_fits_inside_radius() {
        for size in JdDisplaySize.allCases {
            let spec = JdSpinnerSpec.resolve(size: size)
            XCTAssertLessThan(spec.lineWidth, spec.side / 2)
        }
    }

    func test_default_label_matches_web_aria_label() {
        XCTAssertEqual(JdSpinnerSpec.defaultLabel, "로딩 중")
    }
}
