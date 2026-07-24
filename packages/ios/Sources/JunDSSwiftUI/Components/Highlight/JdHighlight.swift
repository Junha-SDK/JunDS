import SwiftUI
import JunDSCore

// 웹 jd-highlight 동형 — 검색어 강조 (DESIGN-3 §C).
//
// ⚠️ 타입명이 **JdHighlightText**인 이유: Core에 이미 `enum JdHighlight`(segments 계산)가 있고
//    우산 타겟이 Core/SwiftUI를 함께 재수출하므로 같은 이름이면 소비처에서 모호해진다.
//    Core 우선 — 뷰가 이름을 양보한다(UIKit 사본은 JdHighlightTextView).
//
// 구간 계산은 **전부 Core의 JdHighlight.segments**다. 이 파일은 세그먼트를 받아 칠하기만 한다
// (04 §4.2 규칙 2 — 계층은 수집·호출·그리기. 자체 매칭은 금지).
public struct JdHighlightText: View {
    private let text: String
    private let query: String
    private let color: JdMarkColor

    public init(_ text: String, query: String, color: JdMarkColor = .yellow) {
        self.text = text
        self.query = query
        self.color = color
    }

    public var body: some View {
        Text(attributed)
            // 조각을 나눠 읽히지 않도록 원문 전체를 라벨 1개로 노출한다 (04 §7.1)
            .accessibilityLabel(Text(text))
    }

    // 세그먼트 → AttributedString. 폰트는 지정하지 않아 둘러싼 문단 서체를 상속한다.
    private var attributed: AttributedString {
        var result = AttributedString()
        for segment in JdHighlight.segments(text: text, query: query) {
            var run = AttributedString(segment.text)
            if segment.isMatch {
                run.foregroundColor = JdMarkPalette.foreground(color).color
                run.backgroundColor = JdMarkPalette.background(color).color
            } else {
                run.foregroundColor = JdToken.Color.foreground.color
            }
            result.append(run)
        }
        return result
    }
}
