/**
 * <jd-floating-action-button> — 화면 모서리에 뜨는 빠른 작업 묶음
 * (v2 composites/FloatingActionButton).
 *
 * 액션 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `actions` 프로퍼티 (Array<JdFloatingAction>)
 *  2. 선언적 초기화: 자식 `<script type="application/json">[…]</script>` 슬롯
 *     (jd-radio-group·jd-action-sheet 선례)
 *
 * 아이콘은 v2에서 ReactNode였다. 바닐라 대응 2경로 — 둘 다 **문자열 HTML 주입 없음**:
 *  - `icon` 필드(문자·이모지) → textContent
 *  - `<template data-key="add"><svg …/></template>` 자식 슬롯 → content를 clone.
 *    template 안의 <svg>는 파서가 SVG 네임스페이스로 만들어 주므로, innerHTML로 옮긴
 *    path가 노드는 들어가되 아무것도 그려지지 않는 네임스페이스 함정이 없다.
 *
 * v2 대비 교정 3건:
 *  1. **툴팁이 키보드에도 뜬다** — v2는 onMouseEnter/Leave state라 포커스로는 절대
 *     보이지 않았다. v3는 :hover와 :focus-within 양쪽에 반응하는 CSS 전용이라
 *     JS 상태가 0이고 프리렌더 결정성(§3.1-3)도 공짜다.
 *  2. **툴팁 aria-hidden** — 버튼 aria-label과 같은 문자열이 두 번 낭독되던 것을 막는다.
 *  3. **묶음에 역할과 이름** — v2는 fixed div에 role도 이름도 없었다. role=group + aria-label.
 *
 * 클릭은 위임 1개로 받는다(버튼마다 리스너를 달지 않는다) — 입양(§3.3) 경로에서
 * 리스너 재부착이 필요 없고, 액션 재구축 비용이 리스너 수와 무관해진다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import fabStyles from "./floating-action-button.css.js";

export interface JdFloatingAction {
  /** 식별자 — jd-select detail로 전달되고 아이콘 template 매칭 키가 된다 */
  key: string;
  /** 접근 이름 + 툴팁 문구 */
  label: string;
  /** 문자·이모지 아이콘. SVG 마크업은 <template data-key="…"> 슬롯으로 */
  icon?: string;
  /** primary | secondary | danger — 기본 primary */
  variant?: string;
  /** v2에 없던 상위집합 — 비활성 액션을 감추지 않고 남길 수 있다 */
  disabled?: boolean;
}

const ROW = "jd-floating-action-button__row";
const BUTTON = "jd-floating-action-button__button";
const TOOLTIP = "jd-floating-action-button__tooltip";

export class JdFloatingActionButton extends JdElement {
  static override tag = "jd-floating-action-button";
  static override props = {
    /** bottom-right | bottom-left | top-right | top-left */
    position: { type: String, default: "bottom-right", reflect: true },
    /** 묶음의 접근 이름 */
    label: { type: String, default: "빠른 작업" },
  };

  declare position: string;
  declare label: string;

  #actions: JdFloatingAction[] = [];
  /** 마지막으로 골격을 세운 액션 서열. null이면 아직 세운 적 없음 */
  #built: string | null = null;

  get actions(): JdFloatingAction[] {
    return this.#actions;
  }
  set actions(v: JdFloatingAction[]) {
    this.#actions = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(fabStyles);
    this.#readJson();
    this.setAttribute("role", "group");
    // 입양(§3.3): SSR/어댑터가 그린 행이 개수까지 맞으면 재구축하지 않는다
    const rows = this.querySelectorAll(`:scope > .${ROW}`);
    if (rows.length > 0 && rows.length === this.#actions.length) this.#built = this.#signature();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdFloatingAction[];
      if (Array.isArray(parsed)) this.#actions = parsed;
    } catch {
      console.warn("[junds] <jd-floating-action-button> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 골격에 박히는 값(key·icon)만 담는다 — label/variant/disabled는 update()가 동기화 */
  #signature(): string {
    return this.#actions.map((a) => `${a.key}|${a.icon ?? ""}`).join("//");
  }

  #rows(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(`:scope > .${ROW}`));
  }

  #onClick = (e: Event): void => {
    const target = e.target as Element | null;
    const btn = target?.closest<HTMLElement>(`.${BUTTON}`);
    if (!btn || !this.contains(btn)) return;
    const row = btn.closest<HTMLElement>(`.${ROW}`);
    const index = row ? this.#rows().indexOf(row) : -1;
    const action = index >= 0 ? this.#actions[index] : undefined;
    if (action) this.emit("jd-select", { key: action.key, label: action.label, index });
  };

  /** 행 골격 재구축 — 액션 서열이 바뀔 때만 호출된다 */
  #rebuild(): void {
    for (const row of this.#rows()) row.remove();
    const templates = new Map<string, HTMLTemplateElement>();
    for (const t of this.querySelectorAll<HTMLTemplateElement>(":scope > template[data-key]")) {
      if (t.dataset.key) templates.set(t.dataset.key, t);
    }
    this.#actions.forEach((action, i) => {
      const row = document.createElement("div");
      row.className = ROW;
      // 첫 액션이 주(主) 액션 — CSS의 :first-child로 고를 수 없다. 아이콘 <template>이
      // 호스트의 첫 자식이라 구조 선택자가 빗나간다(실브라우저 측정으로 발견).
      if (i === 0) row.setAttribute("data-primary", "");
      // 등장 스태거(v2 idx*50ms) — 인덱스의 결정 함수라 프리렌더 스냅샷이 흔들리지 않는다
      row.style.setProperty("--jd-floating-action-button-i", String(i));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = BUTTON;

      const icon = document.createElement("span");
      icon.className = "jd-floating-action-button__icon";
      icon.setAttribute("aria-hidden", "true");
      const tpl = templates.get(action.key);
      if (tpl) icon.append(tpl.content.cloneNode(true));
      else icon.textContent = action.icon ?? "";
      btn.append(icon);

      const tip = document.createElement("span");
      tip.className = TOOLTIP;
      tip.setAttribute("aria-hidden", "true"); // 버튼 aria-label과 중복 낭독 방지

      row.append(btn, tip);
      this.append(row);
    });
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    const signature = this.#signature();
    if (signature !== this.#built) {
      this.#built = signature;
      this.#rebuild();
    }
    const rows = this.#rows();
    for (let i = 0; i < rows.length; i++) {
      const action = this.#actions[i];
      const row = rows[i];
      if (!action || !row) continue;
      const btn = row.querySelector<HTMLButtonElement>(`.${BUTTON}`);
      const tip = row.querySelector<HTMLElement>(`.${TOOLTIP}`);
      if (btn) {
        btn.disabled = Boolean(action.disabled);
        btn.setAttribute("aria-label", action.label);
        btn.dataset.variant = action.variant ?? "primary";
      }
      if (tip) tip.textContent = action.label;
    }
  }
}
