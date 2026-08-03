/**
 * <jd-watchlist-widget> — 관심종목 요약 카드 (v2 finance/WatchlistWidget).
 *
 * v2는 useWatchlist()(localStorage)와 useRealPrices()(KIS/Yahoo 피드)를 직접 구독해
 * 목록·가격·데이터 출처를 컴포넌트 안에서 끌어왔다. DS는 의존성 0이라 그 구독을 옮길 수
 * 없다 — 형제 finance 컴포넌트와 같은 판단으로 **데이터는 앱이 주입**한다(DEC-003):
 *  - 관심종목 목록은 `items` 프로퍼티(또는 자식 JSON 슬롯, §1.3 복합 데이터).
 *  - 각 행의 현재가·등락률은 이미 이식된 리프를 **조합**해 그린다(jd-live-price,
 *    jd-live-pct-badge — jd-live-stock-table가 jd-live-status-dot을 조합한 선례).
 *  - 장 세션 라이브 여부는 `live` 프로퍼티, 가격 출처 배지는 `source` 프로퍼티.
 *
 * v2 대비 교정:
 *  1. `/stock/…`·`/search` 하드코딩 라우트 제거 — DS는 라우팅을 모른다. 행은 `href`가
 *     있으면 진짜 <a>(가운데클릭·새 탭 열기 보존, v2 Link보다 나음)로, 없으면 <button>으로
 *     그리고 활성화 시 `jd-select`를 발행한다. "추가"도 add-href 유무로 <a>/<button> 분기.
 *  2. v2 StarButton은 토글이었으나 이 목록은 전부 등록된 종목이라 별은 항상 채워진
 *     **해제 버튼**이다 — 누르면 `jd-remove`를 발행해 앱이 스토어를 갱신한다.
 *  3. 가격 플래시는 조합한 jd-live-price가 결정적 규칙(§3.1-3) 아래 스스로 처리한다 —
 *     행을 매 업데이트마다 새로 만들지 않고 **제자리 갱신**해 플래시 기준선을 보존한다.
 *  4. 별 deco span에 role/label을 주지 않고 산문 대신 h2에 aria-labelledby로 영역명을 건다.
 */
import { JdElement } from "../../core/element.js";
import { syncAriaIdRefs, syncOwnedAttribute } from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import watchlistWidgetStyles from "./watchlist-widget.css.js";

export interface JdWatchlistItem {
  /** 종목명 — 표시·이벤트 키 */
  name: string;
  /** 색 태그(있으면 이름 앞 점). CSS 색 문자열 */
  color?: string;
  /** 현재가. 0 이하면 fallbackPrice로 폴백, 둘 다 없으면 "—" */
  price?: number;
  /** 등락률(%). 0이면 fallbackChange로 폴백 */
  change?: number;
  /** 시드 전 폴백 현재가 */
  fallbackPrice?: number;
  /** 시드 전 폴백 등락률 */
  fallbackChange?: number;
  /** 행 링크 대상. 있으면 진짜 <a>로 렌더 */
  href?: string;
}

/** v2 sourceLabel 맵 — 표시 텍스트를 그대로 승계(외관 보존). tone은 CSS가 data-source로 착색 */
const SOURCE_TEXT: Record<string, string> = {
  kis: "KIS 실시간",
  yahoo: "Yahoo (15분 지연)",
  pending: "연결 중",
  error: "데이터 없음",
};

/** Material 채움 별 (Lucide star보다 단순, 16px에서 또렷) */
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

const SVG_NS = "http://www.w3.org/2000/svg";

interface Row {
  li: HTMLLIElement;
  dot: HTMLSpanElement;
  body: HTMLAnchorElement | HTMLButtonElement;
  name: HTMLSpanElement;
  price: HTMLElement;
  pct: HTMLElement;
}

