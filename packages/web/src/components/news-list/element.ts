/**
 * <jd-news-list> — 종목/테마 관련 뉴스 목록 (v2 finance/NewsList).
 *
 * v2는 컴포넌트 안에서 /api/news를 fetch하고 4상태(로딩·에러·빈결과·목록)를 오갔다.
 * DS 컴포넌트는 **네트워크를 앱에 남기고 표시 전용**으로 둔다(jd-theme-news-summary와
 * 같은 판단): 앱이 `items`를 싣고 `loading`/`error`를 토글한다. 네 상태를 한 골격에서
 * hidden 토글로 전환한다(§3.3 멱등 — innerHTML 재구축 없이).
 *
 * 상대 시각("3시간 전")은 §3.1-3 결정성 위반(Date.now)이라 **초기 렌더 경로에서 빼고**,
 * connected() 이후 이펙트에서 채운다 — 프리렌더 스냅샷은 절대시각(item.time)만,
 * 방문자 브라우저에서 상대시각으로 갱신. item.time을 직접 주면 그대로 쓴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import newsListStyles from "./news-list.css.js";

export type JdNewsOrigin = "naver" | "mock" | "";

export interface JdNewsItem {
  title: string;
  description: string;
  link: string;
  source?: string;
  /** ISO 시각 — 상대시각 계산용 (connected 이후) */
  publishedAt?: string;
  /** 미리 포맷된 시각 문자열. 있으면 상대시각 대신 이것을 쓴다(결정적) */
  time?: string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toItems(v: unknown): JdNewsItem[] {
  if (!Array.isArray(v)) return [];
  const out: JdNewsItem[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      title: str(raw.title),
      description: str(raw.description),
      link: str(raw.link),
      source: str(raw.source) || undefined,
      publishedAt: str(raw.publishedAt) || undefined,
      time: str(raw.time) || undefined,
    });
  }
  return out;
}

