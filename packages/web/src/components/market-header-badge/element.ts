/**
 * <jd-market-header-badge> — 지수 실시간 배지 (v2 finance/MarketHeader).
 *
 * v2는 컴포넌트 안에서 `/api/kis/index`를 5초 폴링했다 — 데이터 수집·타이머는 DS 밖의
 * 일이라 걷어내고, 스냅샷(value/change/changePct/status)을 **표시 프로퍼티**로 받는다.
 * loading·empty 상태는 v2의 세 갈래(로딩/데이터없음/정상)를 그대로 옮긴 것이다.
 *
 * v2 대비 교정:
 *  1. `toLocaleString("ko-KR")`이 실행 환경 로케일에 좌우됐다(프리렌더≠방문자, §3.1-3).
 *     로케일 비의존 3자리 그룹핑(groupDigits)으로 대체한다.
 *  2. 배지가 그냥 `<div>`였다 — 값이 바뀌어도 스크린리더에 알려지지 않았다. v3는
 *     role="status" + aria-live="polite" + 요약 aria-label로 갱신을 읽어 준다.
 *  3. 상승/하락 색(적/청)은 :where()로 특이도 0에 두어 소비자 재정의를 연다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import badgeStyles from "./market-header-badge.css.js";

/** §3.1-3 결정성: 로케일 비의존 3자리 그룹핑(최대 소수 maxFrac자리) */
function groupDigits(v: number, maxFrac = 2): string {
  if (!Number.isFinite(v)) return "0";
  const neg = v < 0;
  const factor = 10 ** maxFrac;
  const rounded = Math.round(Math.abs(v) * factor) / factor;
  const [int = "0", frac] = String(rounded).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

const fixed = (n: number, d = 2): string => (Number.isFinite(n) ? n : 0).toFixed(d);

export class JdMarketHeaderBadge extends JdElement {
  static override tag = "jd-market-header-badge";
  static override props = {
    /** 지수명 */
    label: { type: String, default: "코스피" },
    /** 지수값 */
    value: { type: Number, default: 0 },
    /** 전일 대비 등락(포인트) */
    change: { type: Number, default: 0 },
    /** 전일 대비 등락률(%) */
    changePct: { type: Number, default: 0, attribute: "change-pct" },
    /** 장 상태: 장중 | 장마감 | 휴장 */
    status: { type: String, default: "장중" },
    /** 로딩 상태 표시 */
    loading: { type: Boolean, reflect: true },
    /** 데이터 없음 상태 표시 */
    empty: { type: Boolean, reflect: true },
    /** 툴팁 출처·시각 문자열 */
    asOf: { type: String, attribute: "as-of" },
  };

  declare label: string;
  declare value: number;
  declare change: number;
  declare changePct: number;
  declare status: string;
  declare loading: boolean;
  declare empty: boolean;
  declare asOf: string;

  #root!: HTMLElement;
  #msg!: HTMLElement;
  #ready!: HTMLElement;
  #name!: HTMLElement;
  #value!: HTMLElement;
  #tag!: HTMLElement;
  #status!: HTMLElement;

  protected render(): void {
    adoptStyles(badgeStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-mhb");
    if (existing) {
      this.#root = existing;
      this.#msg = existing.querySelector(".jd-mhb__msg")!;
      this.#ready = existing.querySelector(".jd-mhb__ready")!;
      this.#name = existing.querySelector(".jd-mhb__name")!;
      this.#value = existing.querySelector(".jd-mhb__value")!;
      this.#tag = existing.querySelector(".jd-mhb__tag")!;
      this.#status = existing.querySelector(".jd-mhb__status")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.update();
  }

  #build(): void {
    this.#root = document.createElement("div");
    this.#root.className = "jd-mhb";

    this.#msg = document.createElement("span");
    this.#msg.className = "jd-mhb__msg";

    this.#ready = document.createElement("span");
    this.#ready.className = "jd-mhb__ready";
    this.#name = document.createElement("span");
    this.#name.className = "jd-mhb__name";
    this.#value = document.createElement("span");
    this.#value.className = "jd-mhb__value";
    this.#tag = document.createElement("span");
    this.#tag.className = "jd-mhb__tag";
    this.#status = document.createElement("span");
    this.#status.className = "jd-mhb__status";
    this.#ready.append(this.#name, this.#value, this.#tag, this.#status);

    this.#root.append(this.#msg, this.#ready);
    this.append(this.#root);
  }

  protected override update(): void {
    const state = this.loading ? "loading" : this.empty ? "empty" : "ready";
    this.#root.dataset.state = state;

    if (this.asOf) this.#root.title = `출처: 한국투자증권 KIS · ${this.asOf}`;
    else this.#root.removeAttribute("title");

    this.#msg.hidden = state === "ready";
    this.#ready.hidden = state !== "ready";

    if (state === "loading") {
      this.#msg.textContent = `${this.label} 로딩…`;
      this.setAttribute("aria-label", `${this.label} 로딩 중`);
      this.removeAttribute("data-dir");
      return;
    }
    if (state === "empty") {
      this.#msg.textContent = `${this.label} 데이터 없음`;
      this.setAttribute("aria-label", `${this.label} 데이터 없음`);
      this.removeAttribute("data-dir");
      return;
    }

    const up = this.change >= 0;
    const dir = up ? "up" : "down";
    const valueText = groupDigits(this.value);
    this.#name.textContent = this.label;
    this.#value.textContent = valueText;
    this.#tag.textContent = `${up ? "+" : ""}${fixed(this.change)} (${up ? "+" : ""}${fixed(this.changePct)}%)`;
    this.#tag.dataset.dir = dir;
    this.#root.dataset.dir = dir;
    this.setAttribute("data-dir", dir);

    const isOpen = this.status === "장중";
    const closedLabel = this.status === "휴장" ? "휴장" : "장마감";
    this.#status.hidden = isOpen;
    this.#status.textContent = closedLabel;

    this.setAttribute(
      "aria-label",
      `${this.label} ${valueText}, ${up ? "상승" : "하락"} ${fixed(this.change)}포인트 ` +
        `${fixed(this.changePct)}퍼센트${isOpen ? "" : `, ${closedLabel}`}`,
    );
  }
}
