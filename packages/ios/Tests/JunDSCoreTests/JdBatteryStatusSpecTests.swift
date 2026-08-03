import JunDSCore
import XCTest

// 표시 계열 순수 함수는 전수 검증 (04 §4.2 규칙 1·3, DESIGN-2 §C).
// 임계값·클램프는 웹 update()의 리터럴(>70 / >30, Math.max(0, Math.min(100, v)))이 정본이다.

final class JdBatterySpecTests: XCTestCase {

    // MARK: autoColor 임계 — 경계는 "초과"라 30·70 자신은 아래 구간에 남는다

    func test_autoColor_threshold_boundaries() {
        XCTAssertEqual(JdBatterySpec.autoColor(for: 0), .danger)
        XCTAssertEqual(JdBatterySpec.autoColor(for: 30), .danger)  // >30 아님 → danger
        XCTAssertEqual(JdBatterySpec.autoColor(for: 30.1), .warning)
        XCTAssertEqual(JdBatterySpec.autoColor(for: 70), .warning)  // >70 아님 → warning
        XCTAssertEqual(JdBatterySpec.autoColor(for: 70.1), .success)
        XCTAssertEqual(JdBatterySpec.autoColor(for: 100), .success)
    }

    // autoColor는 클램프 후 판정한다 — 범위 밖 입력이 구간을 건너뛰지 않는다
    func test_autoColor_clamps_before_deciding() {
        XCTAssertEqual(JdBatterySpec.autoColor(for: -1), .danger)
        XCTAssertEqual(JdBatterySpec.autoColor(for: -1000), .danger)
        XCTAssertEqual(JdBatterySpec.autoColor(for: 100.1), .success)
        XCTAssertEqual(JdBatterySpec.autoColor(for: 1000), .success)
    }

    // MARK: clamp

    func test_clamp_bounds() {
        XCTAssertEqual(JdBatterySpec.clamp(-0.1), 0, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(-50), 0, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(0), 0, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(37.5), 37.5, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(100), 100, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(100.1), 100, accuracy: 0.0001)
        XCTAssertEqual(JdBatterySpec.clamp(1000), 100, accuracy: 0.0001)
    }

    // MARK: 사이즈 3종 — 본체·캡 치수 (웹 40×16/56×24/80×32, 캡 4×8/6×12/8×16)

    func test_size_ramp_body_and_cap_dimensions() {
        let sm = JdBatterySpec.resolve(size: .sm)
        XCTAssertEqual(sm.bodyWidth, 40)
        XCTAssertEqual(sm.bodyHeight, 16)
        XCTAssertEqual(sm.capWidth, 4)
        XCTAssertEqual(sm.capHeight, 8)

        let md = JdBatterySpec.resolve(size: .md)
        XCTAssertEqual(md.bodyWidth, 56)
        XCTAssertEqual(md.bodyHeight, 24)
        XCTAssertEqual(md.capWidth, 6)
        XCTAssertEqual(md.capHeight, 12)

        let lg = JdBatterySpec.resolve(size: .lg)
        XCTAssertEqual(lg.bodyWidth, 80)
        XCTAssertEqual(lg.bodyHeight, 32)
        XCTAssertEqual(lg.capWidth, 8)
        XCTAssertEqual(lg.capHeight, 16)
    }

    // 테두리·라운드는 크기축과 무관한 상수 + 캡이 본체보다 크지 않다(기하 정합)
    func test_size_invariants() {
        for size in JdDisplaySize.allCases {
            let spec = JdBatterySpec.resolve(size: size)
            XCTAssertEqual(spec.borderWidth, JdToken.Border.medium)
            XCTAssertEqual(spec.radius, JdToken.Radius.sm)
            XCTAssertEqual(spec.percentFontSize, 10)
            XCTAssertEqual(spec.labelFontSize, JdTextSpec.resolve(size: .xs).fontSize)
            XCTAssertLessThan(spec.capWidth, spec.bodyWidth)
            XCTAssertLessThan(spec.capHeight, spec.bodyHeight)
            // 채움이 들어갈 안쪽 폭이 남아야 한다
            XCTAssertGreaterThan(spec.bodyWidth - spec.borderWidth * 2, 0)
            XCTAssertGreaterThan(spec.bodyHeight - spec.borderWidth * 2, 0)
        }
    }

