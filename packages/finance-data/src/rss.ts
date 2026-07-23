/**
 * 의존성 없이 단순 RSS 2.0 채널을 파싱한다.
 * <item> 안의 title / link / pubDate / description / author 정도만 추출.
 * CDATA, 엔티티, 누락 필드 모두 관대하게 처리.
 *
 * v2 원본: ds/finance/lib/rss.ts (시그니처·동작 동일 이관).
 */

import type { FetchInit } from "./config.js";

/**
 * 정규화된 뉴스 항목.
 *
 * JSON 스키마:
 * ```json
 * {
 *   "title": "삼성전자, 2분기 영업익 …",   // string
 *   "link": "https://…",                  // string — 기사 URL
 *   "description": "…",                   // string — 본문 요약 (최대 240자)
 *   "source": "매일경제",                  // string — 매체명
 *   "publishedAt": "2026-07-24T05:30:00.000Z",  // string — ISO 8601
 *   "author": "홍길동"                     // string | 없음(옵셔널)
 * }
 * ```
 */
export interface RssItem {
  title: string;
  link: string;
  description: string;
  source: string;
  publishedAt: string; // ISO
  author?: string;
}

const HTTP_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ButterMoney/1.0",
  Accept: "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9",
} as const;

export interface RssFeedSpec {
  source: string;
  url: string;
  /** 원래 매체에서 제공하는 카테고리 표기 (UI 필터용) */
  category?: "증권" | "경제" | "산업" | "정책" | "해외";
}

export const FEED_SPECS: RssFeedSpec[] = [
  {
    source: "매일경제",
    url: "https://www.mk.co.kr/rss/50200011/",
    category: "증권",
  },
  {
    source: "한국경제",
    url: "https://www.hankyung.com/feed/finance",
    category: "증권",
  },
  {
    source: "한국경제",
    url: "https://www.hankyung.com/feed/economy",
    category: "경제",
  },
  {
    source: "파이낸셜뉴스",
    url: "https://www.fnnews.com/rss/r20/fn_realnews_finance.xml",
    category: "증권",
  },
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  return m ? m[1] ?? "" : "";
}

function parseDate(s: string): string {
  if (!s) return new Date().toISOString();
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString();
  return new Date().toISOString();
}

export function parseRss(xml: string, source: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.split(/<item\b/i).slice(1);
  for (const raw of blocks) {
    const end = raw.search(/<\/item>/i);
    if (end < 0) continue;
    const block = raw.slice(0, end);
    const title = decodeEntities(extractTag(block, "title"));
    const link = decodeEntities(extractTag(block, "link"));
    if (!title || !link) continue;
    const description = decodeEntities(extractTag(block, "description")).slice(0, 240);
    const pubDate = decodeEntities(extractTag(block, "pubDate"));
    const author = decodeEntities(extractTag(block, "author")) || undefined;
    items.push({
      title,
      link,
      description,
      source,
      publishedAt: parseDate(pubDate),
      author,
    });
  }
  return items;
}

export async function fetchRss(spec: RssFeedSpec, revalidate = 300): Promise<RssItem[]> {
  try {
    const init: FetchInit = { headers: HTTP_HEADERS, next: { revalidate } };
    const res = await fetch(spec.url, init);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, spec.source);
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(specs: RssFeedSpec[] = FEED_SPECS, revalidate = 300): Promise<RssItem[]> {
  const all = await Promise.all(specs.map((s) => fetchRss(s, revalidate)));
  // 시간순(최신 우선)
  const merged = all.flat();
  merged.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return merged;
}
