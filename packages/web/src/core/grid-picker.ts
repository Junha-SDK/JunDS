/**
 * JdGridPicker — "페이지 이동 헤더 + 격자 버튼" 픽커의 공용 베이스 (§6 R12).
 *
 * v2 MonthPicker(122줄)와 YearPicker(96줄)는 헤더 기하·격자 기하·min/max 비활성·
 * 선택 표현·제어/비제어 전환이 **문자 단위로 같고** 다른 것은 셀이 무엇을 뜻하는가뿐이었다.
 * v3는 골격·상태·키보드를 여기 한 번만 두고, 두 픽커는 셀 의미만 채운다.
 * (Modal→Drawer/ActionSheet와 같은 계열이지만, 이쪽은 두 파생이 대등해서
 *  한쪽을 다른 쪽의 베이스로 삼지 않고 별도 추상 베이스로 뽑았다 — `jd-year-picker`에
 *  뜻 없는 `month` 프로퍼티가 상속되는 것을 피하기 위해서다.)
 *
 * v2 대비 접근성 보정 3건(두 픽커 공통):
 *  1. 격자 버튼 전부가 탭스톱이었다(12~n개) → 로빙 탭인덱스 1개 + 화살표 이동.
 *  2. 선택이 배경색뿐이었다 → aria-pressed.
 *  3. 셀 이름이 "3월"·"2026"뿐이라 헤더 연도 맥락이 빠졌다 → aria-label에 전체 맥락.
 */
import { JdElement } from "./element.js";
import { toDayStart } from "./date.js";

