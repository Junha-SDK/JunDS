import XCTest
import JunDSCore

final class JdTextSpecTests: XCTestCase {

    // rawValue = 웹 attribute 문자열 (04 §3 규칙 1 — 3플랫폼 동일 리터럴)
    func test_textSize_rawValues_match_web() {
        XCTAssertEqual(JdTextSize.xs2.rawValue, "2xs")
        XCTAssertEqual(JdTextSize.xs.rawValue, "xs")
        XCTAssertEqual(JdTextSize.sm.rawValue, "sm")
        XCTAssertEqual(JdTextSize.md.rawValue, "md")
        XCTAssertEqual(JdTextSize.lg.rawValue, "lg")
        XCTAssertEqual(JdTextSize.xl.rawValue, "xl")
        XCTAssertEqual(JdTextSize.xl2.rawValue, "2xl")
        XCTAssertEqual(JdTextSize.xl3.rawValue, "3xl")
        XCTAssertEqual(JdTextSize.xl4.rawValue, "4xl")
        XCTAssertEqual(JdTextSize.allCases.count, 9)
    }

    // v2 리터럴 pt 사다리 전수 (DESIGN §2.1 — 1rem=16pt 환산 실측값)
    func test_text_ladder_pt_values() {
        let expected: [JdTextSize: CGFloat] = [
            .xs2: 10, .xs: 12, .sm: 14, .md: 16, .lg: 18,
            .xl: 20, .xl2: 24, .xl3: 30, .xl4: 36,
        ]
        for (size, pt) in expected {
            XCTAssertEqual(JdTextSpec.resolve(size: size).fontSize, pt,
                           "\(size.rawValue) 사이즈 pt 불일치")
        }
    }

    // 웹 기본 line-height relaxed(1.625) — 전 사이즈 공통
    func test_lineHeightMultiple_is_relaxed_for_all_sizes() {
        for size in JdTextSize.allCases {
            XCTAssertEqual(JdTextSpec.resolve(size: size).lineHeightMultiple,
                           JdToken.LineHeight.relaxed)
        }
    }

    func test_text_ladder_is_ascending() {
        let sizes = JdTextSize.allCases.map { JdTextSpec.resolve(size: $0).fontSize }
        for (smaller, larger) in zip(sizes, sizes.dropFirst()) {
            XCTAssertLessThan(smaller, larger)
        }
    }
}

final class JdHeadingSpecTests: XCTestCase {

    func test_headingLevel_rawValues_match_web() {
        XCTAssertEqual(JdHeadingLevel.allCases.map(\.rawValue), [1, 2, 3, 4, 5, 6])
    }

    // 웹 jd-heading 모바일 램프 6레벨 전수 (DESIGN §2.1):
    // L1 24 bold / L2 20 bold / L3 20 semibold / L4 18 semibold / L5 16 semibold / L6 14 semibold+uppercase
    func test_heading_ramp_sizes_weights_uppercase() {
        let expected: [(JdHeadingLevel, CGFloat, CGFloat, Bool)] = [
            (.h1, 24, JdToken.FontWeight.bold, false),
            (.h2, 20, JdToken.FontWeight.bold, false),
            (.h3, 20, JdToken.FontWeight.semibold, false),
            (.h4, 18, JdToken.FontWeight.semibold, false),
            (.h5, 16, JdToken.FontWeight.semibold, false),
            (.h6, 14, JdToken.FontWeight.semibold, true),
        ]
        for (level, size, weight, uppercase) in expected {
            let spec = JdHeadingSpec.resolve(level: level)
            XCTAssertEqual(spec.fontSize, size, "h\(level.rawValue) 크기 불일치")
            XCTAssertEqual(spec.fontWeight, weight, "h\(level.rawValue) 굵기 불일치")
            XCTAssertEqual(spec.uppercase, uppercase, "h\(level.rawValue) uppercase 불일치")
        }
    }

    // 레벨이 깊어질수록 크기는 단조 비증가(L2=L3 20pt 동률 허용)
    func test_heading_ramp_is_non_increasing() {
        let sizes = JdHeadingLevel.allCases.map { JdHeadingSpec.resolve(level: $0).fontSize }
        for (upper, deeper) in zip(sizes, sizes.dropFirst()) {
            XCTAssertGreaterThanOrEqual(upper, deeper)
        }
    }
}
