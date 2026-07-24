/**
 * <jd-my-position-panel> — 종목 상세의 "내 포지션" 패널 (v2 finance/MyPositionPanel).
 *
 * v2는 useHoldings/useLivePrice/useDsToast/HoldingFormModal 훅에 묶여 있었다. DS 컴포넌트는
 * **데이터 계층을 앱에 남기고 표시 전용**으로 둔다: 앱이 name/qty/avgCost/price를 싣는다.
 * qty>0이면 포지션 카드, 아니면 "보유 등록" 유도(빈 상태). 두 골격을 한 번 짓고 hidden
 * 토글로 전환한다(§3.3 멱등). "보유 등록"은 모달 대신 `jd-register` 통지(§1.5) —
 * 등록 UI는 앱 몫(v2 동형: 상태는 앱이 소유).
 *
 * v2 대비 교정: toLocaleString("ko-KR")은 실행 로케일에 따라 결과가 갈려 프리렌더/방문자
 * 렌더가 어긋난다(§3.1-3). 자체 groupDigits로 결정적 천단위 구분.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import myPositionPanelStyles from "./my-position-panel.css.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const ICON = {
  wallet:
    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
};

function iconSvg(paths: string, size: number, strokeWidth = 2): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "jd-my-position-panel__icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", String(strokeWidth));
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

/** 결정적 천단위 구분 (toLocaleString 대체, §3.1-3) */
function group(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const neg = n < 0;
  const [int = "0", frac] = Math.abs(Math.round(n * 100) / 100).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

function fmtSigned(n: number): string {
  return n > 0 ? `+${group(n)}` : group(n);
}

function fmtSignedPct(pct: number): string {
  return `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

interface CellRef {
  label: HTMLElement;
  value: HTMLElement;
  unit: HTMLElement;
}

export class JdMyPositionPanel extends JdElement {
  static override tag = "jd-my-position-panel";
  static override props = {
    /** 종목명 */
    name: { type: String, default: "" },
    /** 보유 수량 — 0/미지정이면 빈 상태 */
    qty: { type: Number, default: 0 },
    /** 평균 단가 */
    avgCost: { type: Number, default: 0, attribute: "avg-cost" },
    /** 현재가 */
    price: { type: Number, default: 0 },
    /** "전체" 링크 목적지 */
    holdingsHref: { type: String, default: "", attribute: "holdings-href" },
  };

  declare name: string;
  declare qty: number;
  declare avgCost: number;
  declare price: number;
  declare holdingsHref: string;

  #holding!: HTMLElement;
  #empty!: HTMLElement;
  #tag!: HTMLElement;
  #cells: CellRef[] = [];
  #profitVal!: HTMLElement;
  #costVal!: HTMLElement;
  #allLink!: HTMLAnchorElement;

  protected render(): void {
    adoptStyles(myPositionPanelStyles);
    if (this.querySelector(":scope > .jd-my-position-panel__holding")) this.#adopt();
    else this.#build();
    this.update();
  }

  #adopt(): void {
    this.#holding = this.querySelector(":scope > .jd-my-position-panel__holding")!;
    this.#empty = this.querySelector(":scope > .jd-my-position-panel__empty")!;
    this.#tag = this.#holding.querySelector(".jd-my-position-panel__tag")!;
    this.#cells = Array.from(
      this.#holding.querySelectorAll<HTMLElement>(".jd-my-position-panel__cell"),
    ).map((cell) => ({
      label: cell.querySelector(".jd-my-position-panel__cell-label")!,
      value: cell.querySelector(".jd-my-position-panel__cell-value")!,
      unit: cell.querySelector(".jd-my-position-panel__cell-unit")!,
    }));
    this.#profitVal = this.#holding.querySelector(".jd-my-position-panel__profit-value")!;
    this.#costVal = this.#holding.querySelector(".jd-my-position-panel__cost-value")!;
    this.#allLink = this.#empty.querySelector(".jd-my-position-panel__all")!;
  }

  #build(): void {
    this.#holding = this.#buildHolding();
    this.#empty = this.#buildEmpty();
    this.append(this.#holding, this.#empty);
  }

  #buildHolding(): HTMLElement {
    const section = document.createElement("section");
    section.className = "jd-my-position-panel__holding";

    const header = document.createElement("header");
    header.className = "jd-my-position-panel__header";
    const titleWrap = document.createElement("div");
    titleWrap.className = "jd-my-position-panel__titlewrap";
    titleWrap.append(iconSvg(ICON.wallet, 16, 2.2));
    const heading = document.createElement("h2");
    heading.className = "jd-my-position-panel__heading";
    heading.textContent = "내 포지션";
    titleWrap.append(heading);
    this.#tag = document.createElement("span");
    this.#tag.className = "jd-my-position-panel__tag";
    header.append(titleWrap, this.#tag);

    const grid = document.createElement("div");
    grid.className = "jd-my-position-panel__grid";
    const labels = ["보유 수량", "평균 단가", "현재가", "평가금액"];
    this.#cells = labels.map((label) => {
      const cell = document.createElement("div");
      cell.className = "jd-my-position-panel__cell";
      const l = document.createElement("div");
      l.className = "jd-my-position-panel__cell-label";
      l.textContent = label;
      const v = document.createElement("div");
      v.className = "jd-my-position-panel__cell-value";
      const val = document.createElement("span");
      val.className = "jd-my-position-panel__cell-num";
      const unit = document.createElement("span");
      unit.className = "jd-my-position-panel__cell-unit";
      v.append(val, unit);
      cell.append(l, v);
      grid.append(cell);
      return { label: l, value: val, unit };
    });

    const footer = document.createElement("div");
    footer.className = "jd-my-position-panel__footer";
    const left = document.createElement("div");
    const leftLabel = document.createElement("div");
    leftLabel.className = "jd-my-position-panel__foot-label";
    leftLabel.textContent = "평가손익";
    this.#profitVal = document.createElement("div");
    this.#profitVal.className = "jd-my-position-panel__profit-value";
    left.append(leftLabel, this.#profitVal);
    const right = document.createElement("div");
    right.className = "jd-my-position-panel__foot-right";
    const rightLabel = document.createElement("div");
    rightLabel.className = "jd-my-position-panel__foot-label";
    rightLabel.textContent = "매입금액";
    this.#costVal = document.createElement("div");
    this.#costVal.className = "jd-my-position-panel__cost-value";
    right.append(rightLabel, this.#costVal);
    footer.append(left, right);

    section.append(header, grid, footer);
    return section;
  }

  #buildEmpty(): HTMLElement {
    const section = document.createElement("section");
    section.className = "jd-my-position-panel__empty";
    section.append(iconSvg(ICON.wallet, 16, 2));

    const text = document.createElement("div");
    text.className = "jd-my-position-panel__empty-text";
    const title = document.createElement("span");
    title.className = "jd-my-position-panel__empty-title";
    title.textContent = "보유 중이지 않은 종목입니다.";
    const sub = document.createElement("span");
    sub.className = "jd-my-position-panel__empty-sub";
    sub.textContent = "지금 가격으로 보유 등록하거나 가격 알림을 설정해 보세요.";
    text.append(title, sub);

    const register = document.createElement("button");
    register.type = "button";
    register.className = "jd-my-position-panel__register";
    register.append(iconSvg(ICON.plus, 12, 2.6));
    const regLabel = document.createElement("span");
    regLabel.textContent = "보유 등록";
    register.append(regLabel);
    register.addEventListener("click", () => this.emit("jd-register", { name: this.name }));

    this.#allLink = document.createElement("a");
    this.#allLink.className = "jd-my-position-panel__all";
    const allLabel = document.createElement("span");
    allLabel.textContent = "전체";
    this.#allLink.append(allLabel, iconSvg(ICON.chevron, 12, 2.5));

    section.append(text, register, this.#allLink);
    return section;
  }

  protected override update(): void {
    const held = this.#num(this.qty) > 0;
    this.#holding.hidden = !held;
    this.#empty.hidden = held;

    if (!held) {
      this.#allLink.href = this.holdingsHref || "#";
      return;
    }

    const qty = this.#num(this.qty);
    const avgCost = this.#num(this.avgCost);
    const price = this.#num(this.price);
    const market = price * qty;
    const cost = avgCost * qty;
    const profit = market - cost;
    const pct = cost === 0 ? 0 : (profit / cost) * 100;
    const dir = profit >= 0 ? "up" : "down";

    // 손익 태그
    this.#tag.dataset.dir = dir;
    this.#tag.textContent = `${profit >= 0 ? "수익" : "손실"} ${fmtSignedPct(pct)}`;

    // 4셀
    this.#setCell(0, group(qty), "주");
    this.#setCell(1, group(avgCost), "원");
    this.#setCell(2, group(price), "원", price >= avgCost ? "up" : "down");
    this.#setCell(3, group(Math.round(market)), "원");

    // 푸터
    this.#profitVal.dataset.dir = dir;
    this.#profitVal.textContent = fmtSigned(Math.round(profit));
    this.#costVal.textContent = group(Math.round(cost));
  }

  #setCell(i: number, value: string, unit: string, tone = ""): void {
    const cell = this.#cells[i];
    if (!cell) return;
    cell.value.textContent = value;
    cell.value.parentElement!.dataset.tone = tone;
    cell.unit.textContent = unit;
  }

  #num(v: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
}
