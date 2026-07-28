import JunDSCore
import XCTest

// 순수 함수는 전수 검증 (04 §4.2 규칙 1·3 — 판정은 Core, 렌더는 그리기만).
final class JdBadgeCountTextTests: XCTestCase {

    func test_below_max_prints_raw_count() {
        XCTAssertEqual(JdBadgeSpec.countText(1, maxCount: 99), "1")
        XCTAssertEqual(JdBadgeSpec.countText(98, maxCount: 99), "98")
    }

    // 경계: maxCount와 같으면 아직 초과가 아니다 (웹 count > maxCount 조건 동형)
    func test_equal_to_max_is_not_overflow() {
        XCTAssertEqual(JdBadgeSpec.countText(99, maxCount: 99), "99")
        XCTAssertEqual(JdBadgeSpec.countText(9, maxCount: 9), "9")
    }

    // 경계: 한 칸만 넘어도 "N+"
    func test_above_max_prints_plus_form() {
        XCTAssertEqual(JdBadgeSpec.countText(100, maxCount: 99), "99+")
        XCTAssertEqual(JdBadgeSpec.countText(10, maxCount: 9), "9+")
        XCTAssertEqual(JdBadgeSpec.countText(10_000, maxCount: 99), "99+")
    }

    // 경계: 0은 숨기지 않는다 — 웹도 "0"을 그대로 그린다(숨김은 소비자 몫)
    func test_zero_is_rendered_as_is() {
        XCTAssertEqual(JdBadgeSpec.countText(0, maxCount: 99), "0")
        XCTAssertEqual(JdBadgeSpec.countText(0, maxCount: 0), "0")
    }

    // 웹 카운트 모드 기하 — 원형 18px·10pt 고정
    func test_count_geometry_constants_match_web() {
        XCTAssertEqual(JdBadgeSpec.countDiameter, 18)
        XCTAssertEqual(JdBadgeSpec.countFontSize, 10)
    }
}

final class JdBadgeSpecResolveTests: XCTestCase {

    // 전 variant × size 조합이 유효한 기하를 낸다 (렌더 계층이 0/음수를 만날 일이 없다)
    func test_all_variant_size_combinations_resolve() {
        for variant in JdBadgeVariant.allCases {
            for size in JdDisplaySize.allCases {
                let spec = JdBadgeSpec.resolve(variant: variant, size: size)
                XCTAssertGreaterThan(spec.hPadding, 0, "\(variant)/\(size)")
                XCTAssertGreaterThan(spec.vPadding, 0, "\(variant)/\(size)")
                XCTAssertGreaterThan(spec.fontSize, 0, "\(variant)/\(size)")
                XCTAssertGreaterThan(spec.radius, 0, "\(variant)/\(size)")
                XCTAssertEqual(spec.dotSize, 6, "\(variant)/\(size)")  // 웹 6px 고정
            }
        }
        XCTAssertEqual(JdBadgeVariant.allCases.count, 7)
        XCTAssertEqual(JdDisplaySize.allCases.count, 3)
    }

    // 웹 크기 램프: sm 10pt/r6 · md 12pt/r8 · lg 14pt/r8 (radius는 md=lg 동률)
    func test_size_ramp_is_ascending() {
        let sm = JdBadgeSpec.resolve(variant: .default, size: .sm)
        let md = JdBadgeSpec.resolve(variant: .default, size: .md)
        let lg = JdBadgeSpec.resolve(variant: .default, size: .lg)
        XCTAssertLessThan(sm.fontSize, md.fontSize)
        XCTAssertLessThan(md.fontSize, lg.fontSize)
        XCTAssertLessThan(sm.hPadding, md.hPadding)
        XCTAssertLessThan(md.hPadding, lg.hPadding)
        XCTAssertLessThan(sm.vPadding, md.vPadding)
        XCTAssertLessThanOrEqual(md.vPadding, lg.vPadding)
        XCTAssertLessThan(sm.radius, md.radius)
        XCTAssertEqual(md.radius, lg.radius)
    }

    // outline만 테두리를 갖는다 — 나머지는 워시 배경 + 진한 전경 (웹 color-mix 관용구 승계)
    func test_outline_is_the_only_bordered_variant() {
        for variant in JdBadgeVariant.allCases {
            let spec = JdBadgeSpec.resolve(variant: variant, size: .md)
            if variant == .outline {
                XCTAssertNotNil(spec.border)
                XCTAssertEqual(spec.background.light, 0x0000_0000)
                XCTAssertEqual(spec.background.dark, 0x0000_0000)
            } else {
                XCTAssertNil(spec.border, "\(variant)")
            }
        }
    }

    func test_variant_color_mapping_uses_tokens() throws {
        let primary = JdBadgeSpec.resolve(variant: .primary, size: .md)
        XCTAssertEqual(primary.background.light, JdToken.Color.primaryLight.light)
        XCTAssertEqual(primary.foreground.light, JdToken.Color.primary.light)

        let danger = JdBadgeSpec.resolve(variant: .danger, size: .md)
        XCTAssertEqual(danger.background.light, JdToken.Color.dangerLight.light)
        XCTAssertEqual(danger.foreground.light, JdToken.Color.danger.light)

        let outline = JdBadgeSpec.resolve(variant: .outline, size: .md)
        XCTAssertEqual(outline.foreground.light, JdToken.Color.foreground.light)
        let outlineBorder = try XCTUnwrap(outline.border)
        XCTAssertEqual(outlineBorder.light, JdToken.Color.border.light)

        let fallback = JdBadgeSpec.resolve(variant: .default, size: .md)
        XCTAssertEqual(fallback.foreground.light, JdToken.Color.muted.light)
    }
}
