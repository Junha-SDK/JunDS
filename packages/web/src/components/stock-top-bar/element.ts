/**
 * <jd-stock-top-bar> — 종목 상세 상단 헤더 (v2 finance/StockTopBar).
 *
 * v2는 useRouter·useLivePrice·findStock을 안에서 호출해 라우팅과 실시간 시세를 직접
 * 끌어왔다. DS 컴포넌트로는 그 결합을 걷어낸다(§6.3 finance):
 *  - 시세(price/diff/pct/amount)·표시명·섹터는 **프로퍼티로 받는다**. tick 우선 로직은
 *    소비자(finance-data) 몫이고, 여기는 넘어온 값을 그릴 뿐이다.
 *  - 뒤로가기는 `jd-back`, 탭 전환은 `jd-tab-change`로 알린다(router 결합 제거). 탭은
 *    `<a href>`라 JS 없이도 이동 가능.
 *  - 별(관심종목)·알림은 <jd-star-button>·<jd-alert-button>을 합성한다(index에서 등록).
 *    두 자식의 jd-change/jd-open/jd-limit는 그대로 버블한다.
 *  - 추가 액션(NXT 세션 알약 등)은 light DOM `slot="trailing"`으로 받는다(v2 trailing).
 *
 * 색은 인라인 분기 대신 `data-trend`(up/down) 속성 + CSS로 흐른다(§3.1 결정적 렌더).
 * 탭은 property/JSON 슬롯 리스트, 기본값은 v2의 8종.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import stockTopBarStyles from "./stock-top-bar.css.js";

export interface JdStockTab {
  /** 활성 식별자 — active 프로퍼티·jd-tab-change detail과 대응 */
  key: string;
  label: string;
  /** href 접미 (예: "/chart"). href를 직접 주면 그것이 우선 */
  suffix?: string;
  href?: string;
}

const DEFAULT_TABS: JdStockTab[] = [
  { key: "info", label: "정보", suffix: "" },
  { key: "chart", label: "차트", suffix: "/chart" },
  { key: "order", label: "호가", suffix: "/order" },
  { key: "financials", label: "재무", suffix: "/financials" },
  { key: "valuation", label: "밸류에이션", suffix: "/valuation" },
  { key: "analytics", label: "분석", suffix: "/analytics" },
  { key: "disclosures", label: "공시", suffix: "/disclosures" },
  { key: "investor", label: "AI 위원회", suffix: "/investor" },
];

const KRW = new Intl.NumberFormat("ko-KR");