export class JdWatchlistWidget extends JdElement {
  static override tag = "jd-watchlist-widget";
  static override props = {
    /** 헤더 제목 (v2 "관심종목") */
    title: { type: String, default: "관심종목" },
    /** 장 세션 라이브 여부 — 앱이 판정해 주입(조합한 jd-live-status-dot로 전달) */
    live: { type: Boolean, reflect: true },
    /** 가격 출처 배지: kis | yahoo | pending | error. 비우면 배지 숨김 */
    source: { type: String },
    /** 출처 배지 텍스트 override(비우면 source 맵에서 파생) */
    sourceLabel: { type: String, attribute: "source-label" },
    /** "추가" 링크 대상. 있으면 <a>, 없으면 <button>(jd-add 발행) */
    addHref: { type: String, attribute: "add-href" },
    /** "추가" 라벨 (v2 "추가 ›") */
    addLabel: { type: String, default: "추가 ›", attribute: "add-label" },
    /** 빈 상태 안내문 */
    emptyText: {
      type: String,
      default: "종목 상세에서 ☆ 을 눌러 관심종목으로 등록할 수 있습니다.",
      attribute: "empty-text",
    },
    /** 행 현재가 소수 자릿수 (v2 LivePrice decimals 기본 0) */
    decimals: { type: Number, default: 0 },
    // items(배열)는 복합 데이터 — property 전용(§1.3).
  };

  declare title: string;
  declare live: boolean;
  declare source: string;
  declare sourceLabel: string;
  declare addHref: string;
  declare addLabel: string;
  declare emptyText: string;
  declare decimals: number;

  #items: JdWatchlistItem[] = [];
  #rowsKey = "";
  #rows: Row[] = [];

  #titleEl!: HTMLHeadingElement;
  #count!: HTMLElement;
  #status!: HTMLElement;
  #sourceEl!: HTMLSpanElement;
  #add!: HTMLAnchorElement | HTMLButtonElement;
  #list!: HTMLUListElement;
  #empty!: HTMLParagraphElement;

