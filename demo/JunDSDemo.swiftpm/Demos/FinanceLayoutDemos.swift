import JunDS
import SwiftUI
import UIKit

// finance 조립 3종 데모 (DEC-041) — 웹 <jd-live-stacked-cell>·<jd-position-bar>·
// <jd-live-micro-kpi-row> 동형.
//
// 리프 데모(FinanceLeafDemos)와 성격이 다르다: 이 셋은 **배치를 스스로 소유**하므로
// 스테이지 폭을 좁혀 보면 재배치가 눈에 보인다. KPI 행은 컨트롤로 셀 수를 바꿔 볼 수 있다.

@MainActor
private func doubleValue(_ state: DemoState, _ key: String, _ fallback: Double) -> Double {
    Double(state.string(key)) ?? fallback
}

private struct UIKitBox<V: UIView>: UIViewRepresentable {
    let make: () -> V
    func makeUIView(context: Context) -> V { make() }
    func updateUIView(_ uiView: V, context: Context) {}
}

// 폭 반응을 보여주기 위한 래퍼 — 슬라이더로 스테이지 폭을 줄이면 재배치가 드러난다
private struct WidthRuler<Content: View>: View {
    let width: CGFloat
    let content: Content

    var body: some View {
        VStack(spacing: JdToken.Space.s2) {
            content.frame(width: width)
            Text("스테이지 폭 \(Int(width))pt")
                .font(.caption2)
                .foregroundColor(JdToken.Color.muted.color)
        }
    }
}

// MARK: - LiveStackedCell

enum LiveStackedCellDemo {
    static let demo = ComponentDemo(
        id: "LiveStackedCell",
        controls: [
            .text("price", "price", placeholder: "현재가", initial: "71200"),
            .text("change", "change", placeholder: "등락률(%)", initial: "1.234"),
            .text("priceFallback", "price-fallback", placeholder: "price<=0 대체", initial: "0"),
            .text("pctFallback", "pct-fallback", placeholder: "change=0 대체", initial: "0"),
        ],
        swiftUI: { state in AnyView(StackedCellStage(state: state)) },
        uikit: { state in AnyView(StackedCellStageUIKit(state: state)) }
    )
}

private struct StackedCellStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            // 표 오른쪽 열 상황을 재현 — 숫자 끝이 맞는지 보이게 두 행을 나란히 둔다
            VStack(alignment: .trailing, spacing: JdToken.Space.s2) {
                JdLiveStackedCell(
                    price: doubleValue(state, "price", 0),
                    change: doubleValue(state, "change", 0),
                    priceFallback: doubleValue(state, "priceFallback", 0),
                    pctFallback: doubleValue(state, "pctFallback", 0))
                JdLiveStackedCell(price: 8_240, change: -2.15)
            }
            .frame(width: 120, alignment: .trailing)
            Text("0%도 상승색이다 — 두 값이 한 색으로 묶여 있어 회색을 주면 행이 죽어 보인다")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

// UIKit 스테이지는 이 셀의 **실제 서식지**를 보여준다: 열 정렬 표.
// JdColumnsView가 전 행의 열 폭을 공유하므로 종목명 길이가 달라도 가격 열이 어긋나지 않는다.
private struct StackedCellStageUIKit: View {
    @ObservedObject var state: DemoState

    private static let quotes: [(String, Double, Double, Double, Double, Double)] = [
        ("삼성전자", 71_200, 1.24, 0.31, 0.86, 0.62),
        ("에이치엘비생명과학", 8_240, -2.15, 0.12, 0.74, 0.20),
        ("SK", 168_500, 0.00, 0.44, 0.91, 0.55),
    ]

