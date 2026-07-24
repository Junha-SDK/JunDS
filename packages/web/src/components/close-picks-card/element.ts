/**
 * <jd-close-picks-card> — 시그널 추천 목록 카드 (v2 finance/MarketSignals `PicksCard`).
 *
 * v2의 OpenPicksCard/ClosePicksCard/LimitHitsCard 셋은 **카드 크롬(이모지 헤더 + 요약
 * 배지 + 목록 + 각주)을 각자 복사**해 갖고 있었다. 여기 골격을 한 번만 두고(§6 R12),
 * 목록 행·요약·정렬·각주는 오버라이드 훅으로 뽑는다 — <jd-limit-hits-card>가 이 클래스를
 * 상속해 행만 갈아끼운다(modal→drawer 선례와 동형).
 *
 * 데이터는 property + 선언적 `<script type="application/json">` 슬롯(§1.3 — 배열 attribute 금지).
 * 링크는 종목 상세로 가는 `<a>`, 신호 강도 배지는 title로 뜻을 밝힌다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import closePicksStyles from "./close-picks-card.css.js";

/** 추천 종목 한 줄 */
export interface JdPickItem {
  name: string;
  /** 예상 변동률(%) */
  expectedPct: number;
  /** 한 줄 사유 */
  reason: string;
  /** 신호 강도 */
  strength: "high" | "medium" | "low";
  /** 링크 목적지(비우면 /stock/{name}) */
  href?: string;
}

/**
 * 두 카드가 공유하는 느슨한 행 타입 — pick·limit-hit 필드를 전부 옵션으로 담아
 * 단일 `data` 접근자가 파생 간 타입 충돌 없이 양쪽을 받는다(추가 필드는 각자 캐스팅).
 */
export interface JdMarketSignal {
  name: string;
  href?: string;
  expectedPct?: number;
  reason?: string;
  strength?: "high" | "medium" | "low";
  /** limit-hit: 등락률(%) */
  pct?: number;
  /** limit-hit: 잠긴 시각 HH:MM */
  lockedAt?: string;
  /** limit-hit: 한 번에 잠겼는지 */
  lockedFirstAttempt?: boolean;
  /** limit-hit: 거래대금(억) */
  amount?: number;
  /** limit-hit: 모멘텀 요약 */
  catalyst?: string;
}

const STRENGTH_LABEL: Record<NonNullable<JdPickItem["strength"]>, string> = {
  high: "강",
  medium: "중",
  low: "약",
};
const STRENGTH_RANK: Record<NonNullable<JdPickItem["strength"]>, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const stockHref = (item: JdMarketSignal): string =>
  item.href || `/stock/${encodeURIComponent(item.name)}`;

export class JdClosePicksCard extends JdElement {
  static override tag = "jd-close-picks-card";
  static override props = {
    /** 헤더 이모지 */
    emoji: { type: String, default: "🌇" },
    /** 카드 제목 */
    heading: { type: String, default: "내일 종가 강세" },
    /** 각주 문안. 비우면 각주를 숨긴다 */
    footerNote: {
      type: String,
      default: "장중 외국인·기관 매수 패턴 기반 시그널",
      attribute: "footer-note",
    },
  };

  declare emoji: string;
  declare heading: string;
  declare footerNote: string;

  /** 파생이 읽을 수 있도록 protected (base #private는 상속 접근 불가) */
  protected items: JdMarketSignal[] = [];

  #emojiEl!: HTMLElement;
  #titleEl!: HTMLElement;
  #summaryEl!: HTMLElement;
  #listEl!: HTMLUListElement;
  #footerEl!: HTMLElement;

