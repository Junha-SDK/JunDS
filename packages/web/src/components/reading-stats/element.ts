/**
 * <jd-reading-stats> — 독서 통계 4종 (v2 composites/ReadingStats).
 * 오늘(+목표 바) · 스트릭 · 완독 · 누적 시간. 골격은 고정 4타일이라 render 1회로 세우고
 * update()가 값만 칠한다.
 *
 * v2 대비 교정 2건:
 *  1. **타일이 이름 없는 숫자였다.** 각 타일을 role="group" + aria-labelledby(라벨)로
 *     묶어 "오늘, 42 p"처럼 읽히게 한다.
 *  2. **오늘 목표 바가 의미 없는 장식이었다.** role="progressbar" + valuemin/max/now로
 *     실제 진척을 노출한다(pagesGoal 있을 때만).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import readingStatsStyles from "./reading-stats.css.js";

const CLS = "jd-reading-stats";

export class JdReadingStats extends JdElement {
  static override tag = "jd-reading-stats";
  static override props = {
    pagesToday: { type: Number, default: 0 }, // attr: pages-today
    pagesGoal: { type: Number, default: 0 }, // attr: pages-goal (미지정=바 없음)
    streakDays: { type: Number, default: 0 }, // attr: streak-days
    booksCompleted: { type: Number, default: 0 }, // attr: books-completed
    totalMinutes: { type: Number, default: 0 }, // attr: total-minutes
  };

  declare pagesToday: number;
  declare pagesGoal: number;
  declare streakDays: number;
  declare booksCompleted: number;
  declare totalMinutes: number;

  #today!: HTMLElement;
  #todayBarWrap!: HTMLElement;
  #todayBar!: HTMLElement;
  #streak!: HTMLElement;
  #books!: HTMLElement;
  #hours!: HTMLElement;
  #minutes!: HTMLElement;

  protected render(): void {
    adoptStyles(readingStatsStyles);
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", "독서 통계");
    // 슬롯 없는 데이터 컴포넌트 — SSR 골격이 있으면 지우고 새로 세운다(§3.3 멱등, 이중 방지)
    this.textContent = "";

    // 오늘 (+ 목표 바)
    const today = this.#tile("오늘");
    this.#today = today.value;
    this.#today.append(document.createTextNode(""), unit("p"));
    this.#todayBar = document.createElement("div");
    this.#todayBar.className = `${CLS}__bar`;
    this.#todayBarWrap = document.createElement("div");
    this.#todayBarWrap.className = `${CLS}__track`;
    this.#todayBarWrap.setAttribute("role", "progressbar");
    this.#todayBarWrap.setAttribute("aria-valuemin", "0");
    this.#todayBarWrap.setAttribute("aria-label", "오늘 목표");
    this.#todayBarWrap.append(this.#todayBar);
    today.tile.append(this.#todayBarWrap);

    // 스트릭
    const streak = this.#tile("스트릭");
    this.#streak = streak.value;
    this.#streak.append(document.createTextNode(""), unit("일"));

    // 완독
    const books = this.#tile("완독");
    this.#books = books.value;
    this.#books.append(document.createTextNode(""), unit("권"));

    // 누적 시간
    const time = this.#tile("누적 시간");
    this.#hours = document.createElement("span");
    this.#minutes = document.createElement("span");
    time.value.append(this.#hours, unit("h", 0.5), document.createTextNode(" "), this.#minutes, unit("m", 0.5));

    this.append(today.tile, streak.tile, books.tile, time.tile);
    this.update();
  }

  #tile(label: string): { tile: HTMLElement; value: HTMLElement } {
    const tile = document.createElement("div");
    tile.className = `${CLS}__tile`;
    tile.setAttribute("role", "group");
    const labelEl = document.createElement("p");
    labelEl.className = `${CLS}__label`;
    labelEl.id = jdUid(`${CLS}-l`);
    labelEl.textContent = label;
    tile.setAttribute("aria-labelledby", labelEl.id);
    const value = document.createElement("p");
    value.className = `${CLS}__value`;
    tile.append(labelEl, value);
    return { tile, value };
  }

  protected override update(): void {
    setLead(this.#today, String(this.pagesToday));

    const hasGoal = this.hasAttribute("pages-goal") || Number(this.pagesGoal) > 0;
    this.#todayBarWrap.hidden = !hasGoal;
    if (hasGoal) {
      const goal = Number(this.pagesGoal);
      const pct = goal > 0 ? Math.min(100, Math.max(0, (this.pagesToday / goal) * 100)) : 0;
      this.#todayBar.style.width = `${pct}%`;
      this.#todayBarWrap.setAttribute("aria-valuemax", String(goal));
      this.#todayBarWrap.setAttribute("aria-valuenow", String(Math.min(Math.max(this.pagesToday, 0), goal)));
      this.#todayBarWrap.setAttribute("aria-valuetext", `${Math.round(pct)}%`);
    }

    setLead(this.#streak, `🔥 ${this.streakDays}`);
    setLead(this.#books, String(this.booksCompleted));

    const total = Math.max(0, Number(this.totalMinutes) || 0);
    this.#hours.textContent = String(Math.floor(total / 60));
    this.#minutes.textContent = String(total % 60);
  }
}

/** 값 노드의 선두 텍스트(첫 child = 숫자)만 갈아끼운다 — 단위 스팬은 보존 */
function setLead(value: HTMLElement, text: string): void {
  const first = value.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) first.textContent = text;
  else value.prepend(document.createTextNode(text));
}

/** 값 뒤 작은 단위 접미사 */
function unit(text: string, marginRem = 1): HTMLElement {
  const span = document.createElement("span");
  span.className = `${CLS}__unit`;
  span.style.marginInlineStart = `${marginRem * 0.25}rem`;
  span.textContent = text;
  return span;
}
