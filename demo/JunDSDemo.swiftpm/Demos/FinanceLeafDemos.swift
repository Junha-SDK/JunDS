import SwiftUI
import UIKit
import JunDS

// finance leaf 6종 데모 (DEC-040) — 웹 <jd-live-pct-text>·<jd-live-pct-badge>·
// <jd-live-price-text>·<jd-live-status-dot>·<jd-price-badge>·<jd-hot-pct-chip> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴 — 3플랫폼 동일 (04 §3).
//
// 여섯 데모를 한 파일에 둔 이유: 전부 같은 어휘(추세 판정·도메인 색·숫자 포맷)를 쓰는
// 리프이고, **판정 규칙 두 개가 실제로 다르다**는 점이 나란히 놓고 봐야 드러난다.
// LivePctBadge에 -0.003을 넣으면 보합(회색), PriceBadge에 같은 값을 넣으면 하락이다.

// MARK: - 공용 헬퍼

@MainActor
private func doubleValue(_ state: DemoState, _ key: String, _ fallback: Double) -> Double {
    Double(state.string(key)) ?? fallback
}

// UIKit 스테이지는 뷰를 매번 새로 만든다 — 컨트롤 변경이 곧 재생성이라 상태 누수가 없다
private struct UIKitBox<V: UIView>: UIViewRepresentable {
    let make: () -> V
    func makeUIView(context: Context) -> V { make() }
    func updateUIView(_ uiView: V, context: Context) {}
}

// MARK: - LivePctText

enum LivePctTextDemo {
    static let demo = ComponentDemo(
        id: "LivePctText",
        controls: [
            .text("change", "change", placeholder: "등락률(%)", initial: "1.234"),
            .text("fallback", "fallback", placeholder: "change=0일 때 대체값", initial: "0"),
            .text("decimals", "decimals", placeholder: "소수 자리", initial: "2"),
            .toggle("hideSign", "hide-sign", initial: false),
            .toggle("hidePercent", "hide-percent", initial: false),
        ],
        swiftUI: { state in AnyView(LivePctTextStage(state: state)) },
        uikit: { state in AnyView(LivePctTextStageUIKit(state: state)) }
    )
}

@MainActor
private func pctTextView(_ state: DemoState) -> JdLivePctText {
    JdLivePctText(change: doubleValue(state, "change", 0),
                  fallback: doubleValue(state, "fallback", 0),
                  decimals: Int(doubleValue(state, "decimals", 2)),
                  showSign: !state.bool("hideSign"),
                  withPercent: !state.bool("hidePercent"))
}

private struct LivePctTextStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            pctTextView(state)
            Text("색을 스스로 정하지 않는다 — 추세 색은 LivePctBadge의 몫")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct LivePctTextStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdLivePctTextView(change: doubleValue(state, "change", 0),
                              fallback: doubleValue(state, "fallback", 0),
                              decimals: Int(doubleValue(state, "decimals", 2)),
                              showSign: !state.bool("hideSign"),
                              withPercent: !state.bool("hidePercent"))
        }
        .fixedSize()
    }
}

// MARK: - LivePctBadge

enum LivePctBadgeDemo {
    static let demo = ComponentDemo(
        id: "LivePctBadge",
        controls: [
            .text("change", "change", placeholder: "등락률(%)", initial: "1.234"),
            .text("fallback", "fallback", placeholder: "change=0일 때 대체값", initial: "0"),
            .text("decimals", "decimals", placeholder: "소수 자리", initial: "2"),
        ],
        swiftUI: { state in AnyView(LivePctBadgeStage(state: state)) },
        uikit: { state in AnyView(LivePctBadgeStageUIKit(state: state)) }
    )
}

@MainActor
private func badgeTrendNote(_ state: DemoState) -> String {
    let badge = JdLivePctBadge(change: doubleValue(state, "change", 0),
                               fallback: doubleValue(state, "fallback", 0))
    return "live 규칙 판정: \(badge.trend.rawValue) — up(>0)이 flat보다 우선, flat은 [-0.005, 0]뿐"
}

private struct LivePctBadgeStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdLivePctBadge(change: doubleValue(state, "change", 0),
                           fallback: doubleValue(state, "fallback", 0),
                           decimals: Int(doubleValue(state, "decimals", 2)))
            Text(badgeTrendNote(state))
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct LivePctBadgeStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdLivePctBadgeView(change: doubleValue(state, "change", 0),
                               fallback: doubleValue(state, "fallback", 0),
                               decimals: Int(doubleValue(state, "decimals", 2)))
        }
        .fixedSize()
    }
}

// MARK: - LivePriceText

