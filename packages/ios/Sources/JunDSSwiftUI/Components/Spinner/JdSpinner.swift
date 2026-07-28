import JunDSCore
import SwiftUI

// 웹 jd-spinner의 SVG 주기 — `animation: jd-spin 1s linear infinite`.
// JdToken.Duration 사다리(최대 0.5)에 없는 값이라 파일 상수로 1회만 기입한다(스펙 결손 보고 대상).
private let jdSpinnerPeriod: TimeInterval = 1
// 웹 SVG의 호는 원주의 1/4 (path "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z") — 기하 비율.
private let jdSpinnerArcFraction: CGFloat = 0.25

// 웹 jd-spinner 동형 — 25% 불투명 트랙 링 + 75% 불투명 1/4 호가 도는 형태.
// 웹은 Reduce Motion에서 주기만 늦추지만(1.6s) iOS는 04 §7.3에 따라 **정지**시키고
// 마지막 정지 프레임을 그대로 보여준다(사라지지 않는다 — 로딩 중이라는 사실은 남아야 한다).
public struct JdSpinner: View {
    private let spec: JdSpinnerSpec
    private let label: String
    private let color: JdDynamicColor

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isSpinning = false

    public init(
        size: JdDisplaySize = .md,
        label: String = JdSpinnerSpec.defaultLabel,
        color: JdDynamicColor = JdToken.Color.primary
    ) {
        self.spec = JdSpinnerSpec.resolve(size: size)
        self.label = label
        self.color = color
    }

    public var body: some View {
        ZStack {
            // 트랙: 웹 <circle opacity=".25">
            Circle()
                .strokeBorder(
                    color.color.opacity(JdToken.Opacity.o25),
                    lineWidth: spec.lineWidth)
            // 호: 웹 <path opacity=".75"> — 원주의 1/4
            Circle()
                .inset(by: spec.lineWidth / 2)
                .trim(from: 0, to: jdSpinnerArcFraction)
                .stroke(
                    color.color.opacity(JdToken.Opacity.o75),
                    style: StrokeStyle(lineWidth: spec.lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(isSpinning ? 360 : 0))
        }
        .frame(width: spec.side, height: spec.side)
        .animation(spinAnimation, value: isSpinning)
        .onAppear { isSpinning = spinAnimation != nil }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(label))
        // 웹 role=status의 iOS 번역 — 갱신되는 상태 표시기
        .accessibilityAddTraits(.updatesFrequently)
    }

    // Reduce Motion이면 nil — 회전 없이 초기 프레임 그대로 남는다.
    // 환경값과 JdMotion(Core 단일 진입점) 양쪽을 본다: 전자는 SwiftUI 미리보기/트레이트
    // 오버라이드까지 반영하고, 후자는 앱 부트스트랩이 주입한 시스템 설정이다 (04 §7.3).
    private var spinAnimation: Animation? {
        guard !reduceMotion else { return nil }
        let period = JdMotion.duration(jdSpinnerPeriod)
        guard period > 0 else { return nil }
        return .linear(duration: period).repeatForever(autoreverses: false)
    }
}
