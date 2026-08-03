/**
 * <jd-offline-indicator> — 네트워크 오프라인 띠 + 복구 플래시 (v2 composites/OfflineIndicator).
 *
 * v2 대비 교정 4건:
 *  1. **라이브 리전을 내용과 동시에 마운트했다 → 낭독이 씹혔다.** v2는 온라인이면
 *     `null`을 반환해 요소를 통째로 없앴다가, 오프라인이 되는 순간 리전과 문구를
 *     **함께** 삽입했다. 스크린리더는 삽입 시점에 이미 존재하던 리전의 *변경*만
 *     안정적으로 읽는다 — 이 컴포넌트의 유일한 목적인 알림이 그래서 자주 유실됐다.
 *     v3는 리전을 항상 문서에 두고 표시만 `visible`로 전환한다(jd-back-top 선례).
 *  2. **복구 타이머가 절대 정리되지 않았다.** v2는 이벤트 핸들러 **안에서**
 *     `return () => clearTimeout(id)`를 했다 — 이벤트 리스너의 반환값은 아무도
 *     쓰지 않는다(죽은 코드). 언마운트 후에도 타이머가 살아 setState를 때렸다.
 *     v3는 타이머를 요소 수명에 묶는다(behaviors/createTimeout + disconnected 정리).
 *  3. **role=status에 aria-live="assertive"를 얹었다.** 두 신호가 어긋난다.
 *     v3는 role=status의 기본(polite)을 그대로 두고, 대신 리전이 상시 존재하므로
 *     끊김 없이 전달된다.
 *  4. **render가 navigator.onLine을 읽지 않는다**(§3.1-3 결정적 렌더). 최초 골격은
 *     항상 "온라인·숨김"이고 첫 측정은 connected() — 프리렌더 스냅샷이 흔들리지 않는다.
 *
 * 네트워크 구독은 새로 만들지 않고 behaviors의 createNetworkWatcher를 쓴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createNetworkWatcher, type JdNetworkStatus } from "../../behaviors/viewport.js";
import { createTimeout, type Timer } from "../../behaviors/timing.js";
import offlineIndicatorStyles from "./offline-indicator.css.js";

export class JdOfflineIndicator extends JdElement {
  static override tag = "jd-offline-indicator";
  static override props = {
    offlineMessage: { type: String, default: "오프라인 상태입니다" },
    onlineMessage: { type: String, default: "다시 연결되었습니다" },
    /** 복구 문구를 띄워 두는 시간(ms) */
    onlineFlashDuration: { type: Number, default: 3000 },
    /** top | bottom */
    position: { type: String, default: "top", reflect: true },
    /** 관찰 결과 — 읽기 전용으로 다루고 CSS가 색을 가른다 */
    online: { type: Boolean, default: true, reflect: true },
    /** 띠 노출 여부 */
    visible: { type: Boolean, reflect: true },
  };

  declare offlineMessage: string;
  declare onlineMessage: string;
  declare onlineFlashDuration: number;
  declare position: string;
  declare online: boolean;
  declare visible: boolean;

  #message!: HTMLElement;
  #flash: Timer | null = null;

  protected render(): void {
    adoptStyles(offlineIndicatorStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-offline-indicator__message");
    if (existing) {
      this.#message = existing;
    } else {
      const dot = document.createElement("span");
      dot.className = "jd-offline-indicator__dot";
      dot.setAttribute("aria-hidden", "true"); // 장식
      this.#message = document.createElement("span");
      this.#message.className = "jd-offline-indicator__message";
      this.append(dot, this.#message);
    }
    // 리전은 상시 존재해야 변경이 낭독된다 — 내용과 함께 생겼다 사라지지 않는다
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.update();
  }

  protected override connected(): void {
    const net = this.own(createNetworkWatcher());
    // 타이머는 요소 수명에 묶는다 — v2가 놓친 지점
    this.own({ destroy: () => this.#stopFlash() });
    const state = net.get();
    this.online = state.online;
    // 처음부터 오프라인이면 플래시 없이 바로 띄운다(복구가 아니므로)
    this.visible = !state.online;
    net.subscribe(this.#onNetwork);
  }

  #onNetwork = (state: JdNetworkStatus): void => {
    const wasOnline = this.online;
    this.online = state.online;
    if (!state.online) {
      this.#stopFlash();
      this.visible = true;
    } else if (!wasOnline) {
      this.visible = true;
      this.#armFlash(); // 복구 문구를 잠깐 보여주고 스스로 접힌다
    }
    this.emit("jd-change", { online: state.online });
  };

  #stopFlash(): void {
    this.#flash?.stop();
    this.#flash = null;
  }

  #armFlash(): void {
    this.#stopFlash();
    const ms = Number(this.onlineFlashDuration);
    this.#flash = createTimeout(
      () => {
        this.#flash = null;
        if (this.online) this.visible = false;
      },
      Number.isFinite(ms) && ms > 0 ? ms : 0,
    );
  }

  protected override update(): void {
    this.#message.textContent = this.online ? this.onlineMessage : this.offlineMessage;
  }
}
