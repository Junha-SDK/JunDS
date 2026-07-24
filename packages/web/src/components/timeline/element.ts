/**
 * <jd-timeline> — 사건 기록 타임라인 (v2 composites/Timeline).
 *
 * 항목은 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3 ·
 * DEC-023-3 선례). 골격 구축은 Stepper와 같은 "행 수가 바뀔 때만 재생성" 방식이다.
 *
 * v2 대비 교정 4건:
 *  1. **목록 의미가 0이었다.** div 나열이라 AT에는 "몇 개짜리 이력"이라는 정보가
 *     전혀 없었다. v3는 `<ol>/<li>` — 시간순 사건 목록이므로 순서 있는 목록이 맞다.
 *  2. **시각이 그냥 텍스트였다.** `<span>10:00</span>`은 기계 판독이 불가능했다.
 *     v3는 `<time>`이고 `dateTime`을 주면 `datetime` 속성까지 실린다.
 *  3. **점·연결선이 접근성 트리에 남았다.** 순수 장식인 빈 div 두 개가 매 항목마다
 *     읽혔다 — v3는 마커 열 전체가 aria-hidden.
 *  4. **색이 유일한 구분이었다.** color는 여전히 시각 전용이지만, v3는 항목마다
 *     `data-color`를 노출해 소비자가 상태 텍스트를 덧붙일 수 있게 한다(v2는 클래스
 *     문자열 안에 갇혀 있었다).
 *
 * lineStyle(solid|dashed) 분기는 호스트 속성 셀렉터가 담당한다(§4.3) — JS 분기 없음.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import timelineStyles from "./timeline.css.js";

export type JdTimelineColor = "primary" | "success" | "warning" | "danger" | "neutral";

export interface JdTimelineItem {
  /** 타임라인 안에서 유일해야 한다 — data-key로 노출된다 */
  key: string;
  title: string;
  /** 본문. 문자열 또는 DOM 노드(v2 ReactNode 자리) */
  description?: string | Node;
  /** 표시용 시각 텍스트 */
  time?: string;
  /** `<time datetime>` 기계 판독 값 (ISO 8601). 없으면 datetime을 붙이지 않는다 */
  dateTime?: string;
  /** 아이콘. "<svg…>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드. 주면 점 대신 원형 배지 */
  icon?: string | Node;
  color?: JdTimelineColor;
}

const COLORS: readonly JdTimelineColor[] = ["primary", "success", "warning", "danger", "neutral"];

function fillIcon(slot: HTMLElement, icon: string | Node | undefined): void {
  slot.textContent = "";
  if (icon === undefined || icon === null || icon === "") return;
  if (typeof icon === "string") {
    if (icon.trimStart().startsWith("<")) slot.innerHTML = icon;
    else slot.textContent = icon;
  } else {
    slot.append(icon);
  }
}

function fillBody(slot: HTMLElement, value: string | Node | undefined): boolean {
  slot.textContent = "";
  if (value === undefined || value === null || value === "") return false;
  if (typeof value === "string") slot.textContent = value;
  else slot.append(value);
  return true;
}

export class JdTimeline extends JdElement {
  static override tag = "jd-timeline";
  static override props = {
    /** solid | dashed — 연결선 스타일 */
    lineStyle: { type: String, default: "solid", reflect: true },
    /** 목록 접근 이름 */
    label: { type: String },
  };

  declare lineStyle: string;
  declare label: string;

  #items: JdTimelineItem[] = [];
  #built: readonly JdTimelineItem[] | null = null;
  #list: HTMLOListElement | null = null;
  /** 데이터를 실제로 받았는가 — 프리렌더 산출물 위 재업그레이드 판정에 쓴다 */
  #hasData = false;

  get items(): JdTimelineItem[] {
    return this.#items;
  }
  set items(v: JdTimelineItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#hasData = true;
    this.#built = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(timelineStyles);
    this.#readJson();
    // 입양(§3.3): SSR/어댑터가 그린 골격이 있으면 재사용
    this.#list = this.querySelector<HTMLOListElement>(":scope > ol.jd-timeline__list");
    if (!this.#list) {
      this.#list = document.createElement("ol");
      this.#list.className = "jd-timeline__list";
      this.append(this.#list);
    }
    this.#sync();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdTimelineItem[];
      if (Array.isArray(parsed)) {
        this.#items = parsed;
        this.#hasData = true;
      }
    } catch {
      console.warn("[junds] <jd-timeline> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rows(): HTMLLIElement[] {
    return this.#list ? (Array.from(this.#list.children) as HTMLLIElement[]) : [];
  }

  #sync(): void {
    this.#built = this.#items;
    const list = this.#list;
    if (!list) return;
    // 데이터를 받은 적이 없는데 행이 이미 있다 = 프리렌더/어댑터 산출물이다.
    // JSON 슬롯은 1회 소비 후 제거되므로, 그 마크업을 방문자 브라우저가 다시
    // 업그레이드하면 items가 빈 채로 도착한다 — 여기서 지우면 본문이 사라진다(§3.3).
    if (!this.#hasData && list.children.length > 0) return;
    if (list.children.length !== this.#items.length) {
      list.textContent = "";
      for (let i = 0; i < this.#items.length; i++) list.append(this.#createRow());
    }
    const last = this.#items.length - 1;
    this.#rows().forEach((row, i) => {
      const item = this.#items[i];
      if (!item) return;
      row.dataset.key = item.key;
      row.dataset.color = COLORS.includes(item.color as JdTimelineColor)
        ? (item.color as JdTimelineColor)
        : "neutral";
      row.toggleAttribute("data-last", i === last);

      const dot = row.querySelector<HTMLElement>(".jd-timeline__dot")!;
      const hasIcon = item.icon !== undefined && item.icon !== null && item.icon !== "";
      dot.toggleAttribute("data-icon", hasIcon);
      fillIcon(dot, item.icon);

      row.querySelector<HTMLElement>(".jd-timeline__title")!.textContent = item.title;

      const time = row.querySelector<HTMLTimeElement>(".jd-timeline__time")!;
      time.textContent = item.time ?? "";
      time.hidden = !item.time;
      if (item.dateTime) time.setAttribute("datetime", item.dateTime);
      else time.removeAttribute("datetime");

      const desc = row.querySelector<HTMLElement>(".jd-timeline__desc")!;
      desc.hidden = !fillBody(desc, item.description);
    });
  }

  #createRow(): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-timeline__item";

    // 마커 열 전체가 장식이다 — AT에서 통째로 빼낸다(v2는 빈 div 2개를 읽혔다)
    const marker = document.createElement("span");
    marker.className = "jd-timeline__marker";
    marker.setAttribute("aria-hidden", "true");
    const dot = document.createElement("span");
    dot.className = "jd-timeline__dot";
    const line = document.createElement("span");
    line.className = "jd-timeline__line";
    marker.append(dot, line);

    const body = document.createElement("div");
    body.className = "jd-timeline__body";
    const head = document.createElement("div");
    head.className = "jd-timeline__head";
    const title = document.createElement("span");
    title.className = "jd-timeline__title";
    const time = document.createElement("time");
    time.className = "jd-timeline__time";
    head.append(title, time);
    const desc = document.createElement("div");
    desc.className = "jd-timeline__desc";
    body.append(head, desc);

    row.append(marker, body);
    return row;
  }

  protected override update(): void {
    if (this.#built !== this.#items) this.#sync();
    if (this.label) this.#list?.setAttribute("aria-label", this.label);
    else this.#list?.removeAttribute("aria-label");
  }
}
