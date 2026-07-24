import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// 텍스트 런 계열(Code · Mark · Highlight · Link · Mention · Hashtag)의 UIKit 표면 검증.
// 이 계열의 회귀 위험은 두 가지다: ① 렌더가 Core 계산을 재구현하는 것,
// ② 텍스트 속성(폰트 패밀리·밑줄·배경 range)이 조용히 어긋나는 것 — 둘 다 여기서 잡는다.

private let lightTraits = UITraitCollection(userInterfaceStyle: .light)

private func firstAttributes(_ label: UILabel) -> [NSAttributedString.Key: Any] {
    guard let attributed = label.attributedText, attributed.length > 0 else { return [:] }
    return attributed.attributes(at: 0, effectiveRange: nil)
}

// 토큰 색은 다이나믹 컬러(UIDynamicProviderColor)라 인스턴스 비교가 항상 불일치다 —
// 양쪽을 같은 트레이트로 해석한 뒤 비교한다(실측 함정).
private func resolvedLight(_ color: UIColor?) -> UIColor? {
    color?.resolvedColor(with: lightTraits)
}

private func attributeColor(_ label: UILabel, _ key: NSAttributedString.Key) -> UIColor? {
    resolvedLight(firstAttributes(label)[key] as? UIColor)
}

final class JdCodeViewTests: XCTestCase {

    // 인라인 코드의 정체성 = 모노스페이스. 산세리프와 **다른 패밀리**임을 함께 고정한다
    // (scaledMonoFont 대신 scaledFont로 되돌아가는 회귀가 이 단언에서만 잡힌다)
    func test_font_is_monospaced_and_not_the_sans_face() {
        let view = JdCodeView("let x = 1")
        let size = JdTextSpec.resolve(size: .xs).fontSize // md 럼프 = 12
        let mono = JdFontBridge.scaledMonoFont(size: size,
                                               weight: JdToken.FontWeight.normal,
                                               compatibleWith: view.traitCollection)
        let sans = JdFontBridge.scaledFont(size: size,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: view.traitCollection)
        XCTAssertEqual(view.font.fontName, mono.fontName)
        XCTAssertNotEqual(view.font.fontName, sans.fontName)
    }

    // variant 색은 토큰에서 직접 온다(계약: 배경 = *Light · 전경 = 시맨틱 색)
    func test_variant_colors_are_token_pairs() {
        let expected: [(JdCodeVariant, JdDynamicColor, JdDynamicColor)] = [
            (.default, JdToken.Color.cardHover, JdToken.Color.foreground),
            (.primary, JdToken.Color.primaryLight, JdToken.Color.primary),
            (.success, JdToken.Color.successLight, JdToken.Color.success),
            (.warning, JdToken.Color.warningLight, JdToken.Color.warning),
            (.danger, JdToken.Color.dangerLight, JdToken.Color.danger),
        ]
        for (variant, background, foreground) in expected {
            let view = JdCodeView("x", variant: variant)
            XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                           background.uiColor.resolvedColor(with: lightTraits), "\(variant)")
            XCTAssertEqual(view.textColor.resolvedColor(with: lightTraits),
                           foreground.uiColor.resolvedColor(with: lightTraits), "\(variant)")
        }
        XCTAssertEqual(expected.count, JdCodeVariant.allCases.count)
    }

    // variant didSet → 재적용 (init 시점에만 칠하는 회귀 방지)
    func test_variant_change_reapplies_colors() {
        let view = JdCodeView("x")
        view.variant = .danger
        XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                       JdToken.Color.dangerLight.uiColor.resolvedColor(with: lightTraits))
        XCTAssertEqual(view.textColor.resolvedColor(with: lightTraits),
                       JdToken.Color.danger.uiColor.resolvedColor(with: lightTraits))
    }

    // 크기 램프는 비감소 + 끝점은 확실히 벌어진다(폰트·패딩이 함께 자란다)
    func test_size_ramp_does_not_shrink() {
        let widths = JdControlSize.allCases.map { size in
            JdCodeView("npm run build", size: size).intrinsicContentSize.width
        }
        for (smaller, larger) in zip(widths, widths.dropFirst()) {
            XCTAssertLessThanOrEqual(smaller, larger)
        }
        XCTAssertGreaterThan(widths.last ?? 0, widths.first ?? 0)
        XCTAssertEqual(JdToken.Radius.sm, JdCodeView("x").layer.cornerRadius)
    }
}

final class JdMarkViewTests: XCTestCase {

