/**
 * <jd-strategy-panel> — 매매 전략 패널 (v2 finance/StrategyPanel).
 *
 * v2는 `strategyFor(name)`(해시 시드 알고리즘)과 `useLivePrice(name)`을 컴포넌트 안에서
 * 호출했다. DS 컴포넌트로는 그 계산·데이터 결합을 걷어내고(§6.3) **전략 스냅샷 객체와
 * 현재가를 프로퍼티로 받아 그리는 표현 전용 패널**로 만든다:
 *  - `strategy`(StrategySnapshot) — property / JSON 슬롯(§1.3 복합 데이터 attribute 금지)
 *  - `price`(number) — 현재가. 매수/손절까지 거리 계산에 쓴다.
 *
 * REC 5단계 톤은 인라인 색 분기(v2) 대신 호스트 CSS 변수(--_jd-sp-color/-bg)로 한 번만
 * 실어 CSS가 소비한다. 아이콘은 <jd-app-icon>, "데모 알고리즘" 배지는 <jd-badge>를
 * 합성한다(index에서 등록). 근거 패널은 네이티브 <details>라 JS 토글이 없다.
 *
 * 표현 전용이라 update()는 strategy/price가 실제로 바뀔 때만 내부를 재구축한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import strategyPanelStyles from "./strategy-panel.css.js";

export interface JdStrategyLevel {
  label: string;
  price: number;
  description: string;
  tone: "buy" | "sell" | "stop" | "neutral";
}

export interface JdScoreBreakdown {
  base: number;
  changePct: number;
  changeWeight: number;
  changeContribution: number;
  riskRewardRatio: number;
  rrWeight: number;
  rrContribution: number;
  rawTotal: number;
  finalScore: number;
}

export interface JdStrategySnapshot {
  recommendation: string;
  recommendationScore: number;
  confidence: number;
  scoreBreakdown: JdScoreBreakdown;
  reasons: string[];
  riskRewardRatio: number;
  positionSize: { conservative: number; balanced: number; aggressive: number };
  buyZones: JdStrategyLevel[];
  takeProfitZones: JdStrategyLevel[];
  stopLoss: JdStrategyLevel;
  swingScore: number;
  notes: string[];
}

const KRW = new Intl.NumberFormat("ko-KR");
const RECO_ICON: Record<string, string> = {
  강력매수: "trendingUp",
  매수: "trendingUp",
  관망: "activity",
  매도: "trendingDown",
  강력매도: "trendingDown",
};
/**
 * 톤 색/배경 CSS 식 (up=success / down=danger / 중립=muted, color-mix로 5단계).
 * `color`=틴트(bg) 위에 얹는 글자색, `strong`=원색 채움 배경(추천 아이콘 원)용.
 * 강력매수/강력매도는 원색을 틴트 위 글자로 그대로 쓰면 작은 글자(캡션·칩 10~11px)가
 * AA 미달(success 원색 위 12% 틴트 ≈ 3.5:1)이라 65% foreground 혼합으로 낮춘다(점검5).
 * 채움 원(흰 글자)은 원색 그대로도 4~5:1이라 충분하고, foreground 혼합은 다크 테마에서
 * 오히려 밝아져 흰 글자 대비를 떨어뜨리므로 strong으로 분리해 원색을 유지한다.
 */
const RECO_TONE: Record<string, { color: string; bg: string; strong?: string }> = {
  강력매수: {
    color: "color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground))",
    strong: "var(--jd-color-success)",
    bg: "color-mix(in srgb, var(--jd-color-success) 12%, transparent)",
  },
  매수: {
    color: "color-mix(in srgb, var(--jd-color-success) 55%, var(--jd-color-muted))",
    bg: "color-mix(in srgb, var(--jd-color-success) 8%, transparent)",
  },
  관망: {
    color: "var(--jd-color-muted)",
    bg: "color-mix(in srgb, var(--jd-color-muted) 12%, transparent)",
  },
  매도: {
    color: "color-mix(in srgb, var(--jd-color-danger) 55%, var(--jd-color-muted))",
    bg: "color-mix(in srgb, var(--jd-color-danger) 8%, transparent)",
  },
  강력매도: {
    color: "color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground))",
    strong: "var(--jd-color-danger)",
    bg: "color-mix(in srgb, var(--jd-color-danger) 12%, transparent)",
  },
};

