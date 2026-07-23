/**
 * yahoo-finance2 클라이언트 싱글턴.
 *
 * v2 원본: ds/finance/lib/yahoo.ts (시그니처 동일 이관).
 * yahoo-finance2는 이 패키지의 정규 dependency다 — 코어 3패키지(web/ios/react)는
 * 런타임 의존성 0을 유지한다 (DEC-003).
 *
 * 서버 전용 권장: 무겁고(전체 라이브러리) 브라우저에서는 CORS로 야후 직접 호출이
 * 막히므로, 클라이언트는 앱의 프록시 라우트(`batchQuotesUrl`)를 쓴다.
 * 배럴(index)에서 제외되며 서브패스(`@junds/finance-data/yahoo`)로만 노출.
 */
import YahooFinance from "yahoo-finance2";

let _client: InstanceType<typeof YahooFinance> | null = null;

export function yahoo(): InstanceType<typeof YahooFinance> {
  if (!_client) {
    _client = new YahooFinance({
      suppressNotices: ["yahooSurvey", "ripHistorical"],
    });
  }
  return _client;
}
