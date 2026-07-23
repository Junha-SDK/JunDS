# @junds/finance-data

JunDS v3 금융 데이터 연동 패키지. v2(`@junds/ui`)의 `ds/finance/lib`에서 **네트워크/데이터
계열만** 분리 이관했다 (01-repo-structure §3.3, DEC-003). 프레임워크 무관 순수 TS —
**React import 0**. `yahoo-finance2`는 이 패키지의 정규 dependency이며, 이로써 코어
3패키지(web/ios/react)는 런타임 의존성 0을 유지한다.

```
빌드:  npm run build   → dist/esm + dist/cjs + dist/types (tsc 듀얼 에밋)
검사:  npm run typecheck (v2 시그니처 패리티 포함 — __tests__/signatures.test.ts)
테스트: npm run test    (vitest, 전면 모킹 — 실 API 호출 없음)
```

## 모듈 맵 — v2 경로 → v3 서브패스

| v2 (`@junds/ui/finance/lib/*`) | v3 (`@junds/finance-data/*`) | 런타임 | 비고 |
|---|---|---|---|
| `yahoo` | `yahoo` | 서버 권장 | 시그니처 동일. 배럴 제외(서브패스 전용) |
| `kis` | `kis` | **서버 전용** | 시그니처 동일. node:fs·env 의존, 브라우저 평가 시 throw. 배럴 제외 |
| `ecos` | `ecos` | 서버 권장 | 시그니처 동일 |
| `fred` | `fred` | 서버 권장 | 시그니처 동일 |
| `rss` | `rss` | 서버 권장 | 시그니처 동일 |
| `newsSummary` | `newsSummary` | 어디서나 | 순수 함수. rss 파이프라인 후처리라 함께 이관 |
| `tickers` | `tickers` | 어디서나 | 정적 데이터 동일 |
| `livePrices` (스토어부) | `livePrices` | 클라 (SSR no-op) | `subscribe`/`currentTick`/`seedTick` 시그니처 동일. React 훅은 v2 잔류 |
| `liveIndices` (스토어부) | `liveIndices` | 클라 (SSR no-op) | v2 내부 함수를 `subscribeIndex`로 공개. `useLiveIndex` 훅은 v2 잔류 |
| (신설) | `stream` | 어디서나 | SSE 와이어 계약 타입+파서 — v2에 산재하던 것을 정본화 |
| (신설) | `config` | 어디서나 | 엔드포인트/시드 주입 (v2 하드코딩의 승격) |

훅 셤 예정(전환기, ds 동결 구역 소유권에서 수행): v2 `ds/finance/lib/livePrices.ts`는
이 패키지의 스토어를 re-export + React 훅만 유지하는 셤으로 축소된다.

## 서버 전용 경계

배럴(`@junds/finance-data`)은 **클라이언트 안전 모듈만** 담는다. `kis`와 `yahoo`는
반드시 서브패스로 import:

```ts
// 서버 (route handler / Server Action / 백엔드)
import { fetchQuote, fetchChart } from "@junds/finance-data/kis";
import { yahoo } from "@junds/finance-data/yahoo";

// 클라이언트 (바닐라 웹 컴포넌트 / react 어댑터)
import { subscribe, registerPoolCodes, configureFinanceData } from "@junds/finance-data";
```

## 런타임 설정 (config)

v2가 하드코딩했던 결합 2개를 주입 지점으로 승격했다. 기본값은 v2와 동일하므로
설정 없이 쓰면 v2와 같은 경로(`/api/kis/quotes`, `/api/quotes`, `/api/kis/stream`)를 탄다.

```ts
import { configureFinanceData } from "@junds/finance-data";

configureFinanceData({
  streamUrl: "/api/kis/stream",          // SSE 브리지
  kisQuotesUrl: "/api/kis/quotes",       // KIS REST 스냅샷 프록시
  batchQuotesUrl: "/api/quotes",         // Yahoo 배치 폴백 프록시
  seedLookup: (name) => demoDb[name],    // 틱 스토어 초기 시드 (v2: mock findStock)
});
```

## 환경변수 (서버 모듈)

| 변수 | 모듈 | 필수 | 미설정 시 |
|---|---|---|---|
| `KIS_BASE_URL` / `KIS_APP_KEY` / `KIS_APP_SECRET` | kis | ✔ | 호출 시 throw (명시 에러) |
| `KIS_CANO` / `KIS_ACNT_PRDT_CD` | kis | — | ""/"01" |
| `KIS_REST_MRKT_NXT` / `KIS_REST_MRKT_UNIFIED` | kis | — | "NX"/"UN" |
| `ECOS_API_KEY` | ecos | — | null 반환 (graceful) |
| `FRED_API_KEY` | fred | — | null 반환 (graceful) |

## 데이터 인터페이스 (웹/iOS 공용 계약)

모든 와이어 타입에는 소스 JSDoc에 **JSON 스키마 예시**가 달려 있다 — iOS는 같은 모양의
`Codable` 구조체를 만들면 된다. 정본 위치:

- REST 스냅샷: `KisQuote` `KisCandle` `KisOrderBook` `KisInvestorFlow` `KisIndex` (src/kis.ts)
- 거시 시계열: `EcosSeries`/`EcosPoint` (src/ecos.ts), `FredSeries`/`FredPoint` (src/fred.ts)
- 뉴스: `RssItem` (src/rss.ts), `NewsSummary` (src/newsSummary.ts)
- 실시간 SSE: `StreamTickEvent` `IndexTick` `OrderBookTick` (src/stream.ts)
- 클라 스토어 상태: `Tick` `PoolStatus` `RealPriceSource` (src/livePrices.ts)

### SSE 와이어 계약 (요약)

앱 서버가 KIS WebSocket을 SSE로 재방송한다. 이벤트 3종 — iOS는 URLSession
스트리밍으로 동일 페이로드를 소비한다:

| `event:` | 페이로드 | KIS TR | 구독 쿼리 |
|---|---|---|---|
| `tick` | `StreamTickEvent` | 체결 | `?codes=이름,이름` (SSE당 ≤50) |
| `index` | `IndexTick` | H0UPCNT0 | `?indices=KOSPI,KOSDAQ` |
| `orderbook` | `OrderBookTick` | H0STASP0 | `?orderbook=이름` |

malformed 페이로드 방어는 `parseStreamTickEvent`/`parseIndexTickEvent`/
`parseOrderBookTickEvent`가 정본이다 (Swift 쪽도 같은 판정 규칙 권장:
필수 키 부재·비수치 price → drop).

## 잔류 판정 (이 패키지에 없는 것들)

- **React 훅 전부** (`use*`, localStorage 스토어: alerts/holdings/watchlist/tradeJournal/
  snapshots/recentlyViewed/themeMode/accentColor/koreaTime 등) — v2 잔류, v3에서는
  web Behavior/react 어댑터가 이 패키지의 스토어를 소비.
- **순수 계산 계열** (format/tax/marketHolidays/backtest/chartIndicators/heatmapColor) —
  §3.3에 따라 v3 코어(web `internal/`, iOS `JunDSCore`)로 언어 중립 이식 (별도 슬라이스).
- **Mock/데모 데이터** (mock/stocks/heatmapData/financials/compareData/investors/
  marketSignals/dailyThemes/monthlyThemes/disclosureTone/strategy/positions/consensus) —
  데모 계층. ※ consensus는 스펙 명명과 달리 **데이터 페치부가 실재하지 않음**(전부
  mock 파생 스코어링) — DEC-014 참조.
- **auth** — 금융 데이터가 아니라 앱 게이트(HMAC 토큰). 앱 관심사로 잔류.
