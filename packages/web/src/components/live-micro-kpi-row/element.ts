/**
 * <jd-live-micro-kpi-row> — 보조 KPI 소형 셀 묶음 (v2 finance/LiveMicroKpiRow).
 *
 * v2는 `/api/fx` + `/api/kis/investor`를 30초 폴링해 USD/KRW·외국인·기관·WTI 4셀을 그렸다.
 * DS 컴포넌트는 폴링을 앱에 남기고 **표시 전용**으로 `items` 배열(또는 JSON 슬롯)을 받아
 * N셀을 그린다. 값은 앱이 이미 포맷한 문자열(예: "1,320", "—")로 싣는다.
 *
 * 각 셀: 라벨(muted) + 값(+단위) + 보조 라인 = hint 문자열이 있으면 hint, 없으면 pct(±%).
 * 등락 방향은 셀 `data-dir` 반영 → 색은 CSS. 호스트는 display:contents(v2 프래그먼트 등가).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import liveMicroKpiRowStyles from "./live-micro-kpi-row.css.js";

export interface JdMicroKpiItem {
  label: string;
  /** 이미 포맷된 표시 문자열 */
  value: string;
  /** 등락률(%) — hint가 없을 때 표시 + 방향 착색 */
  pct?: number;
  /** 값 접미 단위 (예: "원", "$") */
  unit?: string;
  /** pct 대신 표시할 보조 문구 (예: "순매수") — 색은 pct 부호를 따른다 */
  hint?: string;
}

export class JdLiveMicroKpiRow extends JdElement {
  static override tag = "jd-live-micro-kpi-row";
  static override props = {};

  #items: JdMicroKpiItem[] = [];
  #built = false;

  get items(): JdMicroKpiItem[] {
    return this.#items;
  }
  set items(v: JdMicroKpiItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    // render() 전에는 그리지 않는다 — JSON 슬롯을 지우지 않기 위해(§ 입양).
    if (this.#built) this.#renderItems();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(liveMicroKpiRowStyles);
    this.#readJson();
    this.#built = true;
    this.#renderItems();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdMicroKpiItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #renderItems(): void {
    this.textContent = "";
    for (const it of this.#items) this.append(this.#buildCell(it));
  }

  #buildCell(it: JdMicroKpiItem): HTMLElement {
    const up = (it.pct ?? 0) >= 0;
    const cell = document.createElement("article");
    cell.className = "jd-live-micro-kpi-row__cell";
    cell.setAttribute("data-dir", up ? "up" : "down");

    const inner = document.createElement("div");
    inner.className = "jd-live-micro-kpi-row__inner";

    const label = document.createElement("div");
    label.className = "jd-live-micro-kpi-row__label";
    label.textContent = it.label;

    const value = document.createElement("div");
    value.className = "jd-live-micro-kpi-row__value";
    value.textContent = it.value;
    if (it.unit) {
      const unit = document.createElement("span");
      unit.className = "jd-live-micro-kpi-row__unit";
      unit.textContent = it.unit;
      value.append(unit);
    }

    const sub = document.createElement("div");
    sub.className = "jd-live-micro-kpi-row__sub";
    sub.textContent = it.hint ? it.hint : `${up ? "+" : ""}${(it.pct ?? 0).toFixed(2)}%`;

    inner.append(label, value, sub);
    cell.append(inner);
    return cell;
  }
}