const sign = (n: number): string => (n >= 0 ? "+" : "");
const pctText = (n: number): string => `${sign(n)}${n.toFixed(2)}%`;

export class JdStrategyPanel extends JdElement {
  static override tag = "jd-strategy-panel";
  static override props = {
    /** 현재가 — 매수/손절까지 거리 계산 */
    price: { type: Number, default: 0 },
  };

  declare price: number;

  #strategy: JdStrategySnapshot | null = null;
  #root!: HTMLElement;
  #builtStrategy: JdStrategySnapshot | null | undefined = undefined;
  #builtPrice = NaN;

  get strategy(): JdStrategySnapshot | null {
    return this.#strategy;
  }
  set strategy(v: JdStrategySnapshot | null) {
    this.#strategy = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(strategyPanelStyles);
    this.#upgradeOwn("strategy");
    this.#readJsonSlot();
    let root = this.querySelector<HTMLElement>(":scope > .jd-strategy-panel__body");
    if (!root) {
      root = document.createElement("section");
      root.className = "jd-strategy-panel__body";
      this.append(root);
    }
    this.#root = root;
    this.update();
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "null") as JdStrategySnapshot;
      if (parsed && typeof parsed === "object") this.#strategy = parsed;
    } catch {
      console.warn("[junds] <jd-strategy-panel> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    const s = this.#strategy;
    if (this.#builtStrategy === s && this.#builtPrice === this.price) return;
    this.#builtStrategy = s;
    this.#builtPrice = this.price;

    if (!s) {
      this.#root.replaceChildren();
      this.style.removeProperty("--_jd-sp-color");
      this.style.removeProperty("--_jd-sp-strong");
      this.style.removeProperty("--_jd-sp-bg");
      return;
    }

    const tone = RECO_TONE[s.recommendation] ?? RECO_TONE["관망"]!;
    this.style.setProperty("--_jd-sp-color", tone.color);
    this.style.setProperty("--_jd-sp-strong", tone.strong ?? tone.color);
    this.style.setProperty("--_jd-sp-bg", tone.bg);

    // 근거 패널 열림 상태 보존 — price 틱마다 재구축돼도 접히지 않게(v2 uncontrolled details 동형)
    const wasOpen =
      this.#root.querySelector(".jd-strategy-panel__reason")?.hasAttribute("open") ?? false;

    const reason = this.#reasonPanel(s);
    if (wasOpen) reason.setAttribute("open", "");

    this.#root.replaceChildren(
      this.#header(s),
      this.#topGrid(s),
      reason,
      this.#zones(s),
      this.#positions(s),
      ...(s.notes.length ? [this.#notes(s)] : []),
    );
  }

  /* ── 섹션 빌더 ─────────────────────────────────────────────────────── */

  #header(s: JdStrategySnapshot): HTMLElement {
    const header = elc("header", "jd-strategy-panel__header");
    const left = elc("div", "jd-strategy-panel__header-left");
    left.append(
      icon("target", "16", "2.2", "jd-strategy-panel__accent-icon"),
      elc("h2", "jd-strategy-panel__title", "매매 전략"),
      badge("info", "데모 알고리즘"),
    );
    const right = elc("div", "jd-strategy-panel__header-right");
    right.append(
      elc("span", "jd-strategy-panel__num", `손익비 ${s.riskRewardRatio.toFixed(1)} : 1`),
    );
    header.append(left, right);
    return header;
  }

  #topGrid(s: JdStrategySnapshot): HTMLElement {
    const price = this.price;
    const distToBuy = pctDist(price, s.buyZones[0]?.price ?? price);
    const distToStop = pctDist(price, s.stopLoss.price);

    const grid = elc("div", "jd-strategy-panel__top");

    // 추천 카드
    const rec = elc("div", "jd-strategy-panel__rec");
    const circle = elc("div", "jd-strategy-panel__rec-icon");
    circle.append(icon(RECO_ICON[s.recommendation] ?? "activity", "20", "2.4"));
    const recMain = elc("div", "jd-strategy-panel__rec-main");
    recMain.append(
      elc("div", "jd-strategy-panel__rec-caption jd-strategy-panel__tone", "현재 추천"),
      elc("div", "jd-strategy-panel__rec-label jd-strategy-panel__tone", s.recommendation),
    );
    rec.append(
      circle,
      recMain,
      metricCell("추천 점수", s.recommendationScore.toFixed(0), "/100", true),
      metricCell("신뢰도", (s.confidence * 100).toFixed(0), "%", false),
    );

    // KPI 3종
    const kpis = elc("div", "jd-strategy-panel__kpis");
    kpis.append(
      kpiTile("스윙 점수", `${s.swingScore}`, "/100"),
      kpiTile("B1까지", pctText(distToBuy), "", distToBuy <= 0 ? "buy" : "neutral"),
      kpiTile("손절까지", `${distToStop.toFixed(2)}`, "%", distToStop > 5 ? "buy" : "stop"),
    );

    grid.append(rec, kpis);
    return grid;
  }

  #reasonPanel(s: JdStrategySnapshot): HTMLElement {
    const b = s.scoreBreakdown;
    const confidencePct = Math.round(s.confidence * 100);
    const confidenceLabel =
      confidencePct >= 85
        ? "매우 확신"
        : confidencePct >= 70
        ? "확신"
        : confidencePct >= 55
        ? "약간 확신"
        : "관망에 가까움";

    const details = elc("details", "jd-strategy-panel__reason") as HTMLDetailsElement;
    const summary = elc("summary", "jd-strategy-panel__reason-summary");
    summary.append(
      icon("info", "13", "2.4", "jd-strategy-panel__tone-icon"),
      elc("span", "", `왜 "${s.recommendation}"인가요? — 추천 근거 보기`),
      elc(
        "span",
        "jd-strategy-panel__reason-chip",
        `신뢰도 ${confidencePct}% · ${confidenceLabel}`,
      ),
    );
    details.append(summary);

    const body = elc("div", "jd-strategy-panel__reason-body");

    // 산식 카드
    const formula = elc(
      "div",
      "jd-strategy-panel__reason-card jd-strategy-panel__reason-card--soft",
    );
    formula.append(elc("div", "jd-strategy-panel__reason-heading", "추천 점수 산식 (0~100)"));
    const ul = elc("ul", "jd-strategy-panel__breakdown");
    ul.append(
      breakdownRow("시작 점수", "모든 종목은 중립 50점에서 출발", `${b.base.toFixed(0)}점`, "text"),
      breakdownRow(
        `등락률 ${pctText(b.changePct)} × ${b.changeWeight}`,
        "당일 시세 모멘텀이 강할수록 가산",
        `${sign(b.changeContribution)}${b.changeContribution.toFixed(1)}점`,
        b.changeContribution >= 0 ? "up" : "down",
      ),
      breakdownRow(
        `손익비 ${b.riskRewardRatio.toFixed(2)} : 1 × ${b.rrWeight}`,
        "목표가까지 상승폭 ÷ 손절까지 하락폭",
        `${sign(b.rrContribution)}${b.rrContribution.toFixed(1)}점`,
        b.rrContribution >= 0 ? "up" : "down",
      ),
    );
    const total = elc("li", "jd-strategy-panel__breakdown-total");
    total.append(
      elc("span", "jd-strategy-panel__breakdown-total-label", "합계 (클램프 후)"),
      elc(
        "span",
        "jd-strategy-panel__breakdown-total-value jd-strategy-panel__tone",
        `${b.finalScore.toFixed(0)} / 100`,
      ),
    );
    ul.append(total);
    formula.append(ul);
    const criteria = elc("div", "jd-strategy-panel__reason-criteria");
    const cLabel = elc("strong", "", "판정 기준:");
    criteria.append(
      cLabel,
      document.createTextNode(" ≥80 강력매수 · ≥62 매수 · 39~61 관망 · ≤38 매도 · ≤20 강력매도"),
    );
    formula.append(criteria);

    // 신뢰도 의미 + 근거
    const meaning = elc("div", "jd-strategy-panel__reason-card");
    meaning.append(elc("div", "jd-strategy-panel__reason-heading", "신뢰도 의미"));
    meaning.append(
      elc(
        "p",
        "jd-strategy-panel__reason-p",
        "신뢰도는 추천 점수가 중립값(50점)에서 얼마나 멀리 떨어져 있는지를 0.45~0.95 범위로 환산한 값입니다. 점수가 양극단(0 또는 100)에 가까울수록 라벨에 대한 확신이 높습니다.",
      ),
    );
    meaning.append(elc("div", "jd-strategy-panel__reason-heading", "자연어 근거"));
    const reasons = elc("ul", "jd-strategy-panel__reasons");
    for (const r of s.reasons) {
      const li = elc("li", "jd-strategy-panel__reason-item");
      li.append(
        elc("span", "jd-strategy-panel__reason-dot jd-strategy-panel__tone-bgdot"),
        elc("span", "", r),
      );
      reasons.append(li);
    }
    meaning.append(reasons);
    meaning.append(
      elc(
        "div",
        "jd-strategy-panel__reason-disclaimer",
        "⚠ 본 점수는 데모 알고리즘(등락률 + 손익비 가중합)으로 산출된 참고용 신호이며, 투자 권유가 아닙니다.",
      ),
    );

    body.append(formula, meaning);
    details.append(body);
    return details;
  }

  #zones(s: JdStrategySnapshot): HTMLElement {
    const grid = elc("div", "jd-strategy-panel__zones");
    grid.append(
      zoneColumn("매수 구간", "buy", "arrowDown", s.buyZones, this.price),
      zoneColumn("익절 구간", "sell", "arrowUp", s.takeProfitZones, this.price),
      stopColumn(s.stopLoss, this.price),
    );
    return grid;
  }

  #positions(s: JdStrategySnapshot): HTMLElement {
    const grid = elc("div", "jd-strategy-panel__positions");
    grid.append(
      positionTile("안전형", s.positionSize.conservative, "info"),
      positionTile("균형형", s.positionSize.balanced, "primary"),
      positionTile("공격형", s.positionSize.aggressive, "up"),
    );
    return grid;
  }

  #notes(s: JdStrategySnapshot): HTMLElement {
    const wrap = elc("div", "jd-strategy-panel__notes");
    for (const note of s.notes) {
      const row = elc("div", "jd-strategy-panel__note");
      row.append(icon("info", "12", "2.2", "jd-strategy-panel__note-icon"), elc("span", "", note));
      wrap.append(row);
    }
    return wrap;
  }
}