  get items(): JdWatchlistItem[] {
    return this.#items;
  }
  set items(v: JdWatchlistItem[]) {
    this.#items = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdWatchlistItem[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number | undefined =>
      typeof x === "number" && Number.isFinite(x) ? x : undefined;
    const str = (x: unknown): string | undefined => (typeof x === "string" ? x : undefined);
    return v
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({
        name: typeof s.name === "string" ? s.name : "",
        color: str(s.color),
        price: num(s.price),
        change: num(s.change),
        fallbackPrice: num(s.fallbackPrice),
        fallbackChange: num(s.fallbackChange),
        href: str(s.href),
      }))
      .filter((s) => s.name !== "");
  }

  protected render(): void {
    adoptStyles(watchlistWidgetStyles);
    this.#readJsonSlot();

    const titleId = jdUid("jd-wlw-title");
    syncOwnedAttribute(this, "role", "group", { preserveExisting: true });
    syncAriaIdRefs(this, "aria-labelledby", titleId);

    // ── 헤더 ────────────────────────────────────────────────
    const header = document.createElement("div");
    header.className = "jd-wlw__header";

    const lead = document.createElement("div");
    lead.className = "jd-wlw__lead";

    const mark = document.createElement("span");
    mark.className = "jd-wlw__mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "★";

    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-wlw__title";
    this.#titleEl.id = titleId;

    this.#count = document.createElement("jd-badge");
    this.#count.className = "jd-wlw__count";
    this.#count.setAttribute("variant", "info");
    this.#count.setAttribute("size", "sm");

    this.#status = document.createElement("jd-live-status-dot");
    this.#status.className = "jd-wlw__status";

    this.#sourceEl = document.createElement("span");
    this.#sourceEl.className = "jd-wlw__source";
    this.#sourceEl.title = "가격 데이터 출처";

    lead.append(mark, this.#titleEl, this.#count, this.#status, this.#sourceEl);

    // add 컨트롤은 add-href 유무로 태그가 갈린다 — 초기엔 button, syncAdd가 교체
    this.#add = document.createElement("button");
    this.#add.className = "jd-wlw__add";

    header.append(lead, this.#add);

    // ── 목록 / 빈 상태 ──────────────────────────────────────
    this.#list = document.createElement("ul");
    this.#list.className = "jd-wlw__list";

    this.#empty = document.createElement("p");
    this.#empty.className = "jd-wlw__empty";

    this.replaceChildren(header, this.#list, this.#empty);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#items = this.#normalize(parsed);
    } catch {
      console.warn("[junds] <jd-watchlist-widget> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    const items = this.#items;
    const empty = items.length === 0;
    this.toggleAttribute("data-empty", empty);

    this.#titleEl.textContent = this.title;
    this.#count.textContent = String(items.length);

    // 라이브 점·출처 배지는 종목이 있을 때만(v2 동형)
    this.#status.hidden = empty;
    (this.#status as unknown as { live: boolean }).live = this.live;

    const src = this.source;
    const showSource = !empty && (Boolean(this.sourceLabel) || Boolean(SOURCE_TEXT[src]));
    this.#sourceEl.hidden = !showSource;
    if (showSource) {
      this.#sourceEl.textContent = this.sourceLabel || SOURCE_TEXT[src] || "";
      this.#sourceEl.dataset.source = src || "";
    }

    this.#syncAdd();

    this.#list.hidden = empty;
    this.#empty.hidden = !empty;
    this.#empty.textContent = this.emptyText;

    if (!empty) this.#renderRows(items);
  }

  /** add-href 유무에 맞춰 <a>/<button> 태그를 맞추고 라벨·href를 반영 */
  #syncAdd(): void {
    const wantAnchor = Boolean(this.addHref);
    const isAnchor = this.#add instanceof HTMLAnchorElement;
    if (isAnchor !== wantAnchor) {
      const next = wantAnchor ? document.createElement("a") : document.createElement("button");
      next.className = "jd-wlw__add";
      if (next instanceof HTMLButtonElement) {
        next.type = "button";
        next.addEventListener("click", this.#onAdd);
      }
      this.#add.replaceWith(next);
      this.#add = next;
    }
    if (this.#add instanceof HTMLAnchorElement) this.#add.href = this.addHref;
    this.#add.textContent = this.addLabel;
  }

  #onAdd = (): void => {
    this.emit("jd-add");
  };

  /** 이름·href 시퀀스가 그대로면 행을 재사용하고 값만 제자리 갱신(플래시 보존) */
  #renderRows(items: JdWatchlistItem[]): void {
    const key = items.map((it) => `${it.name}${it.href ?? ""}`).join("");
    if (key !== this.#rowsKey) {
      this.#buildRows(items);
      this.#rowsKey = key;
    }
    items.forEach((it, i) => {
      const r = this.#rows[i];
      if (!r) return;
      if (it.color) {
        r.dot.hidden = false;
        r.dot.style.background = it.color;
      } else {
        r.dot.hidden = true;
      }
      r.name.textContent = it.name;
      const price = r.price as unknown as {
        price: number;
        fallback: number;
        decimals: number;
        size: string;
      };
      price.size = "md";
      price.decimals = this.decimals;
      price.price = it.price ?? 0;
      price.fallback = it.fallbackPrice ?? 0;
      const pct = r.pct as unknown as { change: number; fallback: number };
      pct.change = it.change ?? 0;
      pct.fallback = it.fallbackChange ?? 0;
    });
  }

  #buildRows(items: JdWatchlistItem[]): void {
    this.#list.textContent = "";
    this.#rows = [];
    for (const it of items) {
      const li = document.createElement("li");
      li.className = "jd-wlw__row";

      const star = document.createElement("button");
      star.type = "button";
      star.className = "jd-wlw__star";
      star.setAttribute("aria-label", `${it.name} 관심종목 제거`);
      star.setAttribute("aria-pressed", "true");
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", STAR_PATH);
      svg.append(path);
      star.append(svg);
      const name = it.name;
      star.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.emit("jd-remove", { name });
      });

      const dot = document.createElement("span");
      dot.className = "jd-wlw__dot";
      dot.setAttribute("aria-hidden", "true");
      dot.title = "색 태그";

      const body: HTMLAnchorElement | HTMLButtonElement = it.href
        ? document.createElement("a")
        : document.createElement("button");
      body.className = "jd-wlw__link";
      if (body instanceof HTMLAnchorElement) body.href = it.href!;
      else body.type = "button";
      body.addEventListener("click", () => this.emit("jd-select", { name, href: it.href }));

      const nameEl = document.createElement("span");
      nameEl.className = "jd-wlw__name";

      const meta = document.createElement("span");
      meta.className = "jd-wlw__meta";
      const price = document.createElement("jd-live-price");
      price.className = "jd-wlw__price";
      const pct = document.createElement("jd-live-pct-badge");
      pct.className = "jd-wlw__pct";
      meta.append(price, pct);

      body.append(nameEl, meta);
      li.append(star, dot, body);
      this.#list.append(li);
      this.#rows.push({ li, dot, body, name: nameEl, price, pct });
    }
  }
}
