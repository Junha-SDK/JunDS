/**
 * <jd-split-pane> — 크기 조절 가능한 2분할 패널의 **원형** (v2 composites/SplitPane).
 * jd-resizable이 기본값과 스킨만 바꿔 파생한다(§6 R12).
 *
 * 슬롯 규약(§1.3): [slot="start"|"left"] → 첫 패널 · [slot="end"|"right"] → 둘째 패널.
 * 무슬롯이면 **첫 엘리먼트가 첫 패널, 그 뒤 전부가 둘째 패널**이다
 * (v2 SplitPane의 left/right 프롭 · v2 Resizable의 children 튜플 양쪽을 덮는다).
 *
 * behaviors/createPanelResize를 쓰지 않는 이유: 그 Behavior는 **화면 가장자리에서
 * px 폭**을 끄는 사이드 패널용이다(window.innerWidth 기준, min/max가 px). 여기 기하는
 * **컨테이너 대비 %**이고 세로 분할도 있어 좌표계가 다르다. 포인터 캡처·body 커서 락
 * 같은 관용구는 그쪽 구현과 동일하게 맞췄다.
 *
 * v2 결함 3건 교정:
 *  1. **드래그가 컨테이너를 벗어나면 끊겼다.** v2 SplitPane은 mousemove/mouseup을
 *     컨테이너에 걸고 onMouseLeave로 드래그를 종료했다 — 조금만 빨리 끌면 손을 놓기도
 *     전에 멈춘다. v3는 pointerdown에서 setPointerCapture로 잡아 커서가 어디로 가든
 *     이어지고, 펜·터치도 함께 산다(DEC-032-5c와 같은 교정).
 *  2. **분리대에 접근성이 전무했다.** role·값·키보드가 없어 마우스 없이는 조절이 불가능했다.
 *     v3는 APG Window Splitter대로 role=separator + aria-valuenow/min/max +
 *     aria-orientation을 주고 ←/→(세로 분할은 ↑/↓) 1%p, Home/End로 최소·최대를 지원한다.
 *  3. **min/max가 역전돼도 그대로 통과했다.** 클램프를 한 곳(#clamp)으로 모았다.
 *
 * 이벤트: 드래그 중 `jd-input`({size}), 확정(포인터 놓음·키 조작) 시 `jd-change`({size}).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import splitPaneStyles from "./split-pane.css.js";

export class JdSplitPane extends JdElement {
  static override tag = "jd-split-pane";
  static override props = {
    /** horizontal(좌우) | vertical(상하) */
    direction: { type: String, default: "horizontal", reflect: true },
    /**
     * 첫 패널 크기(%). v2 defaultSize가 초기값 자리다 — 드래그로 갱신되지만
     * attribute로 되쓰지 않는다(포인터 이동마다 attribute를 쓰면 DOM이 요동친다).
     */
    size: { type: Number, default: 50 },
    minSize: { type: Number, default: 20 },
    maxSize: { type: Number, default: 80 },
    /** 분리대 접근 이름 */
    label: { type: String, default: "크기 조절" },
  };

  declare direction: string;
  declare size: number;
  declare minSize: number;
  declare maxSize: number;
  declare label: string;

  #start: HTMLElement | null = null;
  #sep: HTMLElement | null = null;
  #dragging = false;
  #offs: Array<() => void> = [];

  protected get isVertical(): boolean {
    return this.direction === "vertical";
  }
  protected get separatorEl(): HTMLElement | null {
    return this.#sep;
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(splitPaneStyles);
    // 입양 규칙(§3.3)
    let start = this.querySelector<HTMLElement>(":scope > .jd-split-pane__pane--start");
    let sep = this.querySelector<HTMLElement>(":scope > .jd-split-pane__separator");
    const end = this.querySelector<HTMLElement>(":scope > .jd-split-pane__pane--end");
    if (!start || !sep || !end) {
      const parts = this.#classify();
      start = document.createElement("div");
      start.className = "jd-split-pane__pane jd-split-pane__pane--start";
      start.append(...parts.start);
      sep = document.createElement("div");
      sep.className = "jd-split-pane__separator";
      const grip = document.createElement("span");
      grip.className = "jd-split-pane__grip";
      grip.setAttribute("aria-hidden", "true");
      sep.append(grip);
      const tail = document.createElement("div");
      tail.className = "jd-split-pane__pane jd-split-pane__pane--end";
      tail.append(...parts.end);
      this.append(start, sep, tail);
    }
    this.#start = start;
    this.#sep = sep;
    sep.setAttribute("role", "separator");
    if (!sep.hasAttribute("tabindex")) sep.tabIndex = 0;
    this.update();
  }

  /** children을 두 패널로 분류. 명시 슬롯이 항상 이긴다 (jd-popover 선례) */
  #classify(): { start: Node[]; end: Node[] } {
    const startNodes: Node[] = [];
    const endNodes: Node[] = [];
    let sawFirstElement = false;
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      if (slot === "start" || slot === "left") {
        startNodes.push(node);
        continue;
      }
      if (slot === "end" || slot === "right") {
        endNodes.push(node);
        continue;
      }
      if (sawFirstElement) {
        endNodes.push(node);
      } else {
        startNodes.push(node); // 첫 엘리먼트 앞의 공백 텍스트까지 첫 패널에 붙는다
        if (node.nodeType === 1) sawFirstElement = true;
      }
    }
    return { start: startNodes, end: endNodes };
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    const sep = this.#sep;
    if (sep) {
      this.#offs.push(
        on(sep, "pointerdown", this.#onDown as (e: never) => void),
        on(sep, "pointermove", this.#onMove as (e: never) => void),
        on(sep, "pointerup", this.#onUp as (e: never) => void),
        on(sep, "pointercancel", this.#onUp as (e: never) => void),
      );
      // 분리대에 포커스가 있을 때만 도는 요소 스코프 핸들러 (APG Window Splitter)
      this.own(
        createKeyHandler(sep, {
          arrowleft: () => this.#nudge(-1),
          arrowup: () => this.#nudge(-1),
          arrowright: () => this.#nudge(1),
          arrowdown: () => this.#nudge(1),
          home: () => this.#commit(this.minSize),
          end: () => this.#commit(this.maxSize),
        }),
      );
    }
    // 재부모화 생존 규율(DEC-031-1)
    this.requestUpdate();
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    if (this.#dragging) this.#releaseBody();
    this.#dragging = false;
  }

  protected override update(): void {
    const start = this.#start;
    const sep = this.#sep;
    if (!start || !sep) return;
    const size = this.#clamp(this.size);
    // flex-basis는 주축 길이 — direction 하나로 width/height가 함께 따라온다
    start.style.flexBasis = `${size}%`;
    // 좌우 분할의 분리대는 **세로 막대**다 (role=separator 기본 방향은 horizontal)
    sep.setAttribute("aria-orientation", this.isVertical ? "horizontal" : "vertical");
    sep.setAttribute("aria-valuenow", String(Math.round(size)));
    sep.setAttribute("aria-valuemin", String(Math.round(this.minSize)));
    sep.setAttribute("aria-valuemax", String(Math.round(this.maxSize)));
    if (this.label) sep.setAttribute("aria-label", this.label);
    else sep.removeAttribute("aria-label");
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #clamp(v: number): number {
    const raw = Number.isFinite(v) ? v : 50;
    return Math.max(this.minSize, Math.min(this.maxSize, raw));
  }

  #nudge(delta: 1 | -1): void {
    this.#commit(this.size + delta);
  }

  /** 확정 변경 — 값이 실제로 움직였을 때만 jd-change */
  #commit(next: number): void {
    const size = this.#clamp(next);
    if (size === this.size) return;
    this.size = size;
    this.emit("jd-change", { size });
  }

  #releaseBody(): void {
    const body = this.ownerDocument.body;
    body.style.cursor = "";
    body.style.userSelect = "";
  }

  /* ── 드래그 ──────────────────────────────────────────────── */

  #onDown = (e: PointerEvent): void => {
    const sep = this.#sep;
    if (!sep) return;
    this.#dragging = true;
    sep.setPointerCapture(e.pointerId); // 커서가 분리대를 벗어나도 이어진다(v2 결함 1)
    e.preventDefault(); // 드래그 중 텍스트 선택 방지
    const body = this.ownerDocument.body;
    body.style.cursor = this.isVertical ? "row-resize" : "col-resize";
    body.style.userSelect = "none";
  };

  #onMove = (e: PointerEvent): void => {
    if (!this.#dragging) return;
    const rect = this.getBoundingClientRect();
    const span = this.isVertical ? rect.height : rect.width;
    if (span <= 0) return; // 접힌 컨테이너 — 0 나눗셈 방지
    const raw = this.isVertical
      ? ((e.clientY - rect.top) / span) * 100
      : ((e.clientX - rect.left) / span) * 100;
    const size = this.#clamp(raw);
    if (size === this.size) return;
    this.size = size;
    this.emit("jd-input", { size });
  };

  #onUp = (e: PointerEvent): void => {
    if (!this.#dragging) return;
    this.#dragging = false;
    const sep = this.#sep;
    if (sep?.hasPointerCapture(e.pointerId)) sep.releasePointerCapture(e.pointerId);
    this.#releaseBody();
    this.emit("jd-change", { size: this.size });
  };
}
