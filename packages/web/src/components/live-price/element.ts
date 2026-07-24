/**
 * <jd-live-price> — 실시간 현재가 표시 = **jd-live-price-text 파생**(v2 finance/LivePrice).
 *
 * v2 LivePriceText/LivePrice는 숫자 포맷 골격이 같고, LivePrice가 더한 것은 (a) 크기,
 * (b) 값이 바뀔 때 0.6초 배경 플래시 — 둘뿐이다. 그래서 포맷 리프를 상속하고 이 둘만
 * 얹는다(§6 R12, jd-metric-card→jd-stat-card 선례).
 *
 * 플래시는 결정적 렌더 규칙(§3.1-3)을 지킨다: **최초 render/프리렌더 경로에서는 절대
 * 켜지 않는다**(#started 게이트, jd-animated-counter 선례). connected() 이후 price가
 * 실제로 **바뀔 때만** data-flash가 붙고, 0.6초 뒤 createTimeout Behavior가 떼어낸다
 * (this.own() 소유 → disconnected 자동 정리).
 *
 * v2 대비 교정 2건:
 *  1. v2 showFlash=true는 CE Boolean 관용상 부재=false로만 표현되므로 역표현 `no-flash`로
 *     낸다(jd-price-display hideDiscount 선례). 기본 플래시 켜짐은 그대로.
 *  2. v2는 훅이 준 trend로 방향을 정했다. DS는 훅이 없으므로 **직전 price 대비로 자동
 *     판정**하고, 소비자가 trend를 명시하면 그쪽을 우선한다(jd-stat 자동 판정과 같은 결).
 *
 * v2 결함 승계 안 함: v2는 색을 늘 `--bm-up`(초록)으로 고정했다(라이브 티커 관용) — 외관
 * 보존을 위해 그대로 success 고정하되, 하락 플래시 배경만 danger로 칠해 방향을 남긴다.
 */
import { JdLivePriceText } from "../live-price-text/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createTimeout, type Timer } from "../../behaviors/timing.js";
import styles from "./live-price.css.js";

type Dir = "up" | "down";

/** v2 setTimeout(…, 600) */
const FLASH_MS = 600;

export class JdLivePrice extends JdLivePriceText {
  static override tag = "jd-live-price";
  static override props = {
    ...JdLivePriceText.props,
    /** sm(12) | md(14) | lg(18) — v2 fontSize 맵 */
    size: { type: String, default: "md", reflect: true },
    /** up | down | flat. 비우면 직전 price 대비 자동 판정 */
    trend: { type: String },
    /** v2 showFlash=true의 역표현 — 있으면 값 변화 플래시를 끈다 */
    noFlash: { type: Boolean, reflect: true },
  };

  declare size: string;
  declare trend: string;
  declare noFlash: boolean;

  /** connected() 이후에만 플래시를 만진다 — render 경로는 결정적으로 남는다 */
  #started = false;
  /** 직전에 표시한 값 — 방향 자동 판정 기준선 */
  #prev = Number.NaN;
  #flashTimer: Timer | null = null;

  protected override render(): void {
    super.render();
    adoptStyles(styles);
  }

  protected override connected(): void {
    this.#started = true;
    this.#prev = this.resolvedValue; // 최초 표시값을 기준선으로 — 첫 연결은 플래시 없음
  }

  protected override disconnected(): void {
    // own()이 destroy를 마친 뒤 호출된다 — 참조만 끊고 재플래시 때 새로 만든다
    this.#flashTimer = null;
  }

  protected override update(): void {
    super.update(); // 숫자 도색(포맷 골격 재사용)
    if (!this.#started) return; // 프리렌더/최초 render — 플래시 금지(결정성)
    const now = this.resolvedValue;
    const prev = this.#prev;
    this.#prev = now;
    if (this.noFlash || !Number.isFinite(prev) || now === prev) return;
    const dir = this.#direction(prev, now);
    if (dir) this.#flash(dir);
  }

  /** 명시 trend 우선, 없으면 직전값 대비 부호 */
  #direction(prev: number, now: number): Dir | null {
    const t = this.trend;
    if (t === "up" || t === "down") return t;
    if (t === "flat") return null;
    return now > prev ? "up" : now < prev ? "down" : null;
  }

  #flash(dir: Dir): void {
    this.setAttribute("data-flash", dir);
    // createTimeout은 생성 즉시 카운트다운을 건다 — 첫 플래시는 생성이 곧 예약이고,
    // 이후 플래시는 restart()로 창을 다시 연다.
    if (!this.#flashTimer) {
      this.#flashTimer = this.own(createTimeout(() => this.removeAttribute("data-flash"), FLASH_MS));
    } else {
      this.#flashTimer.restart();
    }
  }
}
