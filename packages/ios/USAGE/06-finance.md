# JunDS iOS — 사용법 06 · finance 리프 (가격·등락 어휘)

시세를 **읽는** 최소 단위 6종 + 그것들을 화면에 **놓는** 조립 3종. 웹 finance 86종 중 대부분이 이 리프들을 조립해 만들어지므로,
이 문서의 어휘(추세 판정·도메인 색·숫자 포맷)를 먼저 이해하면 나머지가 따라온다.

| # | SwiftUI | UIKit | 웹 | 한 줄 |
|---|---|---|---|---|
| 1 | `JdLivePctText` | `JdLivePctTextView` | `jd-live-pct-text` | 등락률 텍스트 (색 없음 — 골격 정본) |
| 2 | `JdLivePctBadge` | `JdLivePctBadgeView` | `jd-live-pct-badge` | 등락률 + 추세 색 (live 판정) |
| 3 | `JdLivePriceText` | `JdLivePriceTextView` | `jd-live-price-text` | 현재가 텍스트 (없으면 “—”) |
| 4 | `JdLiveStatusDot` | `JdLiveStatusDotView` | `jd-live-status-dot` | 장 세션 라이브 점 + 라벨 |
| 5 | `JdPriceBadge` | `JdPriceBadgeView` | `jd-price-badge` | 등락률 + 추세 화살표 (exact 판정) |
| 6 | `JdHotPctChip` | `JdHotPctChipView` | `jd-hot-pct-chip` | 급등 강조 알약 (늘 상승 표기) |
| 7 | `JdLiveStackedCell` | `JdLiveStackedCellView` | `jd-live-stacked-cell` | 가격+등락률 2단 우측정렬 셀 |
| 8 | `JdPositionBar` | `JdPositionBarView` | `jd-position-bar` | 구간 대비 현재 위치 막대 |
| 9 | `JdMicroKpiRow` | `JdMicroKpiRowView` | `jd-live-micro-kpi-row` | KPI 셀 N칸 (배치 자체 소유) |

## 공통 규칙

### 데이터는 라이브러리 밖이다

시세 구독·장 세션 계산(공휴일·프리/애프터)은 **앱 또는 `@junds/finance-data` 스코프**이고
(DEC-003 · DEC-019), 컴포넌트는 판정된 값만 프로퍼티로 받는다. 웹 v2가 `useLivePrice(name)` ·
`useMarketStatus()` 훅을 직접 구독했던 것을 v3가 주입으로 바꿨고 iOS도 같은 계약이다.

```swift
// 앱이 소유한 스토어 → 뷰에 값만 흘린다
JdLivePctBadge(change: quote.changeRate, fallback: seed.changeRate)
JdLiveStatusDot(live: session.isTrading)
```

### 추세 판정 규칙이 **세 개** 있다

같은 값이 컴포넌트에 따라 다른 추세로 판정된다. 버그가 아니라 웹에서 승계한 의도된 차이이고,
그래서 규칙 자체가 타입(`JdTrendPolicy`)이다.

| 정책 | 쓰는 곳 | flat(보합) | 왜 |
|---|---|---|---|
| `.live` | `JdLivePctBadge` | `[-0.005, 0]` — 음수 쪽만 | 실시간 틱은 잘게 흔들린다. "거의 0"을 회색으로 눌러 눈이 덜 피로하게. `up(> 0)`이 flat보다 **우선**하므로 `+0.003`은 상승색이다 |
| `.exact` | `JdPriceBadge` | `0`뿐 | 확정된 일봉 등락률엔 임계값을 두지 않는다 |
| `.gainOrEven` | `JdLiveStackedCell` · `JdMicroKpiCell` | **없음** (`>= 0`은 상승) | 두 값이 **한 색으로 묶인** 셀이다. 0%에 회색을 주면 그 행 전체가 죽은 것처럼 보인다 |

```swift
JdTrend.resolve(-0.003, policy: .live)        // .flat  (보합 — 회색)
JdTrend.resolve(-0.003, policy: .exact)       // .down  (하락 — 빨강)
JdTrend.resolve( 0.0,   policy: .gainOrEven)  // .up    (상승 — flat이 없다)
```

### 색은 `JdFinanceTheme` 한 곳에서 온다

