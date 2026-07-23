/**
 * <jd-modal> — 오버레이 다이얼로그. behaviors/createFocusTrap의 첫 규범 소비처.
 *
 * <dialog> 미사용 결정(근거는 DECISIONS "G1 구현 중 발견" 항목):
 * 03-web-arch §5.3·§8이 Modal의 포커스 감금·닫기 경로를 공용 Behavior
 * (createFocusTrap 등)로 강제 일원화(WEB-10)하는데, <dialog>.showModal()의
 * top layer는 그 책임을 브라우저 내장 동작과 이중화하고, --jd-z-* 토큰 체계와
 * @layer 기반 소비자 오버라이드(::backdrop은 레이어 계약 밖) 양쪽과 상충한다.
 *
 * 이벤트(§1.5): ESC/백드롭/close() 모두 요청형 jd-request-close(cancelable)를
 * 먼저 발행 — preventDefault되면 상태 변화 중단. 상태 변화 후 jd-open/jd-close(사후).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createFocusTrap, type FocusTrap } from "../../behaviors/focus-trap.js";
import modalStyles from "./modal.css.js";

export class JdModal extends JdElement {
  static override tag = "jd-modal";
  static override props = {
    open: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true },
    /** true면 백드롭 클릭으로 닫히지 않음. ESC는 항상 동작(v2 Modal과 동일) */
    persistent: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare size: string;
  declare persistent: boolean;

  #panel!: HTMLDivElement;
  #trap!: FocusTrap;
  #wasOpen = false;
  #prevBodyOverflow: string | null = null;

  protected render(): void {
    adoptStyles(modalStyles);
    // 입양 규칙(§3.3)
    let backdrop = this.querySelector<HTMLDivElement>(":scope > .jd-modal__backdrop");
    const panel = this.querySelector<HTMLDivElement>(":scope > .jd-modal__panel");
    if (panel && backdrop) {
      this.#panel = panel;
    } else {
      backdrop = document.createElement("div");
      backdrop.className = "jd-modal__backdrop";
      this.#panel = document.createElement("div");
      this.#panel.className = "jd-modal__panel";
      this.#panel.append(...this.childNodes); // children을 패널로 이동
      this.append(backdrop, this.#panel);
    }
    this.#panel.setAttribute("role", "dialog");
    this.#panel.setAttribute("aria-modal", "true");
    backdrop.addEventListener("click", this.#onBackdrop);
    this.update();
  }

  protected override connected(): void {
    // Behavior 수명은 own()이 관리(§1.2) — disconnected 시 자동 destroy
    this.#trap = this.own(createFocusTrap(this.#panel, { initialFocus: "[data-autofocus]" }));
    if (this.open && !this.#wasOpen) this.#applyOpenChange(true); // 재연결 복원
    else if (this.open) this.#trap.activate(); // 최초 연결: render가 이미 전이 적용 — 트랩만 늦게 합류
  }

  protected override disconnected(): void {
    if (this.#wasOpen) this.#applyOpenChange(false, { silent: true });
  }

  protected override update(): void {
    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  /** open 전이의 부수효과 1곳: 포커스트랩·스크롤 락·ESC 리스너·사후 이벤트 */
  #applyOpenChange(open: boolean, opts?: { silent?: boolean }): void {
    this.#wasOpen = open;
    const doc = this.ownerDocument;
    if (open) {
      doc.addEventListener("keydown", this.#onKeydown);
      this.#prevBodyOverflow = doc.body.style.overflow;
      doc.body.style.overflow = "hidden"; // 스크롤 락(v2 동일 전략)
      this.#trap?.activate();
      if (!opts?.silent) this.emit("jd-open");
    } else {
      doc.removeEventListener("keydown", this.#onKeydown);
      this.#trap?.deactivate();
      if (this.#prevBodyOverflow !== null) {
        doc.body.style.overflow = this.#prevBodyOverflow;
        this.#prevBodyOverflow = null;
      }
      if (!opts?.silent) this.emit("jd-close");
    }
  }

  /** 열기 — 네이티브 dialog 표면과 이름 호환 */
  showModal(): void {
    this.open = true;
  }

  /** 닫기 요청 — jd-request-close가 preventDefault되지 않으면 닫힌다 */
  close(): void {
    this.#requestClose("close");
  }

  #requestClose(reason: "escape" | "backdrop" | "close"): void {
    if (!this.open) return;
    const proceed = this.emit("jd-request-close", { reason }, { cancelable: true });
    if (proceed) this.open = false; // → update()가 전이 부수효과 수행
  }

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    this.#requestClose("escape");
  };

  #onBackdrop = (): void => {
    if (!this.persistent) this.#requestClose("backdrop");
  };
}
