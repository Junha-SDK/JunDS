import JunDS
import SwiftUI

// Motion 데모 — 실컴포넌트 **모디파이어** `.jdMotion(_:delay:)` (JunDSSwiftUI/Layout).
// 웹 <jd-motion>이 CSS animation + @media (prefers-reduced-motion)으로 하던 일을
// iOS에선 모디파이어 하나가 한다. 컨트롤 값 리터럴은 웹 preset attribute와 일치
// (fade-in/slide-up/slide-down/scale-in) — 3플랫폼 동일 (04 §3).
//
// 등장 애니메이션은 onAppear에서 한 번만 돈다 — 다시 보려면 뷰 정체성을 갈아야 해서
// "재생" 버튼이 .id(...)의 토큰을 올린다(preset·delay가 바뀔 때도 같은 이유로 재생성된다).
// UIKit 대응 표면은 없다 — 관용구는 UIView.animate이고 감속 판정은 JdMotion.duration이다.

enum MotionDemo {
    static let demo = ComponentDemo(
        id: "Motion",
        controls: [
            .options(
                "preset", "preset", JdMotionPreset.allCases.map(\.rawValue), initial: "fade-in"),
            .slider("delay", "delay (초)", 0...1, step: 0.1, initial: 0),
        ],
        swiftUI: { state in AnyView(MotionStage(state: state)) }
    )
}

@MainActor
private func motionPreset(_ state: DemoState) -> JdMotionPreset {
    JdMotionPreset(rawValue: state.string("preset")) ?? .fadeIn
}

@MainActor
private func motionDelay(_ state: DemoState) -> TimeInterval {
    state.number("delay")
}

private let motionNote =
    "Reduce Motion이면 전이 없이 처음부터 최종 상태다 — 내용은 즉시 보이고 "
    + "움직임만 사라진다(04 §7.3). 위 환경 섹션의 \"Reduce Motion (JdMotion 경로)\" 토글을 켜고 "
    + "재생하면 같은 결과를 여기서 바로 확인할 수 있다(토글은 JdMotion.duration을 0으로 만들고, "
    + "실제 시스템 설정은 초기 상태 자체를 최종 상태로 만든다)."

private let motionDurationNote =
    "지속시간은 JdToken.Duration.slow(300ms)로 통일돼 있다 — 웹 값 "
    + "fade 300 · scale 280 · slide 400ms 중 토큰 램프에 있는 것이 300뿐이라 리터럴을 신설하지 않았다. "
    + "이징은 fade-in만 ease-out이고 나머지는 JdToken.Easing.default다."

private struct MotionStage: View {
    @ObservedObject var state: DemoState
    @State private var playCount = 0

    var body: some View {
        let preset = motionPreset(state)
        let delay = motionDelay(state)

        return VStack(spacing: JdToken.Space.s4) {
            // 움직임이 보이도록 무대 높이를 고정한다 — 토큰 파생(80×1.5)
            ZStack {
                MotionTargetBlock(preset: preset)
                    .jdMotion(preset, delay: delay)
            }
            .frame(height: JdToken.Space.s20 + JdToken.Space.s10, alignment: .center)
            // 등장은 onAppear 1회 — 정체성이 바뀌어야 다시 돈다
            .id("\(preset.rawValue)|\(delay)|\(playCount)")

            JdButton("재생", variant: .secondary) {
                playCount += 1
            }

            VStack(spacing: JdToken.Space.s1) {
                Text(
                    String(
                        format: "preset=%@ · delay=%.1fs · 재생 %d회", preset.rawValue, delay,
                        playCount)
                )
                .font(.footnote.monospaced())
                Text(motionDurationNote)
                Text(motionNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

private struct MotionTargetBlock: View {
    var preset: JdMotionPreset

    var body: some View {
        JdText(preset.rawValue, size: .sm, mono: true)
            .padding(JdToken.Space.s4)
            .frame(maxWidth: .infinity)
            .background(JdToken.Color.primaryLight.color)
            .cornerRadius(JdToken.Radius.lg)
    }
}
