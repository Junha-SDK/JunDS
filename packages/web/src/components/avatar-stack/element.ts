/**
 * <jd-avatar-stack> — 겹친 아바타 그룹 (v2 composites/AvatarStack).
 *
 * 아바타는 다시 만들지 않고 **<jd-avatar>로 짓는다**(§6 R12 · jd-accordion→
 * jd-disclosure 선례). 이니셜 산출·이름 해시 팔레트·status 점·size 치수가 전부
 * 원형에 있고, 이 컴포넌트의 고유 표면은 **겹침·링·초과 배지** 셋뿐이다.
 * 자식 값은 프로퍼티가 아니라 **attribute로 쓴다** — <jd-avatar>가 아직
 * 업그레이드되지 않았어도(=`/element`만 import한 소비자) 값이 유실되지 않고,
 * 프리렌더 스냅샷에 그대로 직렬화되어 입양(§3.3)이 성립한다.
 *
 * v2 대비 교정 3건:
 *  1. **목록이 아니었다.** div 나열이라 "몇 명인가"라는 이 위젯의 유일한 정보가
 *     접근성 트리에 없었다. v3는 role=list/listitem으로 항목 수가 전달된다.
 *  2. **이름이 안 읽혔다.** v2 Avatar는 이미지가 없으면 이니셜 텍스트만 남는다 —
 *     스택 전체가 자모 나열("김이 이서 박민")로 읽혔다. v3는 아바타를
 *     aria-hidden 장식으로 내리고 항목마다 **전체 이름**을 시각적으로 숨긴
 *     텍스트로 붙인다(이미지·이니셜 어느 경로든 이름이 같게 읽힌다).
 *  3. **초과 배지가 "+2"로 읽혔다.** 무엇이 2인지 말하지 않는다. v3는 "외 2명"을
 *     숨김 텍스트로 주고 "+2"는 aria-hidden 장식으로 내린다.
 *
 * names는 복합 데이터라 property 전용 + 자식 `<script type="application/json">`
 * 슬롯(§1.3 · jd-radio-group 선례). 문자열과 객체를 섞어 줄 수 있고, getter는
 * 정규화된 객체 배열을 돌려준다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import avatarStackStyles from "./avatar-stack.css.js";

export interface JdAvatarStackPerson {
  name: string;
  /** 아바타 이미지 URL. 없으면 <jd-avatar>가 이니셜로 그린다 */
  src?: string;
  /** online | offline | away | busy — <jd-avatar> 표면 그대로 */
  status?: string;
}

/** v2 표면은 string[]이었다 — 객체를 섞어도 받는다 */
export type JdAvatarStackEntry = string | JdAvatarStackPerson;

function toPerson(entry: JdAvatarStackEntry): JdAvatarStackPerson {
  if (typeof entry === "string") return { name: entry };
  if (!entry || typeof entry !== "object") return { name: "" };
  return { ...entry, name: String(entry.name ?? "") };
}

/** 빈 값이면 attribute를 지운다 — <jd-avatar>의 Boolean/String 규칙(§1.3)과 정합 */
function setAttr(el: Element, name: string, value: string | undefined): void {
  if (value) el.setAttribute(name, value);
  else el.removeAttribute(name);
}

export class JdAvatarStack extends JdElement {
  static override tag = "jd-avatar-stack";
  static override props = {
    /** 최대 표시 수. 초과분은 "+N" 배지 하나로 접힌다 (v2 기본 4) */
    max: { type: Number, default: 4 },
    /** xs | sm | md | lg | xl — <jd-avatar>에 그대로 전달 (v2 기본 sm) */
    size: { type: String, default: "sm", reflect: true },
    /** 목록의 접근 이름. 없으면 이름을 붙이지 않는다(가짜 라벨 금지) */
    label: { type: String },
  };

  declare max: number;
  declare size: string;
  declare label: string;

  #people: JdAvatarStackPerson[] = [];

