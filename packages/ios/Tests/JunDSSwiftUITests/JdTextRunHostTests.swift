import XCTest
import SwiftUI
import JunDS

// SwiftUI 계층은 호스팅 스모크로 계약을 지킨다 — 표면 파라미터 전부를 한 번씩 통과시키고
// 크기 축·조건부 요소의 단조성만 확인한다 (DESIGN-2 §C / DESIGN-3 §E).
final class JdTextRunHostTests: XCTestCase {

    private let fit = CGSize(width: 320, height: 400)

    private func measure<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view).sizeThatFits(in: fit)
    }

    // 1. Code — variant 5 × size 3 전 조합 + 크기 램프 비감소
    func test_jdCode_hosts_all_combinations_and_ramps() {
        for variant in JdCodeVariant.allCases {
            for size in JdControlSize.allCases {
                let measured = measure(JdCode("npm run build", variant: variant, size: size))
                XCTAssertGreaterThan(measured.width, 0, "\(variant)/\(size)")
                XCTAssertGreaterThan(measured.height, 0, "\(variant)/\(size)")
            }
        }

        let heights = JdControlSize.allCases.map { measure(JdCode("x", size: $0)).height }
        for (smaller, larger) in zip(heights, heights.dropFirst()) {
            XCTAssertLessThanOrEqual(smaller, larger)
        }
        XCTAssertGreaterThan(heights.last ?? 0, heights.first ?? 0)
    }

    // 2. Mark — 5색 × 배경형/밑줄형. 배경형은 padding-inline만큼 더 넓다
    func test_jdMark_hosts_every_color_in_both_shapes() {
        for color in JdMarkColor.allCases {
            for underline in [false, true] {
                let measured = measure(JdMark("형광펜", color: color, underline: underline))
                XCTAssertGreaterThan(measured.height, 0, "\(color)/\(underline)")
            }
        }

        let filled = measure(JdMark("형광펜"))
        let underlined = measure(JdMark("형광펜", underline: true))
        XCTAssertGreaterThan(filled.width, underlined.width) // 웹 padding-inline 동형
    }

    // 3. Highlight — 매치 유무와 무관하게 원문 폭을 유지한다(구간만 칠한다)
    func test_jdHighlightText_hosts_with_and_without_matches() {
        let matched = measure(JdHighlightText("Swift와 swiftUI", query: "swift"))
        let unmatched = measure(JdHighlightText("Swift와 swiftUI", query: "kotlin"))
        let empty = measure(JdHighlightText("Swift와 swiftUI", query: ""))
        XCTAssertGreaterThan(matched.height, 0)
        XCTAssertEqual(matched.width, unmatched.width, accuracy: 0.5)
        XCTAssertEqual(matched.width, empty.width, accuracy: 0.5)
    }

    // 4. Link — variant 3 × 외부 여부 + destination nil(비활성 링크)
    func test_jdLink_hosts_all_variants_with_and_without_destination() {
        let url = URL(string: "https://junds.dev")
        for variant in JdLinkVariant.allCases {
            for isExternal in [false, true] {
                let measured = measure(JdLink("문서", destination: url,
                                              variant: variant, isExternal: isExternal))
                XCTAssertGreaterThan(measured.width, 0, "\(variant)/\(isExternal)")
            }
        }

        XCTAssertGreaterThan(measure(JdLink("문서", destination: nil)).width, 0)
        XCTAssertGreaterThan(measure(JdLink("문서", destination: url, underline: false)).width, 0)

        // 외부 표식(심볼 + gap)이 붙으면 넓어진다
        let plain = measure(JdLink("문서", destination: url))
        let external = measure(JdLink("문서", destination: url, isExternal: true))
        XCTAssertGreaterThan(external.width, plain.width)
    }

    // 5. MentionChip — label 폴백 / 인증 마크 / 링크 목적지
    func test_jdMentionLabel_hosts_fallback_verified_and_linked() {
        let url = URL(string: "https://junds.dev/@junha")
        XCTAssertGreaterThan(measure(JdMentionLabel(handle: "junha")).width, 0)
        XCTAssertGreaterThan(measure(JdMentionLabel(handle: "junha", label: "준하")).width, 0)
        XCTAssertGreaterThan(measure(JdMentionLabel(handle: "junha", destination: url)).width, 0)

        let plain = measure(JdMentionLabel(handle: "junha"))
        let verified = measure(JdMentionLabel(handle: "junha", isVerified: true))
        XCTAssertGreaterThan(verified.width, plain.width) // 인증 심볼 + gap
    }

    // 6. Hashtag — 카운트/인기 표식/링크 목적지
    func test_jdHashtagLabel_hosts_count_trending_and_linked() {
        let url = URL(string: "https://junds.dev/tags/swift")
        XCTAssertGreaterThan(measure(JdHashtagLabel(tag: "swift")).width, 0)
        XCTAssertGreaterThan(measure(JdHashtagLabel(tag: "swift", destination: url)).width, 0)

        let plain = measure(JdHashtagLabel(tag: "swift"))
        let counted = measure(JdHashtagLabel(tag: "swift", count: 1500))
        let trending = measure(JdHashtagLabel(tag: "swift", isTrending: true))
        XCTAssertGreaterThan(counted.width, plain.width)   // "(1.5천)"
        XCTAssertGreaterThan(trending.width, plain.width)  // 🔥 대응 심볼
    }

    // Motion — 프리셋 전부가 호스팅되고 **레이아웃 크기를 바꾸지 않는다**
    // (등장 연출은 opacity/offset/scale이라 자리 크기는 원본과 같아야 한다)
    func test_jdMotion_hosts_every_preset_without_changing_layout_size() {
        let base = measure(JdText("등장"))
        for preset in JdMotionPreset.allCases {
            let measured = measure(JdText("등장").jdMotion(preset))
            XCTAssertEqual(measured.width, base.width, accuracy: 0.5, "\(preset)")
            XCTAssertEqual(measured.height, base.height, accuracy: 0.5, "\(preset)")
        }
        // delay 인자도 표면을 통과한다
        XCTAssertGreaterThan(measure(JdText("등장").jdMotion(.fadeIn, delay: 0.1)).height, 0)
    }
}