    // 배경형 = 팔레트 배경 + 밑줄 없음
    func test_default_is_a_background_highlight_without_underline() {
        let view = JdMarkView("형광펜")
        XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                       JdMarkPalette.background(.yellow).uiColor.resolvedColor(with: lightTraits))
        XCTAssertNil(firstAttributes(view)[.underlineStyle])
        XCTAssertEqual(attributeColor(view, .foregroundColor),
                       resolvedLight(JdMarkPalette.foreground(.yellow).uiColor))
    }

    // 밑줄형으로 토글하면 배경이 사라지고 밑줄이 팔레트 색으로 붙는다(웹 동형)
    func test_underline_toggle_swaps_background_for_a_colored_rule() {
        let view = JdMarkView("형광펜", color: .blue)
        view.underline = true
        let attributes = firstAttributes(view)
        XCTAssertEqual(view.backgroundColor, UIColor.clear)
        XCTAssertEqual(attributes[.underlineStyle] as? Int, NSUnderlineStyle.thick.rawValue)
        XCTAssertEqual(attributeColor(view, .underlineColor),
                       resolvedLight(JdMarkPalette.foreground(.blue).uiColor))
        // 웹 color: inherit 동형 — 밑줄형 글자색은 팔레트가 아니라 본문색이다
        XCTAssertEqual(attributeColor(view, .foregroundColor),
                       resolvedLight(JdToken.Color.foreground.uiColor))

        // 되돌리면 배경형으로 복귀한다(단방향 전환 회귀 방지)
        view.underline = false
        XCTAssertNil(firstAttributes(view)[.underlineStyle])
        XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                       JdMarkPalette.background(.blue).uiColor.resolvedColor(with: lightTraits))
    }

    // 5색 전부 팔레트가 결의된다 + color didSet 반영
    func test_all_colors_resolve_and_react_to_didSet() {
        for color in JdMarkColor.allCases {
            let view = JdMarkView("색", color: color)
            XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                           JdMarkPalette.background(color).uiColor.resolvedColor(with: lightTraits),
                           "\(color)")
        }
        let view = JdMarkView("색", color: .yellow)
        view.color = .purple
        XCTAssertEqual(view.backgroundColor?.resolvedColor(with: lightTraits),
                       JdMarkPalette.background(.purple).uiColor.resolvedColor(with: lightTraits))
    }
}

final class JdHighlightTextViewTests: XCTestCase {

    // 핵심 계약: 칠해진 range가 **Core JdHighlight.segments와 정확히 일치**한다.
    // 자체 매칭(대소문자·다중 매치 규칙 재구현)이 들어오면 여기서 어긋난다.
    func test_painted_ranges_match_core_segments_exactly() throws {
        let text = "Swift와 swiftUI 그리고 SWIFT"
        let query = "swift"
        let view = JdHighlightTextView(text, query: query)
        let attributed = try XCTUnwrap(view.attributedText)

        var expected: [NSRange] = []
        var location = 0
        for segment in JdHighlight.segments(text: text, query: query) {
            let length = (segment.text as NSString).length
            if segment.isMatch { expected.append(NSRange(location: location, length: length)) }
            location += length
        }

        var actual: [NSRange] = []
        let full = NSRange(location: 0, length: (attributed.string as NSString).length)
        attributed.enumerateAttribute(.backgroundColor, in: full) { value, range, _ in
            if value != nil { actual.append(range) }
        }

        XCTAssertEqual(actual, expected)
        XCTAssertEqual(expected.count, 3) // 대소문자 무시 전수 매칭
        XCTAssertEqual(attributed.string, text) // 원문 보존
    }

    // 빈 쿼리 = 전체가 비매치 1구간(Core 판정) — 아무것도 칠하지 않는다
    func test_empty_query_paints_nothing() throws {
        let view = JdHighlightTextView("검색어 없음", query: "")
        let attributed = try XCTUnwrap(view.attributedText)
        var painted = 0
        attributed.enumerateAttribute(.backgroundColor,
                                      in: NSRange(location: 0, length: attributed.length)) { value, _, _ in
            if value != nil { painted += 1 }
        }
        XCTAssertEqual(painted, 0)
    }

    // 조각을 나눠 읽히지 않도록 원문 전체가 라벨 1개다 (04 §7.1)
    func test_accessibility_exposes_the_whole_source_once() {
        let view = JdHighlightTextView("Swift 하이라이트", query: "swift")
        XCTAssertTrue(view.isAccessibilityElement)
        XCTAssertEqual(view.accessibilityLabel, "Swift 하이라이트")

        view.query = "하이"
        XCTAssertEqual(view.accessibilityLabel, "Swift 하이라이트") // 쿼리가 바뀌어도 원문 1개
    }
}

final class JdLinkViewTests: XCTestCase {

    private let url = URL(string: "https://junds.dev")

    // 외부 링크는 심볼이 붙고 **안내 문구가 라벨에 합류**한다(웹은 아이콘뿐이라 AT 무노출)
    func test_external_adds_symbol_and_joins_the_accessibility_label() {
        let internalLink = JdLinkView("문서", destination: url)
        XCTAssertNil(internalLink.iconView.image)
        XCTAssertTrue(internalLink.iconView.isHidden)
        XCTAssertEqual(internalLink.accessibilityLabel, "문서")

        let externalLink = JdLinkView("문서", destination: url, isExternal: true)
        XCTAssertNotNil(externalLink.iconView.image)
        XCTAssertFalse(externalLink.iconView.isHidden)
        XCTAssertEqual(externalLink.accessibilityLabel, "문서, \(JdLinkStyle.externalHint)")
        XCTAssertTrue(externalLink.accessibilityTraits.contains(.link))
    }

