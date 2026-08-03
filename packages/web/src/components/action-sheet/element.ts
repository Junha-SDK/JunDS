/**
 * <jd-action-sheet> — 하단 액션 목록 (v2 composites/ActionSheet) = Modal 파생.
 * 액션은 property(Array) 또는 자식 <script type="application/json">(DEC-023-3 선례).
 * v2는 ESC·포커스 감금이 없었다 — Modal 파생으로 둘 다 생긴다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import actionSheetStyles from "./action-sheet.css.js";

export interface JdAction {
  label: string;
  /** 식별자 — jd-select detail로 전달 */
  value?: string;
  danger?: boolean;
  disabled?: boolean;
}

export class JdActionSheet extends JdModal {
  static override tag = "jd-action-sheet";
  static override props = {
    ...JdModal.props,
    title: { type: String },
    cancelLabel: { type: String, default: "취소" },
  };

  declare title: string;
  declare cancelLabel: string;

  #actions: JdAction[] = [];
  #list: HTMLElement | null = null;
  #titleEl: HTMLElement | null = null;
  #cancel: HTMLButtonElement | null = null;

  set actions(v: JdAction[]) {
    this.#actions = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get actions(): JdAction[] {
    return this.#actions;
  }

  protected override render(): void {
    this.#readJson();
    super.render();
    adoptStyles(actionSheetStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    this.#titleEl = panel.querySelector(".jd-action-sheet__title");
    this.#list = panel.querySelector(".jd-action-sheet__list");
    if (!this.#list) {
      this.#titleEl = document.createElement("p");
      this.#titleEl.className = "jd-action-sheet__title";
      this.#list = document.createElement("div");
      this.#list.className = "jd-action-sheet__list";
      this.#list.setAttribute("role", "group");
      this.#cancel = document.createElement("button");
      this.#cancel.type = "button";
      this.#cancel.className = "jd-action-sheet__cancel";
      this.#cancel.addEventListener("click", () => this.close());
      panel.prepend(this.#titleEl, this.#list);
      panel.append(this.#cancel);
    } else {
      this.#cancel = panel.querySelector(".jd-action-sheet__cancel");
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdAction[];
      if (Array.isArray(parsed)) this.#actions = parsed;
    } catch {
      /* 잘못된 JSON은 무시 — 렌더를 깨뜨리지 않는다 */
    }
    script.remove();
  }

  protected override update(): void {
    super.update();
    if (this.#titleEl) {
      this.#titleEl.textContent = this.title;
      this.#titleEl.hidden = !this.title;
    }
    if (this.#cancel) this.#cancel.textContent = this.cancelLabel;
    const list = this.#list;
    if (!list) return;
    if (list.children.length !== this.#actions.length) {
      list.textContent = "";
      for (const a of this.#actions) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "jd-action-sheet__item";
        b.addEventListener("click", () => {
          this.emit("jd-select", { value: a.value ?? a.label, label: a.label });
          this.close();
        });
        list.append(b);
      }
    }
    for (let i = 0; i < this.#actions.length; i++) {
      const a = this.#actions[i]!;
      const b = list.children[i] as HTMLButtonElement;
      b.textContent = a.label;
      b.disabled = Boolean(a.disabled);
      b.toggleAttribute("data-danger", Boolean(a.danger));
    }
  }
}