  get names(): JdAvatarStackPerson[] {
    return this.#people;
  }
  set names(v: JdAvatarStackEntry[]) {
    this.#people = Array.isArray(v) ? v.map(toPerson) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(avatarStackStyles);
    this.#upgradeOwn("names");
    this.#readJson();
    this.setAttribute("role", "list");
    this.update();
  }

  /** 업그레이드 전에 대입된 `names`는 베이스의 #upgradeProps 대상이 아니다(§1.3) */
  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (jd-radio-group 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as unknown;
      if (Array.isArray(parsed))
        this.#people = parsed.map((e) => toPerson(e as JdAvatarStackEntry));
    } catch {
      console.warn("[junds] <jd-avatar-stack> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 실제로 그려지는 아바타 수. max가 0 이하면 전부 배지로 접힌다 */
  get visibleCount(): number {
    const m = Math.floor(Number(this.max));
    const max = Number.isFinite(m) && m > 0 ? m : 0;
    return Math.min(max, this.#people.length);
  }

  /** 배지에 담기는 초과 인원 (0이면 배지 없음) */
  get overflowCount(): number {
    return Math.max(0, this.#people.length - this.visibleCount);
  }

  #buildRow(overflow: boolean): HTMLElement {
    const item = document.createElement("span");
    item.className = "jd-avatar-stack__item";
    item.setAttribute("role", "listitem");
    if (overflow) {
      item.setAttribute("data-overflow", "");
      const more = document.createElement("span");
      more.className = "jd-avatar-stack__more";
      more.setAttribute("aria-hidden", "true"); // "+2"는 장식 — 이름은 아래 숨김 텍스트
      item.append(more);
    } else {
      const avatar = document.createElement("jd-avatar");
      avatar.className = "jd-avatar-stack__avatar";
      avatar.setAttribute("aria-hidden", "true"); // 이니셜·이미지 모두 장식으로 내린다
      item.append(avatar);
    }
    const name = document.createElement("span");
    name.className = "jd-avatar-stack__name"; // 시각적으로 숨김 — CSS
    item.append(name);
    return item;
  }

  protected override update(): void {
    const visible = this.visibleCount;
    const overflow = this.overflowCount;
    const wanted = visible + (overflow > 0 ? 1 : 0);

    // 재구축 판정은 **DOM에서 읽는다** — 캐시 키를 쓰면 첫 update가 무조건 재구축이라
    // SSR/프리렌더 골격 입양(§3.3)이 성립하지 않는다. 행 구조는 아바타/배지 두 종뿐이고
    // 나머지 값은 아래 동기화 루프가 전부 다시 쓴다.
    let rows = Array.from(this.querySelectorAll<HTMLElement>(":scope > .jd-avatar-stack__item"));
    const hasBadge = rows.length > 0 && rows[rows.length - 1]!.hasAttribute("data-overflow");
    if (rows.length !== wanted || hasBadge !== overflow > 0) {
      for (const old of rows) old.remove();
      rows = [];
      for (let i = 0; i < visible; i++) rows.push(this.#buildRow(false));
      if (overflow > 0) rows.push(this.#buildRow(true));
      this.append(...rows);
    }

    rows.forEach((row, i) => {
      const nameEl = row.querySelector<HTMLElement>(".jd-avatar-stack__name")!;
      if (i >= visible) {
        row.querySelector<HTMLElement>(".jd-avatar-stack__more")!.textContent = `+${overflow}`;
        nameEl.textContent = `외 ${overflow}명`;
        return;
      }
      const person = this.#people[i]!;
      const avatar = row.querySelector<HTMLElement>(".jd-avatar-stack__avatar")!;
      setAttr(avatar, "name", person.name);
      setAttr(avatar, "src", person.src);
      setAttr(avatar, "status", person.status);
      avatar.setAttribute("size", this.size || "sm");
      nameEl.textContent = person.name;
    });

    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
  }
}
