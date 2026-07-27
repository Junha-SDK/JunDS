import SwiftUI
import JunDSCore

// 웹 jd-live-status-dot 동형 — 장 세션 라이브 여부 표시 (DEC-040).
//
// 장 세션 판정(공휴일·NXT 프리/애프터)은 앱의 몫이고 **결과만 주입받는다** — 웹 v3가
// useMarketStatus 훅을 버린 것과 같은 계약(DEC-019).
//
// 펄스: 웹 v2는 setInterval(800ms)로 box-shadow를 토글했고 v3가 CSS 키프레임으로 옮겼다.
// iOS도 타이머 없이 확장-소멸 링을 애니메이션으로 그리며, Reduce Motion이면 멈춘다
// (04 §7.3 — JdMotion 단일 진입점 경유).
public struct JdLiveStatusDot: View {
    private let live: Bool
    private let label: String?
    private let spec: JdLiveStatusDotSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory
    // 맥동 정지 판정 — SwiftUI는 환경값을 직접 읽는다 (04 §7.3)
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var ringPhase = false

    public init(live: Bool, label: String? = nil) {
        self.live = live
        self.label = label
        self.spec = JdLiveStatusDotSpec.resolve(live: live)
    }

    private var resolvedLabel: String {
        if let label, !label.isEmpty { return label }
        return JdLiveStatusDotSpec.defaultLabel(live: live)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            dot
            Text(resolvedLabel)
                .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                           weight: JdToken.FontWeight.bold,
                                           category: sizeCategory))
                .foregroundColor(spec.color.color)
                .lineLimit(1)
        }
        // 점은 장식이고 상태는 라벨이 낭독한다(웹 aria-hidden 동형)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(resolvedLabel))
    }

    // MARK: 내부

    private var dot: some View {
        Circle()
            .fill(spec.color.color)
            .frame(width: spec.dotSize, height: spec.dotSize)
            // 확장-소멸 링 — 웹 box-shadow 0→5px 스프레드 키프레임의 대응분.
            // 링을 그림자가 아니라 overlay Circle의 scale+opacity로 만든다(CALayer의
            // shadowPath 없이 SwiftUI에서 스프레드를 표현할 방법이 이것뿐이다).
            .overlay(ring)
            .onAppear { ringPhase = pulses }
            .onChange(of: pulses) { active in ringPhase = active }
    }

    @ViewBuilder
    private var ring: some View {
        if pulses {
            Circle()
                .fill(JdFinanceSpecMix.wash(spec.color, alpha: 0.45).color)
                .scaleEffect(ringPhase ? 2.25 : 1)
                .opacity(ringPhase ? 0 : 1)
                .animation(ringAnimation, value: ringPhase)
                .allowsHitTesting(false)
        }
    }

    private var pulses: Bool {
        guard spec.pulses, !reduceMotion else { return false }
        return JdMotion.duration(JdLiveStatusDotSpec.pulsePeriod) > 0
    }

    // 웹 `1.6s ease-out infinite` — autoreverses 없이 처음부터 다시(확장-소멸 반복)
    private var ringAnimation: Animation? {
        guard pulses else { return nil }
        let easing = JdToken.Easing.easeOut
        return Animation
            .timingCurve(easing.0, easing.1, easing.2, easing.3,
                         duration: JdLiveStatusDotSpec.pulsePeriod)
            .repeatForever(autoreverses: false)
    }
}