웹은 33개 CSS 파일이 `--jd-fin-up: var(--bm-up, var(--jd-color-success))` 폴백 체인을 각자
재선언한다. iOS엔 CSS 캐스케이드가 없으므로 같은 "기본값 + 앱 override" 구조를 정적
프로퍼티로 만들었다. 기본값은 웹과 동일하게 **상승 = success(초록) · 하락 = danger(빨강)**이다.

```swift
// 앱 시작 시 1회 — 한국 시장 관례(적상승·청하락)로 바꾸려면
JdFinanceTheme.up   = JdDynamicColor(light: 0xE11D48FF, dark: 0xFB7185FF)
JdFinanceTheme.down = JdDynamicColor(light: 0x2563EBFF, dark: 0x60A5FAFF)
```

한국 관례를 기본으로 삼지 않은 이유: 웹 v2/v3가 이미 초록 상승으로 출고돼 있어 3플랫폼 표면이
갈라진다. 관례 전환은 앱의 판단으로 남긴다.

### 숫자는 흔들리지 않는다

전 컴포넌트가 **숫자만 등폭**인 폰트를 쓴다(SwiftUI `.monospacedDigit()` / UIKit
`JdFontBridge.scaledDigitFont`). 웹 `font-variant-numeric: tabular-nums`의 대응분으로, 값이
갱신될 때 자리수가 바뀌어도 폭이 변하지 않는다. 글자까지 등폭인 `scaledMonoFont`와 다르다 —
한글 라벨이 타자기처럼 보이지 않는다.

포맷은 **로케일이 고정**이다(`JdFinanceFormat` → `JdNumberFormat`). Core는 `Locale.current`를
읽지 않으며, 기기 지역 설정이 결과에 새면 스냅샷·테스트·디자인 대조가 흔들린다. 지역이 필요하면
`locale:` 인자로 명시한다.

---

## 1. JdLivePctText / JdLivePctTextView

등락률 텍스트 리프. **색을 스스로 정하지 않는다** — 추세 색은 파생(`JdLivePctBadge`) 또는
소비자의 몫이다. 웹 `LivePctText`가 색 없는 Fragment였던 것과 동형.

```swift
// SwiftUI
JdLivePctText(change: 1.234)                                  // "+1.23%"
JdLivePctText(change: 0, fallback: -2.5)                      // "-2.50%"
JdLivePctText(change: 3, showSign: false)                     // "3.00%"
JdLivePctText(change: 3, withPercent: false)                  // "+3.00"
JdLivePctText(change: 1.23456, decimals: 4)                   // "+1.2346%"
```

```swift
// UIKit — 프로퍼티 변경이 곧 재렌더(didSet)
let pct = JdLivePctTextView(change: 1.234)
pct.change = -0.87
pct.decimals = 1
print(pct.formatted)   // "-0.9%"
```

**`fallback`의 의미**: `change`가 **정확히 0**일 때만 대체값이 쓰인다(웹 `change !== 0` 분기).
시드 전 상태를 0으로 표현하던 v2 관용구를 보존한 것이며, 실제로 0%인 종목도 fallback으로
덮인다는 뜻이다 — 그게 싫으면 fallback을 주지 않는다.

---

## 2. JdLivePctBadge / JdLivePctBadgeView

1번의 포맷 골격을 그대로 쓰고 **추세 색만 얹는다**(12pt bold). 판정은 `.live` 규칙.

```swift
// SwiftUI — 합성(struct는 상속이 없다)
JdLivePctBadge(change: 1.234)          // 초록 "+1.23%"
JdLivePctBadge(change: -0.003)         // 회색 "-0.00%"  ← live 규칙: 보합
JdLivePctBadge(change: 0.003)          // 초록 "+0.00%"  ← up이 flat보다 우선
```

```swift
// UIKit — 상속(웹의 class extends를 그대로)
let badge = JdLivePctBadgeView(change: 0, fallback: -3)
badge.trend            // .down — 원시 change(0)가 아니라 표시값(-3%)으로 판정한다
badge.accessibilityLabel  // "하락 -3.00%"
```

**판정은 화면의 숫자로 한다.** `change: 0, fallback: -3`이면 화면엔 `-3.00%`가 뜨는데 추세를
원시 `change`로 판정하면 색이 보합(회색)이 되어 숫자와 어긋난다. 그래서 fallback이 반영된
표시값을 판정에 쓴다.

