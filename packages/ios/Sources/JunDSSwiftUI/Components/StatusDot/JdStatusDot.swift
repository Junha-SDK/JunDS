import JunDSCore
import SwiftUI

// 웹 jd-status-dot 동형 — 상태 점 + 선택 라벨 (DESIGN-2 §B2).
// 웹은 점을 ::before로 그리고 라벨만 span이라 role·aria가 전무하다 — **라벨이 없으면 AT에
// 아무것도 노출되지 않는다**. iOS는 상태명을 라벨로 노출해 이 결함을 보정한다 (04 §7.1).
// pulse는 Reduce Motion 시 정지한다 (04 §7.3).
public struct JdStatusDot: View {
    private let status: JdStatusKind
    private let label: String?
    private let spec: JdStatusDotSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory
    // 맥동 정지 판정 — SwiftUI는 환경값을 직접 읽는다 (04 §7.3)
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    // 웹 keyframe `jd-status-pulse 2s` 한 주기. Duration 토큰 램프(최대 slower 0.5) 밖이라
    // 스펙 부재분이다 — notes 보고분.
    static let pulsePeriod: TimeInterval = 2

    @State private var pulsePhase = false

    public init(
        _ status: JdStatusKind = .neutral,
        label: String? = nil,
        size: JdDisplaySize = .md
    ) {
        self.status = status
        self.label = label
        self.spec = JdStatusDotSpec.resolve(status: status, size: size)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {  // 웹 gap: var(--jd-space-1-5)
            dot
            if let label, !label.isEmpty {
                Text(label)
                    .font(
                        JdSwiftUIFont.scaled(
                            size: spec.labelFontSize,
                            weight: JdToken.FontWeight.normal,
                            category: sizeCategory)
                    )
                    .foregroundColor(JdToken.Color.foreground.color)
                    .lineLimit(1)
            }
        }
        // 점+라벨을 요소 1개로 합치고, 라벨이 없으면 상태명을 대신 노출한다(웹 결함 보정)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(accessibilityText))
    }

    // MARK: 내부

    private var dot: some View {
        Circle()
            .fill(spec.color.color)
            .frame(width: spec.dotSize, height: spec.dotSize)
            .opacity(pulsePhase ? JdToken.Opacity.o50 : JdToken.Opacity.o100)
            .animation(pulseAnimation, value: pulsePhase)
            .onAppear { pulsePhase = pulses }
            // Reduce Motion 토글에 즉시 반응 — 꺼지면 불투명도 1로 되돌아간다
            .onChange(of: pulses) { active in pulsePhase = active }
    }

    // 스펙이 pulse로 표시한 상태에서만, 그리고 모션이 살아 있을 때만 맥동한다
    private var pulses: Bool {
        guard spec.pulses, !reduceMotion else { return false }
        return JdMotion.duration(JdStatusDot.pulsePeriod) > 0
    }

    // 웹 cubic-bezier(0.4, 0, 0.6, 1)의 토큰 대응분 = Easing.easeInOut.
    // autoreverses가 왕복을 만드므로 duration은 한 주기의 절반이다.
    private var pulseAnimation: Animation? {
        guard pulses else { return nil }
        let easing = JdToken.Easing.easeInOut
        return
            Animation
            .timingCurve(
                easing.0, easing.1, easing.2, easing.3,
                duration: JdStatusDot.pulsePeriod / 2
            )
            .repeatForever(autoreverses: true)
    }

    private var accessibilityText: String {
        if let label, !label.isEmpty { return label }
        return JdStatusDot.statusName(status)
    }

    /// 상태명 사전 — UIKit 계층(JdStatusDotView)에 동형 사본이 있다(DEC-010으로 공유 불가).
    /// 웹엔 대응 리터럴이 없다: 라벨 없는 점의 AT 무노출을 메우려 iOS가 신설한 어휘다.
    static func statusName(_ status: JdStatusKind) -> String {
        switch status {
        case .neutral: return "중립"
        case .success: return "정상"
        case .warning: return "경고"
        case .danger: return "위험"
        case .info: return "정보"
        case .pulse: return "활성"
        }
    }
}
