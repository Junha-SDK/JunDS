/**
 * <jd-open-picks-card> — "내일 시초가/종가 강세" 추천 카드 (v2 finance/MarketSignals PicksCard).
 *
 * v2는 OpenPicksCard/ClosePicksCard가 각각 상수 데이터(OPEN_PICKS/CLOSE_PICKS)를 물고
 * PicksCard를 렌더하는 얇은 래퍼였다. DS 컴포넌트는 데이터를 앱에서 받고(§1.3 property +
 * JSON 슬롯), 열기/닫기 차이는 `kind`(footer 문구 + 헤더 이모지·제목 기본값)로 표현한다 —
 * 한 컴포넌트가 두 래퍼를 대신한다(§6 R12).
 *
 * v2 대비 개선:
 *  - 종목행을 시맨틱 <ul>/<li>로, 각 행에 href가 있으면 <a>, 없으면 클릭 시 jd-select 통지.
 *  - 강도 배지에 title + aria-label로 "신호 강도: 강"을 말로 읽힌다(v2는 title만).
 *  - 정렬(sortedPicks)을 내장 — 강도 desc → 예상 변동률 desc, 결정적.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import openPicksCardStyles from "./open-picks-card.css.js";

export type JdPickStrength = "high" | "medium" | "low";

export interface JdPickItem {
  name: string;
  expectedPct: number;
  reason: string;
  strength: JdPickStrength;
  /** 있으면 종목명이 링크가 된다 */
  href?: string;
}

const STRENGTH_LABEL: Record<JdPickStrength, string> = { high: "강", medium: "중", low: "약" };
const STRENGTH_RANK: Record<JdPickStrength, number> = { high: 3, medium: 2, low: 1 };

function normStrength(v: unknown): JdPickStrength {
  return v === "high" || v === "medium" || v === "low" ? v : "low";
}

function toPicks(v: unknown): JdPickItem[] {
  if (!Array.isArray(v)) return [];
  const out: JdPickItem[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      name: typeof raw.name === "string" ? raw.name : "",
      expectedPct:
        typeof raw.expectedPct === "number" && Number.isFinite(raw.expectedPct)
          ? raw.expectedPct
          : 0,
      reason: typeof raw.reason === "string" ? raw.reason : "",
      strength: normStrength(raw.strength),
      href: typeof raw.href === "string" ? raw.href : undefined,
    });
  }
  return out;
}

/** v2 sortedPicks — 강도 desc, 동률이면 예상 변동률 desc (결정적) */
function sortPicks(picks: readonly JdPickItem[]): JdPickItem[] {
  return [...picks].sort((a, b) => {
    const r = STRENGTH_RANK[b.strength] - STRENGTH_RANK[a.strength];
    return r !== 0 ? r : b.expectedPct - a.expectedPct;
  });
}

export class JdOpenPicksCard extends JdElement {
  static override tag = "jd-open-picks-card";
  static override props = {
    /** open | close — footer 문구 + 기본 제목/이모지 축 */
    kind: { type: String, default: "open", reflect: true },
    /** 헤더 제목. 비우면 kind 기본값 */
    heading: { type: String, default: "" },
    /** 헤더 이모지. 비우면 kind 기본값 */
    emoji: { type: String, default: "" },
  };

  declare kind: string;
  declare heading: string;
  declare emoji: string;

  #picks: JdPickItem[] = [];
  #emojiEl!: HTMLElement;
  #titleEl!: HTMLElement;
  #summaryEl!: HTMLElement;
  #list!: HTMLUListElement;
  #footerEl!: HTMLElement;

