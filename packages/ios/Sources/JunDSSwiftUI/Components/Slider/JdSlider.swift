import JunDSCore
import SwiftUI

// 웹 jd-slider 동형 — 값 슬라이더 (DESIGN-2 §B1).
// 웹이 네이티브 input[type=range]에 위임했듯 iOS도 시스템 Slider에 위임한다
// (04 §10.1 "시스템 컨트롤 스킨 우선" — 픽셀 동형은 목표가 아니다). JdSliderSpec의
// 트랙·썸 치수는 레이아웃 참고치로 보존만 하고 실제 드로잉은 시스템이 한다.
// 이 계층이 직접 그리는 것은 헤더 행과 마크뿐이고, 값 축 계산(step 정규화·fraction)은
// Core의 JdRangeState가 단일 소스다 (04 §4.2 규칙 3 — 렌더 계층에 판정 재구현 금지).
public struct JdSlider: View {
    private let bounds: ClosedRange<Double>
    private let spec: JdSliderSpec
    private let accent: JdDynamicColor
    private let showsValue: Bool
    private let marks: [JdSliderMark]
    private let format: ((Double) -> String)?
    /// 값 축 계산 전용 — 손잡이 상태(lower/upper)는 쓰지 않고 step 정규화·fraction만 빌린다
    private let axis: JdRangeState

    @Binding private var value: Double

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        value: Binding<Double>,
        in bounds: ClosedRange<Double> = 0...100,
        step: Double = 1,
        color: JdSliderColor = .primary,
        size: JdToggleSize = .md,
        showsValue: Bool = false,
        marks: [JdSliderMark] = [],
        format: ((Double) -> String)? = nil
    ) {
        self._value = value
        self.bounds = bounds
        self.spec = JdSliderSpec.resolve(size: size)
        self.accent = JdSliderSpec.accent(color)
        self.showsValue = showsValue
        self.marks = marks
        self.format = format
        self.axis = JdRangeState(bounds: bounds, step: step)
    }

    public var body: some View {
        // 헤더 아래 여백은 웹 margin-bottom var(--jd-space-1-5)
        VStack(alignment: .leading, spacing: JdToken.Space.s1_5) {
            if showsValue {
                header
            }
            Slider(value: $value, in: bounds, step: axis.step)
                .tint(accent.color)
                // 시스템 기본 낭독은 백분율 — 표시값과 같은 문자열로 맞춘다(format 유무 무관)
                .accessibilityValue(Text(display(value)))
            if !marks.isEmpty {
                marksRow
            }
        }
    }

    // MARK: - 헤더 (웹 show-value 동형: min 좌 · 현재값 중앙 semibold · max 우)

    private var header: some View {
        HStack(alignment: .firstTextBaseline, spacing: JdToken.Space.s2) {
            Text(Self.plain(bounds.lowerBound))
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(display(value))
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.valueFontSize,
                        weight: JdToken.FontWeight.semibold,
                        category: sizeCategory)
                )
                .foregroundColor(JdToken.Color.foreground.color)
                .frame(maxWidth: .infinity, alignment: .center)
            Text(Self.plain(bounds.upperBound))
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .font(
            JdSwiftUIFont.scaled(
                size: spec.valueFontSize,
                weight: JdToken.FontWeight.normal,
                category: sizeCategory)
        )
        .foregroundColor(JdToken.Color.muted.color)
        // 슬라이더 자신이 값·최소·최대를 낭독하므로 헤더는 시각 중복 — 장식으로 숨긴다 (04 §7.1)
        .accessibilityHidden(true)
    }

    // MARK: - 마크 (웹 marks 동형 — 트랙 아래 틱 + 라벨, aria-hidden)

    /// 행 높이를 라벨 유무·Dynamic Type에 맞춰 자연스럽게 확보하는 템플릿.
    /// 고정 높이를 박으면 큰 글자 카테고리에서 라벨이 잘리므로 투명 사본으로 높이만 받는다.
    private var templateMark: JdSliderMark {
        marks.first(where: { $0.label != nil }) ?? marks[0]
    }

    private var marksRow: some View {
        markItem(templateMark)
            .hidden()
            .frame(maxWidth: .infinity, alignment: .leading)
            .overlay(
                GeometryReader { proxy in
                    ForEach(Array(marks.enumerated()), id: \.offset) { entry in
                        markItem(entry.element)
                            .position(
                                x: proxy.size.width
                                    * CGFloat(axis.fraction(of: entry.element.value)),
                                y: proxy.size.height / 2)
                    }
                }
            )
            .accessibilityHidden(true)
    }

    private func markItem(_ mark: JdSliderMark) -> some View {
        VStack(spacing: JdToken.Space.s0_5) {
            // 틱 — 웹 2×6px. 전용 스펙 부재분을 토큰 조합으로 표기한다(Border.medium × Space.s1_5).
            Rectangle()
                .fill(JdSliderSpec.railColor.color)
                .frame(width: JdToken.Border.medium, height: JdToken.Space.s1_5)
            if let label = mark.label {
                Text(label)
                    .font(
                        JdSwiftUIFont.scaled(
                            size: JdTextSpec.resolve(size: .xs2).fontSize,
                            weight: JdToken.FontWeight.normal,
                            category: sizeCategory)
                    )
                    .foregroundColor(JdToken.Color.muted.color)
                    .fixedSize()
            }
        }
        .padding(.top, JdToken.Space.s0_5)  // 웹 틱 margin-top 2px
    }

    // MARK: - 값 표기

    private func display(_ value: Double) -> String {
        if let format { return format(value) }
        return Self.plain(value)
    }

    /// 웹 String(value) 동형 — 정수 값은 소수점 없이 표기한다(min/max 라벨은 웹이 포맷을
    /// 적용하지 않으므로 항상 이 표기를 쓴다).
    private static func plain(_ value: Double) -> String {
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}
