/**
 * <jd-holding-form-modal> — 보유 종목 추가/수정 폼 다이얼로그
 *   (v2 finance/HoldingFormModal) = **jd-modal 파생**(§6 R12).
 *
 * v2는 오버레이·ESC·백드롭 닫기를 손으로 다시 짰다(포커스 감금·스크롤 락은 없었다).
 * jd-modal을 상속해 포커스 트랩·요청형 닫기(jd-request-close)·스크롤 락·재연결 복원을
 * 공짜로 얻고, 파생은 **폼 골격과 자동완성**만 얹는다.
 *
 * v2는 종목 검색을 `./lib/stocks`(searchStocks/findStock)에 결합했다. v3는 표현
 * 컴포넌트로 분리 — 종목 목록은 `stocks` 프로퍼티로 받고 검색은 순수 필터다(§1.3).
 *
 * 이벤트: 유효 제출 시 `jd-submit` { name, qty, avgCost } 발행 후 닫는다.
 * v2 대비 개선: aria-labelledby로 제목이 다이얼로그 이름이 되고, 입력마다 label[for]가 붙는다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits, upgradeAccessor } from "../../core/chart.js";
import { jdUid } from "../../core/uid.js";
import holdingFormModalStyles from "./holding-form-modal.css.js";

export interface JdHolding {
  name: string;
  qty: number;
  avgCost: number;
}

export interface JdStockOption {
  name: string;
  sector?: string;
  price?: number;
}

const CLOSE_SVG =
  `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">` +
  `<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SUGGEST_LIMIT = 6;

export class JdHoldingFormModal extends JdModal {
  static override tag = "jd-holding-form-modal";
  static override props = {
    ...JdModal.props,
    /** 제목. 비우면 편집 모드에 따라 자동(추가/수정) */
    heading: { type: String },
    /** 제출 버튼 라벨. 비우면 자동(추가/저장) */
    submitLabel: { type: String, attribute: "submit-label" },
    /** 종목명을 이 값으로 고정(종목 페이지에서 추가할 때) */
    presetName: { type: String, attribute: "preset-name" },
  };

  declare heading: string;
  declare submitLabel: string;
  declare presetName: string;

  #initial: JdHolding | null = null;
  #stocks: JdStockOption[] = [];

  // 내부 폼 상태 (프롭 아님)
  #nameSel = "";
  #query = "";
  #qty = "";
  #avgCost = "";
  #showSuggest = false;
  #prevOpen = false;

  // DOM refs
  #titleEl!: HTMLHeadingElement;
  #queryInput!: HTMLInputElement;
  #suggestEl!: HTMLUListElement;
  #selectedNote!: HTMLElement;
  #qtyInput!: HTMLInputElement;
  #avgInput!: HTMLInputElement;
  #fillBtn!: HTMLButtonElement;
  #summary!: HTMLElement;
  #summaryVal!: HTMLElement;
  #submitBtn!: HTMLButtonElement;
  #headingId = "";

  /** 편집 초기값. 주면 name 잠금 + 수정 모드 */
  get initial(): JdHolding | null {
    return this.#initial;
  }
  set initial(v: JdHolding | null) {
    this.#initial = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  /** 자동완성 종목 목록 */
  get stocks(): JdStockOption[] {
    return this.#stocks;
  }
  set stocks(v: JdStockOption[]) {
    this.#stocks = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get #locked(): boolean {
    return Boolean(this.#initial || this.presetName);
  }
  get #lockedName(): string {
    return this.#initial?.name ?? this.presetName ?? "";
  }

  protected override render(): void {
    // 정의 이전에 대입된 데이터 프로퍼티 회수(§1.3 표준 CE 함정)
    upgradeAccessor(this, "initial");
    upgradeAccessor(this, "stocks");
    super.render(); // 백드롭 + 패널 구축
    adoptStyles(holdingFormModalStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;

    // 입양(§3.3): 이미 구축된 폼이 있으면 재사용
    const built = panel.querySelector<HTMLElement>(".jd-hfm__body");
    if (built) {
      this.#bindRefs(panel);
    } else {
      this.#buildForm(panel);
    }
    this.update();
  }

  #buildForm(panel: HTMLElement): void {
    this.#headingId = jdUid("jd-hfm-title");

    const header = document.createElement("header");
    header.className = "jd-hfm__header";
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-hfm__title";
    this.#titleEl.id = this.#headingId;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "jd-hfm__close";
    close.setAttribute("aria-label", "닫기");
    close.innerHTML = CLOSE_SVG;
    close.addEventListener("click", () => this.close());
    header.append(this.#titleEl, close);

    const body = document.createElement("div");
    body.className = "jd-hfm__body";

    // 종목 필드
    const nameField = document.createElement("div");
    nameField.className = "jd-hfm__field jd-hfm__field--name";
    const nameLabel = document.createElement("label");
    nameLabel.className = "jd-hfm__label";
    nameLabel.textContent = "종목";
    const queryId = jdUid("jd-hfm-q");
    nameLabel.htmlFor = queryId;
    this.#queryInput = document.createElement("input");
    this.#queryInput.type = "text";
    this.#queryInput.id = queryId;
    this.#queryInput.className = "jd-hfm__input";
    this.#queryInput.placeholder = "종목명 입력 (예: 삼성전자)";
    this.#queryInput.autocomplete = "off";
    this.#queryInput.setAttribute("role", "combobox");
    this.#queryInput.setAttribute("aria-expanded", "false");
    this.#queryInput.setAttribute("aria-autocomplete", "list");
    this.#queryInput.addEventListener("input", this.#onQueryInput);
    this.#queryInput.addEventListener("focus", () => {
      this.#showSuggest = true;
      this.#refresh();
    });
    this.#queryInput.addEventListener("blur", () => {
      // 제안 클릭(mousedown)이 먼저 처리되도록 지연
      window.setTimeout(() => {
        this.#showSuggest = false;
        this.#refresh();
      }, 120);
    });
    this.#suggestEl = document.createElement("ul");
    this.#suggestEl.className = "jd-hfm__suggest";
    this.#suggestEl.hidden = true;
    this.#selectedNote = document.createElement("div");
    this.#selectedNote.className = "jd-hfm__selected";
    this.#selectedNote.hidden = true;
    nameField.append(nameLabel, this.#queryInput, this.#suggestEl, this.#selectedNote);

    // 수량 / 평균단가
    const grid = document.createElement("div");
    grid.className = "jd-hfm__grid";

    const qtyField = document.createElement("div");
    qtyField.className = "jd-hfm__field";
    const qtyLabel = document.createElement("label");
    qtyLabel.className = "jd-hfm__label";
    qtyLabel.textContent = "수량 (주)";
    const qtyId = jdUid("jd-hfm-qty");
    qtyLabel.htmlFor = qtyId;
    this.#qtyInput = this.#numInput(qtyId, "0");
    this.#qtyInput.addEventListener("input", () => {
      this.#qty = this.#qtyInput.value;
      this.#refresh();
    });
    qtyField.append(qtyLabel, this.#qtyInput);

    const avgField = document.createElement("div");
    avgField.className = "jd-hfm__field";
    const avgLabelRow = document.createElement("label");
    avgLabelRow.className = "jd-hfm__label jd-hfm__label--row";
    const avgId = jdUid("jd-hfm-avg");
    avgLabelRow.htmlFor = avgId;
    const avgText = document.createElement("span");
    avgText.textContent = "평균 단가 (원)";
    this.#fillBtn = document.createElement("button");
    this.#fillBtn.type = "button";
    this.#fillBtn.className = "jd-hfm__fill";
    this.#fillBtn.textContent = "현재가로 채우기";
    this.#fillBtn.hidden = true;
    this.#fillBtn.addEventListener("click", () => this.#applyMarketPrice());
    avgLabelRow.append(avgText, this.#fillBtn);
    this.#avgInput = this.#numInput(avgId, "0");
    this.#avgInput.addEventListener("input", () => {
      this.#avgCost = this.#avgInput.value;
      this.#refresh();
    });
    avgField.append(avgLabelRow, this.#avgInput);

    grid.append(qtyField, avgField);

    // 매입금액 요약
    this.#summary = document.createElement("div");
    this.#summary.className = "jd-hfm__summary";
    this.#summary.hidden = true;
    const sumLabel = document.createElement("span");
    sumLabel.className = "jd-hfm__summary-label";
    sumLabel.textContent = "매입금액";
    this.#summaryVal = document.createElement("span");
    this.#summaryVal.className = "jd-hfm__summary-value";
    this.#summary.append(sumLabel, this.#summaryVal);

    body.append(nameField, grid, this.#summary);

    // 푸터
    const footer = document.createElement("footer");
    footer.className = "jd-hfm__footer";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "jd-hfm__btn jd-hfm__btn--cancel";
    cancel.textContent = "취소";
    cancel.addEventListener("click", () => this.close());
    this.#submitBtn = document.createElement("button");
    this.#submitBtn.type = "button";
    this.#submitBtn.className = "jd-hfm__btn jd-hfm__btn--submit";
    this.#submitBtn.addEventListener("click", () => this.#submit());
    footer.append(cancel, this.#submitBtn);

    panel.append(header, body, footer);
    panel.setAttribute("aria-labelledby", this.#headingId);
  }

  #bindRefs(panel: HTMLElement): void {
    this.#titleEl = panel.querySelector(".jd-hfm__title")!;
    this.#headingId = this.#titleEl.id;
    this.#queryInput = panel.querySelector(".jd-hfm__input")!;
    this.#suggestEl = panel.querySelector(".jd-hfm__suggest")!;
    this.#selectedNote = panel.querySelector(".jd-hfm__selected")!;
    const nums = panel.querySelectorAll<HTMLInputElement>(".jd-hfm__num");
    this.#qtyInput = nums[0]!;
    this.#avgInput = nums[1]!;
    this.#fillBtn = panel.querySelector(".jd-hfm__fill")!;
    this.#summary = panel.querySelector(".jd-hfm__summary")!;
    this.#summaryVal = panel.querySelector(".jd-hfm__summary-value")!;
    this.#submitBtn = panel.querySelector(".jd-hfm__btn--submit")!;
  }

  #numInput(id: string, placeholder: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.inputMode = "numeric";
    input.min = "0";
    input.placeholder = placeholder;
    input.className = "jd-hfm__input jd-hfm__num";
    return input;
  }

  protected override update(): void {
    // 폼이 아직 없으면(super.render의 선행 update) 모달 전이만
    if (!this.#titleEl) {
      super.update();
      return;
    }
    // open이 막 켜졌으면 super.update()가 포커스트랩을 켜기 **전에** 필드를 초기화한다 —
    // data-autofocus가 세팅돼 있어야 trap.activate()의 initialFocus가 첫 필드를 잡는다.
    if (this.open && !this.#prevOpen) this.#resetFields();
    super.update(); // 모달 open 전이 (스크롤 락·포커스 트랩·jd-open)
    this.#prevOpen = this.open;
    this.#refresh();
  }

  #resetFields(): void {
    const locked = this.#locked;
    this.#nameSel = this.#lockedName;
    this.#query = this.#lockedName;
    this.#qty = this.#initial ? String(this.#initial.qty) : "";
    this.#avgCost = this.#initial ? String(this.#initial.avgCost) : "";
    this.#showSuggest = false;

    this.#queryInput.value = this.#query;
    this.#queryInput.disabled = locked;
    this.#queryInput.toggleAttribute("data-locked", locked);
    this.#qtyInput.value = this.#qty;
    this.#avgInput.value = this.#avgCost;

    // 초점 대상: 잠겨 있으면 수량, 아니면 종목
    this.#queryInput.toggleAttribute("data-autofocus", !locked);
    this.#qtyInput.toggleAttribute("data-autofocus", locked);
  }

  #onQueryInput = (): void => {
    this.#query = this.#queryInput.value;
    this.#nameSel = "";
    this.#showSuggest = true;
    this.#refresh();
  };

  /** 순수 검색 — 이름에 질의가 포함되는 종목 상위 N */
  #search(): JdStockOption[] {
    const q = this.#query.trim().toLowerCase();
    if (!q || this.#initial) return [];
    return this.#stocks.filter((s) => s.name.toLowerCase().includes(q)).slice(0, SUGGEST_LIMIT);
  }

  #findStock(name: string): JdStockOption | undefined {
    return this.#stocks.find((s) => s.name === name);
  }

  #applyMarketPrice(): void {
    const stock = this.#findStock(this.#nameSel);
    if (stock?.price) {
      this.#avgCost = String(stock.price);
      this.#avgInput.value = this.#avgCost;
      this.#refresh();
    }
  }

  #selectStock(s: JdStockOption): void {
    this.#nameSel = s.name;
    this.#query = s.name;
    this.#queryInput.value = s.name;
    if (s.price && !this.#avgCost) {
      this.#avgCost = String(s.price);
      this.#avgInput.value = this.#avgCost;
    }
    this.#showSuggest = false;
    this.#refresh();
  }

  /** 상태 → DOM 반영 (재구축 없음) */
  #refresh(): void {
    this.#titleEl.textContent =
      this.heading || (this.#initial ? "보유 종목 수정" : "보유 종목 추가");
    this.#submitBtn.textContent = this.submitLabel || (this.#initial ? "저장" : "추가");

    // 제안 목록
    const suggestions = this.#showSuggest && !this.#locked ? this.#search() : [];
    this.#renderSuggestions(suggestions);
    this.#queryInput.setAttribute("aria-expanded", suggestions.length > 0 ? "true" : "false");

    // 선택된 종목 노트
    const stock = this.#findStock(this.#nameSel);
    if (this.#nameSel && stock?.sector) {
      this.#selectedNote.hidden = false;
      this.#selectedNote.textContent = "";
      const lead = document.createTextNode("선택됨: ");
      const strong = document.createElement("strong");
      strong.textContent = this.#nameSel;
      const tail = document.createTextNode(` · ${stock.sector}`);
      this.#selectedNote.append(lead, strong, tail);
    } else {
      this.#selectedNote.hidden = true;
      this.#selectedNote.textContent = "";
    }

    // 현재가 채우기 버튼
    this.#fillBtn.hidden = !stock?.price;

    // 매입금액 요약 + 유효성
    const effectiveName = this.#nameSel || this.#query.trim();
    const qtyNum = Number(this.#qty);
    const costNum = Number(this.#avgCost);
    const bothPositive = qtyNum > 0 && costNum > 0;
    this.#summary.hidden = !bothPositive;
    if (bothPositive) {
      this.#summaryVal.textContent = `${groupDigits(Math.round(qtyNum * costNum))} 원`;
    }
    const valid = effectiveName.length > 0 && bothPositive;
    this.#submitBtn.disabled = !valid;
    this.#submitBtn.toggleAttribute("data-valid", valid);
  }

  #renderSuggestions(items: JdStockOption[]): void {
    const ul = this.#suggestEl;
    ul.hidden = items.length === 0;
    ul.textContent = "";
    for (const s of items) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-hfm__suggest-item";
      // mousedown에서 blur가 클릭을 삼키지 않도록 기본동작 차단
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => this.#selectStock(s));
      const left = document.createElement("span");
      left.className = "jd-hfm__suggest-left";
      const nm = document.createElement("span");
      nm.className = "jd-hfm__suggest-name";
      nm.textContent = s.name;
      left.append(nm);
      if (s.sector) {
        const sec = document.createElement("span");
        sec.className = "jd-hfm__suggest-sector";
        sec.textContent = `· ${s.sector}`;
        left.append(sec);
      }
      const price = document.createElement("span");
      price.className = "jd-hfm__suggest-price";
      price.textContent = s.price ? groupDigits(s.price) : "—";
      btn.append(left, price);
      li.append(btn);
      ul.append(li);
    }
  }

  #submit(): void {
    const effectiveName = this.#nameSel || this.#query.trim();
    const qtyNum = Number(this.#qty);
    const costNum = Number(this.#avgCost);
    if (!(effectiveName.length > 0 && qtyNum > 0 && costNum > 0)) return;
    const holding: JdHolding = { name: effectiveName, qty: qtyNum, avgCost: costNum };
    this.emit("jd-submit", holding);
    this.close();
  }
}
