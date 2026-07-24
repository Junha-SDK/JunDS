/**
 * <jd-pull-to-refresh> — 아래로 당겨 새로고침하는 스크롤 래퍼 (v2 composites/PullToRefresh).
 *
 * 호스트가 스크롤 컨테이너다. children은 그대로 두고 **인디케이터만** 맨 앞에 넣는다
 * (입양 §3.3 — 이미 있으면 재사용).
 *
 * 완료 신호 2경로:
 *  1. `onRefresh` 프로퍼티(함수. Promise를 반환하면 await한다) — v2 API와 동형.
 *  2. `jd-refresh` 이벤트의 `detail.complete()` 호출 — 리스너만 붙이는 바닐라 소비자용.
 * 둘 다 없으면 `timeout`(기본 10초)이 스피너를 강제로 걷는다. v2에는 이 안전망이 없어
 * onRefresh가 reject되면 스피너가 **영구히** 남았다.
 *
 * v2 대비 교정 5건:
 *  1. **onRefresh가 throw하면 refreshing이 영원히 true였다.** v2는 await 뒤에
 *     setRefreshing(false)를 두고 try/finally가 없었다 — v3는 실패해도 반드시 걷고
 *     `jd-error`를 낸다.
 *  2. **네이티브 오버스크롤과 겹쳤다.** 당기는 동안 touchmove 기본 동작(고무줄 스크롤)을
 *     막아 이중 반응을 없앤다(그래서 리스너가 passive가 아니다 — 의도적).
 *  3. **상태를 알리지 않았다.** 인디케이터가 `role="status"`이고 당김/새로고침 문구를
 *     읽어준다(시각적으로는 스피너만 보인다).
 *  4. **당김 높이를 인라인 스타일로 매 프레임 계산했다.** v3는 CSS 변수 하나만 갱신한다.
 *  5. **키보드·데스크톱에 수단이 없었다.** `refresh()` 메서드를 공개해 버튼 등으로
 *     같은 흐름을 부를 수 있다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import pullToRefreshStyles from "./pull-to-refresh.css.js";

const SPINNER_SVG =
  `<svg class="jd-pull-to-refresh__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true" ` +
  `focusable="false">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

export type JdRefreshHandler = () => void | Promise<void>;

export class JdPullToRefresh extends JdElement {
  static override tag = "jd-pull-to-refresh";
  static override props = {
    /** 새로고침 임계 거리(px) — v2 기본 60 */
    threshold: { type: Number, default: 60 },
    /** 완료 신호가 없을 때 강제 종료까지의 시간(ms). 0이면 무제한 */
    timeout: { type: Number, default: 10_000 },
    /** 당기는 중 상태 — 스타일 훅 */
    refreshing: { type: Boolean, reflect: true },
    pullLabel: { type: String, default: "당겨서 새로고침" },
    refreshingLabel: { type: String, default: "새로고침 중" },
  };

  declare threshold: number;
  declare timeout: number;
  declare refreshing: boolean;
  declare pullLabel: string;
  declare refreshingLabel: string;

  /** v2 onRefresh — 함수라 property 전용(§1.3) */
  onRefresh: JdRefreshHandler | null = null;

  #indicator!: HTMLElement;
  #status!: HTMLElement;
  #startY = 0;
  #pulling = 0;
  #tracking = false;
  #guard: ReturnType<typeof setTimeout> | undefined;

  protected render(): void {
    adoptStyles(pullToRefreshStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-pull-to-refresh__indicator");
    if (existing) {
      this.#indicator = existing;
      this.#status = existing.querySelector<HTMLElement>(".jd-pull-to-refresh__status")!;
    } else {
      this.#indicator = document.createElement("div");
      this.#indicator.className = "jd-pull-to-refresh__indicator";
      this.#indicator.setAttribute("role", "status");
      this.#indicator.innerHTML = SPINNER_SVG;
      this.#status = document.createElement("span");
      this.#status.className = "jd-pull-to-refresh__status";
      this.#indicator.append(this.#status);
      this.prepend(this.#indicator); // children보다 위 — v2와 같은 배치
    }
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("touchstart", this.#onTouchStart, { passive: true });
    // passive가 아니다 — 당기는 동안 네이티브 고무줄 스크롤을 막아야 한다
    this.addEventListener("touchmove", this.#onTouchMove, { passive: false });
    this.addEventListener("touchend", this.#onTouchEnd);
    this.addEventListener("touchcancel", this.#onTouchEnd);
  }

  protected override disconnected(): void {
    this.removeEventListener("touchstart", this.#onTouchStart);
    this.removeEventListener("touchmove", this.#onTouchMove);
    this.removeEventListener("touchend", this.#onTouchEnd);
    this.removeEventListener("touchcancel", this.#onTouchEnd);
    this.#clearGuard();
  }

  /* ── 당김 ─────────────────────────────────────────────────────────── */

  #onTouchStart = (e: Event): void => {
    const touch = (e as TouchEvent).touches[0];
    if (!touch || this.scrollTop > 0 || this.refreshing) return;
    this.#startY = touch.clientY;
    this.#tracking = true;
  };

  #onTouchMove = (e: Event): void => {
    if (!this.#tracking || this.refreshing || this.scrollTop > 0) return;
    const touch = (e as TouchEvent).touches[0];
    if (!touch) return;
    const threshold = this.#resolvedThreshold;
    // v2 계수 0.4 그대로 — 손가락보다 느리게 따라오는 저항감
    const delta = Math.max(0, (touch.clientY - this.#startY) * 0.4);
    if (delta <= 0) return;
    e.preventDefault(); // 네이티브 오버스크롤과의 이중 반응 차단
    this.#setPulling(Math.min(delta, threshold * 1.5));
  };

  #onTouchEnd = (): void => {
    if (!this.#tracking) return;
    this.#tracking = false;
    if (this.#pulling >= this.#resolvedThreshold && !this.refreshing) {
      void this.refresh();
      return;
    }
    this.#setPulling(0);
  };

  get #resolvedThreshold(): number {
    return Math.max(1, this.threshold || 1);
  }

  #setPulling(v: number): void {
    if (v === this.#pulling) return;
    this.#pulling = v;
    this.requestUpdate();
  }

  /* ── 새로고침 ─────────────────────────────────────────────────────── */

  /** 당김 없이도 같은 흐름을 부를 수 있다(버튼·단축키 등) */
  async refresh(): Promise<void> {
    if (this.refreshing) return;
    this.refreshing = true;
    this.#setPulling(this.#resolvedThreshold);
    this.#armGuard();
    this.emit("jd-refresh", { complete: () => this.complete() });
    try {
      await this.onRefresh?.();
      if (this.onRefresh) this.complete();
    } catch (error) {
      this.emit("jd-error", { error });
      this.complete();
    }
  }

  /** 새로고침 종료 — 멱등 */
  complete(): void {
    this.#clearGuard();
    if (!this.refreshing && this.#pulling === 0) return;
    this.refreshing = false;
    this.#setPulling(0);
    this.requestUpdate();
  }

  #armGuard(): void {
    this.#clearGuard();
    const ms = Math.floor(this.timeout);
    if (ms <= 0) return;
    this.#guard = setTimeout(() => {
      this.#guard = undefined;
      if (this.refreshing) this.complete();
    }, ms);
  }

  #clearGuard(): void {
    if (this.#guard) clearTimeout(this.#guard);
    this.#guard = undefined;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const threshold = this.#resolvedThreshold;
    this.style.setProperty("--_jd-ptr-pull", `${this.#pulling}px`);
    this.style.setProperty("--_jd-ptr-progress", String(Math.min(1, this.#pulling / threshold)));
    this.#indicator.toggleAttribute("data-active", this.#pulling > 0 || this.refreshing);
    // 시각은 스피너뿐이라 상태 문구는 화면에서 감춘다(접근성 트리에는 남는다)
    this.#status.textContent = this.refreshing
      ? this.refreshingLabel
      : this.#pulling > 0
        ? this.pullLabel
        : "";
  }
}
