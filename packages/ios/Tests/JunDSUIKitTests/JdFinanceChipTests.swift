import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// finance 칩·톤 어휘 (DEC-047).
//
// 핵심 계약은 대비다: 12~14% 틴트 배경 위에 **원색 글자는 대비가 안 나온다**(웹 실측
// amber ~1.9:1). 글자는 색상을 유지한 채 foreground 쪽으로 섞어 올린다. 이 계산이
// 컴포넌트로 새면 반드시 어긋나므로 스펙이 소유하는지 확인한다.
final class JdFinanceChipTests: XCTestCase {

    override func tearDown() {
        JdFinanceTheme.resetToDefaults()
        super.tearDown()
    }

    private let light = UITraitCollection(userInterfaceStyle: .light)

    // MARK: - 팔레트

    // 회전 순서는 웹과 같아야 한다 — 다르면 같은 데이터가 두 플랫폼에서 다른 색이 된다
    func test_category_palette_wraps_and_is_stable() {
        let count = JdFinanceTheme.categoryPalette.count
        XCTAssertEqual(count, 5, "웹 ACCENT_SLOTS와 같아야 한다")
        XCTAssertEqual(JdFinanceTheme.categoryColor(0).light, JdFinanceTheme.categoryColor(count).light)
        XCTAssertEqual(JdFinanceTheme.categoryColor(0).light, JdFinanceTheme.categoryColor(2 * count).light)
        // 음수도 안전하게 감긴다
        XCTAssertEqual(JdFinanceTheme.categoryColor(-1).light,
                       JdFinanceTheme.categoryColor(count - 1).light)
    }

    func test_palette_colors_are_distinct() {
        let lights = JdFinanceTheme.categoryPalette.map(\.light)
        XCTAssertEqual(Set(lights).count, lights.count, "회전 팔레트에 같은 색이 두 번 있다")
    }

    // 틴트 위 글자는 원색이 아니다 — 이게 깨지면 amber 칩이 안 읽힌다
    func test_on_tint_is_mixed_toward_foreground_not_raw() {
        let amber = JdFinanceTheme.categoryColor(2)
        let onTint = JdFinanceTheme.onTint(amber)
        XCTAssertNotEqual(onTint.light, amber.light, "원색을 그대로 쓰면 틴트 위에서 대비가 무너진다")
        // 색상은 유지된다 — foreground(거의 무채)로 완전히 가지는 않는다
        XCTAssertNotEqual(onTint.light, JdToken.Color.foreground.light)
    }

    func test_tint_only_lowers_alpha() {
        let base = JdFinanceTheme.categoryColor(0)
        let tinted = JdFinanceTheme.tint(base)
        XCTAssertEqual(tinted.light & 0xFFFF_FF00, base.light & 0xFFFF_FF00)
        XCTAssertLessThan(tinted.light & 0xFF, base.light & 0xFF)
    }

    // MARK: - DisclosureToneBadge

    func test_tone_labels_match_web_literals() {
        XCTAssertEqual(JdDisclosureTone.positive.label, "호재")
        XCTAssertEqual(JdDisclosureTone.negative.label, "악재")
        XCTAssertEqual(JdDisclosureTone.neutral.label, "중립")
        XCTAssertEqual(JdDisclosureCategory.allCases.count, 9, "웹 CATEGORY_LABELS 9종")
        XCTAssertEqual(JdDisclosureCategory.litigation.label, "분쟁/제재")
    }

    // 중립은 색이 아니라 무채 틴트다 — 톤이 없다는 뜻을 색으로도 말한다
    func test_neutral_tone_is_achromatic() {
        let positive = JdDisclosureToneBadgeSpec.resolve(tone: .positive)
        let neutral = JdDisclosureToneBadgeSpec.resolve(tone: .neutral)
        XCTAssertNotEqual(positive.background.light, neutral.background.light)
        XCTAssertEqual(neutral.foreground.light, JdToken.Color.muted.light)
    }

