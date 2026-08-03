# JunDS iOS — 사용법 07 · finance 차트 8종

DEC-049의 차트 8종. 전부 같은 구조다 — **좌표·눈금·판정은 Core 지오메트리**
(`JdChartGeometry` · `JdChartAxis` · 차트별 `…Geometry/Layout`)가 계산하고, SwiftUI는
`Canvas` 한 패스 · UIKit은 `draw(_:)` 한 패스로 결과만 그린다. 도형을 뷰 트리에 쌓지 않는다.

| #   | SwiftUI              | UIKit                    | 웹                  | 한 줄                                       |
| --- | -------------------- | ------------------------ | ------------------- | ------------------------------------------- |
| 1   | `JdAreaChart`        | `JdAreaChartView`        | `AreaChart`         | 기준선 위/아래를 색으로 가르는 영역 차트    |
| 2   | `JdMultiLineChart`   | `JdMultiLineChartView`   | `MultiLineChart`    | 다중 시리즈 비교 라인(첫 값 = 0% 정규화)    |
| 3   | `JdDonutChart`       | `JdDonutChartView`       | `DonutChart`        | 구성비 도넛 + 중앙 라벨/값                  |
| 4   | `JdQuarterBarChart`  | `JdQuarterBarChartView`  | `QuarterBarChart`   | 분기 매출·이익 짝 막대                      |
| 5   | `JdInvestorFlowChart`| `JdInvestorFlowChartView`| `InvestorFlowChart` | 외국인·기관·개인 순매수 3연 막대            |
| 6   | `JdCandleChart`      | `JdCandleChartView`      | `CandleChart`       | 캔들 + 거래량 + 이동평균 + 마커 라인        |
| 7   | `JdMarketIndexChart` | `JdMarketIndexChartView` | `MarketIndexChart`  | 타임프레임 pill + MA 범례 + 캔들(합성)      |
| 8   | `JdRealCandleChart`  | `JdRealCandleChartView`  | `RealCandleChart`   | 출처 배지 + 신선도 + 캔들(합성)             |

## 공통 규칙

### 데이터는 라이브러리 밖이다 (DEC-019)

웹의 `MarketIndexChart`(mock 생성) · `RealCandleChart`(fetch·폴링) · `InvestorFlowChart`
(`buildFlow`)는 데이터를 스스로 만들거나 구독했다. iOS는 전부 **데이터를 인자로 받는 뷰**다 —
시세 조회·집계·폴링은 앱(또는 후속 라이브 배선)의 몫이고, 컴포넌트는 판정된 값만 그린다.

### 비수치 안전 규칙이 셋으로 갈린다 (규칙 ② 확장)

| 계열                        | 처리                                | 왜                                                              |
| --------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| 단일 선(Area·Sparkline·Candle) | `sanitize` — 대입 시점에 **제거**   | 좌표 하나가 NaN이면 path 전체가 에러 없이 사라진다              |
| 다중 선(MultiLine)          | **nil로 보존** — 점만 건너뛴다      | 여러 시리즈가 한 x축을 공유하므로 지우면 시리즈끼리 축이 밀린다 |
| 막대(QuarterBar·InvestorFlow) | **0으로 눕힌다**                    | rect 하나가 NaN이면 min/max까지 오염되고, 지우면 라벨이 밀린다  |

도넛은 0·음수·비수치 조각을 거른다 — 웹은 안 걸러서 음수 하나가 전체 각도를 망가뜨린다.

### 표면색은 `JdChartTheme` · 추세색은 `JdFinanceTheme`

격자(`grid`)·축(`axis`)은 웹 `--bm-grid`/`--bm-axis`의 대응분으로 `JdChartTheme`에 있고
앱이 override할 수 있다. 추세색(up/down)은 06의 `JdFinanceTheme` 그대로다. 계열 정체성 색
(QuarterBar 매출/이익, InvestorFlow 기관/개인, MA 5색)은 웹 주석을 승계해 **의미 토큰으로
접지 않는다** — 서로 구분되는 것 자체가 기능이다.