/* ── 순수 빌더 (모듈 함수) ──────────────────────────────────────────── */

function elc(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name: string, size: string, strokeWidth: string, className?: string): HTMLElement {
  const node = document.createElement("jd-app-icon");
  node.setAttribute("name", name);
  node.setAttribute("size", size);
  node.setAttribute("stroke-width", strokeWidth);
  if (className) node.className = className;
  return node;
}

function badge(variant: string, text: string): HTMLElement {
  const node = document.createElement("jd-badge");
  node.setAttribute("variant", variant);
  node.setAttribute("size", "sm");
  node.textContent = text;
  return node;
}

/** 추천 카드 우측의 점수/신뢰도 셀 */
function metricCell(label: string, value: string, unit: string, borderRight: boolean): HTMLElement {
  const cell = elc(
    "div",
    `jd-strategy-panel__rec-metric${borderRight ? " jd-strategy-panel__rec-metric--divider" : ""}`,
  );
  cell.append(elc("div", "jd-strategy-panel__rec-metric-label", label));
  const v = elc("div", "jd-strategy-panel__rec-metric-value jd-strategy-panel__tone");
  v.append(document.createTextNode(value), elc("span", "jd-strategy-panel__rec-metric-unit", unit));
  cell.append(v);
  return cell;
}

