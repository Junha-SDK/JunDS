/**
 * finance "최근 본 종목" 저장소 (v2 finance/lib/recentlyViewed 이식).
 *
 * <jd-recent-visit-tracker>(쓰기)와 <jd-recently-viewed>(읽기)가 공유하는 단일 소스.
 * drawer가 modal을 상속하듯(§6 R12) 두 컴포넌트가 이 모듈 하나를 나눠 쓴다 —
 * 각자 localStorage 접근 코드를 복제하지 않는다.
 *
 * createStoredValue(behaviors/storage)를 쓰지 않는 이유:
 *  - v2는 값이 **배열**이고 recordVisit이 dedupe+prepend+cap이라는 도메인 연산을 한다.
 *    범용 get/set 저장소 위에 얹으면 오히려 래핑이 늘어난다.
 *  - v2는 같은 탭 구독자에게 커스텀 이벤트("recent:change")로 알린다. storage 이벤트는
 *    **다른 탭**만 발화하기 때문이다. 두 신호를 여기서 함께 다룬다(상위집합).
 *
 * key는 v2의 "buttermoney.recent.v1"을 라이브러리 중립 기본값으로 바꾸되
 * (앱 브랜드명을 라이브러리에 박지 않는다), 컴포넌트의 `storage-key`로 재정의 가능.
 */
export const RECENT_DEFAULT_KEY = "jd-finance-recent-v1";
const RECENT_MAX = 12;
/** 같은 탭 내 인스턴스 동기화용 window 이벤트 (detail.key로 필터) */
const RECENT_EVENT = "jd-recent-change";

interface RecentChangeDetail {
  key: string;
}

/** 저장소에서 이름 목록을 읽는다. 손상 JSON·접근 거부는 빈 배열로 흡수(v2 동형). */
export function readRecent(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function writeRecent(key: string, items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent<RecentChangeDetail>(RECENT_EVENT, { detail: { key } }),
    );
  } catch {
    // 용량 초과·사생활 모드 — 조용히 무시(v2 동형)
  }
}

/** 방문 기록: 최근 항목을 맨 앞으로, 중복 제거 후 MAX개로 자른다(v2 recordVisit). */
export function recordVisit(key: string, name: string): void {
  if (!name) return;
  const cur = readRecent(key);
  const next = [name, ...cur.filter((x) => x !== name)].slice(0, RECENT_MAX);
  writeRecent(key, next);
}

/** 목록 비우기(v2 clearRecent). */
export function clearRecent(key: string): void {
  writeRecent(key, []);
}

/**
 * 목록 변경 구독. 같은 탭(커스텀 이벤트)과 다른 탭(storage 이벤트)을 모두 듣고,
 * 해당 key의 변경일 때만 콜백에 최신 목록을 넘긴다. 반환값은 해지 함수.
 */
export function subscribeRecent(key: string, fn: (items: string[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = (e: Event): void => {
    if ((e as CustomEvent<RecentChangeDetail>).detail?.key === key) fn(readRecent(key));
  };
  const onStorage = (e: StorageEvent): void => {
    if (e.key === key || e.key === null) fn(readRecent(key));
  };
  window.addEventListener(RECENT_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(RECENT_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