### 축 산수는 한 벌이다

웹이 파일마다 복사한 `niceStep`(1·2·5 사다리)·눈금 나열이 iOS에선 `JdChartAxis` 한 곳이다.
차트별 클램프(Area 1 · InvestorFlow 0.1 · 기본 0.001)와 max 포함 여부(`<` vs `<=`)까지
웹 차이를 그대로 보존한다.

### 접근성 — 라벨 유무가 정보/장식을 가른다 (Sparkline과 같은 계약)

`label:`을 주면 `.isImage` + 접근성 라벨로 승격되고, 없으면 접근성 트리에서 숨는다.
예외 하나: **InvestorFlowChart는 기본이 정보다** — 웹이 `role="img"` + aria-label을 항상
붙이는 유일한 차트라 `label` 기본값이 "투자자별 순매수 추이"다.

### 웹 계약 중 옮기지 않은 것

- **hover 크로스헤어·툴팁**(Area·MultiLine·Candle) — 마우스 전용 DOM 상호작용.
- **CandleChart 기술 지표 15종**(RSI·MACD·Bollinger·Ichimoku·VolumeProfile 등 서브패널),
  이벤트 마커, heikin/line/area 표현 변형(area는 `JdAreaChart` 담당), compareLine — 후속.
- **RealCandleChart의 fetch·폴링·"Yahoo에서 보기" 링크** — 데이터/내비게이션은 앱의 몫.

---

## 1. JdAreaChart / JdAreaChartView

기준선(`baseline`, 없으면 상자 세로 중앙) 위는 up 그라디언트, 아래는 down 그라디언트.
선 색은 **마지막 값이 기준보다 크냐**로 정해진다(웹 이진 분기 — 같으면 down).

```swift
// SwiftUI
JdAreaChart(values: closes)                                  // 380×200
JdAreaChart(values: closes, baseline: prevClose)             // 전일 종가 기준
JdAreaChart(values: closes, width: 320, height: 160, label: "지수 추이")
```

```swift
// UIKit
let chart = JdAreaChartView(values: closes, baseline: prevClose)
chart.values = updated       // 다시 그린다(좌표 재계산은 Core)
chart.baseline = nil         // 기준선이 상자 중앙으로 돌아온다
```

## 2. JdMultiLineChart / JdMultiLineChartView

시리즈마다 색을 소비자가 준다(정체성 색). 기본 `normalize: true`면 각 시리즈의 첫 값을
0%로 두고 등락률로 겹쳐 그린다 — 절대값 비교면 `normalize: false`.

```swift
// SwiftUI
JdMultiLineChart(series: [
    JdChartSeries(name: "삼성전자", color: JdToken.Color.primary, data: samsung),
    JdChartSeries(name: "KOSPI", color: JdToken.Color.hueTeal, data: kospi),
])
JdMultiLineChart(series: series, normalize: false, unit: "")   // 절대값 + 단위 없음
JdMultiLineChart(series: series, showsLegend: false)
```

```swift
// UIKit
let chart = JdMultiLineChartView(series: series, label: "지수 대비 수익률")
chart.series = updated
chart.normalize = false
```

**첫 값이 0인 시리즈는 정규화되지 않는다**(웹 `if (!base)` 동형 — 0으로 나눌 수 없다).
비수치 값은 그 점만 건너뛴다(인덱스 보존 — 시리즈끼리 x축이 밀리지 않는다).

## 3. JdDonutChart / JdDonutChartView

조각 색도 소비자가 준다. 중앙 라벨/값은 옵션.

```swift
// SwiftUI
JdDonutChart(
    slices: [
        JdDonutSlice(label: "국내주식", value: 62, color: JdToken.Color.primary),
        JdDonutSlice(label: "해외주식", value: 28, color: JdToken.Color.hueTeal),
        JdDonutSlice(label: "현금", value: 10, color: JdToken.Color.hueAmber),
    ],
    centerLabel: "총자산", centerValue: "1.2억",
    label: "자산 구성")
```