**접근성**: 색이 유일한 추세 신호가 되지 않게 `accessibilityLabel`에 "상승/하락/보합"을 붙인다.
웹엔 없는 보정이다.

---

## 3. JdLivePriceText / JdLivePriceTextView

현재가 텍스트. `price > 0`이 아니면 `fallback`, 둘 다 없으면 em dash(`—`).

```swift
// SwiftUI
JdLivePriceText(price: 71_200)                      // "71,200"
JdLivePriceText(price: 0, fallback: 68_000)         // "68,000"
JdLivePriceText(price: 0)                           // "—"
JdLivePriceText(price: 1_234.5, decimals: 2)        // "1,234.50"
JdLivePriceText(price: 1_234.5, locale: "de-DE")    // "1.234,5"
```

```swift
// UIKit
let price = JdLivePriceTextView(price: 71_200)
price.price = 0        // "—" + accessibilityLabel "가격 정보 없음"
```

**폴백 규칙이 등락률과 다르다**: 등락률은 `!= 0`, 가격은 `> 0`이다. 가격 0과 음수는 둘 다
"값 없음"이지만 등락률 0은 실제로 유효한 값일 수 있기 때문이다.

**접근성**: em dash를 VoiceOver가 "대시"로 읽으면 뜻이 사라지므로 "가격 정보 없음"으로 바꾼다.

---

## 4. JdLiveStatusDot / JdLiveStatusDotView

장 세션 상태 점 + 라벨(11pt bold). 라이브면 확장-소멸 링이 돈다.

```swift
// SwiftUI
JdLiveStatusDot(live: true)                        // 초록 점 + "실시간" + 링 펄스
JdLiveStatusDot(live: false)                       // 회색 점 + "장마감"
JdLiveStatusDot(live: true, label: "프리마켓")      // 라벨 override
```

```swift
// UIKit
let dot = JdLiveStatusDotView(live: true)
dot.label = "정규장"
dot.label = ""          // 빈 문자열 = override 해제 → "실시간"으로 복귀
dot.live = false        // 링이 숨는다(멈춘 반투명 원이 남으면 점이 두 겹으로 보인다)
```

**세션 판정은 앱이 한다.** 공휴일·NXT 프리/애프터 계산은 라이브러리 밖이고, `live`와 필요하면
세부 세션명(`label`)만 넘긴다.

**Reduce Motion**이면 링이 붙지 않는다(`JdMotion` 단일 진입점 경유, 04 §7.3). 웹 v2가
`setInterval(800ms)`로 box-shadow를 토글했던 것을 v3가 CSS 키프레임으로 옮겼고, iOS는
`CAAnimation`(UIKit) / `.repeatForever`(SwiftUI)로 옮겼다 — 타이머가 없다.

---

## 5. JdPriceBadge / JdPriceBadgeView

등락률 + 추세 화살표. 판정은 `.exact` 규칙(0만 보합)이고 **flat엔 화살표가 없다**.

```swift
// SwiftUI
JdPriceBadge(pct: 1.24)                            // ↗ "+1.24%" 초록
JdPriceBadge(pct: -4.56, size: .sm)                // ↘ "-4.56%" 빨강, 12pt
JdPriceBadge(pct: 0)                               // "0.00%" 회색, 화살표 없음
JdPriceBadge(pct: 1.24, showArrow: false)          // 화살표만 끈다
JdPriceBadge(pct: 1.24, bold: false)               // 굵기 medium(500)
```

```swift
// UIKit
let badge = JdPriceBadgeView(pct: 1.24)
badge.pct = -0.003     // .exact 규칙이므로 하락(빨강) — LivePctBadge라면 보합이다
badge.size = .sm
```

**화살표는 SF Symbols**(`chart.line.uptrend.xyaxis` / `downtrend`)다. 웹은 lucide
`TrendingUp/Down` 폴리라인이며, 서드파티 0 규칙 아래 의미가 같은 시스템 심볼로 번역했다 —
모양은 웹과 완전히 같지 않다.

**`JdLivePctBadge`와 언제 무엇을 쓰나**: 실시간으로 갱신되는 숫자엔 `JdLivePctBadge`(잘게
흔들리는 값을 보합으로 눌러 준다), 확정된 일/주/월 등락률엔 `JdPriceBadge`(화살표로 방향을
한 번 더 말해 준다).

