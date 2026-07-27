import SwiftUI
import JunDSCore

/// 프레스 응답 (DEC-039).
///
/// 왜 필요한가: v3 iOS의 컨트롤 53종 중 움직임을 가진 것은 14종뿐이었고, 버튼조차
/// 배경색 교체만 했다. 색만 바뀌는 버튼은 손가락 밑에서 아무 일도 일어나지 않는 것으로
/// 읽힌다 — 손가락이 픽셀을 가리기 때문이다. 눌림은 **면적**으로 말해야 한다.
///
/// 스케일 값 근거: 44pt 컨트롤에서 0.97은 약 1.3pt 수축으로, 손가락 옆에서 겨우 보이는
/// 최소치다. 작은 컨트롤(아이콘 버튼 24~32pt)은 같은 비율이면 변화가 안 보이므로 더 깊게 준다.
public enum JdPressDepth {
    /// 일반 버튼·카드 — 0.97
    case standard
    /// 아이콘 버튼·체크박스처럼 작은 컨트롤 — 0.92
    case compact

    var scale: CGFloat {
        switch self {
        case .standard: return 0.97
        case .compact: return 0.92
        }
    }
}

public extension JdMotion {
    /// 프레스 복귀용 스프링. Reduce Motion이면 nil(즉시 전환)을 돌려준다 — 04 §7.3의
    /// 유일 진입점 규칙을 그대로 따른다.
    static func pressAnimation() -> Animation? {
        let duration = JdMotion.duration(JdToken.Duration.press)
        guard duration > 0 else { return nil }
        // response는 프레스 지속(90ms)에 맞추고 damping을 높여 되튐 없이 붙는다 —
        // 버튼은 자리를 잡는 물체가 아니라 눌리는 면이므로 오버슈트를 주지 않는다.
        return .interactiveSpring(response: duration * 3, dampingFraction: 0.86)
    }

    /// 스위치 썸·체크 표식처럼 **자리를 잡는** 움직임용. 웹의 easing.overshoot 대응.
    static func settleAnimation() -> Animation? {
        let duration = JdMotion.duration(JdToken.Duration.snap)
        guard duration > 0 else { return nil }
        let c = JdToken.Easing.overshoot
        return .timingCurve(c.0, c.1, c.2, c.3, duration: duration)
    }
}

/// 탭 제스처로 동작하는 컴포넌트(체크박스·라디오 등 Button이 아닌 것)를 위한 프레스 상태.
/// Button 기반 컴포넌트는 ButtonStyle의 `configuration.isPressed`를 쓰면 되므로 필요 없다.
public struct JdPressable: ViewModifier {
    private let depth: JdPressDepth
    @GestureState private var isPressed = false

    public init(depth: JdPressDepth = .standard) {
        self.depth = depth
    }

    public func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? depth.scale : 1)
            .animation(JdMotion.pressAnimation(), value: isPressed)
            // minimumDistance 0 — 손가락이 닿는 즉시 반응해야 '먹었다'로 읽힌다.
            // onTapGesture와 함께 써도 탭을 삼키지 않는다(업데이트만 하고 종료 액션 없음).
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .updating($isPressed) { _, state, _ in state = true }
            )
    }
}

public extension View {
    /// 눌림을 면적으로 표현한다. Button 기반이 아닌 컨트롤에 쓴다.
    func jdPressable(depth: JdPressDepth = .standard) -> some View {
        modifier(JdPressable(depth: depth))
    }

    /// ButtonStyle 안에서 `configuration.isPressed`를 그대로 넘겨 쓰는 축약.
    func jdPressScale(_ isPressed: Bool, depth: JdPressDepth = .standard) -> some View {
        scaleEffect(isPressed ? depth.scale : 1)
            .animation(JdMotion.pressAnimation(), value: isPressed)
    }
}
