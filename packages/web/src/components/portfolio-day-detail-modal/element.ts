/**
 * <jd-portfolio-day-detail-modal> — 일자별 매매 상세 다이얼로그
 *   (v2 finance/PortfolioDayDetailModal) = **jd-modal 파생**(§6 R12).
 *
 * v2는 Modal을 조합해 지표 8칸(실현손익·수익률·회전·순손익 / 매도·매수·수수료·거래세) +
 * 체결 내역 표 + 각주를 그렸다. jd-modal을 상속해 포커스 감금·요청형 닫기(jd-request-close)·
 * 스크롤 락·재연결 복원을 공짜로 얻고, 파생은 **본문 골격과 체결 표**만 얹는다.
 *
 * v2 결합 분리:
 *  - v2는 수수료율을 useBrokerage()(localStorage 훅)에 결합했다. DS는 의존성 0이라
 *    `brokerage` 프로퍼티({name, commission})로 주입받는다(기본 키움 0.015%). 거래세는
 *    규제 상수(0.18%).
 *  - `day`는 복합 데이터라 property 전용(§1.3). null이면 빈 상태 문구.
 *
 * 결정성(§3.1-3): 체결 내역은 v2 그대로 date 시드 mulberry32로 **결정적** 생성한다.
 * 금액 표기는 로케일 비의존 groupDigits.
 *
 * v2 대비 개선: 제목이 aria-labelledby로 다이얼로그 이름이 되고, 표에 행/열 머리가 붙는다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits, upgradeAccessor } from "../../core/chart.js";
import { jdUid } from "../../core/uid.js";
import pddmStyles from "./portfolio-day-detail-modal.css.js";

export interface JdPortfolioDay {
  date: string;
  profit: number;
  pct: number;
  sellAmount: number;
  buyAmount: number;
  sellQty: number;
  buyQty: number;
  fees: number;
}

export interface JdBrokerageInfo {
  name: string;
  /** 온라인 수수료율(소수, 예: 0.00015 = 0.015%) */
  commission: number;
}

interface DayTrade {
  name: string;
  side: "매도" | "매수";
  qty: number;
  price: number;
  amount: number;
  fee: number;
  pl: number;
}

/** 거래세 — 증권사 무관(매도분). KOSPI/KOSDAQ 합산 0.18% */
const TRANSACTION_TAX = 0.0018;
const DEFAULT_BROKERAGE: JdBrokerageInfo = { name: "키움증권 (영웅문)", commission: 0.00015 };

const STOCK_POOL = [
  "보성파워텍",
  "씨아이에스",
  "대원전선",
  "한국항공우주",
  "SK이노베이션",
  "두산에너빌리티",
  "리노공업",
  "에코프로비엠",
] as const;

