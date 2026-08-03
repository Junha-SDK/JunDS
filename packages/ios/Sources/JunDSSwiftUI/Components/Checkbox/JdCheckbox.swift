import JunDSCore
import SwiftUI

// 웹 jd-checkbox 동형 — iOS엔 체크박스 관용구가 없어 SF Symbols 자체 드로잉이다
// (04 §10.1 primitives 항목). 3상태(JdCheckboxState)는 네이티브 input.indeterminate 등가.
//
// a11y(04 §7.1): 버튼이 아니라 **선택 상태를 가진 요소**로 노출한다 —
// .isButton 트레이트를 붙이지 않고 .isSelected + accessibilityValue로 상태를 말한다.
// 활성화는 기본 접근성 액션으로 제공(VoiceOver 이중 탭).
public struct JdCheckbox: View {
    private let label: String?
    private let spec: JdChoiceSpec
    private let indeterminateAllowed: Bool
    @Binding private var state: JdCheckboxState

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory
    // 소비자가 .disabled(true)를 걸면 웹 disabled(opacity 50%) 동형으로 흐려진다
    @Environment(\.isEnabled) private var isEnabled

    public init(
        _ label: String? = nil,
        state: Binding<JdCheckboxState>,
        size: JdToggleSize = .md,
        indeterminateAllowed: Bool = false
    ) {
        self.label = label
        self.spec = JdChoiceSpec.resolve(size: size)
        self.indeterminateAllowed = indeterminateAllowed
        self._state = state
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            Image(systemName: JdCheckbox.symbolName(state))
                .font(symbolFont)
                .foregroundColor(JdCheckbox.symbolColor(state).color)
            if let label, !label.isEmpty {
                Text(label)
                    .font(labelFont)
                    .foregroundColor(JdToken.Color.foreground.color)
            }
        }
        // 라벨 클릭 토글은 웹의 <label> 래핑 동형 — 행 전체가 히트 영역이다
        .contentShape(Rectangle())
        .onTapGesture { advance() }
        // 표식이 즉시 바뀌면 '무엇이 바뀌었는지' 눈이 못 따라간다 → 자리를 잡는 움직임
        // (웹 checkbox의 background-size overshoot 대응, DEC-039)
        .animation(JdMotion.settleAnimation(), value: state)
        .jdPressable(depth: .compact)
        .opacity(isEnabled ? 1 : JdToken.Opacity.o50)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(label ?? ""))
        .accessibilityAddTraits(state == .on ? .isSelected : [])
        .accessibilityValue(Text(JdCheckbox.accessibilityValue(state)))
        .accessibilityAction { advance() }
    }

    private var symbolFont: Font {
        // 심볼 크기 = 스펙 boxSize(md 16 / sm 14). 폰트 경유라 Dynamic Type에 함께 자란다.
        JdSwiftUIFont.scaled(
            size: spec.boxSize,
            weight: JdToken.FontWeight.normal,
            category: sizeCategory)
    }

    private var labelFont: Font {
        JdSwiftUIFont.scaled(
            size: spec.labelFontSize,
            weight: JdToken.FontWeight.normal,
            category: sizeCategory)
    }

    private func advance() {
        state = JdCheckbox.next(state, indeterminateAllowed: indeterminateAllowed)
    }

    // MARK: - 상태 규칙
    //
    // 웹 #onChange 동형: 사용자 조작은 mixed를 해제한다(네이티브 input 동작과 정합).
    // indeterminateAllowed면 3상태 순환 off → on → indeterminate → off.
    // ⚠️ 이 순환 규칙은 Core 스펙에 없어 두 계층에 각각 구현돼 있다(DEC-010으로 계층 간 공유 불가).
    //    JdCheckboxState의 Core 멤버로 승격할 후보 — DECISIONS 기록감.
    private static func next(
        _ state: JdCheckboxState, indeterminateAllowed: Bool
    ) -> JdCheckboxState {
        switch state {
        case .off:
            return .on
        case .on:
            return indeterminateAllowed ? .indeterminate : .off
        case .indeterminate:
            // 웹 네이티브: mixed에서 조작하면 checked로 확정된다
            return indeterminateAllowed ? .off : .on
        }
    }

    // DESIGN-2 §B1 지정 심볼
    private static func symbolName(_ state: JdCheckboxState) -> String {
        switch state {
        case .on: return "checkmark.square.fill"
        case .indeterminate: return "minus.square.fill"
        case .off: return "square"
        }
    }

    // 웹 accent-color: primary / 미선택 상자 테두리
    //
    // 미선택은 border(#e2dfe8)가 아니라 neutral-300이다 (DEC-039): border는 면과 면을
    // 가르는 색이라 흰 배경 위 1.3:1로, 빈 체크박스가 **있는지조차 안 보였다**.
    // 램프 300은 두 모드에서 같은 '컨트롤 윤곽' 위치를 지킨다(웹 체크박스와 동일 값).
    private static func symbolColor(_ state: JdCheckboxState) -> JdDynamicColor {
        switch state {
        case .on, .indeterminate: return JdToken.Color.primary
        case .off: return JdToken.Color.neutralN300
        }
    }

    // 상태 문자열은 라벨과 조합하지 않고 value 슬롯에만 넣는다 (04 §7.1)
    private static func accessibilityValue(_ state: JdCheckboxState) -> String {
        switch state {
        case .on: return "선택됨"
        case .off: return "선택 안 됨"
        case .indeterminate: return "부분 선택"
        }
    }
}
