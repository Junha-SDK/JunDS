/**
 * <jd-investor-council> — AI 투자자 위원회 (v2 finance/InvestorCouncil).
 *
 * 좌측 위원 목록(점수순) + 우측 선택 위원 상세(결론·성향 바·근거/리스크·매매 플랜·인용).
 * v2는 `/api/investor?symbol=`을 fetch했다(데이터 결합). v3는 표현 컴포넌트로 분리 —
 * 위원 카드는 `cards` 프로퍼티(또는 JSON 슬롯)로 받고, 각 카드가 프로필까지 품는다(§1.3).
 * 로딩/에러 상태는 `loading`/`error` attribute로 외부가 제어한다.
 *
 * v2 대비 개선: 아이콘만 있던 좌측 버튼이 aria-pressed로 선택 상태를 알리고, 상세 패널은
 * role=region + aria-live로 전환을 낭독한다. 성향 바에는 텍스트 수치가 항상 함께 온다.
 * SVG 아이콘은 innerHTML(<svg> 루트는 파서가 SVG 네임스페이스로 만든다)로 넣는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits, upgradeAccessor } from "../../core/chart.js";
import investorCouncilStyles from "./investor-council.css.js";

export type JdVerdict = "강력매수" | "매수" | "관망" | "매도" | "강력매도";

export interface JdInvestorProfile {
  emoji: string;
  korean: string;
  name: string;
  tagline: string;
  /** 강조색(CSS 색) */
  accent: string;
  koreanContext?: string;
  quotes?: string[];
  era?: string;
  source?: string;
}

export interface JdCouncilPlan {
  horizon: string;
  entryLow: number;
  entryHigh: number;
  target: number;
  stop: number;
  sizePct: number;
}

export interface JdInvestorCard {
  id: string;
  verdict: JdVerdict;
  /** -1..1 */
  score: number;
  /** 0..1 */
  confidence: number;
  components: Partial<Record<ComponentKey, number>>;
  reasons?: string[];
  risks?: string[];
  plan?: JdCouncilPlan;
  profile: JdInvestorProfile;
}

type ComponentKey = "valuation" | "quality" | "growth" | "moat" | "dividend" | "momentum" | "risk";

const COMPONENT_LABELS: readonly { key: ComponentKey; label: string }[] = [
  { key: "valuation", label: "가치" },
  { key: "quality", label: "품질" },
  { key: "growth", label: "성장" },
  { key: "moat", label: "해자" },
  { key: "dividend", label: "배당" },
  { key: "momentum", label: "모멘텀" },
  { key: "risk", label: "리스크" },
];

const ICONS: Record<string, string> = {
  sparkles:
    `<path d="M12 3l1.8 4.9L18.5 10l-4.7 2.1L12 17l-1.8-4.9L5.5 10l4.7-2.1z"/>` +
    `<path d="M19 14l.9 2.3L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-.7z"/>`,
  trendingUp: `<path d="M3 17l6-6 4 4 8-8"/><path d="M16 7h5v5"/>`,
  trendingDown: `<path d="M3 7l6 6 4-4 8 8"/><path d="M16 17h5v-5"/>`,
  alert: `<path d="M12 3l9 16H3z"/><path d="M12 10v4"/><path d="M12 16.5h.01"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>`,
};

/** 장식 아이콘 svg — <svg> 루트라 innerHTML이 SVG 네임스페이스로 파싱한다 */
function icon(name: string, size = 14, stroke = "2.4"): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", stroke);
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = ICONS[name] ?? "";
  return svg;
}

/** v2 verdictColorFor — 상승=적(danger), 하락=청(info) 관례 */
function verdictColor(v: JdVerdict): string {
  switch (v) {
    case "강력매수":
      return "var(--jd-fin-up)";
    case "매수":
      return "color-mix(in srgb, var(--jd-fin-up) 55%, var(--jd-color-muted))";
    case "관망":
      return "var(--jd-color-muted)";
    case "매도":
      return "color-mix(in srgb, var(--jd-fin-down) 55%, var(--jd-color-muted))";
    case "강력매도":
      return "var(--jd-fin-down)";
    default:
      return "var(--jd-color-muted)";
  }
}