    func test_confidence_text_hides_zero_and_clamps() {
        XCTAssertNil(JdDisclosureToneBadgeSpec.confidenceText(0))
        XCTAssertNil(JdDisclosureToneBadgeSpec.confidenceText(-1))
        XCTAssertNil(JdDisclosureToneBadgeSpec.confidenceText(.nan))
        XCTAssertEqual(JdDisclosureToneBadgeSpec.confidenceText(0.874), "87%")
        XCTAssertEqual(JdDisclosureToneBadgeSpec.confidenceText(5), "100%", "1 초과는 클램프")
    }

    // compact이 세부를 숨겨도 낭독은 전부 — 웹 v2엔 접근 이름이 아예 없었다
    func test_compact_hides_detail_but_keeps_full_accessibility() {
        let full = JdDisclosureToneBadgeView(tone: .positive, category: .earnings, confidence: 0.87)
        let compact = JdDisclosureToneBadgeView(tone: .positive, category: .earnings,
                                                confidence: 0.87, compact: true)
        XCTAssertFalse(full.categoryLabel.isHidden)
        XCTAssertTrue(compact.categoryLabel.isHidden)
        XCTAssertTrue(compact.confidenceLabel.isHidden)
        XCTAssertEqual(compact.accessibilityLabel, "호재 · 실적 · 신뢰도 87%")
        XCTAssertEqual(full.accessibilityLabel, compact.accessibilityLabel,
                       "compact이 낭독까지 줄이면 정보가 사라진다")
    }

    func test_confidence_zero_hides_only_that_label() {
        let view = JdDisclosureToneBadgeView(tone: .negative, category: .litigation, confidence: 0)
        XCTAssertTrue(view.confidenceLabel.isHidden)
        XCTAssertFalse(view.categoryLabel.isHidden)
        XCTAssertEqual(view.accessibilityLabel, "악재 · 분쟁/제재")
    }

    func test_tone_badge_reacts_to_prop_changes() {
        let view = JdDisclosureToneBadgeView(tone: .neutral)
        let neutralBg = view.backgroundColor?.resolvedColor(with: light)
        view.tone = .negative
        XCTAssertNotEqual(view.backgroundColor?.resolvedColor(with: light), neutralBg)
        XCTAssertEqual(view.toneLabel.text, "악재")
    }

    // compact은 높이가 낮다 — 표 행에 들어가는 것이 존재 이유다
    func test_compact_is_shorter() {
        XCTAssertLessThan(JdDisclosureToneBadgeSpec.resolve(tone: .positive, compact: true).height,
                          JdDisclosureToneBadgeSpec.resolve(tone: .positive).height)
    }

    // MARK: - ThemeTagList

    func test_chip_colors_rotate_by_index() {
        let list = JdThemeTagListView(themes: ["반도체", "2차전지", "바이오", "조선", "원전", "AI"])
        let chips = list.wrap.arrangedViews.compactMap { $0 as? JdThemeChipView }
        XCTAssertEqual(chips.count, 6)
        let colors = chips.map { $0.backgroundColor?.resolvedColor(with: light) }
        // 6번째가 1번째와 같은 색으로 돌아온다(팔레트 5종 회전)
        XCTAssertEqual(colors[0], colors[5])
        XCTAssertNotEqual(colors[0], colors[1])
    }

    func test_chip_label_hides_hash_from_voiceover() {
        let chip = JdThemeChipView(theme: "반도체")
        XCTAssertEqual(chip.accessibilityLabel, "반도체", "낭독에 '샵'이 들어가면 안 된다")
        XCTAssertEqual(chip.label.attributedText?.string, "#반도체")
    }

    // 탭 콜백이 있을 때만 링크가 된다 — 표시 전용 칩이 눌리는 것처럼 보이면 안 된다
    func test_chip_is_link_only_when_tappable() {
        let plain = JdThemeChipView(theme: "반도체")
        XCTAssertFalse(plain.accessibilityTraits.contains(.link))
        XCTAssertTrue(plain.gestureRecognizers?.isEmpty ?? true)

        var tapped: String?
        let list = JdThemeTagListView(themes: ["반도체"]) { tapped = $0 }
        let chip = list.wrap.arrangedViews.first as? JdThemeChipView
        XCTAssertTrue(chip?.accessibilityTraits.contains(.link) ?? false)
        chip?.onTap?()
        XCTAssertEqual(tapped, "반도체")
    }