```swift
// UIKit
let donut = JdDonutChartView(slices: slices, size: 180, thickness: 22)
donut.centerValue = "1.3억"     // 값만 바꿔도 다시 그린다
```

**0·음수·비수치 조각은 그리지 않는다.** 합이 0이면 배경 트랙만 남는다.

## 4. JdQuarterBarChart / JdQuarterBarChartView

분기별 매출(항상 왼쪽, `#5cdcd0`)과 이익(오른쪽 — `metric`으로 영업이익/순이익 선택)의
짝 막대. 이익이 음수면 0선 아래로 내려간다.

```swift
// SwiftUI
JdQuarterBarChart(data: [
    JdQuarterRow(label: "1Q24", revenue: 71_000, operatingIncome: 6_600, netIncome: 5_100),
    JdQuarterRow(label: "2Q24", revenue: 74_000, operatingIncome: 10_400, netIncome: 8_900),
])
JdQuarterBarChart(data: rows, metric: .revenueNet)    // 매출 · 순이익
```

```swift
// UIKit
let chart = JdQuarterBarChartView(data: rows, label: "분기 실적")
chart.metric = .revenueNet
```

**범위 규칙이 비대칭이다**(웹 동형): max는 두 지표 전체, min은 0과 **이익**만 본다 —
매출은 음수가 없다는 재무 도메인 가정이다.

## 5. JdInvestorFlowChart / JdInvestorFlowChartView

하루당 3막대(외국인·기관·개인, 억원). 외국인만 추세색(매수 up·매도 down)이고 기관·개인은
주체 정체성 색이다. 0은 상승 쪽(최소 1pt 막대) — 죽은 날처럼 보이지 않게.

```swift
// SwiftUI — label 기본값이 "투자자별 순매수 추이"(기본이 정보)
JdInvestorFlowChart(data: flows)
JdInvestorFlowChart(data: flows, width: 360, height: 180)
```

```swift
// UIKit
let chart = JdInvestorFlowChartView(data: flows)
chart.data = updated          // 날짜 라벨 간격(ceil(n/8))도 다시 계산된다
```

## 6. JdCandleChart / JdCandleChartView

캔들 + 거래량 패널 + 이동평균(기본 5·10·20·60·120) + 가로 마커 라인 + 현재가 칩.

```swift
// SwiftUI
JdCandleChart(candles: candles)                               // 380×380
JdCandleChart(candles: candles, showsVolume: false, movingAverages: [20, 60])
JdCandleChart(candles: candles, logScale: true)               // 장기 차트 — 양수 범위에서만
JdCandleChart(
    candles: candles,
    markers: [
        JdCandleMarkerLine(label: "B1", price: 68_400, color: JdToken.Color.hueBlue),
        JdCandleMarkerLine(label: "현재", price: kisPrice, color: JdToken.Color.hueRose,
                           live: true),                        // 점선 + 우측 맥동 점
    ],
    separatorIndex: 40,
    xLabels: [JdCandleXLabel(index: 1, label: "1/2"),
              JdCandleXLabel(index: 60, label: "오늘", bold: true)],
    label: "삼성전자 일봉")
```

```swift
// UIKit
let chart = JdCandleChartView(candles: candles, width: 380, height: 380)
chart.candles = updated       // 비수치 봉은 대입 시점에 걸러진다
chart.markers = [JdCandleMarkerLine(label: "현재", price: p, color: c, live: true)]
chart.logScale = true
```

**마커 두 종류**: 정적 마커(실선 + 좌측 라벨 칩)는 y축 범위에 **포함**되고, `live` 마커
(점선 + 맥동 점)는 범위에서 **제외**된다 — 실시간 체결가가 캔들 범위와 동떨어져도 차트가
쏠리지 않고, 화면 밖이면 ▲/▼로 접힌 방향만 알린다. 맥동은 Reduce Motion이면 정지 점만
남는다(`JdMotion` 경유).

