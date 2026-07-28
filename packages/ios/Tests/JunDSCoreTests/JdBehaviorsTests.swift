import CoreGraphics
import JunDSCore
import XCTest

// JdBehaviors.swift의 순수 계산·판정 hooks 전수 검증(04 §4.2 규칙 1·3 — 렌더 계층은
// 이 판정을 다시 구현하지 않는다). 타이밍(JdDebouncer/JdThrottler)은 별도 파일에서
// @MainActor async로 검증한다.

// MARK: - JdCountUp (useCountUp — easeOutExpo 이징)

final class JdCountUpTests: XCTestCase {

    // 경계 3점: 0 → 0, 1 → 정확히 1, 0.5 → 1 - 2^-5
    func test_easeOutExpo_boundaries() {
        XCTAssertEqual(JdCountUp.easeOutExpo(0), 0, accuracy: 1e-12)
        XCTAssertEqual(JdCountUp.easeOutExpo(1), 1, accuracy: 1e-12)
        XCTAssertEqual(JdCountUp.easeOutExpo(0.5), 1 - pow(2, -5), accuracy: 1e-12)
        // 웹 상수 확인: 1 - 2^-5 = 0.96875
        XCTAssertEqual(JdCountUp.easeOutExpo(0.5), 0.96875, accuracy: 1e-12)
    }

    // t=1은 분기로 정확히 1을 돌려준다(pow(2,-10)≈0.00098로 근사되지 않음)
    func test_easeOutExpo_exact_one_at_completion() {
        XCTAssertEqual(JdCountUp.easeOutExpo(1), 1)  // accuracy 없이 정확 일치
    }

    // 범위 밖 입력은 clamp: t<0 → 0, t>1 → 1
    func test_easeOutExpo_clamps_out_of_range() {
        XCTAssertEqual(JdCountUp.easeOutExpo(-0.5), 0, accuracy: 1e-12)
        XCTAssertEqual(JdCountUp.easeOutExpo(-100), 0, accuracy: 1e-12)
        XCTAssertEqual(JdCountUp.easeOutExpo(1.5), 1, accuracy: 1e-12)
        XCTAssertEqual(JdCountUp.easeOutExpo(100), 1, accuracy: 1e-12)
    }

    // [0,1] 전 구간 단조 증가(101 표본)
    func test_easeOutExpo_is_strictly_monotonic() {
        var previous = -Double.greatestFiniteMagnitude
        for step in 0...100 {
            let t = Double(step) / 100
            let value = JdCountUp.easeOutExpo(t)
            XCTAssertGreaterThan(value, previous, "t=\(t)에서 이징이 단조 증가하지 않음")
            previous = value
        }
    }

    // value(from:to:progress:) — 경계와 중간, 역방향(감소)까지
    func test_value_interpolates_with_easing() {
        XCTAssertEqual(JdCountUp.value(from: 0, to: 100, progress: 0), 0, accuracy: 1e-9)
        XCTAssertEqual(JdCountUp.value(from: 0, to: 100, progress: 1), 100, accuracy: 1e-9)
        // 0.5 지점: 0 + 100 * 0.96875
        XCTAssertEqual(JdCountUp.value(from: 0, to: 100, progress: 0.5), 96.875, accuracy: 1e-9)
        // 오프셋이 있는 구간
        XCTAssertEqual(JdCountUp.value(from: 10, to: 20, progress: 0.5), 19.6875, accuracy: 1e-9)
        // 감소 구간(from > to)
        XCTAssertEqual(JdCountUp.value(from: 100, to: 0, progress: 0.5), 3.125, accuracy: 1e-9)
        // from == to는 진행률과 무관하게 상수
        XCTAssertEqual(JdCountUp.value(from: 42, to: 42, progress: 0.3), 42, accuracy: 1e-9)
    }
}

// MARK: - JdHotkey (useHotkeys — normalizeChord)

final class JdHotkeyTests: XCTestCase {

    // 계약 핵심: "Cmd+Shift+K" 와 "shift+meta+k" 가 같은 정규 문자열
    func test_case_and_order_independence() {
        XCTAssertEqual(JdHotkey.normalize("Cmd+Shift+K"), "shift+meta+k")
        XCTAssertEqual(JdHotkey.normalize("shift+meta+k"), "shift+meta+k")
        XCTAssertEqual(JdHotkey.normalize("Cmd+Shift+K"), JdHotkey.normalize("shift+meta+k"))
    }