    // 웹은 lg에서만 % 텍스트를 노출한다
    func test_percentText_only_on_lg() {
        XCTAssertFalse(JdBatterySpec.resolve(size: .sm).showsPercentText)
        XCTAssertFalse(JdBatterySpec.resolve(size: .md).showsPercentText)
        XCTAssertTrue(JdBatterySpec.resolve(size: .lg).showsPercentText)
    }

    // 채움색은 v2 Tailwind-500 리터럴 — 테마 불변(라이트=다크)이고 4종이 서로 다르다
    func test_fillColor_is_theme_invariant_and_distinct() {
        var seen = Set<UInt32>()
        for color in JdBatteryColor.allCases {
            let fill = JdBatterySpec.fillColor(color)
            XCTAssertEqual(fill.light, fill.dark)
            XCTAssertTrue(seen.insert(fill.light).inserted, "채움색 중복: \(color.rawValue)")
        }
        XCTAssertEqual(JdBatterySpec.fillColor(.primary).light, 0x3B82_F6FF)
        XCTAssertEqual(JdBatterySpec.fillColor(.success).light, 0x22C5_5EFF)
        XCTAssertEqual(JdBatterySpec.fillColor(.warning).light, 0xF59E_0BFF)
        XCTAssertEqual(JdBatterySpec.fillColor(.danger).light, 0xEF44_44FF)
    }

    // 외곽선은 웹 #9ca3af / 다크 #6b7280
    func test_outlineColor_pair() {
        XCTAssertEqual(JdBatterySpec.outlineColor.light, 0x9CA3_AFFF)
        XCTAssertEqual(JdBatterySpec.outlineColor.dark, 0x6B72_80FF)
    }
}

final class JdStatusDotSpecTests: XCTestCase {

    // pulse만 맥동한다 — 나머지 5종은 정적 (전수)
    func test_pulses_flag_only_for_pulse() {
        for status in JdStatusKind.allCases {
            let spec = JdStatusDotSpec.resolve(status: status, size: .md)
            XCTAssertEqual(
                spec.pulses, status == .pulse,
                "pulses 플래그 불일치: \(status.rawValue)")
        }
    }

    // 웹: sm 6 · md 8 · lg 10
    func test_dot_size_ramp() {
        XCTAssertEqual(JdStatusDotSpec.resolve(status: .neutral, size: .sm).dotSize, 6)
        XCTAssertEqual(JdStatusDotSpec.resolve(status: .neutral, size: .md).dotSize, 8)
        XCTAssertEqual(JdStatusDotSpec.resolve(status: .neutral, size: .lg).dotSize, 10)
    }

    // gap·라벨 폰트는 크기축과 무관한 상수 (웹 --jd-space-1-5, --jd-text-xs)
    func test_gap_and_label_font_are_constant() {
        for status in JdStatusKind.allCases {
            for size in JdDisplaySize.allCases {
                let spec = JdStatusDotSpec.resolve(status: status, size: size)
                XCTAssertEqual(spec.gap, JdToken.Space.s1_5)
                XCTAssertEqual(spec.labelFontSize, JdTextSpec.resolve(size: .xs).fontSize)
            }
        }
    }

    // 웹 색 매핑: info=primary(v2 동형), pulse=success와 동색
    func test_color_mapping() {
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .success, size: .md).color.light,
            JdToken.Color.success.light)
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .pulse, size: .md).color.light,
            JdToken.Color.success.light)
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .warning, size: .md).color.light,
            JdToken.Color.warning.light)
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .danger, size: .md).color.light,
            JdToken.Color.danger.light)
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .info, size: .md).color.light,
            JdToken.Color.primary.light)
        XCTAssertEqual(
            JdStatusDotSpec.resolve(status: .neutral, size: .md).color.light,
            0x9CA3_AFFF)
    }
}

