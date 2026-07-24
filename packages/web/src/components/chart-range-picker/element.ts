/**
 * <jd-chart-range-picker> — 차트 기간 선택 pill 묶음 (v2 finance/ChartRangePicker).
 *
 * v2는 Next router에 직접 묶여 있었다: 클릭 → `router.push(?range=&interval=)`.
 * 라우팅은 앱 관심사(§6.3 — 컴포넌트는 데이터를 받기만/알리기만)이므로, v3는
 * 선택을 **jd-change 이벤트**로만 알리고 URL 쓰기는 소비자에게 남긴다. 활성 표시는
 * `value`(=range) 프로퍼티로 제어 — 소비자가 라우트 상태를 되먹이면 controlled,
 * 안 하면 클릭이 낙관적으로 갱신(uncontrolled)한다.
 *
 * 옵션 2경로(§1.3): `options` 프로퍼티(Array) 또는 자식 JSON 슬롯. 미지정 시 v2 기본 7종.
 * a11y 순증: v2는 활성/비활성이 색뿐이었다 — v3는 `aria-pressed`로 상태를 노출하고
 * `role="group"` + 이름을 준다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import chartRangePickerStyles from "./chart-range-picker.css.js";

export interface JdRangeOption {
  /** yahoo-finance 스타일 범위 키 — "1d","1mo","1y" 등 */
  range: string;
  /** 봉 간격 — "5m","1d","1wk" 등 */
  interval: string;
  label: string;
}

/** v2 OPTIONS */
const DEFAULT_OPTIONS: JdRangeOption[] = [
  { range: "1d", interval: "5m", label: "1일" },
  { range: "5d", interval: "15m", label: "5일" },
  { range: "1mo", interval: "1d", label: "1개월" },
  { range: "3mo", interval: "1d", label: "3개월" },
  { range: "6mo", interval: "1d", label: "6개월" },
  { range: "1y", interval: "1d", label: "1년" },
  { range: "2y", interval: "1wk", label: "2년" },
];

export class JdChartRangePicker extends JdElement {
  static override tag = "jd-chart-range-picker";
  static override props = {
    /** 활성 범위 키. 클릭 시 낙관적으로 갱신 후 반영 */
    value: { type: String, reflect: true },
    label: { type: String, default: "기간 선택" },
  };

  declare value: string;
  declare label: string;

  #options: JdRangeOption[] = DEFAULT_OPTIONS;
  #built = false;

  get options(): JdRangeOption[] {
    return this.#options;
  }
  set options(v: JdRangeOption[]) {
    this.#options = Array.isArray(v) && v.length > 0 ? v : DEFAULT_OPTIONS;
    this.#built = false;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(chartRangePickerStyles);
    this.setAttribute("role", "group");
    // 선언적 초기화 슬롯 — 1회 소비(§1.3 예외)
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdRangeOption[];
        if (Array.isArray(parsed) && parsed.length > 0) this.#options = parsed;
      } catch {
        console.warn("[junds] <jd-chart-range-picker> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      ".jd-chart-range-picker__pill",
    );
    if (!btn || !this.contains(btn)) return;
    const opt = this.#options[Number(btn.dataset.idx)];
    if (!opt) return;
    this.value = opt.range; // 낙관적 갱신 (controlled면 소비자가 되돌림)
    this.emit("jd-change", { range: opt.range, interval: opt.interval, label: opt.label });
  };

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    if (!this.#built || this.childElementCount !== this.#options.length) {
      this.#rebuild();
    }
    const pills = this.querySelectorAll<HTMLButtonElement>(":scope > .jd-chart-range-picker__pill");
    pills.forEach((pill, i) => {
      const active = this.#options[i]?.range === this.value;
      pill.setAttribute("aria-pressed", String(active));
      pill.toggleAttribute("data-active", active);
    });
  }

  #rebuild(): void {
    this.textContent = "";
    for (let i = 0; i < this.#options.length; i += 1) {
      const opt = this.#options[i]!;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "jd-chart-range-picker__pill";
      pill.dataset.idx = String(i);
      pill.textContent = opt.label;
      this.append(pill);
    }
    this.#built = true;
  }
}
