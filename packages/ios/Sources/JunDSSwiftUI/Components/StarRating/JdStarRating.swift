import JunDSCore
import SwiftUI

// 웹 jd-star-rating 동형 — iOS에 시스템 대응이 없는 진짜 신규 컴포넌트 (DESIGN-3 §B).
//
// ⚠️ **접근성이 이 컴포넌트의 본체다**: 별 N개를 각각 버튼으로 노출하면 VoiceOver 사용자는
//    "별 3개 버튼"들 사이를 훑을 뿐 값을 조절하지 못한다. 그래서 별들은 전부 장식으로 합치고
//    (children: .ignore) **컨트롤 하나**에 adjustable을 준다 — 위/아래 스와이프로 0.5씩.
//
// 별 상태·탭 값은 Core(JunDSCore.JdStarRating)가 단일 소스다. 같은 이름의 뷰 타입이라
// 모듈 한정자로 호출한다(04 §4.2 규칙 3 — 렌더 계층에 판정 재구현 금지).
public struct JdStarRating: View {
    @Binding private var value: Double
    private let starCount: Int
    private let side: CGFloat
    private let isReadOnly: Bool
    private let label: String

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    /// Core의 fill 판정이 0.5 단위이므로 조절 단위도 0.5다(웹 반별 토글과 같은 격자).
    private static let step: Double = 0.5

    public init(
        value: Binding<Double>,
        max: Int = 5,
        size: JdIconSize = .md,
        isReadOnly: Bool = false,
        accessibilityLabel: String = "별점"
    ) {
        self._value = value
        self.starCount = max
        self.side = size.side
        self.isReadOnly = isReadOnly
        self.label = accessibilityLabel
    }

    public var body: some View {
        if isReadOnly {
            // 읽기 전용은 조절 불가 — 값만 읽어주는 단일 요소
            stars
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(label))
                .accessibilityValue(Text(valueText))
        } else {
            stars
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(label))
                .accessibilityValue(Text(valueText))
                .accessibilityAdjustableAction { direction in
                    switch direction {
                    case .increment: adjust(by: Self.step)
                    case .decrement: adjust(by: -Self.step)
                    @unknown default: break
                    }
                }
        }
    }

    // MARK: - 별 행 (전부 장식 — 접근성 표면은 부모 하나뿐)

    private var stars: some View {
        HStack(spacing: JdToken.Space.s1) {
            ForEach(0..<starCount, id: \.self) { index in
                star(index)
            }
        }
    }

    private func star(_ index: Int) -> some View {
        // 상태 판정은 Core — 임계값(0.5/1.0)을 여기서 다시 쓰지 않는다
        let fill = JunDSCore.JdStarRating.fill(index: index, value: value)
        return Image(systemName: Self.symbol(fill))
            .font(
                JdSwiftUIFont.scaled(
                    size: side,
                    weight: JdToken.FontWeight.medium,
                    category: sizeCategory)
            )
            .foregroundColor(Self.tint(fill).color)
            .contentShape(Rectangle())
            .onTapGesture {
                guard !isReadOnly else { return }
                // 같은 별 재탭 시 반값 — 규칙 전부 Core 소유
                value = JunDSCore.JdStarRating.value(forTappedIndex: index, current: value)
            }
    }

    // MARK: - 값

    private func adjust(by delta: Double) {
        // 0…max 클램프도 Core 규칙 재사용(JdNumberInputRules.clamp)
        value = JdNumberInputRules.clamp(value + delta, min: 0, max: Double(starCount))
    }

    /// 낭독 문자열 — 숫자 표기는 JdNumberFormat이 단일 소스다
    private var valueText: String {
        let current = JdNumberFormat.string(value: value, style: .decimal)
        let total = JdNumberFormat.string(value: Double(starCount), style: .decimal)
        return "\(total)점 만점에 \(current)점"
    }

    // MARK: - 심볼·색 (DESIGN-3 §B 지정)

    private static func symbol(_ fill: JdStarFill) -> String {
        switch fill {
        case .full: return "star.fill"
        case .half: return "star.leadinghalf.filled"
        case .empty: return "star"
        }
    }

    private static func tint(_ fill: JdStarFill) -> JdDynamicColor {
        switch fill {
        case .full, .half: return JdToken.Color.warning
        case .empty: return JdToken.Color.border
        }
    }
}
