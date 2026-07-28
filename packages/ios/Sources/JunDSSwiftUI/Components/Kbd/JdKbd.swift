import JunDSCore
import SwiftUI

// 웹 jd-kbd 동형 — 단축키 표기 칩. keys의 공백은 Core가 제거한다("⌘ K" → "⌘K").
// JdKbdSpec은 치수만 준다 — 색은 웹 CSS 매핑대로 토큰에서 읽는다
// (배경 #f9fafb ≈ cardHover · 테두리 border · 글자 muted · mono medium). 스펙 결손은 notes 보고.
// ⚠️ JdKbdSpec.gap(2)은 키를 개별 요소로 쪼갤 때의 간격이다 — iOS는 정규화된 한 문자열을
//    한 요소로 그리므로(웹 textContent 동형) 사용처가 없다.
public struct JdKbd: View {
    private let keys: String
    private let spec = JdKbdSpec.resolve()

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ keys: String) {
        self.keys = JdKbdSpec.normalize(keys: keys)
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        return Text(keys)
            .font(
                JdSwiftUIFont.scaledMono(
                    size: spec.fontSize,
                    weight: JdToken.FontWeight.medium,
                    category: sizeCategory)
            )
            .foregroundColor(JdToken.Color.muted.color)
            .padding(.horizontal, spec.hPadding)
            .padding(.vertical, spec.vPadding)
            .background(JdToken.Color.cardHover.color)
            .clipShape(shape)
            .overlay(
                shape.strokeBorder(
                    JdToken.Color.border.color,
                    lineWidth: JdToken.Border.thin))
    }
}
