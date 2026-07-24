/**
 * <jd-radio-card-group> — 옵션을 카드로 펼친 단일 선택 그룹 (v2 composites/RadioCardGroup).
 *
 * 옵션 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `options` 프로퍼티 (Array<JdCardOption>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (DEC-023-3 선례)
 *
 * 네이티브 위임(§1.6-1): 카드 안의 진짜 radio가 화살표 순회·단일 탭스톱·폼 참여를
 * 전부 담당한다 — roving Behavior 불필요. name 미지정이면 jdUid로 문서 유일 name 발급.
 *
 * v2 대비 개선 2가지:
 *  - v2는 <label> 안에 <div>를 넣었다(label은 phrasing content만 허용 — 무효 HTML).
 *    v3는 전부 <span>이라 파서가 카드를 쪼개지 않는다.
 *  - v2는 감싸는 label 때문에 접근 이름이 "제목+설명+배지"로 뭉쳤다. v3는 input에
 *    aria-labelledby(제목) + aria-describedby(설명·배지)를 걸어 이름과 설명을 분리한다.
 *
 * 파생(§6 R12): <jd-checkbox-card-group>이 이 골격을 그대로 물려받고 선택 의미만
 * 바꾼다 — inputType/groupRole/isSelected/isBlocked/commit 5개 훅이 확장점이다.
 */
import { JdElement } from "../../core/element.js";
import type { PropDef } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import radioCardGroupStyles from "./radio-card-group.css.js";

export interface JdCardOption {
  value: string;
  title: string;
  description?: string;
  /** 좌측 장식(이모지·기호). 텍스트로만 삽입된다 — HTML은 해석되지 않는다 */
  icon?: string;
  /** 우측 보조 라벨 */
  badge?: string;
  disabled?: boolean;
}

export class JdRadioCardGroup extends JdElement {
  static override tag = "jd-radio-card-group";
  // 파생(<jd-checkbox-card-group>)이 `value`를 뺀 목록을 선언할 수 있도록 기반 타입으로
  // 넓혀 둔다 — 리터럴 타입이면 정적 측 호환성 검사가 프롭 제거를 막는다.
  static override props: Record<string, PropDef> = {
    name: { type: String },
    value: { type: String, reflect: true },
    /** 그리드 컬럼 수. v2 columns 동형(기본 1) */
    columns: { type: Number, default: 1 },
    /** 그룹 전체 비활성 (v2에 없던 상위집합) */
    disabled: { type: Boolean, reflect: true },
    /** 그룹 접근 이름 — role=radiogroup에는 이름이 있어야 한다 */
    label: { type: String },
  };

  declare name: string;
  declare value: string;
  declare columns: number;
  declare disabled: boolean;
  declare label: string;

  #options: JdCardOption[] = [];
  #items: HTMLLabelElement[] = [];
  #groupName = "";

  get options(): JdCardOption[] {
    return this.#options;
  }
  set options(v: JdCardOption[]) {
    this.#options = Array.isArray(v) ? v : [];
    this.#rebuild();
    this.requestUpdate();
  }

  /* ── 파생 훅 (§6 R12) ─────────────────────────────────────────────── */

