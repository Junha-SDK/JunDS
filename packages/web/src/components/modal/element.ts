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
import { defineProps, JdElement, type PropDefs } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { lockScroll } from "../../behaviors/document.js";
import { createFocusTrap, type FocusTrap } from "../../behaviors/focus-trap.js";
import modalStyles from "./modal.css.js";

export type JdModalSize = "sm" | "md" | "lg" | "xl" | "full";

const modalStacks = new WeakMap<Document, JdModal[]>();

function pushModal(doc: Document, modal: JdModal): void {
  const stack = modalStacks.get(doc) ?? [];
  const previous = stack.indexOf(modal);
  if (previous !== -1) stack.splice(previous, 1);
  stack.push(modal);
  modalStacks.set(doc, stack);
}

function removeModal(doc: Document, modal: JdModal): void {
  const stack = modalStacks.get(doc);
  if (!stack) return;
  const index = stack.indexOf(modal);
  if (index !== -1) stack.splice(index, 1);
  if (!stack.length) modalStacks.delete(doc);
}

function isTopModal(doc: Document, modal: JdModal): boolean {
  const stack = modalStacks.get(doc);
  return stack?.at(-1) === modal;
}

export class JdModal extends JdElement {
  static override tag = "jd-modal";
  static override props: PropDefs = defineProps({
    open: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true },
    /** true면 백드롭 클릭으로 닫히지 않음. ESC는 항상 동작(v2 Modal과 동일) */
    persistent: { type: Boolean, reflect: true },
    /** 내부 dialog panel로 전달되는 접근 가능한 이름 */
    ariaLabel: { type: String, attribute: "aria-label" },
    ariaLabelledby: { type: String, attribute: "aria-labelledby" },
    ariaDescribedby: { type: String, attribute: "aria-describedby" },
  });

  declare open: boolean;
  declare size: JdModalSize;
  declare persistent: boolean;
  declare ariaLabel: string;
  declare ariaLabelledby: string;
  declare ariaDescribedby: string;

  #panel!: HTMLDivElement;
  #trap!: FocusTrap;
  #wasOpen = false;
  #unlockScroll: (() => void) | undefined;
  #syncedPanelAria = new Map<string, string>();

  protected render(): void {
    adoptStyles(modalStyles);
    // 입양 규칙(§3.3)
    let backdrop = this.querySelector<HTMLDivElement>(
      ":scope > .jd-modal__backdrop",
    );
    const panel = this.querySelector<HTMLDivElement>(
      ":scope > .jd-modal__panel",
    );
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
    this.#trap = this.own(
      createFocusTrap(this.#panel, { initialFocus: "[data-autofocus]" }),
    );
    if (this.open && !this.#wasOpen)
      this.#applyOpenChange(true); // 재연결 복원
    else if (this.open) this.#trap.activate(); // 최초 연결: render가 이미 전이 적용 — 트랩만 늦게 합류
  }

  protected override disconnected(): void {
    if (this.#wasOpen) this.#applyOpenChange(false, { silent: true });
  }

  protected override update(): void {
    this.#syncPanelAria();
    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  #syncPanelAria(): void {
    const attrs = {
      "aria-label": this.ariaLabel,
      "aria-labelledby": this.ariaLabelledby,
      "aria-describedby": this.ariaDescribedby,
    };
    for (const [name, value] of Object.entries(attrs)) {
      if (value) {
        this.#panel.setAttribute(name, value);
        this.#syncedPanelAria.set(name, value);
        continue;
      }
      const previous = this.#syncedPanelAria.get(name);
      if (
        previous !== undefined &&
        this.#panel.getAttribute(name) === previous
      ) {
        this.#panel.removeAttribute(name);
      }
      this.#syncedPanelAria.delete(name);
    }
  }

  /** open 전이의 부수효과 1곳: 포커스트랩·스크롤 락·ESC 리스너·사후 이벤트 */
  #applyOpenChange(open: boolean, opts?: { silent?: boolean }): void {
    this.#wasOpen = open;
    const doc = this.ownerDocument;
    if (open) {
      pushModal(doc, this);
      doc.addEventListener("keydown", this.#onKeydown);
      this.#unlockScroll ??= lockScroll();
      this.#trap?.activate();
      if (!opts?.silent) this.emit("jd-open");
    } else {
      removeModal(doc, this);
      doc.removeEventListener("keydown", this.#onKeydown);
      this.#trap?.deactivate();
      this.#unlockScroll?.();
      this.#unlockScroll = undefined;
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
    const proceed = this.emit(
      "jd-request-close",
      { reason },
      { cancelable: true },
    );
    if (proceed) this.open = false; // → update()가 전이 부수효과 수행
  }

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !isTopModal(this.ownerDocument, this)) return;
    e.stopPropagation();
    this.#requestClose("escape");
  };

  #onBackdrop = (): void => {
    if (!this.persistent) this.#requestClose("backdrop");
  };
}