function el(tag: string, className?: string): HTMLElement {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

export class JdInvestorCouncil extends JdElement {
  static override tag = "jd-investor-council";
  static override props = {
    /** 선택된 위원 id. 비우면 점수 1위 */
    activeId: { type: String, reflect: true, attribute: "active-id" },
    /** 로딩 상태 */
    loading: { type: Boolean, reflect: true },
    /** 에러 메시지 (있으면 에러 상태) */
    error: { type: String },
    /** "모든 투자자 모드 보기" 링크 */
    moreHref: { type: String, default: "/investors", attribute: "more-href" },
  };

  declare activeId: string;
  declare loading: boolean;
  declare error: string;
  declare moreHref: string;

  #cards: JdInvestorCard[] = [];
  #cardsDirty = true;

  #root!: HTMLElement;
  #stateEl!: HTMLElement;
  #consensusEl!: HTMLElement;
  #asideList!: HTMLUListElement;
  #detailEl!: HTMLElement;
  #countTag!: HTMLElement;

  get cards(): JdInvestorCard[] {
    return this.#cards;
  }
  set cards(v: JdInvestorCard[]) {
    this.#cards = Array.isArray(v) ? v : [];
    this.#cardsDirty = true;
    this.requestUpdate();
  }

  protected render(): void {
    upgradeAccessor(this, "cards"); // 정의 이전 대입 회수(§1.3)
    adoptStyles(investorCouncilStyles);
    this.#readJsonSlot();
    this.setAttribute("role", "region");
    this.setAttribute("aria-label", "AI 투자자 위원회");

    this.#root = el("section", "jd-council__card");

    // 헤더
    const header = el("header", "jd-council__header");
    const brand = el("div", "jd-council__brand");
    const badge = el("span", "jd-council__brand-icon");
    badge.append(icon("sparkles", 14));
    const h2 = el("h2", "jd-council__title");
    h2.textContent = "AI 투자자 위원회";
    this.#countTag = el("span", "jd-council__tag");
    brand.append(badge, h2, this.#countTag);
    this.#consensusEl = el("div", "jd-council__consensus");
    header.append(brand, this.#consensusEl);

    // 본문
    const body = el("div", "jd-council__body");
    const aside = el("aside", "jd-council__aside");
    this.#asideList = el("ul", "jd-council__list") as HTMLUListElement;
    aside.append(this.#asideList);
    this.#detailEl = el("div", "jd-council__detail");
    this.#detailEl.setAttribute("role", "region");
    this.#detailEl.setAttribute("aria-live", "polite");
    body.append(aside, this.#detailEl);

    // 상태(로딩/에러) 오버레이
    this.#stateEl = el("div", "jd-council__state");
    this.#stateEl.hidden = true;

    this.#root.append(header, body);
    this.append(this.#stateEl, this.#root);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#cards = parsed as JdInvestorCard[];
    } catch {
      console.warn("[junds] <jd-investor-council> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    // 상태 우선: 에러 > 로딩 > (데이터 없음 → 로딩) > 정상
    const hasData = this.#cards.length > 0;
    if (this.error) {
      this.#showState("error", `AI 투자자 분석을 불러오지 못했습니다 (${this.error}).`);
      return;
    }
    if (this.loading || !hasData) {
      this.#showState("loading", "AI 투자자 위원회 소집 중…");
      return;
    }
    this.#stateEl.hidden = true;
    this.#root.hidden = false;

    const sorted = [...this.#cards].sort((a, b) => b.score - a.score);
    const active = sorted.find((c) => c.id === this.activeId) ?? sorted[0]!;

    this.#countTag.textContent = `ButterAI 스타일 · ${this.#cards.length}명 분석`;
    this.#paintConsensus(sorted);
    if (this.#cardsDirty) {
      this.#buildAside(sorted);
      this.#cardsDirty = false;
    }
    this.#markActive(active.id);
    this.#buildDetail(active);
  }

  #showState(kind: "loading" | "error", text: string): void {
    this.#root.hidden = true;
    this.#stateEl.hidden = false;
    this.#stateEl.setAttribute("data-kind", kind);
    this.#stateEl.textContent = "";
    if (kind === "loading") {
      const dot = el("span", "jd-council__state-dot");
      this.#stateEl.append(dot, document.createTextNode(text));
    } else {
      const p = el("p", "jd-council__state-text");
      p.textContent = text;
      this.#stateEl.append(p);
    }
  }

  #paintConsensus(sorted: JdInvestorCard[]): void {
    const buyers = sorted.filter((c) => c.score >= 0.2).length;
    const sellers = sorted.filter((c) => c.score <= -0.2).length;
    const score = sorted.reduce((s, c) => s + c.score, 0) / Math.max(1, sorted.length);
    const tone = score >= 0.2 ? "up" : score <= -0.2 ? "down" : "neutral";
    const label =
      tone === "up"
        ? "위원회 매수 우위"
        : tone === "down"
        ? "위원회 매도 우위"
        : "위원회 의견 분분";

    this.#consensusEl.textContent = "";
    this.#consensusEl.setAttribute("data-tone", tone);
    const up = el("span", "jd-council__consensus-up");
    up.textContent = `▲ ${buyers}`;
    const sep = el("span", "jd-council__consensus-sep");
    sep.textContent = "·";
    const down = el("span", "jd-council__consensus-down");
    down.textContent = `▼ ${sellers}`;
    const div = el("span", "jd-council__consensus-div");
    const lab = el("span", "jd-council__consensus-label");
    lab.textContent = label;
    this.#consensusEl.append(up, sep, down, div, lab);
  }

  #buildAside(sorted: JdInvestorCard[]): void {
    this.#asideList.textContent = "";
    for (const card of sorted) {
      const li = el("li");
      const btn = el("button", "jd-council__investor") as HTMLButtonElement;
      btn.type = "button";
      btn.dataset.id = card.id;
      btn.style.setProperty("--_accent", card.profile.accent);
      btn.addEventListener("click", () => {
        this.activeId = card.id;
        this.emit("jd-select", { id: card.id });
      });

      const emoji = el("span", "jd-council__investor-emoji");
      emoji.textContent = card.profile.emoji;
      const meta = el("div", "jd-council__investor-meta");
      const korean = el("div", "jd-council__investor-name");
      korean.textContent = card.profile.korean;
      const tagline = el("div", "jd-council__investor-tagline");
      tagline.textContent = card.profile.tagline;
      meta.append(korean, tagline);
      const right = el("div", "jd-council__investor-right");
      const verdict = el("div", "jd-council__investor-verdict");
      verdict.textContent = card.verdict;
      verdict.style.color = verdictColor(card.verdict);
      const sc = el("div", "jd-council__investor-score");
      sc.textContent = `점수 ${(card.score * 100).toFixed(0)}`;
      right.append(verdict, sc);

      btn.append(emoji, meta, right);
      li.append(btn);
      this.#asideList.append(li);
    }
  }

  #markActive(id: string): void {
    for (const btn of this.#asideList.querySelectorAll<HTMLButtonElement>(
      ".jd-council__investor",
    )) {
      const on = btn.dataset.id === id;
      btn.toggleAttribute("data-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  #buildDetail(active: JdInvestorCard): void {
    const p = active.profile;
    const vc = verdictColor(active.verdict);
    const detail = this.#detailEl;
    detail.textContent = "";
    detail.style.setProperty("--_accent", p.accent);
    detail.style.setProperty("--_verdict", vc);

    // 프로필 헤더
    const head = el("header", "jd-council__profile");
    const bigEmoji = el("span", "jd-council__profile-emoji");
    bigEmoji.textContent = p.emoji;
    const pmeta = el("div", "jd-council__profile-meta");
    const nameRow = el("div", "jd-council__profile-namerow");
    const korean = el("h3", "jd-council__profile-korean");
    korean.textContent = p.korean;
    const enName = el("span", "jd-council__profile-name");
    enName.textContent = p.name;
    nameRow.append(korean, enName);
    const tagline = el("p", "jd-council__profile-tagline");
    tagline.textContent = p.tagline;
    pmeta.append(nameRow, tagline);
    if (p.koreanContext) {
      const ctx = el("p", "jd-council__profile-context");
      ctx.textContent = p.koreanContext;
      pmeta.append(ctx);
    }
    head.append(bigEmoji, pmeta);
    detail.append(head);

    // 결론 박스
    const verdictBox = el("div", "jd-council__verdict-box");
    const circle = el("div", "jd-council__verdict-circle");
    circle.append(icon(active.score >= 0 ? "trendingUp" : "trendingDown", 20));
    const vmain = el("div", "jd-council__verdict-main");
    const vlabel = el("div", "jd-council__verdict-label");
    vlabel.textContent = `${p.korean}의 결론`;
    const vbig = el("div", "jd-council__verdict-big");
    vbig.textContent = active.verdict;
    vmain.append(vlabel, vbig);
    const vstats = el("div", "jd-council__verdict-stats");
    vstats.append(
      this.#stat("점수", `${(active.score * 100).toFixed(0)}`, active.score >= 0 ? "up" : "down"),
      this.#stat("신뢰도", `${(active.confidence * 100).toFixed(0)}%`),
    );
    verdictBox.append(circle, vmain, vstats);
    detail.append(verdictBox);

    // 성향 바
    detail.append(this.#componentBars(active));

    // 근거 / 리스크
    const lists = el("div", "jd-council__lists");
    lists.append(
      this.#reasonList("왜 이런 결론을 내렸는가", "sparkles", p.accent, active.reasons ?? []),
      // 리스크 톤 = v2 orange-500 리터럴(경고 amber 토큰과 색상을 의도적으로 구분)
      this.#reasonList("유의 사항 / 미스매치", "alert", "#f97316", active.risks ?? []),
    );
    detail.append(lists);

    // 매매 플랜
    if (active.plan) detail.append(this.#planBlock(active.plan, p.accent));

    // 인용 details
    if (p.quotes && p.quotes.length > 0) detail.append(this.#quotes(p));

    // 면책 + 링크
    const disc = el("p", "jd-council__disclaimer");
    disc.append(
      document.createTextNode(
        "⚠️ 본 분석은 ButterAI 스타일의 룰 기반 시뮬레이션이며 각 인물의 공개된 투자 철학을 단순 모사한 것입니다. 실제 매수·매도 권유가 아닙니다. ",
      ),
    );
    const link = el("a", "jd-council__more") as HTMLAnchorElement;
    link.href = this.moreHref || "/investors";
    link.textContent = "모든 투자자 모드 보기";
    disc.append(link);
    detail.append(disc);
  }

  #stat(label: string, value: string, tone?: "up" | "down"): HTMLElement {
    const wrap = el("div", "jd-council__stat");
    const l = el("div", "jd-council__stat-label");
    l.textContent = label;
    const v = el("div", "jd-council__stat-value");
    v.textContent = value;
    if (tone) v.setAttribute("data-dir", tone);
    wrap.append(l, v);
    return wrap;
  }

  #componentBars(active: JdInvestorCard): HTMLElement {
    const grid = el("div", "jd-council__bars");
    for (const { key, label } of COMPONENT_LABELS) {
      const raw = active.components[key] ?? 0;
      const pct = Math.max(-1, Math.min(1, raw));
      const w = Math.abs(pct) * 100;

      const cell = el("div", "jd-council__bar");
      const top = el("div", "jd-council__bar-top");
      const name = el("span", "jd-council__bar-label");
      name.textContent = label;
      const val = el("span", "jd-council__bar-value");
      val.textContent = `${pct >= 0 ? "+" : ""}${(pct * 100).toFixed(0)}`;
      val.toggleAttribute("data-neg", pct < 0);
      top.append(name, val);

      const track = el("div", "jd-council__bar-track");
      if (pct < 0) {
        const half = el("div", "jd-council__bar-half");
        const fill = el("div", "jd-council__bar-fill-neg");
        fill.style.marginLeft = `${50 - w / 2}%`;
        fill.style.width = `${w / 2}%`;
        half.append(fill);
        track.append(half);
      } else {
        const spacer = el("div", "jd-council__bar-spacer");
        const fill = el("div", "jd-council__bar-fill-pos");
        fill.style.width = `${w / 2}%`;
        track.append(spacer, fill);
      }
      cell.append(top, track);
      grid.append(cell);
    }
    return grid;
  }

  #reasonList(title: string, iconName: string, tone: string, items: string[]): HTMLElement {
    const box = el("div", "jd-council__reasons");
    box.style.setProperty("--_tone", tone);
    const h = el("h4", "jd-council__reasons-title");
    h.append(icon(iconName, 12), document.createTextNode(title));
    const ul = el("ul", "jd-council__reasons-list");
    if (items.length === 0) {
      const li = el("li", "jd-council__reasons-empty");
      li.textContent = "— 해당 사항 없음 —";
      ul.append(li);
    } else {
      for (const it of items) {
        const li = el("li", "jd-council__reasons-item");
        const bullet = el("span", "jd-council__reasons-bullet");
        const txt = el("span");
        txt.textContent = it;
        li.append(bullet, txt);
        ul.append(li);
      }
    }
    box.append(h, ul);
    return box;
  }

  #planBlock(plan: JdCouncilPlan, accent: string): HTMLElement {
    const box = el("div", "jd-council__plan");
    box.style.setProperty("--_accent", accent);
    const head = el("div", "jd-council__plan-head");
    const h4 = el("h4", "jd-council__plan-title");
    h4.append(icon("target", 13), document.createTextNode("매매 플랜 (참고용)"));
    const horizon = el("span", "jd-council__plan-horizon");
    horizon.textContent = plan.horizon;
    head.append(h4, horizon);
    const grid = el("div", "jd-council__plan-grid");
    grid.append(
      this.#planCell("진입(저)", plan.entryLow, "up"),
      this.#planCell("진입(고)", plan.entryHigh, "up"),
      this.#planCell("목표가", plan.target, "up", true),
      this.#planCell("손절선", plan.stop, "down"),
      this.#planCell("비중", `${plan.sizePct}%`),
    );
    box.append(head, grid);
    return box;
  }

  #planCell(
    label: string,
    value: number | string,
    tone?: "up" | "down",
    big?: boolean,
  ): HTMLElement {
    const cell = el("div", "jd-council__plan-cell");
    const l = el("div", "jd-council__plan-cell-label");
    l.textContent = label;
    const v = el("div", "jd-council__plan-cell-value");
    v.textContent = typeof value === "number" ? groupDigits(value) : value;
    if (tone) v.setAttribute("data-dir", tone);
    if (big) v.setAttribute("data-big", "");
    cell.append(l, v);
    return cell;
  }

  #quotes(p: JdInvestorProfile): HTMLElement {
    const details = el("details", "jd-council__quotes") as HTMLDetailsElement;
    const summary = el("summary", "jd-council__quotes-summary");
    summary.append(
      icon("info", 12, "2.2"),
      document.createTextNode(`${p.korean}이 자주 인용하는 말 / 출처`),
    );
    const ul = el("ul", "jd-council__quotes-list");
    for (const q of p.quotes ?? []) {
      const li = el("li", "jd-council__quote");
      li.textContent = `“${q}”`;
      ul.append(li);
    }
    const src = el("li", "jd-council__quotes-source");
    src.textContent = [p.era, p.source].filter(Boolean).join(" · ");
    ul.append(src);
    details.append(summary, ul);
    return details;
  }
}
