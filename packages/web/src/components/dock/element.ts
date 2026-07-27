/**
 * <jd-dock> / <jd-dock-item> — macOS 스타일 확대 독 (v2 composites/Dock + Dock.Item).
 *
 * v2 결함 3건 교정:
 *  1. **이웃이 같이 커지지 않았다.** v2는 확대 계산을 *아이템마다*의 onMouseMove에서
 *     했다 — mousemove는 커서 아래 요소에서만 발생하므로 실제로는 **커서가 얹힌 하나만**
 *     커졌다. 컨테이너가 `--dock-mouse-x`를 기록했지만 아무도 읽지 않았다(죽은 코드).
 *     v3는 컨테이너가 pointermove를 한 번 받아 **전 아이템의 거리별 배율**을 쓴다 —
 *     v2가 의도했던(그리고 macOS가 하는) 동작이다. 공식·계수(120px)는 v2 그대로.
 *  2. **레이아웃 스래싱.** v2는 move마다 getBoundingClientRect를 읽고 setState로
 *     리렌더했다. v3는 pointerenter/리사이즈에서 중심좌표를 1회 측정해 캐시하고,
 *     move 중에는 커스텀 프로퍼티 **쓰기만** 한다(읽기 0 → 강제 리플로 0).
 *  3. **툴팁이 절대 안 보였다.** v2 라벨은 `absolute -top-7`인데 부모 버튼에
 *     position이 없어 기준이 엉뚱했고, `scale > 1.2` 조건이라 키보드로는 못 봤다.
 *     v3는 버튼을 relative로 두고 :hover / :focus-visible에 CSS로 반응한다.
 *
 * 접근성: v2의 role=toolbar를 유지하고 **화살표·Home/End 이동을 추가**한다(v2는
 * role만 있고 키보드 규약이 없었다 — 지키지 않는 약속이었다). 탭 순서는 아이템별
 * 유지(roving tabindex 미도입): 공용 createRovingTabindex Behavior가 아직 없고,
 * 컴포넌트가 개별 재구현하는 것은 §8이 금지한다. Behavior 신설 시 이 자리에 붙인다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import dockStyles from "./dock.css.js";

/** v2 DockItem의 maxDist — 이 거리를 넘으면 배율 1 */
const FALLOFF_PX = 120;

export class JdDockItem extends JdElement {
  static override tag = "jd-dock-item";
  static override props = {
    /** 접근 이름 + 호버 시 뜨는 라벨 */
    label: { type: String },
  };

  declare label: string;

  #btn!: HTMLButtonElement;
  #labelEl!: HTMLElement;

  protected render(): void {
    adoptStyles(dockStyles);
    // 입양 규칙(§3.3)
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-dock-item__button");
    if (existing) {
      this.#btn = existing;
      this.#labelEl =
        existing.querySelector<HTMLElement>(".jd-dock-item__label") ?? this.#buildLabel(existing);
    } else {
      const tile = document.createElement("span");
      tile.className = "jd-dock-item__tile";
      tile.append(...this.childNodes); // 아이콘 children을 타일로 이동
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-dock-item__button";
      this.#btn.append(tile);
      this.#labelEl = this.#buildLabel(this.#btn);
      this.append(this.#btn);
    }
    this.update();
  }

  #buildLabel(btn: HTMLElement): HTMLElement {
    const el = document.createElement("span");
    el.className = "jd-dock-item__label";
    el.setAttribute("aria-hidden", "true"); // 버튼 aria-label과 같은 문자열
    btn.append(el);
    return el;
  }

  protected override update(): void {
    if (this.label) this.#btn.setAttribute("aria-label", this.label);
    else this.#btn.removeAttribute("aria-label");
    this.#labelEl.textContent = this.label;
    this.#labelEl.hidden = !this.label;
  }

  /** 호스트 포커스를 내부 네이티브 버튼으로 위임 (jd-back-top 선례) */
  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}