  /** 카드 안 네이티브 컨트롤 종류 */
  protected get inputType(): "radio" | "checkbox" {
    return "radio";
  }
  /** 호스트 role */
  protected get groupRole(): string {
    return "radiogroup";
  }
  /** 이 값이 현재 선택 상태인가 */
  protected isSelected(value: string): boolean {
    return value === this.value;
  }
  /** 선택 상한 등으로 "지금은" 고를 수 없는 값인가 (단일 선택엔 없다) */
  protected isBlocked(_value: string): boolean {
    return false;
  }
  /** 사용자 조작 반영 + 통지(§1.5). 상태 저장소는 파생이 소유한다 */
  protected commit(value: string, _checked: boolean): void {
    this.value = value;
    this.emit("jd-change", { value });
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(radioCardGroupStyles);
    this.#readJson();
    this.setAttribute("role", this.groupRole);
    this.#rebuild();
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdCardOption[];
      if (Array.isArray(parsed)) this.#options = parsed;
    } catch {
      const tag = (this.constructor as typeof JdRadioCardGroup).tag;
      console.warn(`[junds] <${tag}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  /** 카드 재구축 — 입양(§3.3): 개수가 같으면 기존 골격을 재사용하고 내용만 동기화 */
  #rebuild(): void {
    if (!this.#groupName) this.#groupName = this.name || jdUid("jd-cardgroup");
    const existing = Array.from(
      this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-radio-card-group__item"),
    );
    if (existing.length === this.#options.length) {
      this.#items = existing;
    } else {
      for (const el of existing) el.remove();
      this.#items = this.#options.map(() => {
        const item = this.#buildItem();
        this.append(item);
        return item;
      });
    }
    this.#items.forEach((item, i) => {
      const opt = this.#options[i];
      if (opt) this.#syncItem(item, opt);
    });
  }

  /** 구조만 만든다 — 내용·aria 연결은 #syncItem 몫(입양 골격도 같은 경로를 탄다) */
  #buildItem(): HTMLLabelElement {
    const item = document.createElement("label");
    item.className = "jd-radio-card-group__item";
    const input = document.createElement("input");
    input.type = this.inputType;
    input.className = "jd-radio-card-group__input";
    const icon = document.createElement("span");
    icon.className = "jd-radio-card-group__icon";
    icon.setAttribute("aria-hidden", "true");
    const body = document.createElement("span");
    body.className = "jd-radio-card-group__body";
    const title = document.createElement("span");
    title.className = "jd-radio-card-group__title";
    const desc = document.createElement("span");
    desc.className = "jd-radio-card-group__description";
    const badge = document.createElement("span");
    badge.className = "jd-radio-card-group__badge";
    body.append(title, desc);
    item.append(input, icon, body, badge);
    return item;
  }

  #syncItem(item: HTMLLabelElement, opt: JdCardOption): void {
    const input = item.querySelector<HTMLInputElement>(".jd-radio-card-group__input")!;
    const icon = item.querySelector<HTMLElement>(".jd-radio-card-group__icon")!;
    const title = item.querySelector<HTMLElement>(".jd-radio-card-group__title")!;
    const desc = item.querySelector<HTMLElement>(".jd-radio-card-group__description")!;
    const badge = item.querySelector<HTMLElement>(".jd-radio-card-group__badge")!;

    // 입양 골격엔 id가 없을 수 있다 — 여기서 한 번만 발급한다
    if (!title.id) {
      const id = jdUid("jd-card");
      title.id = `${id}-title`;
      desc.id = `${id}-desc`;
      badge.id = `${id}-badge`;
    }

    icon.textContent = opt.icon ?? "";
    icon.hidden = !opt.icon;
    title.textContent = opt.title;
    desc.textContent = opt.description ?? "";
    desc.hidden = !opt.description;
    badge.textContent = opt.badge ?? "";
    badge.hidden = !opt.badge;

    // 감싸는 label의 암시적 이름(제목+설명+배지)을 제목만으로 좁힌다
    input.setAttribute("aria-labelledby", title.id);
    const described = [opt.description ? desc.id : "", opt.badge ? badge.id : ""]
      .filter(Boolean)
      .join(" ");
    if (described) input.setAttribute("aria-describedby", described);
    else input.removeAttribute("aria-describedby");
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-radio-card-group__input")) return;
    this.commit(input.value, input.checked);
    this.requestUpdate(); // 파생의 배열 상태는 setter를 타지 않는다
  };

  protected override update(): void {
    if (this.#items.length !== this.#options.length) this.#rebuild();

    // 임의 정수 → 셀렉터로 표현 불가(§4.3 예외). 기본 1컬럼은 base CSS가 담당한다
    if (this.columns > 1) {
      this.style.setProperty("grid-template-columns", `repeat(${this.columns}, minmax(0, 1fr))`);
    } else {
      this.style.removeProperty("grid-template-columns");
    }

    const name = this.name || this.#groupName;
    this.#items.forEach((item, i) => {
      const opt = this.#options[i];
      if (!opt) return;
      const input = item.querySelector<HTMLInputElement>(".jd-radio-card-group__input")!;
      const selected = this.isSelected(opt.value);
      const blocked = this.disabled || Boolean(opt.disabled) || this.isBlocked(opt.value);
      if (input.type !== this.inputType) input.type = this.inputType;
      input.name = name;
      input.value = opt.value;
      input.checked = selected;
      input.disabled = blocked;
      item.toggleAttribute("data-selected", selected);
      item.toggleAttribute("data-disabled", blocked);
    });

    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
  }
}
