import JunDSCore
import SwiftUI

// 웹 jd-badge 동형 — 상태·카테고리 라벨 (DESIGN-2 §B2).
// 웹처럼 count 모드가 children을 대체한다(병용 금지) → iOS는 init 2종으로 모드를 갈라
// 잘못된 조합 자체를 타입으로 막는다.
public struct JdBadge: View {

    private enum Mode {
        case text(String, showsDot: Bool)
        case count(String)
    }

    private let mode: Mode
    private let spec: JdBadgeSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ text: String,
        variant: JdBadgeVariant = .default,
        size: JdDisplaySize = .md,
        showsDot: Bool = false
    ) {
        self.mode = .text(text, showsDot: showsDot)
        self.spec = JdBadgeSpec.resolve(variant: variant, size: size)
    }

    /// 웹 count 모드 — 원형 18pt·danger 고정이라 variant/size 축을 받지 않는다.
    public init(count: Int, maxCount: Int = 99) {
        self.mode = .count(JdBadgeSpec.countText(count, maxCount: maxCount))
        // 카운트 모드는 색·크기가 고정이지만 스펙 접근을 한 곳으로 모으기 위해 danger를 결의해 둔다
        self.spec = JdBadgeSpec.resolve(variant: .danger, size: .sm)
    }

    public var body: some View {
        switch mode {
        case .text(let text, let showsDot):
            textBadge(text, showsDot: showsDot)
        case .count(let text):
            countBadge(text)
        }
    }

    // MARK: 내부

    private func textBadge(_ text: String, showsDot: Bool) -> some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        return HStack(spacing: JdToken.Space.s1) {  // 웹 gap: var(--jd-space-1)
            if showsDot {
                Circle()
                    .fill(spec.foreground.color)
                    .frame(width: spec.dotSize, height: spec.dotSize)
                    .accessibilityHidden(true)  // 장식 — 텍스트가 이미 상태를 말한다 (04 §7.1)
            }
            Text(text)
                .lineLimit(1)  // 웹 white-space: nowrap
        }
        .font(
            JdSwiftUIFont.scaled(
                size: spec.fontSize,
                weight: JdToken.FontWeight.semibold,
                category: sizeCategory)
        )
        .foregroundColor(spec.foreground.color)
        .padding(.horizontal, spec.hPadding)
        .padding(.vertical, spec.vPadding)
        .background(spec.background.color)
        .clipShape(shape)
        .overlay(borderOverlay(shape))
    }

    private func countBadge(_ text: String) -> some View {
        Text(text)
            .font(
                JdSwiftUIFont.scaled(
                    size: JdBadgeSpec.countFontSize,
                    weight: JdToken.FontWeight.semibold,
                    category: sizeCategory
                )
                .monospacedDigit()
            )  // 웹 font-variant-numeric: tabular-nums
            .lineLimit(1)
            // 웹 #fff — 스펙에 카운트 전경색이 없어 시스템 흰색을 쓴다(notes 보고분)
            .foregroundColor(.white)
            .padding(.horizontal, JdToken.Space.s1)
            // 고정 크기 금지 — 하한만(04 §7.2). 한 자리면 정원, 여러 자리면 알약으로 늘어난다
            .frame(minWidth: JdBadgeSpec.countDiameter, minHeight: JdBadgeSpec.countDiameter)
            .background(JdToken.Color.danger.color)
            .clipShape(Capsule())
    }

    @ViewBuilder
    private func borderOverlay(_ shape: RoundedRectangle) -> some View {
        if let border = spec.border {
            shape.strokeBorder(border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
