/**
 * <jd-loading-screen> — 앱 부팅·라우트 전환용 전면 로딩 화면 (v2 composites/LoadingScreen).
 *
 * v2 대비 교정 4건:
 *  1. **aria-label이 메시지를 가로챘다.** v2는 메시지를 본문에 그리면서 같은 문자열을
 *     `aria-label`로도 얹었다 — 라이브 리전에 이름을 박으면 AT에 따라 내용 낭독이
 *     통째로 대체된다(그리고 message가 ReactNode면 이름이 "로딩 중"으로 퇴화했다).
 *     v3는 메시지가 있으면 **내용이 곧 이름**이고, 없을 때만 aria-label을 준다.
 *  2. **진행률이 숫자로만 있었다.** 폭 %로만 그려 AT에는 아무 값도 없었다.
 *     v3는 role=progressbar + valuemin/max/now/text.
 *  3. **`bars`가 인스턴스마다 `<style>`을 심었다.** keyframes가 화면에 뜬 개수만큼
 *     중복 정의됐다. v3는 시트에 한 번(css 파일).
 *  4. **aria-busy를 얹지 않는다.** 로딩 화면이라 붙이고 싶어지지만, 라이브 리전에
 *     aria-busy=true는 "아직 읽지 말라"는 뜻이라 메시지 낭독이 눌린다.
 *
 * 스피너는 jd-spinner·jd-button·jd-loading-overlay와 **같은 SVG**를 쓴다 —
 * v2 LoadingScreen만 혼자 다른 원호 스피너였다(같은 스피너를 네 번 그리지 않는다).
 * 로고는 light DOM 슬롯 `[slot="logo"]`(v2 logo: ReactNode 대응).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import loadingScreenStyles from "./loading-screen.css.js";

/** jd-spinner와 동일 SVG */
const SPINNER_SVG =
  `<svg class="jd-loading-screen__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

const BAR_COUNT = 5;

export class JdLoadingScreen extends JdElement {
  static override tag = "jd-loading-screen";
  static override props = {
    /** spinner | bars | pulse | logo */
    variant: { type: String, default: "spinner", reflect: true },
    message: { type: String },
    /**
     * 0~100. **attribute/프로퍼티가 없으면 진행 바를 그리지 않는다**(v2 undefined =
     * indeterminate). jd-badge의 count 모드와 같은 관용구.
     */
    progress: { type: Number, reflect: true },
    /** v2 fullscreen=false — 기본(풀스크린)의 부정형 */
    contained: { type: Boolean, reflect: true },
    transparent: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare message: string;
  declare progress: number;
  declare contained: boolean;
  declare transparent: boolean;

  #visual!: HTMLElement;
  #art!: HTMLElement;
  #message!: HTMLElement;
  #track!: HTMLElement;
  #fill!: HTMLElement;
  #drawn = "";

  protected render(): void {
    adoptStyles(loadingScreenStyles);
    const visual = this.querySelector<HTMLElement>(":scope > .jd-loading-screen__visual");
    if (visual) {
      // 입양(§3.3)
      this.#visual = visual;
      this.#art = visual.querySelector(".jd-loading-screen__art")!;
      this.#message = this.querySelector(":scope > .jd-loading-screen__message")!;
      this.#track = this.querySelector(":scope > .jd-loading-screen__progress")!;
      this.#fill = this.#track.querySelector(".jd-loading-screen__fill")!;
      this.#drawn = this.#art.dataset.variant ?? "";
    } else {
      const logo = this.querySelector(':scope > [slot="logo"]');
      this.#art = document.createElement("div");
      this.#art.className = "jd-loading-screen__art";
      this.#visual = document.createElement("div");
      this.#visual.className = "jd-loading-screen__visual";
      this.#visual.append(this.#art);
      if (logo) this.#visual.append(logo);

      this.#message = document.createElement("p");
      this.#message.className = "jd-loading-screen__message";

      this.#fill = document.createElement("div");
      this.#fill.className = "jd-loading-screen__fill";
      this.#track = document.createElement("div");
      this.#track.className = "jd-loading-screen__progress";
      this.#track.setAttribute("role", "progressbar");
      this.#track.setAttribute("aria-valuemin", "0");
      this.#track.setAttribute("aria-valuemax", "100");
      this.#track.setAttribute("aria-label", "진행률");
      this.#track.append(this.#fill);

      this.append(this.#visual, this.#message, this.#track);
    }
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.update();
  }

  /** 변형이 바뀔 때만 다시 그린다. 로고 노드(소비자 것)는 건드리지 않는다 */
  #drawArt(): void {
    const variant = this.variant;
    if (this.#drawn === variant) return;
    this.#drawn = variant;
    this.#art.dataset.variant = variant;
    this.#art.textContent = "";
    if (variant === "logo") {
      this.#art.hidden = true;
      return;
    }
    this.#art.hidden = false;
    if (variant === "bars") {
      const wrap = document.createElement("div");
      wrap.className = "jd-loading-screen__bars";
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = document.createElement("span");
        bar.className = "jd-loading-screen__bar";
        bar.style.setProperty("--jd-bar-index", String(i)); // 지연 계단
        wrap.append(bar);
      }
      this.#art.append(wrap);
      return;
    }
    if (variant === "pulse") {
      const wrap = document.createElement("div");
      wrap.className = "jd-loading-screen__pulse";
      const ping = document.createElement("span");
      ping.className = "jd-loading-screen__ping";
      const core = document.createElement("span");
      core.className = "jd-loading-screen__core";
      wrap.append(ping, core);
      this.#art.append(wrap);
      return;
    }
    this.#art.innerHTML = SPINNER_SVG; // spinner(기본) — 알 수 없는 값도 여기로
  }

  protected override update(): void {
    this.#drawArt();

    this.#message.textContent = this.message;
    this.#message.hidden = !this.message;
    // 메시지가 있으면 그 내용이 라이브 리전의 이름이자 낭독 대상이다
    if (this.message) this.removeAttribute("aria-label");
    else this.setAttribute("aria-label", "로딩 중");

    const determinate = this.hasAttribute("progress");
    this.#track.hidden = !determinate;
    if (determinate) {
      const raw = Number(this.progress);
      const pct = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
      this.#fill.style.width = `${pct}%`;
      this.#track.setAttribute("aria-valuenow", String(Math.round(pct)));
      this.#track.setAttribute("aria-valuetext", `${Math.round(pct)}%`);
    }
  }
}