    // 목록이 줄바꿈으로 흐른다 — JdWrapView 위에 얹은 것이 실제로 동작하는지
    func test_tag_list_wraps_and_reports_height() {
        let list = JdThemeTagListView(themes: ["반도체", "2차전지", "바이오", "조선", "원전", "AI", "로봇", "우주"])

        // 칩은 내용 폭이어야 한다 — 컨테이너 폭을 요구하면 한 줄에 하나씩 놓인다
        let chip = list.wrap.arrangedViews[0]
        let natural = JdMeasure.flowSize(of: chip, maxWidth: 900)
        XCTAssertLessThan(natural.width, 200,
                          "칩 자연 폭이 \(natural.width) — 컨테이너 폭으로 강제되고 있다")

        let wide = list.sizeThatFits(CGSize(width: 900, height: CGFloat.greatestFiniteMagnitude)).height
        let narrow = list.sizeThatFits(CGSize(width: 160, height: CGFloat.greatestFiniteMagnitude)).height
        XCTAssertGreaterThan(wide, 0)
        XCTAssertGreaterThan(narrow, wide,
                             "좁아졌는데 높이가 늘지 않았다(wide \(wide) / narrow \(narrow)) — 줄바꿈이 안 된다")
    }

    func test_empty_theme_list_is_safe() {
        let list = JdThemeTagListView(themes: [])
        XCTAssertEqual(list.sizeThatFits(CGSize(width: 300, height: 300)).height, 0)
    }

    // MARK: - LivePrice (DEC-048)

    // 최초 표시에서는 절대 번쩍이지 않는다 — 화면에 처음 뜨는 순간의 플래시는
    // "값이 바뀌었다"는 거짓 신호다(웹 #started 게이트와 같은 규칙)
    func test_live_price_does_not_flash_on_first_display() {
        XCTAssertNil(JdLivePriceSpec.flashTrend(previous: nil, current: 71_200))
        let view = JdLivePriceView(price: 71_200)
        XCTAssertNil(view.backgroundColor?.cgColor.alpha == 0 ? nil : view.backgroundColor,
                     "최초 표시에서 배경이 칠해졌다")
    }

    func test_live_price_flash_direction() {
        XCTAssertEqual(JdLivePriceSpec.flashTrend(previous: 100, current: 110), .up)
        XCTAssertEqual(JdLivePriceSpec.flashTrend(previous: 110, current: 100), .down)
        XCTAssertNil(JdLivePriceSpec.flashTrend(previous: 100, current: 100), "같으면 안 켠다")
        XCTAssertNil(JdLivePriceSpec.flashTrend(previous: .nan, current: 100))
    }

    // 색은 방향과 무관하게 늘 상승색 — 방향은 플래시 배경이 말한다(웹 라이브 티커 관습)
    func test_live_price_text_color_is_always_up() {
        for size in JdLivePriceSize.allCases {
            XCTAssertEqual(JdLivePriceSpec.resolve(size: size).textColor.light,
                           JdFinanceTheme.up.light, "\(size)")
        }
        XCTAssertNotEqual(JdLivePriceSpec.flashColor(.up).light,
                          JdLivePriceSpec.flashColor(.down).light,
                          "플래시가 방향을 구분하지 않으면 색 정보가 아예 없다")
    }

    func test_live_price_size_ramp() {
        XCTAssertLessThan(JdLivePriceSize.sm.fontSize, JdLivePriceSize.md.fontSize)
        XCTAssertLessThan(JdLivePriceSize.md.fontSize, JdLivePriceSize.lg.fontSize)
        let view = JdLivePriceView(price: 71_200)
        let md = view.font.pointSize
        view.size = .lg
        XCTAssertGreaterThan(view.font.pointSize, md)
    }

    // 파생 관계 — 포맷 골격은 부모 것을 그대로 쓴다
    func test_live_price_inherits_format_skeleton() {
        let view = JdLivePriceView(price: 71_200)
        XCTAssertTrue(view is JdLivePriceTextView, "파생 관계가 끊겼다")
        XCTAssertEqual(view.text, "71,200")
        view.price = 0
        view.fallback = 0
        XCTAssertEqual(view.text, JdFinanceFormat.emDash)
    }
}
