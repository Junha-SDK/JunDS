/**
 * <jd-investor-ranking> — 투자자별 순매수 TOP 5 (v2 finance/InvestorRanking).
 *
 * 외국인·기관·개인 3열, 각 열은 순매수 상위 5종목. `live` attribute를 주면 v2처럼
 * 결정적 LCG 지터로 3초마다(interval) 값을 흔든다 — Math.random 미사용(§3.1-3 결정적
 * 렌더). 틱은 connected 이후 createInterval Behavior에서만 돈다(render는 항상 순수).
 *
 * v2는 종목 시드를 HEATMAP_FLAT에서 파생했다(데이터 결합). v3는 표현 컴포넌트로 분리 —
 * 종목 배열은 `stocks` 프로퍼티(또는 JSON 슬롯)로 받는다(§1.3 복합 데이터는 property).
 * 순위 계산·틱은 순수 함수라 데이터 출처와 무관하게 재사용된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits, upgradeAccessor } from "../../core/chart.js";
import { createInterval } from "../../behaviors/timing.js";
import investorRankingStyles from "./investor-ranking.css.js";

type InvestorKey = "foreign" | "institution" | "individual";

export interface JdRankingStock {
  name: string;
  /** 종가(원) */
  close: number;
  /** 등락률 % */
  pct: number;
  /** 투자자별 순매수(억원) */
  net: Record<InvestorKey, number>;
  group?: string;
}

interface Column {
  key: InvestorKey;
  label: string;
  colorVar: string;
}

const COLUMNS: readonly Column[] = [
  { key: "foreign", label: "외국인", colorVar: "var(--jd-fin-foreign)" },
  { key: "institution", label: "기관", colorVar: "var(--jd-fin-institution)" },
  { key: "individual", label: "개인", colorVar: "var(--jd-fin-individual)" },
];