final class JdSeverityBadgeSpecTests: XCTestCase {

    // 5종 전수 — 배경·전경·점 색이 서로 겹치지 않고 기하는 유효하다
    func test_all_five_severities_resolve_with_distinct_colors() {
        XCTAssertEqual(JdSeverity.allCases.count, 5)
        var backgrounds = Set<UInt32>()
        var dots = Set<UInt32>()
        for severity in JdSeverity.allCases {
            let spec = JdSeverityBadgeSpec.resolve(severity: severity, size: .md)
            XCTAssertGreaterThan(spec.hPadding, 0)
            XCTAssertGreaterThan(spec.vPadding, 0)
            XCTAssertGreaterThan(spec.fontSize, 0)
            XCTAssertEqual(spec.dotSize, 8)
            XCTAssertEqual(spec.gap, JdToken.Space.s1_5)
            XCTAssertTrue(
                backgrounds.insert(spec.background.light).inserted,
                "배경 중복: \(severity.rawValue)")
            XCTAssertTrue(
                dots.insert(spec.dotColor.light).inserted,
                "점 색 중복: \(severity.rawValue)")
            // 점 색은 v2 500 계열 리터럴이라 테마 불변
            XCTAssertEqual(spec.dotColor.light, spec.dotColor.dark)
        }
    }

    // 웹 v2 리터럴 승계 — 라이트 쌍(배경/전경) 고정
    func test_light_palette_matches_v2_literals() {
        let ok = JdSeverityBadgeSpec.resolve(severity: .ok, size: .md)
        XCTAssertEqual(ok.background.light, 0xECFD_F5FF)
        XCTAssertEqual(ok.foreground.light, 0x0477_57FF)

        let warn = JdSeverityBadgeSpec.resolve(severity: .warn, size: .md)
        XCTAssertEqual(warn.background.light, 0xFFFB_EBFF)
        XCTAssertEqual(warn.foreground.light, 0xB453_09FF)

        let danger = JdSeverityBadgeSpec.resolve(severity: .danger, size: .md)
        XCTAssertEqual(danger.background.light, 0xFEF2_F2FF)
        XCTAssertEqual(danger.foreground.light, 0xB91C_1CFF)

        let info = JdSeverityBadgeSpec.resolve(severity: .info, size: .md)
        XCTAssertEqual(info.background.light, 0xEFF6_FFFF)
        XCTAssertEqual(info.foreground.light, 0x1D4E_D8FF)

        let neutral = JdSeverityBadgeSpec.resolve(severity: .neutral, size: .md)
        XCTAssertEqual(neutral.background.light, 0xF3F4_F6FF)
        XCTAssertEqual(neutral.foreground.light, 0x4B55_63FF)
    }

    // 웹 크기축: sm 2/8·10pt, md 4/10·12pt. lg는 md와 동형(웹엔 lg가 없다)
    func test_size_ramp_padding_and_font() {
        let sm = JdSeverityBadgeSpec.resolve(severity: .ok, size: .sm)
        XCTAssertEqual(sm.hPadding, JdToken.Space.s2)
        XCTAssertEqual(sm.vPadding, JdToken.Space.s0_5)
        XCTAssertEqual(sm.fontSize, JdTextSpec.resolve(size: .xs2).fontSize)

        let md = JdSeverityBadgeSpec.resolve(severity: .ok, size: .md)
        XCTAssertEqual(md.hPadding, JdToken.Space.s2_5)
        XCTAssertEqual(md.vPadding, JdToken.Space.s1)
        XCTAssertEqual(md.fontSize, JdTextSpec.resolve(size: .xs).fontSize)

        let lg = JdSeverityBadgeSpec.resolve(severity: .ok, size: .lg)
        XCTAssertEqual(lg.hPadding, md.hPadding)
        XCTAssertEqual(lg.vPadding, md.vPadding)
        XCTAssertEqual(lg.fontSize, md.fontSize)

        XCTAssertLessThan(sm.fontSize, md.fontSize)
        XCTAssertLessThan(sm.hPadding, md.hPadding)
    }
}