function kpiTile(
  label: string,
  value: string,
  unit: string,
  tone?: "buy" | "stop" | "neutral",
): HTMLElement {
  const tile = elc("div", "jd-strategy-panel__kpi");
  if (tone) tile.dataset.tone = tone;
  tile.append(elc("div", "jd-strategy-panel__kpi-label", label));
  const v = elc("div", "jd-strategy-panel__kpi-value");
  v.append(document.createTextNode(value));
  if (unit) v.append(elc("span", "jd-strategy-panel__kpi-unit", unit));
  tile.append(v);
  return tile;
}

function breakdownRow(
  label: string,
  detail: string,
  value: string,
  trend: "up" | "down" | "text",
): HTMLElement {
  const li = elc("li", "jd-strategy-panel__breakdown-row");
  const main = elc("div", "jd-strategy-panel__breakdown-main");
  main.append(
    elc("div", "jd-strategy-panel__breakdown-label", label),
    elc("div", "jd-strategy-panel__breakdown-detail", detail),
  );
  const v = elc("span", "jd-strategy-panel__breakdown-value", value);
  v.dataset.trend = trend;
  li.append(main, v);
  return li;
}

function zoneColumn(
  title: string,
  tone: "buy" | "sell",
  iconName: string,
  levels: JdStrategyLevel[],
  current: number,
): HTMLElement {
  const col = elc("div", "jd-strategy-panel__zone");
  col.dataset.tone = tone;
  const head = elc("div", "jd-strategy-panel__zone-head");
  head.append(
    icon(iconName, "13", "2.4", "jd-strategy-panel__zone-icon"),
    elc("h3", "jd-strategy-panel__zone-title", title),
  );
  col.append(head);
  for (const level of levels) {
    const dist = pctDist(current, level.price);
    const row = elc("div", "jd-strategy-panel__level");
    const left = elc("div", "jd-strategy-panel__level-left");
    left.append(
      chip(level.label, tone),
      elc("div", "jd-strategy-panel__level-desc", level.description),
    );
    const right = elc("div", "jd-strategy-panel__level-right");
    right.append(
      elc("div", "jd-strategy-panel__level-price", KRW.format(level.price)),
      elc("div", "jd-strategy-panel__level-dist", pctText(dist)),
    );
    row.append(left, right);
    col.append(row);
  }
  return col;
}