**거래량 막대색은 웹과 의도적으로 다르다.** 웹 v2는 리터럴 빨강/파랑(한국 관례)을 박아 두어
테마를 바꿔도 거래량만 따로 놀았다 — iOS는 `JdFinanceTheme.up/down`의 55% 워시라 앱의
색 override를 따라온다.

## 7. JdMarketIndexChart / JdMarketIndexChartView

타임프레임 pill(월·주·일·분 등 — 라벨도 데이터다) + MA 범례 + `JdCandleChart` 합성.
웹의 mock 생성 대신 **타임프레임별 캔들을 인자로 받는다**.

```swift
// SwiftUI
JdMarketIndexChart(
    timeframes: [
        JdMarketIndexTimeframe(label: "일", candles: daily, separatorIndex: 40,
                               xLabels: [JdCandleXLabel(index: 1, label: "1/2")]),
        JdMarketIndexTimeframe(label: "분 15분", candles: minutes),
    ],
    selectedIndex: 0,
    onSelect: { index in analytics.log("tf", index) })
```

```swift
// UIKit
let chart = JdMarketIndexChartView(timeframes: timeframes)
chart.onSelect = { index in … }   // 사용자 탭에만 발화
chart.select(1)                    // 프로그램 선택 — 콜백 없음(웹 계약 동형)
```

선택 pill은 accent 소프트 배경 + bold(웹 `aria-pressed` → `.selected` 트레이트).
웹의 `bm-card p-3` 래퍼는 소비자의 몫이다.

## 8. JdRealCandleChart / JdRealCandleChartView

출처 배지("… · 실시간"/"샘플 데이터"/"데이터 불러오는 중…") + 봉 수 캡션 + 신선도 +
`JdCandleChart` 합성. **네트워크가 없다** — 앱이 데이터·출처·경과 초를 주입한다.

```swift
// SwiftUI
JdRealCandleChart(
    candles: bars,
    source: .live,                        // .live / .sample / .loading
    liveLabel: "KIS · 실시간",             // 라이브 배지 문구(데이터 출처)
    rangeLabel: "3mo", intervalLabel: "1d",   // 라이브일 때만 "88봉 · 3mo 1d"
    secondsSinceUpdate: 12,               // "12초 전 갱신" — 재계산은 앱의 타이머
    markers: [JdCandleMarkerLine(label: "현재", price: p, color: c, live: true)],
    label: "삼성전자 일봉")
```

```swift
// UIKit
let chart = JdRealCandleChartView(candles: bars, source: .loading)
chart.candles = fetched          // 앱의 로더가 값을 흘린다
chart.source = .live
chart.secondsSinceUpdate = 0     // "방금 갱신"
```

**신선도 규칙**은 웹 동형(`< 5초 방금 · < 60초 n초 전 · n분 전`)이되, 5초마다 다시 세는
타이머는 뷰가 아니라 앱의 몫이다 — 라이브 배선(폴링·장중 판정) 후속과 함께 온다.

---

## 조립 예 — 종목 상세 화면

```swift
ScrollView {
    VStack(alignment: .leading, spacing: JdGap.md.value) {
        // 실시간 캔들 — 앱 스토어가 데이터를 흘린다
        JdRealCandleChart(candles: store.bars, source: store.source,
                          liveLabel: "KIS · 실시간",
                          secondsSinceUpdate: store.age,
                          width: 720, height: 360)

        HStack(alignment: .top, spacing: JdGap.md.value) {
            JdQuarterBarChart(data: store.quarters, label: "분기 실적")
            JdDonutChart(slices: store.ownership, size: 180,
                         centerLabel: "외국인", centerValue: "51.2%")
        }

        JdInvestorFlowChart(data: store.flows, width: 720, height: 220)
    }
    .padding(JdToken.Space.s4)
}
```
