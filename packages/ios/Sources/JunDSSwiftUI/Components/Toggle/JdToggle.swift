import JunDSCore
import SwiftUI

// 웹 jd-toggle · jd-switch 동형 — 웹은 두 태그(Switch가 Toggle의 서브클래스)지만
// iOS는 같은 시스템 컨트롤이라 단일 구현 + 별칭이다 (R12, DESIGN-2 §B1).
//
// 04 §10.1 "시스템 컨트롤 스킨 우선": JdToggleSpec의 트랙/썸 기하(sm 36×20 … lg 56×28)는
// **레이아웃 참고치**일 뿐 픽셀 재현 대상이 아니다 — 크기 축은 시스템 어휘(ControlSize)로 번역하고,
// 스펙에서 실제로 쓰는 값은 라벨 폰트 크기뿐이다.
public struct JdToggle: View {
    private let label: String?
    private let size: JdToggleSize
    private let spec: JdToggleSpec
    @Binding private var isOn: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ label: String? = nil,
        isOn: Binding<Bool>,
        size: JdToggleSize = .md
    ) {
        self.label = label
        self.size = size
        self.spec = JdToggleSpec.resolve(size: size)
        self._isOn = isOn
    }

    public var body: some View {
        if hasLabel {
            control
        } else {
            // 웹의 텍스트 슬롯 미출력 동형. 라벨을 감추어도 스위치 트레이트·값(켬/끔)은
            // 시스템이 스스로 읽으므로 트레이트에 손대지 않는다 (04 §7.1 — 상태는 traits로).
            control.labelsHidden()
        }
    }

    private var hasLabel: Bool {
        guard let label else { return false }
        return !label.isEmpty
    }

    private var control: some View {
        Toggle(isOn: $isOn) {
            Text(label ?? "")
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.labelFontSize,
                        weight: JdToken.FontWeight.normal,
                        category: sizeCategory)
                )
                .foregroundColor(JdToken.Color.foreground.color)
        }
        .toggleStyle(.switch)
        .tint(JdToken.Color.primary.color)
        .controlSize(controlSize)
    }

    // 웹 sm/md/lg → 시스템 크기 축. 기하 리터럴을 다시 그리는 대신 시스템 어휘로 옮긴다.
    private var controlSize: ControlSize {
        switch size {
        case .sm: return .mini
        case .md: return .regular
        case .lg: return .large
        }
    }
}

/// 웹 `<jd-switch>`는 `<jd-toggle>`의 서브클래스(표면 차 = size lg 추가·썸 그림자)지만
/// iOS는 양쪽 모두 같은 시스템 스위치로 귀결되므로 별칭 한 줄이 정본이다 (R12).
public typealias JdSwitch = JdToggle
