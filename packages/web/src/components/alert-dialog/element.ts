/**
 * <jd-alert-dialog> — 확인이 필요한 다이얼로그 (v2 composites/AlertDialog·ConfirmDialog)
 * = Modal 파생. ConfirmDialog는 같은 표면의 별칭이라 태그를 따로 두지 않는다(§6 R12).
 *
 * role=alertdialog: 일반 dialog와 달리 **열리는 순간 내용을 읽어준다** — 파괴적
 * 작업 확인처럼 놓치면 안 되는 메시지에 쓰라는 뜻이다(v2는 role=dialog였다).
 * 접근 이름·설명은 aria-labelledby/describedby로 실제 노드를 가리킨다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import alertDialogStyles from "./alert-dialog.css.js";

export class JdAlertDialog extends JdModal {
  static override tag = "jd-alert-dialog";
  static override props = {
    ...JdModal.props,
    title: { type: String },
    description: { type: String },
    confirmLabel: { type: String, default: "확인" },
    cancelLabel: { type: String, default: "취소" },
    /** 확인 버튼을 위험 색으로 (삭제 등) */
    danger: { type: Boolean, reflect: true },
    /** 취소 버튼 숨김 — 단순 알림 */
    noCancel: { type: Boolean, reflect: true },
  };

  declare title: string;
  declare description: string;
  declare confirmLabel: string;
  declare cancelLabel: string;
  declare danger: boolean;
  declare noCancel: boolean;

  #title: HTMLElement | null = null;
  #desc: HTMLElement | null = null;
  #confirm: HTMLButtonElement | null = null;
  #cancel: HTMLButtonElement | null = null;

  protected override render(): void {
    super.render();
    adoptStyles(alertDialogStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    panel.setAttribute("role", "alertdialog");
    this.#title = panel.querySelector(".jd-alert-dialog__title");
    if (!this.#title) {
      const id = jdUid("jd-ad");
      this.#title = document.createElement("h2");
      this.#title.className = "jd-alert-dialog__title";
      this.#title.id = `${id}-t`;
      this.#desc = document.createElement("p");
      this.#desc.className = "jd-alert-dialog__desc";
      this.#desc.id = `${id}-d`;
      const actions = document.createElement("div");
      actions.className = "jd-alert-dialog__actions";
      this.#cancel = document.createElement("button");
      this.#cancel.type = "button";
      this.#cancel.className = "jd-alert-dialog__cancel";
      this.#cancel.addEventListener("click", () => {
        this.emit("jd-dismiss");
        this.close();
      });
      this.#confirm = document.createElement("button");
      this.#confirm.type = "button";
      this.#confirm.className = "jd-alert-dialog__confirm";
      this.#confirm.setAttribute("data-autofocus", ""); // 트랩 initialFocus 대상
      this.#confirm.addEventListener("click", () => {
        // 요청형이 아니다 — 확인은 사용자의 명시 결정이라 되돌릴 지점이 없다
        this.emit("jd-confirm");
        this.open = false;
      });
      actions.append(this.#cancel, this.#confirm);
      panel.prepend(this.#title, this.#desc);
      panel.append(actions);
      panel.setAttribute("aria-labelledby", this.#title.id);
      panel.setAttribute("aria-describedby", this.#desc.id);
    } else {
      this.#desc = panel.querySelector(".jd-alert-dialog__desc");
      this.#confirm = panel.querySelector(".jd-alert-dialog__confirm");
      this.#cancel = panel.querySelector(".jd-alert-dialog__cancel");
    }
    this.update();
  }

  protected override update(): void {
    super.update();
    if (this.#title) {
      this.#title.textContent = this.title;
      this.#title.hidden = !this.title;
    }
    if (this.#desc) {
      this.#desc.textContent = this.description;
      this.#desc.hidden = !this.description;
    }
    if (this.#confirm) this.#confirm.textContent = this.confirmLabel;
    if (this.#cancel) {
      this.#cancel.textContent = this.cancelLabel;
      this.#cancel.hidden = this.noCancel;
    }
  }
}