    // 수식키 순서는 입력과 무관하게 ctrl→alt→shift→meta 고정
    func test_modifier_ordering_is_fixed() {
        let expected = "ctrl+alt+shift+meta+k"
        XCTAssertEqual(JdHotkey.normalize("meta+shift+alt+ctrl+k"), expected)
        XCTAssertEqual(JdHotkey.normalize("ctrl+alt+shift+meta+k"), expected)
        XCTAssertEqual(JdHotkey.normalize("shift+ctrl+meta+alt+k"), expected)
    }

    // 수식키 별칭: cmd/command/meta/mod/super/win → meta
    func test_meta_aliases() {
        for alias in ["cmd", "command", "meta", "mod", "super", "win"] {
            XCTAssertEqual(JdHotkey.normalize("\(alias)+k"), "meta+k", "\(alias) → meta")
        }
    }

    // ctrl/control, alt/option/opt 별칭
    func test_ctrl_and_alt_aliases() {
        XCTAssertEqual(JdHotkey.normalize("control+k"), "ctrl+k")
        XCTAssertEqual(JdHotkey.normalize("ctrl+k"), "ctrl+k")
        for alias in ["alt", "option", "opt"] {
            XCTAssertEqual(JdHotkey.normalize("\(alias)+k"), "alt+k", "\(alias) → alt")
        }
    }

    // 특수 키 별칭: esc/escape, space/spacebar, return/enter, del/delete
    func test_special_key_aliases() {
        XCTAssertEqual(JdHotkey.normalize("esc"), "escape")
        XCTAssertEqual(JdHotkey.normalize("escape"), "escape")
        XCTAssertEqual(JdHotkey.normalize("space"), "space")
        XCTAssertEqual(JdHotkey.normalize("spacebar"), "space")
        XCTAssertEqual(JdHotkey.normalize("return"), "enter")
        XCTAssertEqual(JdHotkey.normalize("enter"), "enter")
        XCTAssertEqual(JdHotkey.normalize("del"), "delete")
        XCTAssertEqual(JdHotkey.normalize("delete"), "delete")
    }

    // 수식키 + 특수 키 결합
    func test_modifier_with_special_key() {
        XCTAssertEqual(JdHotkey.normalize("Cmd+Escape"), "meta+escape")
        XCTAssertEqual(JdHotkey.normalize("Ctrl+Shift+Enter"), "ctrl+shift+enter")
    }

    // 구분자는 + 와 - 둘 다, 공백/대소문자 관대
    func test_separators_and_whitespace_tolerance() {
        XCTAssertEqual(JdHotkey.normalize("cmd-k"), "meta+k")
        XCTAssertEqual(JdHotkey.normalize("  CMD  +  K  "), "meta+k")
        XCTAssertEqual(JdHotkey.normalize("Cmd + Shift + K"), "shift+meta+k")
    }

    // 중복 수식키는 집합이라 1회로 접힌다
    func test_duplicate_modifiers_collapse() {
        XCTAssertEqual(JdHotkey.normalize("shift+shift+k"), "shift+k")
        XCTAssertEqual(JdHotkey.normalize("cmd+meta+k"), "meta+k")
    }
}

// MARK: - JdForm (useForm — 규칙 검증)

final class JdFormTests: XCTestCase {

    // required: 빈 문자열/공백만 → 위반, 내용 있으면 통과
    func test_required_empty_and_whitespace() {
        XCTAssertEqual(JdForm.firstViolation("", rules: [.required]), .required)
        XCTAssertEqual(JdForm.firstViolation("   ", rules: [.required]), .required)
        XCTAssertEqual(JdForm.firstViolation("\n\t ", rules: [.required]), .required)
        XCTAssertNil(JdForm.firstViolation("a", rules: [.required]))
        XCTAssertNil(JdForm.firstViolation("  a  ", rules: [.required]))
    }