/** ISO → "방금 전 / N분 전 / N시간 전 / N일 전". now는 이펙트 시점 Date.now */
function timeAgo(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (now - t) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export class JdNewsList extends JdElement {
  static override tag = "jd-news-list";
  static override props = {
    /** 검색어 — origin 배지 옆에 표기 */
    query: { type: String, default: "" },
    /** 최대 표시 개수 */
    limit: { type: Number, default: 6 },
    /** origin 배지 숨김 (v2 showOriginBadge=true의 부정형) */
    noOriginBadge: { type: Boolean, reflect: true, attribute: "no-origin-badge" },
    /** naver | mock — 배지 라벨/색 */
    origin: { type: String, default: "" },
    /** 앱이 fetch 중이면 true → 스켈레톤 */
    loading: { type: Boolean, reflect: true },
    /** 로드 실패 시 true → 에러 메시지 */
    error: { type: Boolean, reflect: true },
  };

  declare query: string;
  declare limit: number;
  declare noOriginBadge: boolean;
  declare origin: string;
  declare loading: boolean;
  declare error: boolean;

  #items: JdNewsItem[] = [];
  #timesReady = false;
  #skeleton!: HTMLElement;
  #message!: HTMLElement;
  #main!: HTMLElement;
  #badgeWrap!: HTMLElement;
  #badge!: HTMLElement;
  #queryLabel!: HTMLElement;
  #list!: HTMLUListElement;

  get items(): JdNewsItem[] {
    return this.#items;
  }
  set items(v: JdNewsItem[]) {
    this.#items = toItems(v);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(newsListStyles);
    this.#readJson();
    if (this.querySelector(":scope > .jd-news-list__main")) this.#adopt();
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const items = toItems(JSON.parse(script.textContent));
      if (items.length > 0) this.#items = items;
    } catch {
      /* 잘못된 JSON은 무시 */
    }
    script.remove();
  }

  #adopt(): void {
    this.#skeleton = this.querySelector(":scope > .jd-news-list__skeleton")!;
    this.#message = this.querySelector(":scope > .jd-news-list__message")!;
    this.#main = this.querySelector(":scope > .jd-news-list__main")!;
    this.#badgeWrap = this.#main.querySelector(".jd-news-list__badgewrap")!;
    this.#badge = this.#main.querySelector(".jd-news-list__badge")!;
    this.#queryLabel = this.#main.querySelector(".jd-news-list__query")!;
    this.#list = this.#main.querySelector(".jd-news-list__list")!;
  }

  #build(): void {
    this.#skeleton = document.createElement("div");
    this.#skeleton.className = "jd-news-list__skeleton";
    for (let i = 0; i < 3; i += 1) {
      const row = document.createElement("div");
      row.className = "jd-news-list__skeleton-row";
      for (const w of ["75%", "100%"]) {
        const bar = document.createElement("div");
        bar.className = "jd-news-list__bar";
        bar.style.width = w;
        row.append(bar);
      }
      this.#skeleton.append(row);
    }

    this.#message = document.createElement("div");
    this.#message.className = "jd-news-list__message";

    this.#main = document.createElement("div");
    this.#main.className = "jd-news-list__main";
    this.#badgeWrap = document.createElement("div");
    this.#badgeWrap.className = "jd-news-list__badgewrap";
    this.#badge = document.createElement("span");
    this.#badge.className = "jd-news-list__badge";
    this.#queryLabel = document.createElement("span");
    this.#queryLabel.className = "jd-news-list__query";
    this.#badgeWrap.append(this.#badge, this.#queryLabel);
    this.#list = document.createElement("ul");
    this.#list.className = "jd-news-list__list";
    this.#main.append(this.#badgeWrap, this.#list);

    this.append(this.#skeleton, this.#message, this.#main);
  }

  protected override connected(): void {
    this.#timesReady = true;
    this.#refreshTimes();
  }

  protected override update(): void {
    const limited = this.#items.slice(0, Math.max(0, this.#px(this.limit, 6)));
    const state = this.error
      ? "error"
      : this.loading
      ? "loading"
      : limited.length === 0
      ? "empty"
      : "list";

    this.#skeleton.hidden = state !== "loading";
    this.#message.hidden = state !== "error" && state !== "empty";
    this.#main.hidden = state !== "list";

    if (state === "error") this.#message.textContent = "뉴스를 불러오지 못했습니다.";
    else if (state === "empty") this.#message.textContent = "관련 뉴스가 없습니다.";
    if (state !== "list") return;

    // origin 배지
    const showBadge = !this.noOriginBadge;
    this.#badgeWrap.hidden = !showBadge;
    if (showBadge) {
      const isNaver = this.origin === "naver";
      this.#badge.dataset.origin = isNaver ? "naver" : "mock";
      this.#badge.textContent = isNaver ? "실시간 네이버 뉴스" : "샘플 뉴스";
      this.#queryLabel.textContent = this.query ? `검색어: ${this.query}` : "";
      this.#queryLabel.hidden = !this.query;
    }

    this.#reconcile(limited.length);
    limited.forEach((item, i) => this.#fillRow(this.#list.children[i] as HTMLLIElement, item));
    if (this.#timesReady) this.#refreshTimes();
  }

  #reconcile(count: number): void {
    while (this.#list.children.length > count) this.#list.lastElementChild!.remove();
    while (this.#list.children.length < count) {
      const li = document.createElement("li");
      li.className = "jd-news-list__item";
      const a = document.createElement("a");
      a.className = "jd-news-list__link";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const body = document.createElement("div");
      body.className = "jd-news-list__text";
      const title = document.createElement("span");
      title.className = "jd-news-list__title";
      const desc = document.createElement("span");
      desc.className = "jd-news-list__desc";
      const meta = document.createElement("div");
      meta.className = "jd-news-list__meta";
      const source = document.createElement("span");
      source.className = "jd-news-list__source";
      const dot = document.createElement("span");
      dot.className = "jd-news-list__dot";
      dot.setAttribute("aria-hidden", "true");
      dot.textContent = "·";
      const time = document.createElement("span");
      time.className = "jd-news-list__time";
      meta.append(source, dot, time);
      body.append(title, desc, meta);
      const chevron = document.createElement("span");
      chevron.className = "jd-news-list__chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = "›";
      a.append(body, chevron);
      li.append(a);
      this.#list.append(li);
    }
  }

  #fillRow(li: HTMLLIElement, item: JdNewsItem): void {
    const a = li.querySelector<HTMLAnchorElement>(".jd-news-list__link")!;
    a.href = item.link || "#";
    li.querySelector(".jd-news-list__title")!.textContent = item.title;
    li.querySelector(".jd-news-list__desc")!.textContent = item.description;
    const source = li.querySelector<HTMLElement>(".jd-news-list__source")!;
    source.textContent = item.source ?? "";
    source.hidden = !item.source;
    li.querySelector<HTMLElement>(".jd-news-list__dot")!.hidden = !item.source;
    const time = li.querySelector<HTMLElement>(".jd-news-list__time")!;
    // 초기 렌더는 결정적 값만(item.time 또는 빈 문자열). 상대시각은 #refreshTimes가 채운다.
    time.textContent = item.time ?? "";
    if (item.publishedAt) time.dataset.at = item.publishedAt;
    else delete time.dataset.at;
  }

  /** connected 이후: item.time이 없고 publishedAt이 있으면 상대시각으로 채운다 */
  #refreshTimes(): void {
    const now = Date.now();
    const times = this.#list.querySelectorAll<HTMLElement>(".jd-news-list__time");
    times.forEach((el) => {
      const at = el.dataset.at;
      if (!at) return;
      const rel = timeAgo(at, now);
      if (rel) el.textContent = rel;
    });
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }
}
