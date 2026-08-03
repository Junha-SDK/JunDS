import JunDSCore
import SwiftUI

// 웹 jd-live-pct-text 동형 — 등락률 텍스트 리프 (DEC-040).
//
// **등락률 렌더 계열의 골격 정본**이다. JdLivePctBadge가 이 뷰를 감싸 색만 얹는다
// (웹이 클래스 상속으로 한 것을 SwiftUI에선 합성으로 — struct는 상속이 없다).
//
// 값은 주입받는다: 웹 v3가 `useLivePrice` 훅 구독을 버리고 property로 바꾼 것과 같은
// 계약이다(DEC-019 — 시세 연동은 finance-data 스코프). change가 0이면 fallback으로
// 폴백하는 v2 분기도 Core가 소유한다.
//
// 색을 스스로 정하지 않는다 — 웹 LivePctText가 색 없는 Fragment였던 것과 동형이며,
// 소비 측 foregroundColor를 그대로 상속한다.
public struct JdLivePctText: View {
    private let change: Double
    private let fallback: Double
    private let decimals: Int
    private let showSign: Bool
    private let withPercent: Bool

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        change: Double,
        fallback: Double = 0,
        decimals: Int = 2,
        showSign: Bool = true,
        withPercent: Bool = true
    ) {
        self.change = change
        self.fallback = fallback
        self.decimals = decimals
        self.showSign = showSign
        self.withPercent = withPercent
    }

    /// 확정 표시 문자열 — 파생(JdLivePctBadge)·소비자 공용. 웹 `get formatted()` 동형.
    public var formatted: String {
        JdFinanceFormat.percentText(
            resolvedValue,
            decimals: decimals,
            showSign: showSign,
            withPercent: withPercent)
    }

    /// 표시값 — 추세 판정도 이 값으로 한다(원시 change가 아니라 **화면의 숫자**로 판정해야
    /// 색과 숫자가 어긋나지 않는다. 웹 live-pct-badge의 판단과 동일).
    public var resolvedValue: Double {
        JdFinanceFormat.resolvedChange(change: change, fallback: fallback)
    }

    public var body: some View {
        Text(formatted)
            // 갱신 때 자리수가 바뀌어도 폭이 흔들리지 않게 tabular (웹 tabular-nums 동형)
            .monospacedDigit()
            .font(
                JdSwiftUIFont.scaled(
                    size: JdTextSpec.resolve(size: .md).fontSize,
                    weight: JdToken.FontWeight.normal,
                    category: sizeCategory))
    }
}