    // minLength 경계: count < n 만 위반(원시 count 기준, trim 아님)
    func test_minLength_boundary() {
        XCTAssertEqual(JdForm.firstViolation("ab", rules: [.minLength(3)]), .minLength(3))
        XCTAssertNil(JdForm.firstViolation("abc", rules: [.minLength(3)]))  // 정확히 n
        XCTAssertNil(JdForm.firstViolation("abcd", rules: [.minLength(3)]))
        XCTAssertNil(JdForm.firstViolation("", rules: [.minLength(0)]))  // 0은 항상 통과
    }

    // maxLength 경계: count > n 만 위반
    func test_maxLength_boundary() {
        XCTAssertNil(JdForm.firstViolation("abc", rules: [.maxLength(3)]))  // 정확히 n
        XCTAssertNil(JdForm.firstViolation("ab", rules: [.maxLength(3)]))
        XCTAssertEqual(JdForm.firstViolation("abcd", rules: [.maxLength(3)]), .maxLength(3))
        XCTAssertNil(JdForm.firstViolation("", rules: [.maxLength(0)]))  // 빈 값은 0 이하
    }

    // email: 유효/무효, 빈 값은 email 단독으로는 통과(웹 동형 — required가 빈 값을 잡음)
    func test_email_validity() {
        XCTAssertNil(JdForm.firstViolation("a@b.com", rules: [.email]))
        XCTAssertNil(JdForm.firstViolation("user.name+tag@sub.example.co", rules: [.email]))
        XCTAssertEqual(JdForm.firstViolation("invalid", rules: [.email]), .email)
        XCTAssertEqual(JdForm.firstViolation("a@b", rules: [.email]), .email)  // TLD 없음
        XCTAssertEqual(JdForm.firstViolation("a@b.c", rules: [.email]), .email)  // TLD 1자
        XCTAssertNil(JdForm.firstViolation("", rules: [.email]))  // 빈 값 통과
    }

    // email + required 조합: 빈 값이면 required가(순서상 먼저면) 먼저 잡힌다
    func test_email_with_required_combo() {
        // required가 앞: 빈 값 → required
        XCTAssertEqual(JdForm.firstViolation("", rules: [.required, .email]), .required)
        // email이 앞이어도 빈 값은 email을 통과하고 required가 잡는다
        XCTAssertEqual(JdForm.firstViolation("", rules: [.email, .required]), .required)
        // 내용 있고 형식 틀리면 email
        XCTAssertEqual(JdForm.firstViolation("nope", rules: [.required, .email]), .email)
        // 둘 다 만족
        XCTAssertNil(JdForm.firstViolation("a@b.com", rules: [.required, .email]))
    }

    // pattern: 정규식 부분 아닌 firstMatch 판정. 앵커 있는 패턴으로 전수 일치 검증
    func test_pattern_rule() {
        let digitsOnly = JdFieldRule.pattern("^[0-9]+$")
        XCTAssertNil(JdForm.firstViolation("123", rules: [digitsOnly]))
        XCTAssertEqual(JdForm.firstViolation("12a", rules: [digitsOnly]), digitsOnly)
        XCTAssertEqual(JdForm.firstViolation("", rules: [digitsOnly]), digitsOnly)  // + 는 1자 이상
    }

    // 잘못된 정규식은 통과로 처리(크래시 없음 — guard의 방어)
    func test_invalid_pattern_does_not_crash_and_passes() {
        XCTAssertNil(JdForm.firstViolation("anything", rules: [.pattern("[")]))
    }

    // 첫 위반에서 멈춤 — 뒤 규칙도 위반이지만 앞 규칙이 반환된다
    func test_stops_at_first_violation() {
        // "ab": email 위반 & minLength(5) 위반 → 앞에 놓인 email이 반환
        XCTAssertEqual(JdForm.firstViolation("ab", rules: [.email, .minLength(5)]), .email)
        // 순서를 바꾸면 minLength가 먼저
        XCTAssertEqual(JdForm.firstViolation("ab", rules: [.minLength(5), .email]), .minLength(5))
        // required가 맨 앞이면 빈 값은 항상 required
        XCTAssertEqual(
            JdForm.firstViolation("", rules: [.required, .minLength(5), .email]), .required)
    }