enum LivePriceTextDemo {
    static let demo = ComponentDemo(
        id: "LivePriceText",
        controls: [
            .text("price", "price", placeholder: "현재가", initial: "71200"),
            .text("fallback", "fallback", placeholder: "price<=0일 때 대체값", initial: "0"),
            .text("decimals", "decimals", placeholder: "소수 자리", initial: "0"),
            .options("locale", "locale", ["ko-KR", "en-US", "de-DE"], initial: "ko-KR"),
        ],
        swiftUI: { state in AnyView(LivePriceTextStage(state: state)) },
        uikit: { state in AnyView(LivePriceTextStageUIKit(state: state)) }
    )
}

private struct LivePriceTextStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdLivePriceText(price: doubleValue(state, "price", 0),
                            fallback: doubleValue(state, "fallback", 0),
                            decimals: Int(doubleValue(state, "decimals", 0)),
                            locale: state.string("locale"))
            Text("price를 0으로 두고 fallback도 0이면 “—” — 값 없음은 숫자 0과 다르다")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct LivePriceTextStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdLivePriceTextView(price: doubleValue(state, "price", 0),
                                fallback: doubleValue(state, "fallback", 0),
                                decimals: Int(doubleValue(state, "decimals", 0)),
                                locale: state.string("locale"))
        }
        .fixedSize()
    }
}

// MARK: - LiveStatusDot

enum LiveStatusDotDemo {
    static let demo = ComponentDemo(
        id: "LiveStatusDot",
        controls: [
            .toggle("live", "live", initial: true),
            .text("label", "label", placeholder: "빈 값 = 실시간/장마감 기본", initial: ""),
        ],
        swiftUI: { state in AnyView(LiveStatusDotStage(state: state)) },
        uikit: { state in AnyView(LiveStatusDotStageUIKit(state: state)) }
    )
}

@MainActor
private func statusLabel(_ state: DemoState) -> String? {
    let raw = state.string("label")
    return raw.isEmpty ? nil : raw
}

private struct LiveStatusDotStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdLiveStatusDot(live: state.bool("live"), label: statusLabel(state))
            Text("확장-소멸 링은 라이브에서만 — 환경 섹션의 Reduce Motion을 켜면 멈춘다")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct LiveStatusDotStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdLiveStatusDotView(live: state.bool("live"), label: statusLabel(state))
        }
        .fixedSize()
    }
}

// MARK: - PriceBadge

enum PriceBadgeDemo {
    static let demo = ComponentDemo(
        id: "PriceBadge",
        controls: [
            .text("pct", "pct", placeholder: "등락률(%)", initial: "1.24"),
            .options("size", "size", JdPriceBadgeSize.allCases.map(\.rawValue), initial: "md"),
            .toggle("noArrow", "no-arrow", initial: false),
            .toggle("noBold", "no-bold", initial: false),
        ],
        swiftUI: { state in AnyView(PriceBadgeStage(state: state)) },
        uikit: { state in AnyView(PriceBadgeStageUIKit(state: state)) }
    )
}

@MainActor
private func priceBadgeSize(_ state: DemoState) -> JdPriceBadgeSize {
    JdPriceBadgeSize(rawValue: state.string("size")) ?? .md
}

private struct PriceBadgeStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdPriceBadge(pct: doubleValue(state, "pct", 0),
                         size: priceBadgeSize(state),
                         showArrow: !state.bool("noArrow"),
                         bold: !state.bool("noBold"))
            Text("exact 규칙 — flat은 정확히 0뿐이다. pct에 -0.003을 넣으면 여기선 하락,\nLivePctBadge에선 보합이다.")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct PriceBadgeStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdPriceBadgeView(pct: doubleValue(state, "pct", 0),
                             size: priceBadgeSize(state),
                             showArrow: !state.bool("noArrow"),
                             bold: !state.bool("noBold"))
        }
        .fixedSize()
    }
}

// MARK: - HotPctChip

enum HotPctChipDemo {
    static let demo = ComponentDemo(
        id: "HotPctChip",
        controls: [
            .text("pct", "pct", placeholder: "등락률(%)", initial: "12.34"),
        ],
        swiftUI: { state in AnyView(HotPctChipStage(state: state)) },
        uikit: { state in AnyView(HotPctChipStageUIKit(state: state)) }
    )
}

private struct HotPctChipStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdHotPctChip(pct: doubleValue(state, "pct", 0))
            Text("늘 상승 표기다 — 음수를 넣어도 “↑”가 유지된다(웹 동형, 급등 전용 칩)")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct HotPctChipStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdHotPctChipView(pct: doubleValue(state, "pct", 0))
        }
        .fixedSize()
    }
}
