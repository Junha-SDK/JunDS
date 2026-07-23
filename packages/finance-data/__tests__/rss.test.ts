/** RSS 파서/페처 계약 테스트 — fetch 모킹. CDATA/엔티티/누락 필드 관대 처리 검증. */
import { describe, it, expect, vi, afterEach } from "vitest";
import { textResponse, stubFetchByUrl } from "./helpers.js";
import { parseRss, fetchRss, fetchAllFeeds, FEED_SPECS, type RssFeedSpec } from "../src/rss.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>테스트 피드</title>
  <item>
    <title><![CDATA[삼성전자 &quot;최대 실적&quot; 발표]]></title>
    <link>https://news.test/a1</link>
    <description><![CDATA[<p>본문   요약이다.</p>]]></description>
    <pubDate>Thu, 23 Jul 2026 09:30:00 +0900</pubDate>
    <author>기자A</author>
  </item>
  <item>
    <title>링크 없는 기사</title>
  </item>
  <item>
    <title>날짜 없는 기사 &amp; 특수문자</title>
    <link>https://news.test/a2</link>
  </item>
</channel></rss>`;

describe("parseRss", () => {
  it("CDATA/HTML 태그/엔티티 해제, 공백 정규화", () => {
    const items = parseRss(SAMPLE_XML, "매일경제");
    expect(items).toHaveLength(2); // 링크 없는 항목 제외
    expect(items[0]!.title).toBe('삼성전자 "최대 실적" 발표');
    expect(items[0]!.description).toBe("본문 요약이다.");
    expect(items[0]!.source).toBe("매일경제");
    expect(items[0]!.author).toBe("기자A");
    expect(new Date(items[0]!.publishedAt).toISOString()).toBe(items[0]!.publishedAt);
    // KST 09:30 → UTC 00:30
    expect(items[0]!.publishedAt).toBe("2026-07-23T00:30:00.000Z");
  });

  it("날짜 없는 항목은 현재 시각 ISO로 보충, author 없으면 undefined", () => {
    const items = parseRss(SAMPLE_XML, "src");
    expect(items[1]!.title).toBe("날짜 없는 기사 & 특수문자");
    expect(items[1]!.author).toBeUndefined();
    expect(Number.isNaN(Date.parse(items[1]!.publishedAt))).toBe(false);
  });

  it("description은 240자 절단", () => {
    const long = "가".repeat(500);
    const xml = `<item><title>t</title><link>https://x</link><description>${long}</description></item>`;
    const items = parseRss(xml, "s");
    expect(items[0]!.description).toHaveLength(240);
  });

  it("item 블록이 없으면 빈 배열", () => {
    expect(parseRss("<rss><channel></channel></rss>", "s")).toEqual([]);
  });
});

describe("fetchRss", () => {
  const SPEC: RssFeedSpec = { source: "테스트", url: "https://feed.test/rss" };

  it("정상 응답 파싱", async () => {
    stubFetchByUrl([["feed.test", () => textResponse(SAMPLE_XML)]]);
    const items = await fetchRss(SPEC);
    expect(items).toHaveLength(2);
    expect(items[0]!.source).toBe("테스트");
  });

  it("HTTP 실패/네트워크 예외는 빈 배열 (graceful)", async () => {
    stubFetchByUrl([["feed.test", () => textResponse("err", 500)]]);
    expect(await fetchRss(SPEC)).toEqual([]);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
    expect(await fetchRss(SPEC)).toEqual([]);
  });
});

describe("fetchAllFeeds", () => {
  it("여러 피드 병합 후 최신 우선 정렬", async () => {
    const xmlA = `<item><title>old</title><link>https://a/1</link><pubDate>Mon, 01 Jul 2026 00:00:00 GMT</pubDate></item>`;
    const xmlB = `<item><title>new</title><link>https://b/1</link><pubDate>Fri, 24 Jul 2026 00:00:00 GMT</pubDate></item>`;
    stubFetchByUrl([
      ["a.test", () => textResponse(xmlA)],
      ["b.test", () => textResponse(xmlB)],
    ]);
    const items = await fetchAllFeeds([
      { source: "A", url: "https://a.test/rss" },
      { source: "B", url: "https://b.test/rss" },
    ]);
    expect(items.map((i) => i.title)).toEqual(["new", "old"]);
  });

  it("기본 스펙은 4개 피드 (v2 데이터 보존)", () => {
    expect(FEED_SPECS).toHaveLength(4);
    expect(FEED_SPECS.every((s) => s.url.startsWith("https://"))).toBe(true);
  });
});