function stopColumn(level: JdStrategyLevel, current: number): HTMLElement {
  const dist = pctDist(current, level.price);
  const col = elc("div", "jd-strategy-panel__zone");
  col.dataset.tone = "stop";
  const head = elc("div", "jd-strategy-panel__zone-head");
  head.append(
    icon("alert", "13", "2.4", "jd-strategy-panel__zone-icon"),
    elc("h3", "jd-strategy-panel__zone-title", "손절선"),
  );
  col.append(head);
  const box = elc("div", "jd-strategy-panel__stop");
  const rowTop = elc("div", "jd-strategy-panel__stop-top");
  const right = elc("div", "jd-strategy-panel__stop-right");
  right.append(
    elc("div", "jd-strategy-panel__stop-price", KRW.format(level.price)),
    elc("div", "jd-strategy-panel__stop-dist", `${dist.toFixed(2)}% 거리`),
  );
  rowTop.append(chip(level.label, "stop"), right);
  box.append(rowTop, elc("p", "jd-strategy-panel__stop-desc", level.description));
  col.append(box);
  return col;
}

function positionTile(label: string, pct: number, tone: "info" | "primary" | "up"): HTMLElement {
  const tile = elc("div", "jd-strategy-panel__position");
  tile.dataset.tone = tone;
  const left = elc("div", "");
  left.append(
    elc("div", "jd-strategy-panel__position-label", `${label} 포지션`),
    elc("div", "jd-strategy-panel__position-value", `${pct}%`),
  );
  tile.append(left, elc("div", "jd-strategy-panel__position-note", "총자산 대비"));
  return tile;
}

function chip(text: string, tone: string): HTMLElement {
  const node = elc("span", "jd-strategy-panel__chip", text);
  node.dataset.tone = tone;
  return node;
}

/** (current - level)/level × 100 */
function pctDist(current: number, level: number): number {
  if (!level) return 0;
  return ((current - level) / level) * 100;
}
