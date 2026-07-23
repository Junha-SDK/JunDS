import XCTest
import JunDSCore

final class JdOptionsTests: XCTestCase {

    // rawValue = 웹 attribute 문자열 (04 §3 규칙 1 — 3플랫폼 동일 리터럴)
    func test_buttonVariant_rawValues_match_web() {
        XCTAssertEqual(JdButtonVariant.primary.rawValue, "primary")
        XCTAssertEqual(JdButtonVariant.secondary.rawValue, "secondary")
        XCTAssertEqual(JdButtonVariant.ghost.rawValue, "ghost")
        XCTAssertEqual(JdButtonVariant.danger.rawValue, "danger")
        XCTAssertEqual(JdButtonVariant.allCases.count, 4)
    }

    func test_controlSize_rawValues_match_web() {
        XCTAssertEqual(JdControlSize.sm.rawValue, "sm")
        XCTAssertEqual(JdControlSize.md.rawValue, "md")
        XCTAssertEqual(JdControlSize.lg.rawValue, "lg")
        XCTAssertEqual(JdControlSize.allCases.count, 3)
    }

    func test_modalCloseReason_rawValues_match_web_requestClose_detail() {
        XCTAssertEqual(JdModalCloseReason.escape.rawValue, "escape")
        XCTAssertEqual(JdModalCloseReason.backdrop.rawValue, "backdrop")
        XCTAssertEqual(JdModalCloseReason.close.rawValue, "close")
    }
}

final class JdButtonSpecTests: XCTestCase {

    func test_size_ramp_is_ascending() {
        let sm = JdButtonSpec.resolve(variant: .primary, size: .sm)
        let md = JdButtonSpec.resolve(variant: .primary, size: .md)
        let lg = JdButtonSpec.resolve(variant: .primary, size: .lg)
        XCTAssertEqual(sm.minHeight, 32)
        XCTAssertEqual(md.minHeight, 40)
        XCTAssertEqual(lg.minHeight, 48)
        XCTAssertLessThan(sm.hPadding, md.hPadding)
        XCTAssertLessThan(md.hPadding, lg.hPadding)
        XCTAssertLessThan(sm.fontSize, md.fontSize)
        XCTAssertLessThan(md.fontSize, lg.fontSize)
    }

    func test_all_combinations_resolve() {
        for variant in JdButtonVariant.allCases {
            for size in JdControlSize.allCases {
                let spec = JdButtonSpec.resolve(variant: variant, size: size)
                XCTAssertGreaterThan(spec.minHeight, 0)
                XCTAssertGreaterThan(spec.hPadding, 0)
                XCTAssertGreaterThan(spec.fontSize, 0)
                XCTAssertEqual(spec.disabledOpacity, 0.4, accuracy: 0.001)
            }
        }
    }

    func test_variant_color_mapping() {
        let primary = JdButtonSpec.resolve(variant: .primary, size: .md)
        XCTAssertEqual(primary.background.light, JdToken.Color.primary.light)
        XCTAssertEqual(primary.pressedBackground.light, JdToken.Color.primaryHover.light)
        XCTAssertNil(primary.border)

        let secondary = JdButtonSpec.resolve(variant: .secondary, size: .md)
        XCTAssertEqual(secondary.background.light, JdToken.Color.card.light)
        XCTAssertNotNil(secondary.border)

        let ghost = JdButtonSpec.resolve(variant: .ghost, size: .md)
        XCTAssertEqual(ghost.background.light, 0x0000_0000)
        XCTAssertEqual(ghost.background.dark, 0x0000_0000)

        let danger = JdButtonSpec.resolve(variant: .danger, size: .md)
        XCTAssertEqual(danger.background.light, JdToken.Color.danger.light)
        XCTAssertEqual(danger.pressedBackground.light, JdToken.Color.dangerHover.light)
    }
}

final class JdTextFieldSpecTests: XCTestCase {

    func test_size_ramp() {
        let sm = JdTextFieldSpec.resolve(size: .sm)
        let md = JdTextFieldSpec.resolve(size: .md)
        let lg = JdTextFieldSpec.resolve(size: .lg)
        XCTAssertEqual(sm.minHeight, 32)
        XCTAssertEqual(md.minHeight, 40)
        XCTAssertEqual(lg.minHeight, 48)
        XCTAssertEqual(md.labelFontSize, JdToken.FontSize.md)
        XCTAssertEqual(md.errorFontSize, JdToken.FontSize.xs)
    }
}

final class JdMotionTests: XCTestCase {

    override func tearDown() {
        JdMotion.isReduced = { false }
        super.tearDown()
    }

    func test_duration_passthrough_by_default() {
        JdMotion.isReduced = { false }
        XCTAssertEqual(JdMotion.duration(0.3), 0.3, accuracy: 0.0001)
    }

    func test_duration_zero_when_reduced() {
        JdMotion.isReduced = { true }
        XCTAssertEqual(JdMotion.duration(0.3), 0, accuracy: 0.0001)
    }
}