    // custom은 Core에선 항상 통과(소비자 판정 위임)
    func test_custom_rule_always_passes_in_core() {
        XCTAssertNil(JdForm.firstViolation("anything", rules: [.custom(id: "x")]))
        XCTAssertNil(JdForm.firstViolation("", rules: [.custom(id: "x")]))
        // custom과 실제 규칙 혼합 — custom은 건너뛰고 나머지만 판정
        XCTAssertNil(JdForm.firstViolation("ok", rules: [.custom(id: "x"), .required]))
        XCTAssertEqual(JdForm.firstViolation("", rules: [.custom(id: "x"), .required]), .required)
    }

    // isValid = firstViolation == nil 편의
    func test_isValid_matches_firstViolation() {
        XCTAssertTrue(JdForm.isValid("a@b.com", rules: [.required, .email]))
        XCTAssertFalse(JdForm.isValid("", rules: [.required]))
        XCTAssertFalse(JdForm.isValid("ab", rules: [.minLength(3)]))
        XCTAssertTrue(JdForm.isValid("anything", rules: []))  // 규칙 없음 → 유효
    }

    // message(label:) 문구 — 렌더 계층이 그대로 노출
    func test_messages() {
        XCTAssertEqual(JdFieldRule.required.message(label: "이름"), "이름은(는) 필수입니다")
        XCTAssertEqual(JdFieldRule.minLength(3).message(label: "비밀번호"), "비밀번호은(는) 3자 이상이어야 합니다")
        XCTAssertEqual(JdFieldRule.maxLength(10).message(label: "닉네임"), "닉네임은(는) 10자 이하여야 합니다")
        XCTAssertEqual(JdFieldRule.pattern("x").message(label: "코드"), "코드 형식이 올바르지 않습니다")
        XCTAssertEqual(JdFieldRule.email.message(label: "메일"), "올바른 이메일 주소가 아닙니다")
        XCTAssertEqual(JdFieldRule.custom(id: "x").message(label: "값"), "값이(가) 올바르지 않습니다")
    }
}

// MARK: - JdScrollProgress (useReadingProgress · useScrollSpy)

final class JdScrollProgressTests: XCTestCase {

    // reading: 정상 구간에서 offset/scrollable 을 0…1로 clamp
    func test_reading_normal_range() {
        // content 2000, viewport 1000 → scrollable 1000
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 0, contentHeight: 2000, viewportHeight: 1000), 0,
            accuracy: 1e-12)
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 500, contentHeight: 2000, viewportHeight: 1000), 0.5,
            accuracy: 1e-12)
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 1000, contentHeight: 2000, viewportHeight: 1000), 1,
            accuracy: 1e-12)
    }

    // 오버스크롤 clamp: 음수 offset → 0, 초과 → 1
    func test_reading_clamps_overscroll() {
        XCTAssertEqual(
            JdScrollProgress.reading(offset: -200, contentHeight: 2000, viewportHeight: 1000), 0,
            accuracy: 1e-12)
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 5000, contentHeight: 2000, viewportHeight: 1000), 1,
            accuracy: 1e-12)
    }

    // scrollable <= 0 (내용이 뷰포트에 다 들어감): 내용 있으면 1, 없으면 0
    func test_reading_non_scrollable() {
        // content == viewport → scrollable 0, 내용 있음 → 1
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 0, contentHeight: 1000, viewportHeight: 1000), 1,
            accuracy: 1e-12)
        // content < viewport → 1
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 0, contentHeight: 400, viewportHeight: 1000), 1,
            accuracy: 1e-12)
        // content 0 → 0
        XCTAssertEqual(
            JdScrollProgress.reading(offset: 0, contentHeight: 0, viewportHeight: 1000), 0,
            accuracy: 1e-12)
    }

    // activeSection: 빈 배열 → nil
    func test_activeSection_empty_is_nil() {
        XCTAssertNil(JdScrollProgress.activeSection(offset: 100, sectionOffsets: []))
    }

    // 오프셋별 활성 섹션 — 현재 위치를 지난 마지막 섹션
    func test_activeSection_by_offset() {
        let sections: [CGFloat] = [0, 100, 200, 300]
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 0, sectionOffsets: sections), 0)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 50, sectionOffsets: sections), 0)
        // 경계 포함(<=)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 100, sectionOffsets: sections), 1)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 150, sectionOffsets: sections), 1)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 250, sectionOffsets: sections), 2)
        // 마지막 경계
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 300, sectionOffsets: sections), 3)
        // 끝 지남
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 9999, sectionOffsets: sections), 3)
    }

    // 첫 섹션에도 못 미치면 첫 섹션(0)으로 clamp
    func test_activeSection_before_first_clamps_to_zero() {
        let sections: [CGFloat] = [50, 150, 250]
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 0, sectionOffsets: sections), 0)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 49, sectionOffsets: sections), 0)
        // 첫 경계
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 50, sectionOffsets: sections), 0)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 51, sectionOffsets: sections), 0)
    }

    // topInset은 커서를 앞당긴다(스티키 헤더 높이만큼 활성 조기 전환)
    func test_activeSection_topInset_advances_cursor() {
        let sections: [CGFloat] = [0, 100, 200]
        // offset 80 + inset 20 = cursor 100 → index 1
        XCTAssertEqual(
            JdScrollProgress.activeSection(offset: 80, sectionOffsets: sections, topInset: 20), 1)
        // 같은 offset이라도 inset 0이면 아직 index 0
        XCTAssertEqual(
            JdScrollProgress.activeSection(offset: 80, sectionOffsets: sections, topInset: 0), 0)
        // inset이 커서를 200까지 밀면 index 2
        XCTAssertEqual(
            JdScrollProgress.activeSection(offset: 120, sectionOffsets: sections, topInset: 80), 2)
    }

    // 단일 섹션은 항상 0
    func test_activeSection_single_section() {
        XCTAssertEqual(JdScrollProgress.activeSection(offset: -100, sectionOffsets: [0]), 0)
        XCTAssertEqual(JdScrollProgress.activeSection(offset: 5000, sectionOffsets: [0]), 0)
    }
}