    // isExternal didSet → 심볼·라벨 동시 갱신
    func test_isExternal_didSet_updates_symbol_and_label() {
        let view = JdLinkView("문서", destination: url)
        view.isExternal = true
        XCTAssertNotNil(view.iconView.image)
        XCTAssertEqual(view.accessibilityLabel, "문서, \(JdLinkStyle.externalHint)")
    }

    // 밑줄은 기본 켬(웹 hover 밑줄의 iOS 번역) — 끄면 속성이 사라진다
    func test_underline_is_on_by_default_and_can_be_turned_off() {
        let view = JdLinkView("문서", destination: url)
        XCTAssertEqual(firstAttributes(view.contentLabel)[.underlineStyle] as? Int,
                       NSUnderlineStyle.single.rawValue)
        view.underline = false
        XCTAssertNil(firstAttributes(view.contentLabel)[.underlineStyle])
    }

    // variant 색 — default와 primary는 같은 토큰으로 결의된다(웹 `.jd-link` 기본색 = primary)
    func test_variant_colors_come_from_tokens() {
        let muted = JdLinkView("문서", destination: url, variant: .muted)
        XCTAssertEqual(attributeColor(muted.contentLabel, .foregroundColor),
                       resolvedLight(JdToken.Color.muted.uiColor))
        for variant in [JdLinkVariant.default, .primary] {
            let view = JdLinkView("문서", destination: url, variant: variant)
            XCTAssertEqual(attributeColor(view.contentLabel, .foregroundColor),
                           resolvedLight(JdToken.Color.primary.uiColor), "\(variant)")
        }
    }

    // 소비자 가로채기(라우터)가 시스템 열기를 대신한다 — sendActions는 이 하네스에서 무동작이라 헬퍼 사용
    func test_onTap_intercepts_the_system_open() {
        let view = JdLinkView("문서", destination: url)
        var taps = 0
        view.onTap = { taps += 1 }
        view.jdSendActions(for: .touchUpInside)
        view.jdSendActions(for: .touchUpInside)
        XCTAssertEqual(taps, 2)
    }
}

final class JdMentionHashtagViewTests: XCTestCase {

    // 표시 문자열은 Core가 만든다(label 폴백 규칙 재구현 금지)
    func test_mention_display_text_delegates_to_core() {
        let fallback = JdMentionLabelView(handle: "junha")
        XCTAssertEqual(fallback.attributedText?.string,
                       JdMentionChip.displayText(handle: "junha", label: ""))
        XCTAssertEqual(fallback.accessibilityLabel, "@junha")

        let labeled = JdMentionLabelView(handle: "junha", label: "준하", isVerified: true)
        XCTAssertEqual(labeled.attributedText?.string.hasPrefix("준하"), true)
        XCTAssertEqual(labeled.accessibilityLabel, "준하, \(JdMentionStyle.verifiedLabel)")
        XCTAssertTrue(labeled.accessibilityTraits.contains(.link))
    }

    // handle didSet → Core 재호출
    func test_mention_handle_didSet_recomputes_display_text() {
        let view = JdMentionLabelView(handle: "junha")
        view.handle = "swift"
        XCTAssertEqual(view.attributedText?.string, "@swift")
    }

    // 카운트 축약은 Core(JdNumberFormat.compactCount)를 그대로 쓴다 — 자체 포맷 금지
    func test_hashtag_count_delegates_to_core() {
        let bare = JdHashtagLabelView(tag: "swift")
        XCTAssertEqual(bare.attributedText?.string, JdHashtag.displayText(tag: "swift"))
        XCTAssertEqual(bare.accessibilityLabel, "#swift")

        let counted = JdHashtagLabelView(tag: "swift", count: 1500, isTrending: true)
        let expected = JdHashtag.countText(1500)
        XCTAssertEqual(expected, JdNumberFormat.compactCount(1500))
        XCTAssertEqual(counted.attributedText?.string.contains("(\(expected))"), true)
        XCTAssertEqual(counted.accessibilityLabel,
                       "#swift, \(JdMentionStyle.trendingLabel), \(expected)")
    }

    // count didSet → 표기 갱신(nil이면 표기 자체가 사라진다)
    func test_hashtag_count_didSet_adds_and_removes_the_suffix() {
        let view = JdHashtagLabelView(tag: "swift")
        view.count = 999
        XCTAssertEqual(view.attributedText?.string.contains("(999)"), true)
        view.count = nil
        XCTAssertEqual(view.attributedText?.string, "#swift")
    }
}