const CHEVRON_LEFT =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CHEVRON_RIGHT =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export abstract class JdGridPicker extends JdElement {
  static override props = {
    disabled: { type: Boolean, reflect: true },
  };

  declare disabled: boolean;

  /** 페이지 기준값 — MonthPicker는 보고 있는 연도, YearPicker는 페이지 첫 연도 */
  protected viewBase = 0;
  /** 뷰가 값 또는 오늘로 정해졌는지. 정해지기 전에는 헤더를 비워 둔다 */
  protected viewReady = false;
  /** connected() 이후에만 채워진다 (§3.1-3 — render는 시계를 읽지 않는다) */
  protected today: Date | null = null;

  protected labelEl!: HTMLElement;
  protected gridEl!: HTMLElement;

  #prev!: HTMLButtonElement;
  #next!: HTMLButtonElement;
  #renderedCount = -1;
  #focusIndex = -1;

  /* ── 파생이 채우는 셀 의미 ─────────────────────────────────── */
  protected abstract columns(): number;
  protected abstract cellCount(): number;
  protected abstract cellText(index: number): string;
  protected abstract cellAriaLabel(index: number): string;
  protected abstract cellSelected(index: number): boolean;
  protected abstract cellDisabled(index: number): boolean;
  protected abstract headerText(): string;
  protected abstract prevLabel(): string;
  protected abstract nextLabel(): string;
  /** 페이지 1칸 이동이 viewBase를 얼마나 움직이는지 */
  protected abstract pageDelta(): number;
  protected abstract selectIndex(index: number): void;
  /** connected()에서 1회 — 시계를 받아 기본 선택값·뷰를 정한다 */
  protected abstract resolveDefaults(today: Date): void;
  /** 값에서 뷰를 유도 — 시계 없이 가능하면 viewReady를 세운다 */
  protected abstract syncViewFromValue(): void;
  /** 접근 이름 (호스트 role=group) */
  protected abstract groupLabel(): string;

  protected render(): void {
    // 입양 규칙(§3.3)
    const existingGrid = this.querySelector<HTMLElement>(":scope > .jd-grid-picker__grid");
    if (existingGrid) {
      this.gridEl = existingGrid;
      this.labelEl = this.querySelector<HTMLElement>(".jd-grid-picker__label")!;
      this.#prev = this.querySelector<HTMLButtonElement>('[data-nav="prev"]')!;
      this.#next = this.querySelector<HTMLButtonElement>('[data-nav="next"]')!;
      this.#renderedCount = this.gridEl.childElementCount;
    } else {
      this.#build();
    }
    this.setAttribute("data-jd-grid-picker", "");
    this.setAttribute("role", "group");
    // 소비자가 직접 붙인 이름이 있으면 존중한다
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", this.groupLabel());
    this.#prev.addEventListener("click", () => this.step(-1));
    this.#next.addEventListener("click", () => this.step(1));
    this.gridEl.addEventListener("click", this.#onGridClick);
    this.gridEl.addEventListener("keydown", this.#onGridKeydown);
    this.syncViewFromValue();
    this.update();
  }

  #build(): void {
    const header = document.createElement("div");
    header.className = "jd-grid-picker__header";
    this.#prev = document.createElement("button");
    this.#prev.type = "button";
    this.#prev.className = "jd-grid-picker__nav";
    this.#prev.dataset.nav = "prev";
    this.#prev.innerHTML = CHEVRON_LEFT;
    this.labelEl = document.createElement("div");
    this.labelEl.className = "jd-grid-picker__label";
    this.labelEl.setAttribute("aria-live", "polite");
    this.#next = document.createElement("button");
    this.#next.type = "button";
    this.#next.className = "jd-grid-picker__nav";
    this.#next.dataset.nav = "next";
    this.#next.innerHTML = CHEVRON_RIGHT;
    header.append(this.#prev, this.labelEl, this.#next);

    this.gridEl = document.createElement("div");
    this.gridEl.className = "jd-grid-picker__grid";

    this.append(header, this.gridEl);
  }

  protected override connected(): void {
    // "오늘"은 여기서 1회만 읽는다 — render()는 결정적으로 유지(§3.1-3)
    this.today = toDayStart(new Date());
    if (!this.viewReady) {
      this.resolveDefaults(this.today);
      this.viewReady = true;
    }
    this.update();
  }

  protected override update(): void {
    this.#prev.setAttribute("aria-label", this.prevLabel());
    this.#next.setAttribute("aria-label", this.nextLabel());
    this.#prev.disabled = this.disabled;
    this.#next.disabled = this.disabled;
    this.labelEl.textContent = this.viewReady ? this.headerText() : "";
    this.gridEl.style.gridTemplateColumns = `repeat(${this.columns()}, 1fr)`;

    const count = this.cellCount();
    if (count !== this.#renderedCount) {
      this.#renderedCount = count;
      this.gridEl.textContent = "";
      for (let i = 0; i < count; i += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "jd-grid-picker__cell";
        cell.dataset.index = String(i);
        cell.tabIndex = -1;
        this.gridEl.append(cell);
      }
    }
    this.paintCells();
  }

  /** 셀 상태 반영 — 구조는 건드리지 않는다 */
  protected paintCells(): void {
    const cells = this.gridEl.children;
    let tabStop = -1;
    let firstEnabled = -1;
    for (let i = 0; i < cells.length; i += 1) {
      const cell = cells[i] as HTMLButtonElement;
      cell.textContent = this.viewReady ? this.cellText(i) : "";
      const disabled = this.disabled || (this.viewReady && this.cellDisabled(i));
      cell.disabled = disabled;
      const selected = this.viewReady && this.cellSelected(i);
      cell.setAttribute("aria-pressed", String(selected));
      // 뷰가 정해지기 전에는 빈 aria-label로 이름을 지우지 말고 아예 붙이지 않는다
      if (this.viewReady) cell.setAttribute("aria-label", this.cellAriaLabel(i));
      else cell.removeAttribute("aria-label");
      cell.tabIndex = -1;
      if (!disabled) {
        if (firstEnabled < 0) firstEnabled = i;
        if (tabStop < 0 && (i === this.#focusIndex || (this.#focusIndex < 0 && selected)))
          tabStop = i;
      }
    }
    const stop = tabStop >= 0 ? tabStop : firstEnabled;
    if (stop >= 0) (cells[stop] as HTMLButtonElement).tabIndex = 0;
  }

  /** 페이지 이동 — 파생의 pageDelta() 단위 */
  protected step(direction: number): void {
    if (this.disabled || !this.viewReady) return;
    this.viewBase += direction * this.pageDelta();
    this.#focusIndex = -1;
    this.update();
  }

  #onGridClick = (e: Event): void => {
    const cell = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-index]");
    if (!cell || cell.disabled || !this.viewReady) return;
    const index = Number(cell.dataset.index);
    this.#focusIndex = index;
    this.selectIndex(index);
    this.paintCells();
  };

  /** 화살표 ±1 / 상하 ±columns / Home·End / PageUp·Down 페이지 이동 */
  #onGridKeydown = (e: KeyboardEvent): void => {
    const cell = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-index]");
    if (!cell) return;
    const count = this.#renderedCount;
    const current = Number(cell.dataset.index);
    const cols = this.columns();
    let next = current;
    switch (e.key) {
      case "ArrowRight":
        next = current + 1;
        break;
      case "ArrowLeft":
        next = current - 1;
        break;
      case "ArrowDown":
        next = current + cols;
        break;
      case "ArrowUp":
        next = current - cols;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      case "PageUp":
        e.preventDefault();
        this.step(-1);
        this.#focusCell(current);
        return;
      case "PageDown":
        e.preventDefault();
        this.step(1);
        this.#focusCell(current);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next < 0 || next >= count) return; // 페이지 경계를 넘지 않는다
    this.#focusIndex = next;
    this.paintCells();
    this.#focusCell(next);
  };

  #focusCell(index: number): void {
    const cell = this.gridEl.children[index] as HTMLButtonElement | undefined;
    if (cell && !cell.disabled) {
      this.#focusIndex = index;
      this.paintCells();
      cell.focus();
    }
  }
}