    var body: some View {
        let table = Self.makeTable(
            first: (
                price: doubleValue(state, "price", 0),
                change: doubleValue(state, "change", 0),
                priceFallback: doubleValue(state, "priceFallback", 0),
                pctFallback: doubleValue(state, "pctFallback", 0)
            ))
        let width: CGFloat = 340
        let height = table.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
            .height
        return VStack(spacing: JdToken.Space.s2) {
            UIKitBox {
                Self.makeTable(
                    first: (
                        price: doubleValue(state, "price", 0),
                        change: doubleValue(state, "change", 0),
                        priceFallback: doubleValue(state, "priceFallback", 0),
                        pctFallback: doubleValue(state, "pctFallback", 0)
                    ))
            }
            .frame(width: width, height: max(height, 1))
            Text("JdColumnsView가 전 행의 열 폭을 공유한다 — 종목명 길이가 달라도\n가격 열 끝이 맞는다(가격 열 align: .end)")
                .font(.caption2)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }

    @MainActor
    private static func makeTable(
        first: (price: Double, change: Double, priceFallback: Double, pctFallback: Double)
    ) -> JdColumnsView {
        JdColumnsView(
            columns: [
                .fit(max: 150, align: .start),  // 종목명 — 전 행 중 가장 긴 이름에 맞춘다
                .flex(weight: 1),  // 위치 막대 — 남는 폭
                .fixed(96, align: .end),  // 가격·등락 — 숫자는 끝을 맞춘다
            ],
            gap: .sm,
            rowGap: .sm
        ) {
            // 첫 행은 컨트롤 값을 그대로 받는다(컨트롤을 만지면 이 행만 바뀐다)
            [
                nameLabel(quotes[0].0),
                JdPositionBarView(low: quotes[0].3, high: quotes[0].4, cur: quotes[0].5),
                JdLiveStackedCellView(
                    price: first.price, change: first.change,
                    priceFallback: first.priceFallback, pctFallback: first.pctFallback),
            ]
            for q in quotes.dropFirst() {
                [
                    nameLabel(q.0),
                    JdPositionBarView(low: q.3, high: q.4, cur: q.5, tone: q.2 < 0 ? .down : .up),
                    JdLiveStackedCellView(price: q.1, change: q.2),
                ]
            }
        }
    }

    @MainActor
    private static func nameLabel(_ text: String) -> UILabel {
        let label = UILabel()
        label.text = text
        label.font = JdFontBridge.scaledFont(size: 13, weight: JdToken.FontWeight.semibold)
        label.textColor = JdToken.Color.foreground.uiColor
        label.adjustsFontForContentSizeCategory = true
        label.numberOfLines = 1
        return label
    }
}

// MARK: - PositionBar

enum PositionBarDemo {
    static let demo = ComponentDemo(
        id: "PositionBar",
        controls: [
            .text("low", "low", placeholder: "구간 하단 0~1", initial: "0.2"),
            .text("high", "high", placeholder: "구간 상단 0~1", initial: "0.8"),
            .text("cur", "cur", placeholder: "현재 0~1", initial: "0.5"),
            .options("tone", "tone", JdPositionBarTone.allCases.map(\.rawValue), initial: "up"),
        ],
        swiftUI: { state in AnyView(PositionBarStage(state: state)) },
        uikit: { state in AnyView(PositionBarStageUIKit(state: state)) }
    )
}

@MainActor
private func barTone(_ state: DemoState) -> JdPositionBarTone {
    JdPositionBarTone(rawValue: state.string("tone")) ?? .up
}

private struct PositionBarStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdPositionBar(
                low: doubleValue(state, "low", 0),
                high: doubleValue(state, "high", 1),
                cur: doubleValue(state, "cur", 0.5),
                tone: barTone(state)
            )
            .frame(width: 220)
            Text("cur를 low보다 작게 넣어도 채움이 음수가 되지 않는다(웹 v2 결함 교정).\n마커는 항상 정중앙 50% 기준선이다.")
                .font(.caption)
                .foregroundColor(JdToken.Color.muted.color)
                .multilineTextAlignment(.center)
        }
    }
}

private struct PositionBarStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        UIKitBox {
            JdPositionBarView(
                low: doubleValue(state, "low", 0),
                high: doubleValue(state, "high", 1),
                cur: doubleValue(state, "cur", 0.5),
                tone: barTone(state))
        }
        .frame(width: 220, height: 12)
    }
}

// MARK: - LiveMicroKpiRow

enum LiveMicroKpiRowDemo {
    static let demo = ComponentDemo(
        id: "LiveMicroKpiRow",
        controls: [
            .options("count", "셀 개수", ["1", "2", "3", "4", "6"], initial: "4"),
            .options("width", "스테이지 폭", ["360", "300", "240", "180"], initial: "360"),
            .toggle("hints", "hint 사용", initial: true),
        ],
        swiftUI: { state in AnyView(MicroKpiRowStage(state: state)) },
        uikit: { state in AnyView(MicroKpiRowStageUIKit(state: state)) }
    )
}

@MainActor
private func kpiItems(_ state: DemoState) -> [JdMicroKpiItem] {
    let useHints = state.bool("hints")
    let pool: [JdMicroKpiItem] = [
        .init(label: "USD/KRW", value: "1,320", pct: -0.4, unit: "원"),
        .init(label: "외국인", value: "+1,204", pct: 1.2, hint: useHints ? "순매수" : nil),
        .init(label: "기관", value: "-820", pct: -0.8, hint: useHints ? "순매도" : nil),
        .init(label: "WTI", value: "78.2", pct: 1.1, unit: "$"),
        .init(label: "KOSPI", value: "2,684", pct: 0.0),
        .init(label: "환율변동", value: "—", hint: useHints ? "휴장" : nil),
    ]
    let n = Int(state.string("count")) ?? 4
    return Array(pool.prefix(max(1, min(pool.count, n))))
}

@MainActor
private func stageWidth(_ state: DemoState) -> CGFloat {
    CGFloat(Double(state.string("width")) ?? 360)
}

private struct MicroKpiRowStage: View {
    @ObservedObject var state: DemoState
    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            WidthRuler(
                width: stageWidth(state),
                content: JdMicroKpiRow(items: kpiItems(state)))
            Text(
                "폭을 줄이면 열 수가 줄고 다음 행으로 넘어간다 — 소비자가 격자를 정의하지 않는다.\npct=0(KOSPI)은 상승색, pct 없음(휴장)은 muted다."
            )
            .font(.caption)
            .foregroundColor(JdToken.Color.muted.color)
            .multilineTextAlignment(.center)
        }
    }
}

private struct MicroKpiRowStageUIKit: View {
    @ObservedObject var state: DemoState
    var body: some View {
        let width = stageWidth(state)
        let items = kpiItems(state)
        // UIKit은 랩 뷰가 높이를 계산하므로 컨테이너 높이를 그 결과로 잡아 준다
        let probe = JdMicroKpiRowView(items: items)
        let height = probe.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
            .height
        return VStack(spacing: JdToken.Space.s2) {
            UIKitBox { JdMicroKpiRowView(items: items) }
                .frame(width: width, height: max(height, 1))
            Text("JdWrapView(equalWidths)가 열 수·행 높이를 정한다 — UICollectionView 없이")
                .font(.caption2)
                .foregroundColor(JdToken.Color.muted.color)
        }
    }
}