  get data(): JdMarketSignal[] {
    return this.items;
  }
  set data(v: JdMarketSignal[]) {
    this.items = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(closePicksStyles);
    this.#readJsonSlot();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-cpc__card");
    if (existing) {
      this.#emojiEl = existing.querySelector(".jd-cpc__emoji")!;
      this.#titleEl = existing.querySelector(".jd-cpc__title")!;
      this.#summaryEl = existing.querySelector(".jd-cpc__summary")!;
      this.#listEl = existing.querySelector(".jd-cpc__list")!;
      this.#footerEl = existing.querySelector(".jd-cpc__footer")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.items = parsed as JdMarketSignal[];
    } catch {
      console.warn(`[junds] <${this.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  #build(): void {
    const card = document.createElement("article");
    card.className = "jd-cpc__card";

    const head = document.createElement("header");
    head.className = "jd-cpc__head";
    const titleWrap = document.createElement("div");
    titleWrap.className = "jd-cpc__title-wrap";
    this.#emojiEl = document.createElement("span");
    this.#emojiEl.className = "jd-cpc__emoji";
    this.#emojiEl.setAttribute("aria-hidden", "true");
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-cpc__title";
    titleWrap.append(this.#emojiEl, this.#titleEl);
    this.#summaryEl = document.createElement("span");
    this.#summaryEl.className = "jd-cpc__summary";
    head.append(titleWrap, this.#summaryEl);

    this.#listEl = document.createElement("ul");
    this.#listEl.className = "jd-cpc__list";

    this.#footerEl = document.createElement("footer");
    this.#footerEl.className = "jd-cpc__footer";

    card.append(head, this.#listEl, this.#footerEl);
    this.append(card);
  }

  protected override update(): void {
    this.#emojiEl.textContent = this.emoji;
    this.#emojiEl.hidden = !this.emoji;
    this.#titleEl.textContent = this.heading;

    const rows = this.sortItems(this.items);
    this.#summaryEl.textContent = this.summaryText(rows);
    this.#listEl.replaceChildren(...rows.map((item) => this.buildRow(item)));

    const footer = this.footerText();
    this.#footerEl.textContent = footer;
    this.#footerEl.hidden = !footer;
  }

  /* ── 오버라이드 훅 (기본 = picks) ─────────────────────────── */

  /** 신호 강도(강>중>약) → 예상 변동률 내림차순 (v2 sortedPicks) */
  protected sortItems(items: readonly JdMarketSignal[]): JdMarketSignal[] {
    return [...items].sort((a, b) => {
      const r = STRENGTH_RANK[b.strength ?? "low"] - STRENGTH_RANK[a.strength ?? "low"];
      if (r !== 0) return r;
      return (b.expectedPct ?? 0) - (a.expectedPct ?? 0);
    });
  }

  protected summaryText(items: readonly JdMarketSignal[]): string {
    const high = items.filter((p) => p.strength === "high").length;
    return `${items.length}종목 · 강 ${high}`;
  }

  protected footerText(): string {
    return this.footerNote;
  }

  protected buildRow(raw: JdMarketSignal): HTMLLIElement {
    const strength = raw.strength ?? "low";
    const li = document.createElement("li");
    li.className = "jd-cpc__row";

    const badge = document.createElement("span");
    badge.className = "jd-cpc__badge";
    badge.dataset.strength = strength;
    badge.textContent = STRENGTH_LABEL[strength];
    badge.title = `신호 강도: ${STRENGTH_LABEL[strength]}`;

    const meta = document.createElement("div");
    meta.className = "jd-cpc__meta";
    const name = document.createElement("a");
    name.className = "jd-cpc__name";
    name.href = stockHref(raw);
    name.textContent = raw.name;
    const reason = document.createElement("div");
    reason.className = "jd-cpc__reason";
    reason.textContent = raw.reason ?? "";
    meta.append(name, reason);

    const val = document.createElement("span");
    val.className = "jd-cpc__val";
    val.dataset.dir = "up";
    val.textContent = `+${(raw.expectedPct ?? 0).toFixed(1)}%`;

    li.append(badge, meta, val);
    return li;
  }
}
