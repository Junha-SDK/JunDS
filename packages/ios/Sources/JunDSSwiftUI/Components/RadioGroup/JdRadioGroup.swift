import SwiftUI
import JunDSCore

// 웹 jd-radio-group 동형 — 옵션 배열 + 단일 선택 (role=radiogroup 등가).
// iOS엔 라디오 관용구가 없어 SF Symbols 자체 드로잉이다 (04 §10.1 primitives).
//
// a11y(04 §7.1 + DESIGN-2 §B1): 각 행이 .isButton + 선택 시 .isSelected를 갖는 개별 요소이고,
// 그룹 자체의 라벨(웹 aria-label)은 소비자 몫이다 — 컴포넌트가 임의 문자열을 만들지 않는다.
public struct JdRadioGroup: View {
    private let options: [JdRadioOption]
    private let axis: JdAxis
    private let spec: JdChoiceSpec
    private let isEnabled: Bool
    @Binding private var selection: String?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(_ options: [JdRadioOption],
                selection: Binding<String?>,
                axis: JdAxis = .vertical,
                size: JdToggleSize = .md,
                isEnabled: Bool = true) {
        self.options = options
        self.axis = axis
        self.spec = JdChoiceSpec.resolve(size: size)
        self.isEnabled = isEnabled
        self._selection = selection
    }

    public var body: some View {
        switch axis {
        case .vertical:
            // 웹: flex-direction column · gap 8(--jd-space-2) = JdChoiceSpec.gap
            VStack(alignment: .leading, spacing: spec.gap) {
                rows
            }
        case .horizontal:
            // 웹: flex-direction row + flex-wrap wrap — 좁은 폭에서 다음 줄로 넘어간다
            JdFlowLayout(spacing: spec.gap) {
                rows
            }
        }
    }

    private var rows: some View {
        ForEach(options) { option in
            row(option)
        }
    }

    private func row(_ option: JdRadioOption) -> some View {
        let isSelected = (selection == option.value)
        // 웹 update(): 그룹 disabled 또는 옵션 disabled면 그 행이 비활성
        let isRowDisabled = !isEnabled || option.isDisabled
        return HStack(spacing: spec.gap) {
            Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                .font(symbolFont)
                .foregroundColor((isSelected ? JdToken.Color.primary : JdToken.Color.border).color)
            Text(option.label)
                .font(labelFont)
                .foregroundColor(JdToken.Color.foreground.color)
        }
        // 웹 <label> 래핑 동형 — 텍스트를 눌러도 선택된다
        .contentShape(Rectangle())
        .onTapGesture { selection = option.value }
        .disabled(isRowDisabled)
        .opacity(isRowDisabled ? JdToken.Opacity.o50 : 1)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(option.label))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }

    private var symbolFont: Font {
        // 심볼 크기 = 스펙 boxSize(md 16 / sm 14). 폰트 경유라 Dynamic Type에 함께 자란다.
        JdSwiftUIFont.scaled(size: spec.boxSize,
                             weight: JdToken.FontWeight.normal,
                             category: sizeCategory)
    }

    private var labelFont: Font {
        JdSwiftUIFont.scaled(size: spec.labelFontSize,
                             weight: JdToken.FontWeight.normal,
                             category: sizeCategory)
    }
}