/** v2 fmtKR억 근사: 1만억 이상은 조, 그 미만은 억 */
function fmtAmount(amount: number): string {
  if (!(amount > 0)) return "";
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}조`;
  return `${KRW.format(Math.round(amount))}억`;
}

export class JdStockTopBar extends JdElement {
  static override tag = "jd-stock-top-bar";
  static override props = {
    /** 라우트 심볼 — 탭 href 구성 + 별 name 폴백 */
    symbol: { type: String },
    /** 헤더에 표시할 종목명 (v2 displayName) */
    displayName: { type: String },
    sector: { type: String },
    price: { type: Number, default: 0 },
    /** 변동 금액(절대값 표시). 미지정 시 price·pct로 추정 */
    diff: { type: Number },
    /** 등락률(%) */
    pct: { type: Number, default: 0 },
    /** 거래대금(억) */
    amount: { type: Number, default: 0 },
    /** 활성 탭 key */
    active: { type: String, reflect: true },
    /** 이 종목의 관심종목 등록 여부 */
    starActive: { type: Boolean },
    /** 이 종목의 활성 알림 수 (jd-alert-button count) */
    alertCount: { type: Number, default: 0 },
    /** sticky top 오프셋(px) — v2 --bm-topbar-h 기본 53 */
    topOffset: { type: Number, default: 53 },
  };

  declare symbol: string;
  declare displayName: string;
  declare sector: string;
  declare price: number;
  declare diff: number;
  declare pct: number;
  declare amount: number;
  declare active: string;
  declare starActive: boolean;
  declare alertCount: number;
  declare topOffset: number;

  #tabs: JdStockTab[] = DEFAULT_TABS;
  #builtTabs: readonly JdStockTab[] | null = null;
  #tabRefs: { a: HTMLAnchorElement; tab: JdStockTab }[] = [];

  // 골격 참조
  #tabsNav!: HTMLElement;
  #star!: HTMLElement;
  #alert!: HTMLElement;
  #name!: HTMLElement;
  #sector!: HTMLElement;
  #amountEl!: HTMLElement;
  #priceBlock!: HTMLElement;
  #price!: HTMLElement;
  #diffIcon!: HTMLElement;
  #diffVal!: HTMLElement;
  #pct!: HTMLElement;

  get tabs(): JdStockTab[] {
    return this.#tabs;
  }
  set tabs(v: JdStockTab[]) {
    this.#tabs = Array.isArray(v) && v.length ? v : DEFAULT_TABS;
    this.#builtTabs = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(stockTopBarStyles);
    this.#upgradeOwn("tabs");
    this.#readJsonSlot();
    this.#build();
    this.#syncTabs();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdStockTab[];
      if (Array.isArray(parsed) && parsed.length) this.#tabs = parsed;
    } catch {
      console.warn("[junds] <jd-stock-top-bar> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const existing = this.querySelector<HTMLElement>(":scope > .jd-stock-top-bar__inner");
    if (existing) {
      this.#adoptRefs(existing);
      return;
    }
    // trailing 슬롯 children을 미리 걷어둔다
    const trailingNodes = Array.from(this.children).filter(
      (c) => c.getAttribute("slot") === "trailing",
    );

    const inner = el("div", "jd-stock-top-bar__inner");
    const row = el("div", "jd-stock-top-bar__row");

    const back = document.createElement("button");
    back.type = "button";
    back.className = "jd-stock-top-bar__back";
    back.setAttribute("aria-label", "뒤로");
    back.append(appIcon("chevronLeft", "20", "2.4"));

    const titleWrap = el("div", "jd-stock-top-bar__title-wrap");
    this.#star = document.createElement("jd-star-button");
    this.#star.className = "jd-stock-top-bar__star";
    const names = el("div", "jd-stock-top-bar__names");
    const nameRow = el("div", "jd-stock-top-bar__name-row");
    this.#name = document.createElement("h1");
    this.#name.className = "jd-stock-top-bar__name";
    this.#sector = el("span", "jd-stock-top-bar__sector");
    nameRow.append(this.#name, this.#sector);
    this.#amountEl = el("div", "jd-stock-top-bar__amount");
    names.append(nameRow, this.#amountEl);
    titleWrap.append(this.#star, names);

    const priceWrap = el("div", "jd-stock-top-bar__price-wrap");
    this.#priceBlock = el("div", "jd-stock-top-bar__price-block");
    this.#price = el("span", "jd-stock-top-bar__price");
    const change = el("div", "jd-stock-top-bar__change");
    this.#diffVal = el("span", "jd-stock-top-bar__diff");
    this.#diffIcon = appIcon("trendingUp", "11", "2.4");
    this.#diffVal.prepend(this.#diffIcon);
    this.#pct = el("span", "jd-stock-top-bar__pct");
    change.append(this.#diffVal, this.#pct);
    this.#priceBlock.append(this.#price, change);

    this.#alert = document.createElement("jd-alert-button");
    this.#alert.className = "jd-stock-top-bar__alert";

    const trailing = el("div", "jd-stock-top-bar__trailing");
    trailing.append(...trailingNodes);
    trailing.hidden = trailingNodes.length === 0;

    priceWrap.append(this.#priceBlock, this.#alert, trailing);
    row.append(back, titleWrap, priceWrap);

    this.#tabsNav = document.createElement("nav");
    this.#tabsNav.className = "jd-stock-top-bar__tabs";
    this.#tabsNav.setAttribute("aria-label", "종목 메뉴");

    inner.append(row, this.#tabsNav);
    this.append(inner);
  }

  #adoptRefs(inner: HTMLElement): void {
    this.#tabsNav = inner.querySelector(".jd-stock-top-bar__tabs")!;
    this.#star = inner.querySelector(".jd-stock-top-bar__star")!;
    this.#alert = inner.querySelector(".jd-stock-top-bar__alert")!;
    this.#name = inner.querySelector(".jd-stock-top-bar__name")!;
    this.#sector = inner.querySelector(".jd-stock-top-bar__sector")!;
    this.#amountEl = inner.querySelector(".jd-stock-top-bar__amount")!;
    this.#priceBlock = inner.querySelector(".jd-stock-top-bar__price-block")!;
    this.#price = inner.querySelector(".jd-stock-top-bar__price")!;
    this.#diffVal = inner.querySelector(".jd-stock-top-bar__diff")!;
    this.#diffIcon = inner.querySelector(".jd-stock-top-bar__diff jd-app-icon")!;
    this.#pct = inner.querySelector(".jd-stock-top-bar__pct")!;
  }

  /** 탭 앵커 재구축 — 개수가 같으면 내용만 맞춘다(tabs 선례) */
  #syncTabs(): void {
    this.#builtTabs = this.#tabs;
    this.#tabRefs = [];
    let anchors = Array.from(
      this.#tabsNav.querySelectorAll<HTMLAnchorElement>(":scope > a.jd-stock-top-bar__tab"),
    );
    if (anchors.length !== this.#tabs.length) {
      for (const a of anchors) a.remove();
      anchors = this.#tabs.map(() => {
        const a = document.createElement("a");
        a.className = "jd-stock-top-bar__tab";
        this.#tabsNav.append(a);
        return a;
      });
    }
    anchors.forEach((a, i) => {
      const tab = this.#tabs[i];
      if (!tab) return;
      a.textContent = tab.label;
      a.dataset.key = tab.key;
      this.#tabRefs.push({ a, tab });
    });
  }

  protected override update(): void {
    if (this.#builtTabs !== this.#tabs) this.#syncTabs();

    const up = this.pct >= 0;
    this.#priceBlock.setAttribute("data-trend", up ? "up" : "down");

    // 종목명 / 섹터 / 거래대금
    this.#name.textContent = this.displayName || this.symbol || "";
    const hasSector = Boolean(this.sector);
    this.#sector.textContent = this.sector || "";
    this.#sector.hidden = !hasSector;
    const amountText = fmtAmount(this.amount);
    this.#amountEl.textContent = amountText ? `거래대금 ${amountText}` : "";
    this.#amountEl.hidden = !amountText;

    // 시세
    this.#price.textContent = KRW.format(Math.round(this.price));
    const diffAbs = Math.abs(Math.round(this.#resolvedDiff()));
    this.#setDiffText(diffAbs);
    this.#diffIcon.setAttribute("name", up ? "trendingUp" : "trendingDown");
    this.#pct.textContent = `${up ? "+" : ""}${this.pct.toFixed(2)}%`;

    // 자식 컴포넌트 — 속성으로 전달(업그레이드 전에도 안전)
    this.#star.setAttribute("size", "18");
    if (this.symbol) this.#star.setAttribute("name", this.symbol);
    this.#star.toggleAttribute("active", this.starActive);
    this.#alert.setAttribute("count", String(Math.max(0, Math.trunc(this.alertCount))));

    this.style.setProperty("--jd-stock-top-bar-top", `${this.topOffset}px`);

    // 탭 href + 활성
    for (const { a, tab } of this.#tabRefs) {
      a.href = tab.href ?? `/stock/${this.symbol ?? ""}${tab.suffix ?? ""}`;
      const isActive = tab.key === this.active;
      a.toggleAttribute("data-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /** diff 텍스트만 교체(아이콘 노드는 보존) */
  #setDiffText(diffAbs: number): void {
    let text = this.#diffVal.querySelector<HTMLElement>(":scope > .jd-stock-top-bar__diff-num");
    if (!text) {
      text = document.createElement("span");
      text.className = "jd-stock-top-bar__diff-num";
      this.#diffVal.append(text);
    }
    text.textContent = KRW.format(diffAbs);
  }

  /** v2: diff 미지정 시 price·pct로 추정 */
  #resolvedDiff(): number {
    if (Number.isFinite(this.diff) && this.diff !== 0) return this.diff;
    const pct = this.pct;
    return Math.round((this.price * pct) / Math.max(100 + pct, 1));
  }

  #onClick = (e: Event): void => {
    const target = e.target as Element | null;
    if (target?.closest(".jd-stock-top-bar__back")) {
      this.emit("jd-back");
      return;
    }
    const tab = target?.closest("a.jd-stock-top-bar__tab") as HTMLAnchorElement | null;
    if (tab && this.#tabsNav.contains(tab)) {
      this.emit("jd-tab-change", { value: tab.dataset.key ?? "" });
    }
  };
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function appIcon(name: string, size: string, strokeWidth: string): HTMLElement {
  const node = document.createElement("jd-app-icon");
  node.setAttribute("name", name);
  node.setAttribute("size", size);
  node.setAttribute("stroke-width", strokeWidth);
  return node;
}
