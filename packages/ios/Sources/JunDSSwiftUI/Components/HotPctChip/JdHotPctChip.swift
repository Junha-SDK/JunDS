import SwiftUI
import JunDSCore

// 웹 jd-hot-pct-chip 동형 — "급등" 강조 알약 (DEC-040).
//
// 늘 상승 표기다("↑ n%") — 부호·색 분기가 없는 것이 이 컴포넌트의 정체성이다.
// 세로 그라디언트(위=up 원색, 아래=up에 foreground 20% 섞어 어둡게)도 마찬가지다:
// 웹 v2는 위를 up+흰색 72%로 밝게 뒀는데 흰 글자가 얹히기엔 대비가 부족해 v3가 방향을
// 뒤집었고, iOS도 그 교정본을 따른다.
public struct JdHotPctChip: View {
    private let pct: Double
    private let spec: JdHotPctChipSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(pct: Double) {
        self.pct = pct
        self.spec = JdHotPctChipSpec.resolve()
    }

    public var body: some View {
        Text(JdHotPctChipSpec.text(pct))
            .monospacedDigit()
            .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                       weight: spec.fontWeight,
                                       category: sizeCategory))
            .foregroundColor(spec.foreground.color)
            .padding(.horizontal, spec.hPadding)
            .padding(.vertical, spec.vPadding)
            .background(
                LinearGradient(colors: [spec.gradientTop.color, spec.gradientBottom.color],
                               startPoint: .top,
                               endPoint: .bottom)
            )
            // 알약 — 고정 반경이 아니라 Capsule이라 Dynamic Type에서 높이가 자라도 유지된다
            .clipShape(Capsule())
            // "↑"는 VoiceOver가 읽지 않거나 "위쪽 화살표"로 읽는다 — 뜻을 말로 준다
            .accessibilityLabel(Text("급등 " + JdFinanceFormat.percentText(pct,
                                                                          decimals: 2,
                                                                          showSign: false,
                                                                          withPercent: true)))
    }
}
