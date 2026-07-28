import JunDSCore
import SwiftUI

// 웹 jd-range-slider 동형 — 두 손잡이 범위 슬라이더 (DESIGN-2 §B1).
// 네이티브 컨트롤이 단일 값뿐이라 웹처럼 자체 드로잉한다(위임 예외).
// ⚠️ 클램프·양자화·최소 간격 유지는 **전부 Core JdRangeState**가 한다 — 이 계층은
// fraction만 읽어 그리고, 드래그 좌표를 value(atFraction:)로 되돌려 넘길 뿐이다
// (04 §4.2 규칙 3: 렌더 계층에 판정 재구현 금지).
public struct JdRangeSlider: View {
    @Binding private var state: JdRangeState
    private let showsValues: Bool
    private let format: ((Double) -> String)?

    @State private var activeHandle: JdRangeHandle?
    @State private var gestureBegan = false

    @Environment(\.sizeCategory) private var sizeCategory
    @Environment(\.isEnabled) private var isEnabled

    // 웹 트랙 히트 영역 1.25rem = 손잡이 지름과 동일. 손잡이 전용 치수가 스펙에 없어
    // 토큰으로 표기한다(Space.s5 = 20 — DESIGN-2가 고정한 20pt).
    private static let thumbSide = JdToken.Space.s5
    private static let trackHeight = JdSliderSpec.resolve(size: .md).trackHeight

    public init(
        state: Binding<JdRangeState>,
        showsValues: Bool = false,
        format: ((Double) -> String)? = nil
    ) {
        self._state = state
        self.showsValues = showsValues
        self.format = format
    }

    public var body: some View {
        // 값 행 아래 여백은 웹 margin-bottom var(--jd-space-1)
        VStack(alignment: .leading, spacing: JdToken.Space.s1) {
            if showsValues {
                valuesRow
            }
            track
        }
        .opacity(isEnabled ? 1 : JdToken.Opacity.o50)  // 웹 [disabled] opacity-50
    }

    // MARK: - 값 행 (웹 show-values 동형)

    private var valuesRow: some View {
        HStack(spacing: JdToken.Space.s2) {
            Text(display(state.lower))
            Spacer(minLength: JdToken.Space.s2)
            Text(display(state.upper))
        }
        .font(
            JdSwiftUIFont.scaled(
                size: JdTextSpec.resolve(size: .xs).fontSize,
                weight: JdToken.FontWeight.normal,
                category: sizeCategory)
        )
        .foregroundColor(JdToken.Color.muted.color)
        // 두 손잡이가 각자 값을 낭독하므로 시각 중복 — 장식 처리 (04 §7.1)
        .accessibilityHidden(true)
    }

    // MARK: - 트랙

    private var track: some View {
        GeometryReader { proxy in
            let width = proxy.size.width
            let lowerX = width * CGFloat(state.lowerFraction)
            let upperX = width * CGFloat(state.upperFraction)
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(JdSliderSpec.railColor.color)
                    .frame(height: Self.trackHeight)
                Capsule()
                    .fill(JdToken.Color.primary.color)
                    .frame(width: max(0, upperX - lowerX), height: Self.trackHeight)
                    .offset(x: lowerX)
                thumb(.lower, at: lowerX)
                thumb(.upper, at: upperX)
            }
            .frame(width: width, height: Self.thumbSide)
            .contentShape(Rectangle())
            .gesture(drag(width: width))
        }
        .frame(height: Self.thumbSide)
    }

    /// 웹 썸: 20pt 흰 원 + 2pt primary 테두리. 흰색 리터럴 대신 card 토큰을 쓴다 —
    /// 라이트에서 #fff로 동일하고, 다크에서 순백 대비가 깨지는 웹 결함을 함께 보정한다.
    private func thumb(_ handle: JdRangeHandle, at x: CGFloat) -> some View {
        Circle()
            .fill(JdToken.Color.card.color)
            .overlay(
                Circle().strokeBorder(JdToken.Color.primary.color, lineWidth: JdToken.Border.medium)
            )
            .frame(width: Self.thumbSide, height: Self.thumbSide)
            .offset(x: x - Self.thumbSide / 2)
            .accessibilityElement()
            .accessibilityLabel(Text(handle.label))
            .accessibilityValue(Text(display(handle == .lower ? state.lower : state.upper)))
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: adjust(handle, by: state.step)
                case .decrement: adjust(handle, by: -state.step)
                @unknown default: break
                }
            }
    }

    // MARK: - 입력 (좌표 수집 → Core 호출 → 그리기, 그 외 동사 없음)

    private func drag(width: CGFloat) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { gesture in
                let span = max(width, 1)
                let fraction = Double(gesture.location.x / span)
                if !gestureBegan {
                    gestureBegan = true
                    // 웹은 썸 위 pointerdown만 드래그를 시작한다 — 레일 탭으로 값이 튀지 않게 동형 유지
                    activeHandle = handle(near: fraction, width: span)
                }
                guard let handle = activeHandle else { return }
                let value = state.value(atFraction: fraction)
                switch handle {
                case .lower: state.setLower(value)
                case .upper: state.setUpper(value)
                }
            }
            .onEnded { _ in
                gestureBegan = false
                activeHandle = nil
            }
    }

    /// 손잡이 히트 판정 — 두 손잡이 중 가까운 쪽, 지름 밖이면 무시
    private func handle(near fraction: Double, width: CGFloat) -> JdRangeHandle? {
        let x = CGFloat(min(max(fraction, 0), 1)) * width
        let lowerDistance = abs(x - width * CGFloat(state.lowerFraction))
        let upperDistance = abs(x - width * CGFloat(state.upperFraction))
        let nearest = min(lowerDistance, upperDistance)
        guard nearest <= Self.thumbSide else { return nil }
        return lowerDistance <= upperDistance ? .lower : .upper
    }

    private func adjust(_ handle: JdRangeHandle, by delta: Double) {
        switch handle {
        case .lower: state.setLower(state.lower + delta)
        case .upper: state.setUpper(state.upper + delta)
        }
    }

    private func display(_ value: Double) -> String {
        if let format { return format(value) }
        // 웹 String(value) 동형 — 정수 값은 소수점 없이 표기
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}

/// 두 손잡이 식별 + 웹 aria-label 리터럴("최솟값"/"최댓값") 동형.
/// DEC-010으로 UIKit 계층과 타입을 공유하지 않는다 — 리터럴만 같은 값을 쓴다.
private enum JdRangeHandle {
    case lower
    case upper

    var label: String {
        switch self {
        case .lower: return "최솟값"
        case .upper: return "최댓값"
        }
    }
}