export class JdDock extends JdElement {
  static override tag = "jd-dock";
  static override props = {
    /** 커서 바로 위 아이템의 최대 배율. v2 기본 1.6 */
    magnification: { type: Number, default: 1.6 },
    /** 툴바의 접근 이름. v2 aria-label="Dock" */
    label: { type: String, default: "Dock" },
  };

  declare magnification: number;
  declare label: string;

  /** 아이템 중심 x좌표 캐시 — pointermove 중에는 읽지 않는다 */
  #centers: number[] = [];

  protected render(): void {
    adoptStyles(dockStyles);
    this.setAttribute("role", "toolbar");
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("pointerenter", this.#onEnter);
    this.addEventListener("pointermove", this.#onMove);
    this.addEventListener("pointerleave", this.#onLeave);
    this.addEventListener("pointercancel", this.#onLeave);
    this.addEventListener("click", this.#onClick);
    // Behavior 수명은 own()이 관리(§1.2) — disconnected 시 자동 destroy
    this.own(createSizeObserver(this, this.#measure));
    this.own(
      createKeyHandler(this, {
        arrowright: () => this.#move(1),
        arrowdown: () => this.#move(1),
        arrowleft: () => this.#move(-1),
        arrowup: () => this.#move(-1),
        home: () => this.#focusAt(0),
        end: () => this.#focusAt(this.#items().length - 1),
      }),
    );
  }

  protected override disconnected(): void {
    this.removeEventListener("pointerenter", this.#onEnter);
    this.removeEventListener("pointermove", this.#onMove);
    this.removeEventListener("pointerleave", this.#onLeave);
    this.removeEventListener("pointercancel", this.#onLeave);
    this.removeEventListener("click", this.#onClick);
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
  }

  #items(): JdDockItem[] {
    return Array.from(this.querySelectorAll<JdDockItem>(":scope > jd-dock-item"));
  }

  /** 레이아웃 읽기는 여기 1곳 — 호버 진입과 리사이즈에서만 (SizeObserver 콜백 시그니처) */
  #measure = (): void => {
    this.#measureItems(this.#items());
  };

  #measureItems(items: JdDockItem[]): void {
    this.#centers = items.map((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  }

  /** 배율 쓰기 전용 — x가 null이면 전부 원래 크기로 */
  #apply(items: JdDockItem[], x: number | null): void {
    const mag = Math.max(1, this.magnification);
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (!el) continue;
      const center = this.#centers[i];
      let scale = 1;
      if (x !== null && center !== undefined) {
        const distance = Math.abs(x - center);
        scale = Math.max(1, mag - (distance / FALLOFF_PX) * (mag - 1)); // v2 공식 그대로
      }
      el.style.setProperty("--jd-dock-scale", scale.toFixed(3));
    }
  }

  #onEnter = (): void => {
    this.#measure();
  };

  #onMove = (e: Event): void => {
    const items = this.#items();
    // 아이템이 늦게 붙었거나 개수가 바뀐 경우의 보정 (업그레이드 순서와 무관하게 안전)
    if (this.#centers.length !== items.length) this.#measureItems(items);
    this.#apply(items, (e as PointerEvent).clientX);
  };

  #onLeave = (): void => {
    this.#apply(this.#items(), null);
  };

  #onClick = (e: Event): void => {
    const el = (e.target as Element | null)?.closest("jd-dock-item");
    if (!el || !this.contains(el)) return;
    const item = el as JdDockItem;
    const index = this.#items().indexOf(item);
    if (index < 0) return;
    this.emit("jd-select", { index, label: item.label });
  };

  #move(delta: number): void {
    const items = this.#items();
    const active = (this.ownerDocument.activeElement as Element | null)?.closest("jd-dock-item");
    const at = active ? items.indexOf(active as JdDockItem) : -1;
    this.#focusAt(at < 0 ? 0 : at + delta);
  }

  #focusAt(index: number): void {
    const items = this.#items();
    if (items.length === 0) return;
    const target = items[((index % items.length) + items.length) % items.length];
    if (!target) return;
    const btn = target.querySelector<HTMLElement>(".jd-dock-item__button");
    (btn ?? target).focus();
  }
}