// MARK: - JdPreload (useImagePreload — 동시성 배치)

final class JdPreloadTests: XCTestCase {

    private let six = ["a", "b", "c", "d", "e", "f"]

    // concurrency 1 → 낱개 배치
    func test_concurrency_one() {
        XCTAssertEqual(
            JdPreload.batches(six, concurrency: 1),
            [["a"], ["b"], ["c"], ["d"], ["e"], ["f"]])
    }

    // concurrency 3 → 균등 분할(6/3 나눗셈 경계)
    func test_concurrency_three_even_division() {
        XCTAssertEqual(
            JdPreload.batches(six, concurrency: 3),
            [["a", "b", "c"], ["d", "e", "f"]])
    }

    // 나눗셈이 떨어지지 않으면 마지막 배치가 짧다(7/3)
    func test_concurrency_three_uneven_remainder() {
        XCTAssertEqual(
            JdPreload.batches(six + ["g"], concurrency: 3),
            [["a", "b", "c"], ["d", "e", "f"], ["g"]])
    }

    // concurrency가 원소 수를 초과 → 단일 배치
    func test_concurrency_exceeds_count() {
        XCTAssertEqual(JdPreload.batches(six, concurrency: 100), [six])
    }

    // 빈 배열 → 빈 결과
    func test_empty_urls() {
        XCTAssertEqual(JdPreload.batches([], concurrency: 3), [])
    }

    // concurrency 0/음수는 1로 방어(무한 루프·크래시 없음)
    func test_non_positive_concurrency_defaults_to_one() {
        XCTAssertEqual(JdPreload.batches(["a", "b"], concurrency: 0), [["a"], ["b"]])
        XCTAssertEqual(JdPreload.batches(["a", "b"], concurrency: -5), [["a"], ["b"]])
    }

    func test_default_concurrency_is_three() {
        XCTAssertEqual(JdPreload.defaultConcurrency, 3)
    }
}

// MARK: - JdInfiniteFeedGate (useInfiniteFeed — 중복 로드 가드)

final class JdInfiniteFeedGateTests: XCTestCase {

    func test_initial_state() {
        let gate = JdInfiniteFeedGate()
        XCTAssertFalse(gate.isLoading)
        XCTAssertFalse(gate.isExhausted)
    }

