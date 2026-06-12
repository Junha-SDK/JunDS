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