const CLOSE_SVG =
  `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">` +
  `<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const UP = "var(--jd-finance-up, var(--jd-color-success))";
const DOWN = "var(--jd-finance-down, var(--jd-color-danger))";
const signColor = (n: number): string => (n >= 0 ? UP : DOWN);
const fmtSigned = (n: number): string => (n > 0 ? `+${groupDigits(n)}` : groupDigits(n));
const fmtSignedPct = (n: number): string => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

interface Tile {
  label: HTMLElement;
  num: HTMLElement;
  unit: HTMLElement;
}

export class JdPortfolioDayDetailModal extends JdModal {
  static override tag = "jd-portfolio-day-detail-modal";
  static override props = {
    ...JdModal.props,
  };

  #day: JdPortfolioDay | null = null;
  #brokerage: JdBrokerageInfo = DEFAULT_BROKERAGE;

  #built = false;
  #titleEl!: HTMLHeadingElement;
  #empty!: HTMLElement;
  #content!: HTMLElement;
  #tiles: Record<string, Tile> = {};
  #tbody!: HTMLTableSectionElement;

  /** 매매일자 요약. null이면 빈 상태 */
  get day(): JdPortfolioDay | null {
    return this.#day;
  }
  set day(v: JdPortfolioDay | null) {
    this.#day = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  /** 수수료율 주입(기본 키움) */
  get brokerage(): JdBrokerageInfo {
    return this.#brokerage;
  }
  set brokerage(v: JdBrokerageInfo) {
    this.#brokerage =
      v && typeof v === "object" && Number.isFinite(v.commission) ? v : DEFAULT_BROKERAGE;
    this.requestUpdate();
  }

  protected override render(): void {
    upgradeAccessor(this, "day");
    upgradeAccessor(this, "brokerage");
    super.render(); // 백드롭 + 패널 구축
    adoptStyles(pddmStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    if (panel.querySelector(".jd-pddm__header")) {
      this.#bindRefs(panel);
    } else {
      this.#build(panel);
    }
    this.#built = true;
    this.update();
  }

  #build(panel: HTMLElement): void {
    const doc = this.ownerDocument;
    const headingId = jdUid("jd-pddm-title");

    const header = doc.createElement("header");
    header.className = "jd-pddm__header";
    this.#titleEl = doc.createElement("h3");
    this.#titleEl.className = "jd-pddm__title";
    this.#titleEl.id = headingId;
    const close = doc.createElement("button");
    close.type = "button";
    close.className = "jd-pddm__close";
    close.setAttribute("aria-label", "닫기");
    close.setAttribute("data-autofocus", "");
    close.innerHTML = CLOSE_SVG;
    close.addEventListener("click", () => this.close());
    header.append(this.#titleEl, close);

    this.#empty = doc.createElement("div");
    this.#empty.className = "jd-pddm__empty";
    this.#empty.textContent = "선택된 매매일자가 없습니다.";

    this.#content = doc.createElement("div");
    this.#content.className = "jd-pddm__content";

    const grid1 = doc.createElement("div");
    grid1.className = "jd-pddm__grid";
    grid1.append(
      this.#tile("realizedPL", "실현손익"),
      this.#tile("realizedPct", "실현수익률"),
      this.#tile("turnover", "거래 회전"),
      this.#tile("netPL", "순손익(세후)"),
    );

    const h1 = doc.createElement("h4");
    h1.className = "jd-pddm__section";
    h1.textContent = "금액 구성";
    const grid2 = doc.createElement("div");
    grid2.className = "jd-pddm__grid";
    grid2.append(
      this.#tile("sell", "매도금액"),
      this.#tile("buy", "매수금액"),
      this.#tile("commission", "수수료"),
      this.#tile("tax", "거래세 0.18%"),
    );

    const h2 = doc.createElement("h4");
    h2.className = "jd-pddm__section";
    h2.textContent = "체결 내역";
    const tableWrap = doc.createElement("div");
    tableWrap.className = "jd-pddm__table-wrap";
    const table = doc.createElement("table");
    table.className = "jd-pddm__table";
    table.append(this.#thead(doc));
    this.#tbody = doc.createElement("tbody");
    table.append(this.#tbody);
    tableWrap.append(table);

    const note = doc.createElement("p");
    note.className = "jd-pddm__note";
    note.textContent =
      "※ 체결 내역은 일별 합계 기준으로 자동 분배해 표시한 데모 자료입니다. 실제 거래 내역은 체결 화면에서 확인해 주세요.";

    this.#content.append(grid1, h1, grid2, h2, tableWrap, note);
    panel.append(header, this.#empty, this.#content);
    panel.setAttribute("aria-labelledby", headingId);
  }

  #thead(doc: Document): HTMLTableSectionElement {
    const thead = doc.createElement("thead");
    const tr = doc.createElement("tr");
    const cols: { text: string; align: "left" | "right" }[] = [
      { text: "종목", align: "left" },
      { text: "구분", align: "left" },
      { text: "수량", align: "right" },
      { text: "단가", align: "right" },
      { text: "금액", align: "right" },
      { text: "수수료", align: "right" },
      { text: "손익", align: "right" },
    ];
    for (const c of cols) {
      const th = doc.createElement("th");
      th.scope = "col";
      th.textContent = c.text;
      th.dataset.align = c.align;
      tr.append(th);
    }
    thead.append(tr);
    return thead;
  }

  #tile(key: string, label: string): HTMLElement {
    const doc = this.ownerDocument;
    const root = doc.createElement("div");
    root.className = "jd-pddm__stat";
    const labelEl = doc.createElement("div");
    labelEl.className = "jd-pddm__stat-label";
    labelEl.textContent = label;
    const valueEl = doc.createElement("div");
    valueEl.className = "jd-pddm__stat-value";
    const num = doc.createElement("span");
    num.className = "jd-pddm__stat-num";
    const unit = doc.createElement("span");
    unit.className = "jd-pddm__stat-unit";
    valueEl.append(num, unit);
    root.append(labelEl, valueEl);
    this.#tiles[key] = { label: labelEl, num, unit };
    return root;
  }

  #bindRefs(panel: HTMLElement): void {
    this.#titleEl = panel.querySelector(".jd-pddm__title")!;
    this.#empty = panel.querySelector(".jd-pddm__empty")!;
    this.#content = panel.querySelector(".jd-pddm__content")!;
    this.#tbody = panel.querySelector(".jd-pddm__table tbody")!;
    const stats = panel.querySelectorAll<HTMLElement>(".jd-pddm__stat");
    const keys = [
      "realizedPL",
      "realizedPct",
      "turnover",
      "netPL",
      "sell",
      "buy",
      "commission",
      "tax",
    ];
    stats.forEach((s, i) => {
      this.#tiles[keys[i]!] = {
        label: s.querySelector<HTMLElement>(".jd-pddm__stat-label")!,
        num: s.querySelector<HTMLElement>(".jd-pddm__stat-num")!,
        unit: s.querySelector<HTMLElement>(".jd-pddm__stat-unit")!,
      };
    });
  }

  protected override update(): void {
    super.update(); // 모달 open 전이
    if (!this.#built) return;
    const day = this.#day;
    this.#titleEl.textContent = day ? `${day.date} 매매 상세` : "매매 상세";
    this.#empty.hidden = Boolean(day);
    this.#content.hidden = !day;
    if (!day) return;

    const b = this.#brokerage;
    const commission = Math.round((day.buyAmount + day.sellAmount) * b.commission);
    const tax = Math.round(day.sellAmount * TRANSACTION_TAX);
    const feeTotal = commission + tax;
    const netProfit = day.profit - feeTotal;
    const turnover = day.buyAmount + day.sellAmount;

    this.#setTile("realizedPL", fmtSigned(day.profit), "", signColor(day.profit));
    this.#setTile("realizedPct", fmtSignedPct(day.pct), "", signColor(day.profit));
    this.#setTile("turnover", groupDigits(turnover), "원", "");
    this.#setTile("netPL", fmtSigned(Math.round(netProfit)), "", signColor(netProfit));

    this.#setTile("sell", groupDigits(day.sellAmount), "원", "");
    this.#setTile("buy", groupDigits(day.buyAmount), "원", "");
    // v2 Stat의 muted 프롭은 색에 영향이 없었다(양 분기 모두 text) — 기본 전경색 유지
    this.#tiles.commission!.label.textContent = `수수료 (${b.name.split(" ")[0]})`;
    this.#setTile("commission", groupDigits(commission), "원", "");
    this.#setTile("tax", groupDigits(tax), "원", "");

    this.#renderTrades(this.#synthesizeTrades(day));
  }

  #setTile(key: string, value: string, unit: string, color: string): void {
    const t = this.#tiles[key];
    if (!t) return;
    t.num.textContent = value;
    t.unit.textContent = unit;
    t.unit.hidden = !unit;
    const valueEl = t.num.parentElement;
    if (valueEl) valueEl.style.color = color;
  }

  #renderTrades(trades: DayTrade[]): void {
    const doc = this.ownerDocument;
    this.#tbody.replaceChildren(
      ...trades.map((t) => {
        const tr = doc.createElement("tr");
        const name = doc.createElement("th");
        name.scope = "row";
        name.className = "jd-pddm__td-name";
        name.textContent = t.name;
        tr.append(name);

        const sideTd = doc.createElement("td");
        const badge = doc.createElement("span");
        badge.className = "jd-pddm__side";
        badge.dataset.side = t.side === "매도" ? "sell" : "buy";
        badge.textContent = t.side;
        sideTd.append(badge);
        tr.append(sideTd);

        tr.append(
          this.#numCell(groupDigits(t.qty)),
          this.#numCell(groupDigits(t.price)),
          this.#numCell(groupDigits(t.amount), "jd-pddm__td-amount"),
          this.#numCell(groupDigits(t.fee), "jd-pddm__td-fee"),
        );
        const pl = doc.createElement("td");
        pl.className = "jd-pddm__td-pl";
        pl.dataset.align = "right";
        pl.textContent = t.pl === 0 ? "—" : fmtSigned(t.pl);
        pl.style.color = t.pl === 0 ? "var(--jd-color-muted)" : signColor(t.pl);
        tr.append(pl);
        return tr;
      }),
    );
  }

  #numCell(text: string, extra?: string): HTMLTableCellElement {
    const td = this.ownerDocument.createElement("td");
    td.className = extra ? `jd-pddm__num ${extra}` : "jd-pddm__num";
    td.dataset.align = "right";
    td.textContent = text;
    return td;
  }

  /* ── 체결 합성 (v2 synthesizeTrades 포팅, date 시드 결정적) ── */

  #synthesizeTrades(day: JdPortfolioDay): DayTrade[] {
    const seedNum = parseInt(day.date.replace(/\D/g, ""), 10) || 1;
    const rng = mulberry32(seedNum);
    const items: DayTrade[] = [];

    if (day.sellAmount > 0 && day.sellQty > 0) {
      for (const s of splitInto(day.sellAmount, day.sellQty, day.profit, rng, 2)) {
        const name = STOCK_POOL[Math.floor(rng() * STOCK_POOL.length)]!;
        items.push({
          name,
          side: "매도",
          qty: s.qty,
          price: s.qty === 0 ? 0 : Math.round(s.amount / s.qty),
          amount: s.amount,
          fee: Math.round(s.amount * 0.00015),
          pl: s.pl,
        });
      }
    }
    if (day.buyAmount > 0 && day.buyQty > 0) {
      for (const s of splitInto(day.buyAmount, day.buyQty, 0, rng, 2)) {
        const name = STOCK_POOL[Math.floor(rng() * STOCK_POOL.length)]!;
        items.push({
          name,
          side: "매수",
          qty: s.qty,
          price: s.qty === 0 ? 0 : Math.round(s.amount / s.qty),
          amount: s.amount,
          fee: Math.round(s.amount * 0.00015),
          pl: 0,
        });
      }
    }
    return items;
  }
}

function splitInto(
  amount: number,
  qty: number,
  pl: number,
  rng: () => number,
  pieces: number,
): { amount: number; qty: number; pl: number }[] {
  const result: { amount: number; qty: number; pl: number }[] = [];
  let remainingAmount = amount;
  let remainingQty = qty;
  let remainingPl = pl;
  for (let i = 0; i < pieces - 1; i++) {
    const ratio = 0.35 + rng() * 0.3;
    const a = Math.round(remainingAmount * ratio);
    const q = Math.max(1, Math.round(remainingQty * ratio));
    const p = Math.round(remainingPl * ratio);
    result.push({ amount: a, qty: q, pl: p });
    remainingAmount -= a;
    remainingQty -= q;
    remainingPl -= p;
  }
  result.push({
    amount: Math.max(0, remainingAmount),
    qty: Math.max(0, remainingQty),
    pl: remainingPl,
  });
  return result;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
