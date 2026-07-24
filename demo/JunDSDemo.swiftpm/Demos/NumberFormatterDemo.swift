import SwiftUI
import JunDS

// NumberFormatter 데모 — **뷰 없음** (04 §10.1). 웹은 값을 그리는 태그지만 iOS에선 Core 함수
// 하나면 끝나고(JdNumberFormat.string), 결과 문자열을 JdText에 넘긴다.
// 컨트롤 키·값은 웹 attribute 리터럴(format/currency/decimals/prefix/suffix) — 3플랫폼 동일.
//
// 데모는 포맷 규칙을 재구현하지 않는다 — 컨트롤을 그대로 Core 인자로 넘기고 결과만 크게 보인다.

enum NumberFormatterDemo {
    static let demo = ComponentDemo(
        id: "NumberFormatter",
        controls: [
            .slider("value", "value", 0...2_000_000, step: 1000, initial: 12800),
            .options("format", "format", JdNumberFormatStyle.allCases.map(\.rawValue), initial: "decimal"),
            .options("currency", "currency", ["KRW", "USD", "JPY"], initial: "KRW"),
            .slider("decimals", "decimals", 0...3, step: 1, initial: 0),
            .text("prefix", "prefix", placeholder: "앞에 붙일 문자열", initial: ""),
            .text("suffix", "suffix", placeholder: "뒤에 붙일 문자열", initial: ""),
        ],
        swiftUI: { state in AnyView(NumberFormatterStage(state: state)) },
        recipe: """
        // NumberFormatter = Core 함수 하나 (04 §10.1 — 뷰 없음)
        JdNumberFormat.string(value: 1234.5)                               // "1,234.5"
        JdNumberFormat.string(value: 12000, style: .currency)              // "₩12,000" (KRW 기본)
        JdNumberFormat.string(value: 1234.5, style: .currency,
                              currency: "USD", locale: "en-US")            // "$1,234.50"
        JdNumberFormat.string(value: 0.153, style: .percent, decimals: 1)  // ×100 → "15.3%"
        JdNumberFormat.string(value: 12_800, style: .compact)              // "1.3만"
        JdNumberFormat.compactCount(1_200)                                 // "1.2천"

        JdText(JdNumberFormat.string(value: total, style: .currency), size: .lg, mono: true)

        // Foundation의 .compactName은 "1K"/"1M"이라 웹 문자열(천·만·억)과 어긋난다 —
        // 축약은 반드시 Core의 style: .compact / compactCount를 거친다.
        """
    )
}

@MainActor
private func numberValue(_ state: DemoState) -> Double {
    state.number("value", fallback: 12800)
}

@MainActor
private func numberStyle(_ state: DemoState) -> JdNumberFormatStyle {
    JdNumberFormatStyle(rawValue: state.string("format")) ?? .decimal
}

@MainActor
private func numberCurrency(_ state: DemoState) -> String {
    state.string("currency", fallback: "KRW")
}

@MainActor
private func numberDecimals(_ state: DemoState) -> Int {
    Int(state.number("decimals"))
}

// 컨트롤 → Core 호출. 데모가 규칙을 다시 쓰지 않는다는 사실이 이 함수 한 줄에 있다.
@MainActor
private func numberResult(_ state: DemoState) -> String {
    JdNumberFormat.string(value: numberValue(state),
                          style: numberStyle(state),
                          currency: numberCurrency(state),
                          decimals: numberDecimals(state),
                          prefix: state.string("prefix"),
                          suffix: state.string("suffix"))
}

@MainActor
private func numberCallNote(_ state: DemoState) -> String {
    var args = ["value: \(Int(numberValue(state)))",
                "style: .\(numberStyle(state).rawValue)",
                "currency: \"\(numberCurrency(state))\"",
                "decimals: \(numberDecimals(state))"]
    let prefix = state.string("prefix")
    let suffix = state.string("suffix")
    if !prefix.isEmpty { args.append("prefix: \"\(prefix)\"") }
    if !suffix.isEmpty { args.append("suffix: \"\(suffix)\"") }
    return "JdNumberFormat.string(" + args.joined(separator: ", ") + ")"
}

private let numberStyleNote = "percent는 100을 곱한다(0.15 → \"15%\") — 슬라이더 값이 크면 자릿수도 "
    + "그만큼 커진다. compact는 Foundation .compactName(\"1K\")이 아니라 Core의 천·만·억 사다리이고, "
    + "반올림 뒤 단위를 재평가한다(9999 → \"1만\")."

private let numberLocaleNote = "locale 기본값은 상수 \"ko-KR\"다 — 환경 의존을 막아 결정성을 지킨다. "
    + "decimals를 지정하지 않으면(nil) 통화별 기본 자릿수에 위임한다(KRW 0 · USD 2 · JPY 0)지만, "
    + "이 데모의 슬라이더는 항상 값을 주므로 통화 기본값이 아니라 슬라이더가 이긴다."

private struct NumberFormatterStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            // 결과 문자열이 주인공이다
            JdText(numberResult(state), size: .xl3, weight: JdToken.FontWeight.semibold, mono: true, lineLimit: 2)
                .padding(.horizontal, JdToken.Space.s4)
                .padding(.vertical, JdToken.Space.s3)
                .frame(maxWidth: .infinity)
                .background(JdToken.Color.cardHover.color)
                .cornerRadius(JdToken.Radius.lg)

            JdText(numberCallNote(state), size: .xs2, dimmed: true, mono: true, lineLimit: 3)

            VStack(spacing: JdToken.Space.s1) {
                Text(numberStyleNote)
                Text(numberLocaleNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}