---

## 6. JdHotPctChip / JdHotPctChipView

급등 강조 알약. **늘 상승 표기**(`↑ n%`)이고 부호·색 분기가 없다 — 음수를 넣어도 `↑`가 남는다.

```swift
// SwiftUI
JdHotPctChip(pct: 12.34)      // "↑ 12.34%" 흰 글자 + up색 세로 그라디언트 알약
```

```swift
// UIKit
let chip = JdHotPctChipView(pct: 12.34)
chip.pct = 29.9
```

**그라디언트 방향**: 위가 up 원색, 아래가 up + foreground 20%로 어둡다. 웹 v2는 위를 밝게
(up + 흰색 72%) 뒀는데 흰 글자가 얹히기엔 대비가 부족해 v3가 뒤집었고 iOS도 교정본을 따른다.

**알약 반경은 리터럴이 아니라 높이의 절반**이라 Dynamic Type에서 높이가 자라도 모양이 유지된다
(SwiftUI는 `Capsule`, UIKit은 `layoutSubviews`에서 `bounds.height / 2`).

**접근성**: `↑`는 낭독되지 않거나 "위쪽 화살표"로 읽히므로 라벨을 "급등 12.34%"로 준다.

---

## 조립 예 — 종목 행 하나

리프들이 어떻게 합쳐지는지. 이 조합이 웹 `jd-live-stacked-cell`·`jd-live-stock-table`의 한 행이다.

```swift
// SwiftUI
HStack {
    VStack(alignment: .leading, spacing: JdToken.Space.s0_5) {
        Text("삼성전자").font(.body)
        JdLiveStatusDot(live: session.isTrading)
    }
    Spacer()
    VStack(alignment: .trailing, spacing: JdToken.Space.s0_5) {
        JdLivePriceText(price: quote.price, fallback: seed.price)
            .font(.headline)
        JdLivePctBadge(change: quote.changeRate, fallback: seed.changeRate)
    }
}
.padding(JdGap.md.value)
```


---

## 7. JdLiveStackedCell / JdLiveStackedCellView

현재가(위) + 등락률(아래)을 **한 색으로 묶어** 우측정렬로 쌓은 셀. 표 종목 열의 관용구다.

```swift
// SwiftUI
JdLiveStackedCell(price: 71_200, change: 1.234)                    // "71,200" / "+1.23%" 초록
JdLiveStackedCell(price: 0, change: 0,
                  priceFallback: 68_000, pctFallback: -2.5)        // "68,000" / "-2.50%" 빨강
JdLiveStackedCell(price: 8_240, change: 0)                         // 0%도 상승색
```

```swift
// UIKit
let cell = JdLiveStackedCellView(price: 71_200, change: 1.234)
cell.change = -2.15          // 두 줄이 같이 빨강으로 바뀐다
print(cell.lines)            // (price: "71,200", pct: "-2.15%")
```

**리프를 조립하지 않는 이유**: 이 셀은 색 통로가 **하나**다. `JdLivePriceText` +
`JdLivePctBadge`를 얹으면 배지는 자기 색을 정하고 가격 텍스트는 정하지 않아 통로가 둘로
갈린다. 웹도 같은 이유로 상속하지 않았다.

**판정은 `.gainOrEven`** — flat이 없고 `0%`도 상승 쪽이다. 두 값이 한 색이라 0%에 회색을
주면 그 행 전체가 죽은 것처럼 보인다(v2 규칙 보존). 리프의 두 규칙과 함께 세 규칙이 된다.

**정렬**: `trailing`이 계약이다. 표 오른쪽 열에서 숫자 끝이 맞아야 읽히므로 소비자가
`.frame(width:, alignment: .trailing)`으로 열 폭만 잡아 주면 된다.

---

## 8. JdPositionBar / JdPositionBarView

`[low, high]` 구간 안에서 `cur`의 위치를 보여주는 막대. 값은 전부 **0~1 분수**다.

```swift
// SwiftUI — 폭은 소비자가, 높이는 스펙이 정한다(마커 12pt)
JdPositionBar(low: 0.2, high: 0.8, cur: 0.5).frame(width: 220)
JdPositionBar(low: 0.4, high: 0.9, cur: 0.45, tone: .down)
```

