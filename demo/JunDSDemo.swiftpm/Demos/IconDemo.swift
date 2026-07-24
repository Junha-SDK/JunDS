import SwiftUI
import JunDS

// Icon 데모 — 레시피형 (04 §10.1). 아이콘은 SF Symbols 하나로 수렴하고(서드파티 0)
// 신규 타입은 없다. 변 길이는 Core의 JdIconSize.side, 색은 JdToken — 리터럴 금지.
// 컨트롤 값 리터럴은 웹 size attribute와 일치(xs/sm/md/lg/xl).

enum IconDemo {
    static let demo = ComponentDemo(
        id: "Icon",
        controls: [
            .options("size", "size", JdIconSize.allCases.map(\.rawValue), initial: "md"),
            .options("symbol", "symbol", ["star", "heart", "bell", "gear", "bolt"], initial: "star"),
            .options("color", "color", ["primary", "muted", "danger", "success"], initial: "primary"),
        ],
        swiftUI: { state in AnyView(IconStage(state: state)) },
        recipe: """
        // Icon = SF Symbols 관용구 (04 §10.1 — 신규 컴포넌트 없음)
        Image(systemName: "star.fill")
            .font(.system(size: JdIconSize.md.side))          // md = 20
            .foregroundColor(JdToken.Color.primary.color)
            .accessibilityHidden(true)                        // 장식 아이콘은 AT에서 제거

        // 본문과 함께 자라야 하면 변을 스케일한다 (View 프로퍼티로)
        @ScaledMetric(relativeTo: .body) private var iconSide: CGFloat = JdIconSize.md.side

        // UIKit
        let config = UIImage.SymbolConfiguration(
            pointSize: UIFontMetrics(forTextStyle: .body)
                .scaledValue(for: JdIconSize.md.side, compatibleWith: traitCollection),
            weight: .medium)
        let iconView = UIImageView(image: UIImage(systemName: "star.fill", withConfiguration: config))
        iconView.tintColor = JdToken.Color.primary.uiColor
        iconView.isAccessibilityElement = false
        """
    )
}

@MainActor
private func iconSize(_ state: DemoState) -> JdIconSize {
    JdIconSize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func iconSymbol(_ state: DemoState) -> String {
    state.string("symbol", fallback: "star")
}

@MainActor
private func iconColor(_ state: DemoState) -> JdDynamicColor {
    switch state.string("color") {
    case "muted": return JdToken.Color.muted
    case "danger": return JdToken.Color.danger
    case "success": return JdToken.Color.success
    default: return JdToken.Color.primary
    }
}

private let iconNote = "JdIconSize.side는 웹 SVG 박스의 변이고 SF Symbol의 pointSize는 글리프 기준이라 "
    + "실제 박스가 정확히 같지는 않다 — 점선이 side×side 박스다. 그리드 정렬이 필요하면 "
    + ".frame(width:height:)로 박스를 고정한다. 버튼 안 아이콘은 이 램프가 아니라 "
    + "JdIconButtonSpec.iconSize(버튼 변의 0.5배)를 따른다 — JdIconSize는 단독 아이콘용이다."

private struct IconStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let size = iconSize(state)
        let side = size.side

        return VStack(spacing: JdToken.Space.s4) {
            // 램프 전체를 나란히 — 단독 크기만 보면 차이를 못 읽는다
            HStack(alignment: .bottom, spacing: JdToken.Space.s5) {
                ForEach(JdIconSize.allCases, id: \.self) { ramp in
                    VStack(spacing: JdToken.Space.s1) {
                        IconGlyph(symbol: iconSymbol(state),
                                  side: ramp.side,
                                  color: iconColor(state),
                                  boxed: ramp == size)
                        JdText(ramp.rawValue, size: .xs2, dimmed: true)
                    }
                }
            }

            JdText("JdIconSize.\(size.rawValue).side = \(Int(side))pt", size: .sm, mono: true)

            Text(iconNote)
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

private struct IconGlyph: View {
    var symbol: String
    var side: CGFloat
    var color: JdDynamicColor
    var boxed: Bool

    var body: some View {
        Image(systemName: symbol)
            // SF Symbol의 크기는 폰트에 실린다
            .font(.system(size: side))
            .foregroundColor(color.color)
            .accessibilityHidden(true) // 장식 아이콘은 AT에서 제거
            .frame(width: side, height: side)
            .overlay(
                // 선택된 램프만 side×side 박스를 그려 글리프와 박스의 차이를 보인다
                RoundedRectangle(cornerRadius: JdToken.Radius.sm)
                    .strokeBorder(style: StrokeStyle(lineWidth: JdToken.Space.px,
                                                     dash: [JdToken.Space.s0_5, JdToken.Space.s0_5]))
                    .foregroundColor(boxed ? JdToken.Color.border.color : .clear)
            )
    }
}
