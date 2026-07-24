import SwiftUI
import JunDSCore

// 웹 jd-motion 동형 — 등장 애니메이션 (DESIGN-3 §D).
// 웹이 CSS animation + @media (prefers-reduced-motion)으로 하는 일을 SwiftUI에서는
// 모디파이어 하나가 한다: 초기 상태에서 최종 상태로 한 번 전이하고, **Reduce Motion이면
// 전이 없이 처음부터 최종 상태**다 (04 §7.3 — 내용은 즉시 보이고 움직임만 사라진다).
public extension View {

    /// 등장 모션. Reduce Motion에서는 애니메이션 없이 즉시 최종 상태로 그려진다.
    func jdMotion(_ preset: JdMotionPreset, delay: TimeInterval = 0) -> some View {
        return modifier(JdMotionModifier(preset: preset, delay: delay))
    }
}

struct JdMotionModifier: ViewModifier {
    let preset: JdMotionPreset
    let delay: TimeInterval

    // 감속 판정 — SwiftUI는 환경값을 직접 읽는다 (04 §7.3)
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var isPresented = false

    /// 웹 keyframes의 이동량 24px = JdToken.Space.s6
    private static var travel: CGFloat { JdToken.Space.s6 }

    /// 웹 scale-in의 0.96 — 배율은 토큰 축이 아니라 대응 토큰이 없다(웹 리터럴 승계, notes 보고분)
    static let scaleFrom: CGFloat = 0.96

    func body(content: Content) -> some View {
        // 감속 선호면 onAppear를 기다리지 않고 처음부터 최종 상태다
        let settled = isPresented || reduceMotion
        return content
            .opacity(settled ? JdToken.Opacity.o100 : JdToken.Opacity.o0)
            .scaleEffect(settled ? 1 : scaleStart)
            .offset(y: settled ? 0 : offsetStart)
            .animation(animation, value: isPresented)
            .onAppear { isPresented = true }
    }

    // MARK: 내부

    private var offsetStart: CGFloat {
        switch preset {
        case .fadeIn, .scaleIn: return 0
        case .slideUp: return JdMotionModifier.travel      // 아래에서 올라온다(웹 translateY(24px))
        case .slideDown: return -JdMotionModifier.travel   // 위에서 내려온다
        }
    }

    private var scaleStart: CGFloat {
        preset == .scaleIn ? JdMotionModifier.scaleFrom : 1
    }

    // 지속시간은 JdMotion.duration 경유(부트스트랩된 감속 판정도 함께 존중된다).
    // ⚠️ 웹 값은 fade 300 · scale 280 · slide 400ms인데 Duration 토큰 램프엔 300(slow)만 있다 —
    //    리터럴 신설 대신 slow로 통일한다(웹 CSS도 "토큰과 어긋나는 리터럴"로 기록해 둔 지점).
    private var animation: Animation? {
        guard !reduceMotion else { return nil }
        let duration = JdMotion.duration(JdToken.Duration.slow)
        guard duration > 0 else { return nil }
        let easing = easingCurve
        return Animation
            .timingCurve(easing.0, easing.1, easing.2, easing.3, duration: duration)
            .delay(delay)
    }

    // 웹: fade는 ease-out, 나머지는 cubic-bezier(0.16,1,0.3,1) = JdToken.Easing.default
    private var easingCurve: (Double, Double, Double, Double) {
        preset == .fadeIn ? JdToken.Easing.easeOut : JdToken.Easing.default
    }
}
