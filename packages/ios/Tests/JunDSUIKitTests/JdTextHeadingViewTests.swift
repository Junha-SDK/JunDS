import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

final class JdTextViewTests: XCTestCase {

    private let lightTraits = UITraitCollection(userInterfaceStyle: .light)

    private func resolved(_ color: UIColor?) -> UIColor? {
        color?.resolvedColor(with: lightTraits)
    }

    // 웹 dimmed attribute 동형 — foreground ↔ muted 전환
    func test_dimmed_switches_between_foreground_and_muted() {
        let view = JdTextView("본문")
        XCTAssertEqual(resolved(view.textColor),
                       resolved(JdToken.Color.foreground.uiColor))
        view.dimmed = true
        XCTAssertEqual(resolved(view.textColor),
                       resolved(JdToken.Color.muted.uiColor))
        view.dimmed = false
        XCTAssertEqual(resolved(view.textColor),
                       resolved(JdToken.Color.foreground.uiColor))
    }

    // 웹 mono attribute 동형 — 모노스페이스 패밀리 전환(디스크립터 트레이트로 판정)
    func test_mono_switches_font_family() {
        let view = JdTextView("code")
        XCTAssertFalse(view.font.fontDescriptor.symbolicTraits.contains(.traitMonoSpace))
        view.mono = true
        XCTAssertTrue(view.font.fontDescriptor.symbolicTraits.contains(.traitMonoSpace))
    }

    // textSize 변경 → 스케일 폰트 재적용(브리지 출력과 동일값 + 단조 증가)
    func test_textSize_change_reapplies_font_size() {
        let view = JdTextView("본문") // 기본 md=16
        let mdPoint = view.font.pointSize
        XCTAssertEqual(mdPoint,
                       JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                               weight: JdToken.FontWeight.normal,
                                               compatibleWith: view.traitCollection).pointSize)
        view.textSize = .xl4 // 36
        XCTAssertGreaterThan(view.font.pointSize, mdPoint)
        XCTAssertEqual(view.font.pointSize,
                       JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .xl4).fontSize,
                                               weight: JdToken.FontWeight.normal,
                                               compatibleWith: view.traitCollection).pointSize)
    }

    // 웹 p 동형 — 기본 다행 + Dynamic Type 필수 플래그 (04 §7.2)
    func test_defaults_multiline_and_dynamic_type() {
        let view = JdTextView("본문")
        XCTAssertEqual(view.numberOfLines, 0)
        XCTAssertTrue(view.adjustsFontForContentSizeCategory)
    }
}

final class JdHeadingViewTests: XCTestCase {

    func test_heading_exposes_header_trait() {
        let view = JdHeadingView("제목")
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertTrue(view.accessibilityTraits.contains(.header))
    }

    // L6은 표시만 대문자화 — VoiceOver는 원문으로 읽는다
    func test_h6_uppercases_display_but_preserves_original() {
        let view = JdHeadingView("hello world", level: .h6)
        XCTAssertEqual(view.text, "HELLO WORLD")
        XCTAssertEqual(view.accessibilityLabel, "hello world")
    }

    // 레벨 변경 didSet — uppercase 레벨을 벗어나면 원문 복원 + 램프 크기 재적용
    func test_level_change_restores_original_and_resizes() {
        let view = JdHeadingView("hello world", level: .h6)
        let h6Point = view.font.pointSize
        view.level = .h1
        XCTAssertEqual(view.text, "hello world")
        XCTAssertGreaterThan(view.font.pointSize, h6Point)
        view.level = .h6
        XCTAssertEqual(view.text, "HELLO WORLD")
    }

    // UILabel API로 텍스트를 갈아끼워도 원문 보존 로직이 유지된다
    func test_text_setter_keeps_uppercase_contract() {
        let view = JdHeadingView("hello", level: .h6)
        view.text = "new title"
        XCTAssertEqual(view.text, "NEW TITLE")
        XCTAssertEqual(view.accessibilityLabel, "new title")
        view.level = .h2
        XCTAssertEqual(view.text, "new title")
    }
}