/** v2 fmt억 — toLocaleString은 로케일 의존이라 프리렌더가 어긋난다(§3.1-3) → groupDigits */
function fmtEok(eok: number): string {
  if (Math.abs(eok) >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  return `${groupDigits(eok)}억`;
}

/** v2 tickAll — 결정적 지터로 값 한 스텝 흔들기 */
function tickAll(prev: JdRankingStock[], jitter: () => number): JdRankingStock[] {
  return prev.map((s) => {
    const foreign = Math.round(
      s.net.foreign + jitter() * Math.max(40, Math.abs(s.net.foreign) * 0.18),
    );
    const institution = Math.round(
      s.net.institution + jitter() * Math.max(30, Math.abs(s.net.institution) * 0.2),
    );
    return {
      ...s,
      pct: +(s.pct + jitter() * 0.4).toFixed(2),
      close: Math.max(100, Math.round(s.close * (1 + jitter() * 0.005))),
      net: {
        foreign,
        institution,
        individual: -(foreign + institution) + Math.round(jitter() * 60),
      },
    };
  });
}

export class JdInvestorRanking extends JdElement {
  static override tag = "jd-investor-ranking";
  static override props = {
    /** 라이브 틱 켜기 (v2는 항상 켜짐 — 여기선 opt-in) */
    live: { type: Boolean, reflect: true },
    /** 틱 간격(ms). v2 3000 */
    interval: { type: Number, default: 3000 },
    /** 상위 몇 종목 (v2 5) */
    topN: { type: Number, default: 5, attribute: "top-n" },
  };

  declare live: boolean;
  declare interval: number;
  declare topN: number;

  #stocks: JdRankingStock[] = [];
  #seed = 2;
  #timer?: { destroy(): void };
  #lists = new Map<InvestorKey, HTMLOListElement>();
  #sub!: HTMLElement;

  /** 종목 데이터 (§1.3 property 전용) */
  get stocks(): JdRankingStock[] {
    return this.#stocks;
  }
  set stocks(v: JdRankingStock[]) {
    this.#stocks = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdRankingStock[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => {
        const net = (s.net ?? {}) as Record<string, unknown>;
        return {
          name: typeof s.name === "string" ? s.name : "",
          close: num(s.close),
          pct: num(s.pct),
          group: typeof s.group === "string" ? s.group : undefined,
          net: {
            foreign: num(net.foreign),
            institution: num(net.institution),
            individual: num(net.individual),
          },
        };
      });
  }

  protected render(): void {
    upgradeAccessor(this, "stocks"); // 정의 이전 대입 회수(§1.3)
    adoptStyles(investorRankingStyles);
    this.#readJsonSlot();

    const card = document.createElement("div");
    card.className = "jd-ir__card";

    const head = document.createElement("div");
    head.className = "jd-ir__head";
    const title = document.createElement("span");
    title.className = "jd-ir__title";
    title.textContent = "투자자별 순매수 TOP 5";
    this.#sub = document.createElement("span");
    this.#sub.className = "jd-ir__sub-note";
    head.append(title, this.#sub);

    const grid = document.createElement("div");
    grid.className = "jd-ir__grid";
    COLUMNS.forEach((col, i) => {
      const colEl = document.createElement("div");
      colEl.className = "jd-ir__col";
      colEl.style.setProperty("--_c", col.colorVar);
      if (i === COLUMNS.length - 1) colEl.setAttribute("data-last", "");
      const colHead = document.createElement("div");
      colHead.className = "jd-ir__col-head";
      const dot = document.createElement("span");
      dot.className = "jd-ir__dot";
      const label = document.createElement("span");
      label.className = "jd-ir__col-label";
      label.textContent = `${col.label} 순매수`;
      colHead.append(dot, label);
      const list = document.createElement("ol");
      list.className = "jd-ir__list";
      colEl.append(colHead, list);
      grid.append(colEl);
      this.#lists.set(col.key, list);
    });

    card.append(head, grid);
    this.append(card);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#stocks = this.#normalize(parsed);
    } catch {
      console.warn("[junds] <jd-investor-ranking> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    if (this.live) this.#start();
  }

  protected override disconnected(): void {
    this.#timer?.destroy();
    this.#timer = undefined;
  }

  protected override update(): void {
    // live 토글 반영
    if (this.live && !this.#timer && this.isConnected) this.#start();
    if (!this.live && this.#timer) {
      this.#timer.destroy();
      this.#timer = undefined;
    }

    this.#sub.textContent = `전 종목(${this.#stocks.length}) 누적${
      this.live ? ` · ${Math.round(this.interval / 1000)}초마다 갱신` : ""
    }`;

    const top = Math.max(1, this.topN);
    for (const col of COLUMNS) {
      const list = this.#lists.get(col.key);
      if (!list) continue;
      const rows = [...this.#stocks].sort((a, b) => b.net[col.key] - a.net[col.key]).slice(0, top);
      this.#paintColumn(list, col, rows);
    }
  }

  #start(): void {
    if (this.#timer) return; // 멱등 — connected와 update가 동시에 부를 수 있다
    this.#timer = this.own(
      createInterval(() => {
        this.#stocks = tickAll(this.#stocks, () => {
          this.#seed = (this.#seed * 1103515245 + 12345) & 0x7fffffff;
          return (this.#seed % 1000) / 1000 - 0.5;
        });
        this.requestUpdate();
      }, Math.max(250, this.interval)),
    );
  }

  #paintColumn(list: HTMLOListElement, col: Column, rows: JdRankingStock[]): void {
    // 행 수를 맞춘 뒤 내용만 동기화 — 노드 재사용
    while (list.children.length > rows.length) list.lastElementChild!.remove();
    while (list.children.length < rows.length) list.append(this.#rowSkeleton());

    rows.forEach((s, i) => {
      const li = list.children[i] as HTMLLIElement;
      const rank = li.querySelector<HTMLElement>(".jd-ir__rank")!;
      rank.textContent = String(i + 1);
      rank.toggleAttribute("data-first", i === 0);
      li.querySelector(".jd-ir__name")!.textContent = s.name;
      li.querySelector(".jd-ir__close")!.textContent = groupDigits(s.close);
      const pctEl = li.querySelector<HTMLElement>(".jd-ir__pct")!;
      pctEl.textContent = `${s.pct >= 0 ? "+" : ""}${s.pct.toFixed(2)}%`;
      pctEl.setAttribute("data-dir", s.pct >= 0 ? "up" : "down");
      const v = s.net[col.key];
      const netEl = li.querySelector<HTMLElement>(".jd-ir__net")!;
      netEl.textContent = `${v >= 0 ? "+" : ""}${fmtEok(v)}`;
      netEl.setAttribute("data-dir", v >= 0 ? "up" : "down");
    });
  }

  #rowSkeleton(): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-ir__row";
    const rank = document.createElement("span");
    rank.className = "jd-ir__rank";
    const meta = document.createElement("div");
    meta.className = "jd-ir__meta";
    const name = document.createElement("div");
    name.className = "jd-ir__name";
    const sub = document.createElement("div");
    sub.className = "jd-ir__row-sub";
    const close = document.createElement("span");
    close.className = "jd-ir__close";
    const pct = document.createElement("span");
    pct.className = "jd-ir__pct";
    sub.append(close, pct);
    meta.append(name, sub);
    const net = document.createElement("span");
    net.className = "jd-ir__net";
    li.append(rank, meta, net);
    return li;
  }
}