```swift
// UIKit
let bar = JdPositionBarView(low: 0.2, high: 0.8, cur: 0.5)
bar.cur = 0.1          // low보다 작아도 채움이 음수가 되지 않는다
bar.tone = .down
```

**좌표는 Core가 계산한다** (`JdPositionBarGeometry`). 두 렌더 계층이 같은 산수를 각자
구현하면 반드시 어긋나기 때문이다(04 §4.2). 클램프도 여기 있다:

- 범위 밖(`< 0`, `> 1`)은 0/100으로 접는다.
- **비유한(NaN·무한)은 0이다** — 100(최대)으로 접으면 데이터 결손이 "구간 끝 도달"로
  잘못 보인다. 웹 v3와 동형.
- 폭은 음수가 되지 않는다. 웹 v2는 `cur < low`일 때 음수 width를 냈다.

**마커는 트랙보다 크다**(12 vs 8pt). 그래서 트랙만 클립하고 마커는 그 바깥에 얹는다 —
전체 높이는 마커 기준이다. 마커는 `cur`이 아니라 **정중앙 50% 기준선**이다(웹 동형).

---

## 9. JdMicroKpiRow / JdMicroKpiRowView

KPI 소형 셀 N칸. **이 컴포넌트는 자기 배치를 스스로 소유한다.**

```swift
// SwiftUI — items만 넘기면 폭에 맞춰 열 수가 정해진다
JdMicroKpiRow(items: [
    .init(label: "USD/KRW", value: "1,320", pct: -0.4, unit: "원"),
    .init(label: "외국인",  value: "+1,204", pct: 1.2, hint: "순매수"),
    .init(label: "기관",    value: "-820",  pct: -0.8, hint: "순매도"),
    .init(label: "WTI",    value: "78.2",  pct: 1.1, unit: "$"),
])
JdMicroKpiRow(items: items, minCellWidth: 160)   // 셀을 더 넓게 → 열 수가 줄어든다
JdMicroKpiCell(item: items[0])                    // 한 칸만 단독으로도 쓸 수 있다
```

```swift
// UIKit — 높이는 랩 뷰가 계산해 보고한다
let row = JdMicroKpiRowView(items: items, minCellWidth: 132)
row.items = updated                  // 개수가 바뀌어도 재배치된다
row.sizeThatFits(CGSize(width: 360, height: .greatestFiniteMagnitude))
```

**왜 배치를 컴포넌트가 갖는가**: 웹은 호스트를 `display: contents`로 두어 격자 정의를
소비자에게 넘겼다. iOS엔 그런 투명 호스트가 없고, 무엇보다 소비자가 SwiftUI `LazyVGrid`
열 정의나 UIKit `UICollectionViewCompositionalLayout`을 **매번 짜야 하는 것**이 실제 비용이다.
그래서 SwiftUI는 `.adaptive(minimum:)` 격자, UIKit은 `JdWrapView(equalWidths:)`로 스스로
감싸 배치한다. 소비자가 정하는 것은 `minCellWidth` 하나다.

**중단점을 나열하지 않는 이유**: 웹은 `grid-cols-2 md:grid-cols-4`처럼 중단점을 썼지만
iOS는 기기 폭이 연속적이고 분할 화면·회전까지 있어 **최소 셀 폭**이 더 잘 맞는다.

**값은 이미 포맷된 문자열**이다 — 폴링·포맷은 앱의 몫(DEC-019). `pct`는 hint가 있어도
**착색을 결정**하고, `pct` 자체가 없으면 방향이 없어 muted다. `pct: 0`은 상승색이다
(`.gainOrEven`, StackedCell과 같은 규칙).

---

## 조립 예 2 — KPI 대시보드 + 종목 표

```swift
ScrollView {
    VStack(alignment: .leading, spacing: JdGap.md.value) {
        // 상단 KPI — 격자 정의 없이 한 줄
        JdMicroKpiRow(items: kpis)

        // 종목 표 — 왼쪽 정체성, 오른쪽 2단 셀
        ForEach(quotes) { q in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(q.name)
                    JdPositionBar(low: q.dayLow, high: q.dayHigh, cur: q.position)
                        .frame(width: 88)
                }
                Spacer()
                JdLiveStackedCell(price: q.price, change: q.changeRate)
                    .frame(width: 96, alignment: .trailing)
            }
        }
    }
    .padding(JdToken.Space.s4)
}
```