  get picks(): JdPickItem[] {
    return this.#picks;
  }
  set picks(v: JdPickItem[]) {
    this.#picks = toPicks(v);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(openPicksCardStyles);
    this.#readJson();
    if (this.querySelector(":scope > .jd-open-picks-card__head")) this.#adopt();
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const picks = toPicks(JSON.parse(script.textContent));
      if (picks.length > 0) this.#picks = picks;
    } catch {
      /* 잘못된 JSON은 무시 */
    }
    script.remove();
  }

  #adopt(): void {
    this.#emojiEl = this.querySelector(".jd-open-picks-card__emoji")!;
    this.#titleEl = this.querySelector(".jd-open-picks-card__title")!;
    this.#summaryEl = this.querySelector(".jd-open-picks-card__summary")!;
    this.#list = this.querySelector(".jd-open-picks-card__list")!;
    this.#footerEl = this.querySelector(".jd-open-picks-card__footer")!;
  }

  #build(): void {
    const head = document.createElement("header");
    head.className = "jd-open-picks-card__head";
    const titleGroup = document.createElement("div");
    titleGroup.className = "jd-open-picks-card__titlewrap";
    this.#emojiEl = document.createElement("span");
    this.#emojiEl.className = "jd-open-picks-card__emoji";
    this.#emojiEl.setAttribute("aria-hidden", "true");
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-open-picks-card__title";
    titleGroup.append(this.#emojiEl, this.#titleEl);
    this.#summaryEl = document.createElement("span");
    this.#summaryEl.className = "jd-open-picks-card__summary";
    head.append(titleGroup, this.#summaryEl);

    this.#list = document.createElement("ul");
    this.#list.className = "jd-open-picks-card__list";

    this.#footerEl = document.createElement("footer");
    this.#footerEl.className = "jd-open-picks-card__footer";

    this.append(head, this.#list, this.#footerEl);
  }

  protected override connected(): void {
    this.#list.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#list.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const row = (e.target as Element).closest<HTMLElement>(".jd-open-picks-card__item");
    if (!row || !this.#list.contains(row)) return;
    // href 링크는 브라우저 기본 이동에 맡긴다 — 통지는 링크 없는 행에서만
    if ((e.target as Element).closest("a")) return;
    const name = row.dataset.name;
    if (name) this.emit("jd-select", { value: name });
  };

  protected override update(): void {
    const isClose = this.kind === "close";
    this.#emojiEl.textContent = this.emoji || (isClose ? "🌇" : "🌅");
    this.#titleEl.textContent = this.heading || (isClose ? "내일 종가 강세" : "내일 시초가 강세");

    const rows = sortPicks(this.#picks);
    const high = rows.filter((p) => p.strength === "high").length;
    this.#summaryEl.textContent = `${rows.length}종목 · 강 ${high}`;

    this.#reconcile(rows.length);
    rows.forEach((p, i) => this.#fillRow(this.#list.children[i] as HTMLLIElement, p));

    this.#footerEl.textContent = isClose
      ? "장중 외국인·기관 매수 패턴 기반 시그널"
      : "장 마감 후 발표된 모멘텀·공시 기반 시그널";
  }

  /** 행 개수 정합 — 골격만 만들고 값은 #fillRow가 채운다 */
  #reconcile(count: number): void {
    while (this.#list.children.length > count) this.#list.lastElementChild!.remove();
    while (this.#list.children.length < count) {
      const li = document.createElement("li");
      li.className = "jd-open-picks-card__item";
      const badge = document.createElement("span");
      badge.className = "jd-open-picks-card__badge";
      const body = document.createElement("div");
      body.className = "jd-open-picks-card__body";
      const name = document.createElement("span");
      name.className = "jd-open-picks-card__name";
      const reason = document.createElement("span");
      reason.className = "jd-open-picks-card__reason";
      body.append(name, reason);
      const pct = document.createElement("span");
      pct.className = "jd-open-picks-card__pct";
      li.append(badge, body, pct);
      this.#list.append(li);
    }
  }

  #fillRow(li: HTMLLIElement, p: JdPickItem): void {
    li.dataset.name = p.name;
    const badge = li.querySelector<HTMLElement>(".jd-open-picks-card__badge")!;
    badge.dataset.strength = p.strength;
    badge.textContent = STRENGTH_LABEL[p.strength];
    const strengthText = `신호 강도: ${STRENGTH_LABEL[p.strength]}`;
    badge.title = strengthText;
    badge.setAttribute("aria-label", strengthText);

    // 종목명 — href 있으면 <a>, 없으면 <span> (마지막 쓰기 승리로 노드 타입 교체)
    let name = li.querySelector<HTMLElement>(".jd-open-picks-card__name")!;
    const wantLink = Boolean(p.href);
    const isLink = name.tagName === "A";
    if (wantLink !== isLink) {
      const next = document.createElement(wantLink ? "a" : "span");
      next.className = "jd-open-picks-card__name";
      name.replaceWith(next);
      name = next;
    }
    if (wantLink) (name as HTMLAnchorElement).href = p.href!;
    name.textContent = p.name;

    li.querySelector(".jd-open-picks-card__reason")!.textContent = p.reason;
    const pct = li.querySelector<HTMLElement>(".jd-open-picks-card__pct")!;
    pct.textContent = `+${p.expectedPct.toFixed(1)}%`;
  }
}