    // shouldLoad는 첫 호출만 true, 로딩 중 재호출은 차단(중복 가드)
    func test_shouldLoad_guards_duplicate_while_loading() {
        var gate = JdInfiniteFeedGate()
        XCTAssertTrue(gate.shouldLoad())
        XCTAssertTrue(gate.isLoading)
        XCTAssertFalse(gate.shouldLoad(), "로딩 중 재호출은 차단")
        XCTAssertFalse(gate.shouldLoad())
    }

    // finish(false) 후 다시 로드 가능
    func test_finish_not_reached_allows_reload() {
        var gate = JdInfiniteFeedGate()
        _ = gate.shouldLoad()
        gate.finish(reachedEnd: false)
        XCTAssertFalse(gate.isLoading)
        XCTAssertFalse(gate.isExhausted)
        XCTAssertTrue(gate.shouldLoad(), "끝나지 않았으면 다시 로드")
    }

    // finish(true) 후 소진 — 이후 재호출 영구 차단
    func test_finish_reachedEnd_blocks_forever() {
        var gate = JdInfiniteFeedGate()
        _ = gate.shouldLoad()
        gate.finish(reachedEnd: true)
        XCTAssertTrue(gate.isExhausted)
        XCTAssertFalse(gate.shouldLoad(), "소진 후 차단")
        // 이후 finish(false)를 불러도 소진 상태는 유지
        gate.finish(reachedEnd: false)
        XCTAssertTrue(gate.isExhausted)
        XCTAssertFalse(gate.shouldLoad())
    }

    // 정상 페이징 사이클: load→finish→load→finish(end)
    func test_full_paging_cycle() {
        var gate = JdInfiniteFeedGate()
        XCTAssertTrue(gate.shouldLoad())
        gate.finish(reachedEnd: false)
        XCTAssertTrue(gate.shouldLoad())
        gate.finish(reachedEnd: false)
        XCTAssertTrue(gate.shouldLoad())
        gate.finish(reachedEnd: true)
        XCTAssertFalse(gate.shouldLoad())
    }
}

// MARK: - JdBreakpointValue (useBreakpointValue — 폭별 값 해석)

final class JdBreakpointValueTests: XCTestCase {

    // 오버라이드 없으면 항상 base
    func test_base_only() {
        XCTAssertEqual(JdBreakpointValue.resolve(width: 0, base: "base", overrides: []), "base")
        XCTAssertEqual(JdBreakpointValue.resolve(width: 9999, base: "base", overrides: []), "base")
    }

    // 폭이 도달한 것 중 가장 큰 브레이크포인트를 선택(모바일 우선)
    func test_picks_largest_reached_breakpoint() {
        let overrides: [(JdBreakpoint, String)] = [(.md, "medium"), (.lg, "large")]
        // md(768) 미만 → base
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 500, base: "base", overrides: overrides), "base")
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 767, base: "base", overrides: overrides), "base")
        // md 경계(768) 포함(>=)
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 768, base: "base", overrides: overrides), "medium")
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 1000, base: "base", overrides: overrides), "medium")
        // lg 경계(1024) → large
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 1024, base: "base", overrides: overrides), "large")
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 2000, base: "base", overrides: overrides), "large")
    }

    // 입력 오버라이드 순서가 뒤섞여도 내부 정렬로 결과 동일
    func test_override_input_order_does_not_matter() {
        let scrambled: [(JdBreakpoint, String)] = [(.lg, "L"), (.sm, "S"), (.md, "M")]
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 639, base: "base", overrides: scrambled), "base")
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 640, base: "base", overrides: scrambled), "S")  // sm
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 800, base: "base", overrides: scrambled), "M")  // md
        XCTAssertEqual(
            JdBreakpointValue.resolve(width: 1024, base: "base", overrides: scrambled), "L")  // lg
    }

    // Int 등 다른 타입에도 제네릭하게 동작
    func test_generic_over_value_type() {
        let overrides: [(JdBreakpoint, Int)] = [(.md, 2), (.xl, 4)]
        XCTAssertEqual(JdBreakpointValue.resolve(width: 320, base: 1, overrides: overrides), 1)
        XCTAssertEqual(JdBreakpointValue.resolve(width: 768, base: 1, overrides: overrides), 2)
        XCTAssertEqual(JdBreakpointValue.resolve(width: 1280, base: 1, overrides: overrides), 4)
    }
}
