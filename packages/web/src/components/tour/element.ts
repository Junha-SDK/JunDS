/**
 * <jd-tour> — 단계별 가이드 투어 오버레이 (v2 patterns/Tour).
 *
 * 골격은 jd-spotlight의 SVG 마스크 관용구를 그대로 잇고(대상만 남기고 화면을 덮는
 * 컷아웃), 그 위에 단계 이동 팝오버를 얹는다. 파생(extends)이 아니라 관용구 승계인
 * 이유: jd-spotlight의 측정·컷아웃 상태는 전부 private(#)이라 서브클래스가 만질 수
 * 없고, 투어의 팝오버(제목·설명·이전/다음/완료·카운터)는 spotlight 콘텐츠 슬롯과
 * 구조가 다르다. 측정·리스너·마스크 규율만 동일하게 따른다.
 *
 * SVG는 전부 createElementNS로 만든다(§6-1 네임스페이스 함정). mask id는 jdUid로
 * 문서 유일(두 투어가 같은 마스크를 참조하는 v2 버그 회피 — spotlight 선례).
 *
 * 결정적 render(§3.1-3): render()는 절대 측정하지 않는다. 컷아웃 초기값은 0×0이고
 * 첫 측정은 connected() 이후. getBoundingClientRect는 뷰포트에 의존하므로 render에
 * 두면 SSG 스냅샷이 흔들린다.
 *
 * v2 대비 교정(접근성):
 *  1. **ESC·포커스 감금이 없었다** — 오버레이가 떠도 뒤 페이지로 Tab이 샜다.
 *     v3는 createFocusTrap(팝오버 감금) + ESC 닫기 + ←/→ 단계 이동.
 *  2. **좌표계 혼선** — v2는 컷아웃을 문서 좌표(scrollY 합산)로, 오버레이는 fixed로
 *     그려 스크롤 시 구멍이 어긋났다. v3는 양쪽 다 뷰포트 좌표로 통일(spotlight 교정).
 *
 * 복합 데이터(§1.3): `steps`는 property 전용 + 자식 `<script type="application/json">`.
 *
 * 이벤트(§1.5):
 *  - `jd-close` — 닫기/ESC/완료(cancelable 아님 — 요청형은 modal 몫)
 *  - `jd-step-change` {current}
 *  - `jd-finish` — 마지막 단계 완료 버튼
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on } from "../../behaviors/input.js";
import { createFocusTrap, type FocusTrap } from "../../behaviors/focus-trap.js";
import { createWindowSizeWatcher, createSizeObserver } from "../../behaviors/viewport.js";
import type { Behavior } from "../../behaviors/types.js";
import tourStyles from "./tour.css.js";

export interface JdTourStep {
  /** 강조 대상 CSS 셀렉터 */
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const SVG_NS = "http://www.w3.org/2000/svg";

export class JdTour extends JdElement {
  static override tag = "jd-tour";
  static override props = {
    open: { type: Boolean, reflect: true },
    current: { type: Number, reflect: true },
    /** 컷아웃 여백(px). v2 padding=6 */
    padding: { type: Number, default: 6 },
    /** 컷아웃 모서리 반경(px). v2 rx=6 */
    radius: { type: Number, default: 6 },
    /** 팝오버-대상 간격(px). v2 gap=12 */
    gap: { type: Number, default: 12 },
    /** 딤 불투명도. v2 rgba(0,0,0,0.5) */
    dim: { type: Number, default: 0.5 },
    prevLabel: { type: String, default: "이전" },
    nextLabel: { type: String, default: "다음" },
    finishLabel: { type: String, default: "완료" },
    closeLabel: { type: String, default: "닫기" },
  };

  declare open: boolean;
  declare current: number;
  declare padding: number;
  declare radius: number;
  declare gap: number;
  declare dim: number;
  declare prevLabel: string;
  declare nextLabel: string;
  declare finishLabel: string;
  declare closeLabel: string;

  #steps: JdTourStep[] = [];

  #svg!: SVGSVGElement;
  #sheet!: SVGRectElement;
  #cutout!: SVGRectElement;
  #dimRect!: SVGRectElement;
  #popover!: HTMLElement;
  #titleEl!: HTMLElement;
  #descEl!: HTMLElement;
  #counter!: HTMLElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;
  #finishBtn!: HTMLButtonElement;
  #closeBtn!: HTMLButtonElement;

  #trap: FocusTrap | null = null;
  #offs: Array<() => void> = [];
  #targetObserver: Behavior | null = null;
  #observed: Element | null = null;
  #rect: DOMRect | null = null;
  #wasOpen = false;
  #live = false;

  get steps(): JdTourStep[] {
    return this.#steps;
  }
  set steps(v: JdTourStep[]) {
    this.#steps = Array.isArray(v) ? v.map((s) => ({ ...s })) : [];
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(tourStyles);
    this.#upgradeOwn("steps");
    this.#readJson();

    const existingSvg = this.querySelector<SVGSVGElement>(":scope > .jd-tour__canvas");
    if (existingSvg) {
      this.#svg = existingSvg;
      this.#sheet = existingSvg.querySelector(".jd-tour__sheet")!;
      this.#cutout = existingSvg.querySelector(".jd-tour__cutout")!;
      this.#dimRect = existingSvg.querySelector(".jd-tour__dim")!;
      this.#popover = this.querySelector(":scope > .jd-tour__popover")!;
      this.#adoptPopoverRefs(); // 입양(§3.3): 팝오버 내부 참조를 다시 물어온다 — 없으면 update() 붕괴
    } else {
      this.#buildCanvas();
      this.#buildPopover();
    }
    this.#bindPopover();
    this.update();
  }

  /** 프리렌더/SSR 골격을 입양할 때 팝오버 내부 노드 참조 복구(§3.3) */
  #adoptPopoverRefs(): void {
    const p = this.#popover;
    this.#titleEl = p.querySelector(".jd-tour__title")!;
    this.#descEl = p.querySelector(".jd-tour__desc")!;
    this.#counter = p.querySelector(".jd-tour__counter")!;
    this.#prevBtn = p.querySelector('[data-action="prev"]')!;
    this.#nextBtn = p.querySelector('[data-action="next"]')!;
    this.#finishBtn = p.querySelector('[data-action="finish"]')!;
    this.#closeBtn = p.querySelector('[data-action="close"]')!;
  }

  #buildCanvas(): void {
    const doc = this.ownerDocument;
    this.#svg = doc.createElementNS(SVG_NS, "svg");
    this.#svg.setAttribute("class", "jd-tour__canvas");
    this.#svg.setAttribute("aria-hidden", "true");
    const defs = doc.createElementNS(SVG_NS, "defs");
    const mask = doc.createElementNS(SVG_NS, "mask");
    const maskId = jdUid("jd-tour-mask");
    mask.setAttribute("id", maskId);
    this.#sheet = doc.createElementNS(SVG_NS, "rect");
    this.#sheet.setAttribute("class", "jd-tour__sheet");
    setNs(this.#sheet, { x: "0", y: "0", width: "100%", height: "100%", fill: "#ffffff" });
    this.#cutout = doc.createElementNS(SVG_NS, "rect");
    this.#cutout.setAttribute("class", "jd-tour__cutout");
    setNs(this.#cutout, { fill: "#000000", width: "0", height: "0" });
    mask.append(this.#sheet, this.#cutout);
    defs.append(mask);
    this.#dimRect = doc.createElementNS(SVG_NS, "rect");
    this.#dimRect.setAttribute("class", "jd-tour__dim");
    setNs(this.#dimRect, {
      x: "0",
      y: "0",
      width: "100%",
      height: "100%",
      mask: `url(#${maskId})`,
    });
    this.#svg.append(defs, this.#dimRect);
    this.append(this.#svg);
  }

  #buildPopover(): void {
    this.#popover = document.createElement("div");
    this.#popover.className = "jd-tour__popover";
    this.#popover.setAttribute("role", "dialog");
    this.#popover.setAttribute("aria-modal", "true");

    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-tour__title";
    this.#titleEl.id = jdUid("jd-tour-title");
    this.#descEl = document.createElement("p");
    this.#descEl.className = "jd-tour__desc";
    this.#popover.setAttribute("aria-labelledby", this.#titleEl.id);

    const footer = document.createElement("div");
    footer.className = "jd-tour__footer";
    this.#counter = document.createElement("span");
    this.#counter.className = "jd-tour__counter";
    const actions = document.createElement("div");
    actions.className = "jd-tour__actions";
    this.#prevBtn = this.#actionButton("prev", "jd-tour__btn jd-tour__btn--ghost");
    this.#nextBtn = this.#actionButton("next", "jd-tour__btn jd-tour__btn--primary");
    this.#finishBtn = this.#actionButton("finish", "jd-tour__btn jd-tour__btn--primary");
    this.#closeBtn = this.#actionButton("close", "jd-tour__btn jd-tour__btn--muted");
    actions.append(this.#prevBtn, this.#nextBtn, this.#finishBtn, this.#closeBtn);
    footer.append(this.#counter, actions);

    this.#popover.append(this.#titleEl, this.#descEl, footer);
    this.append(this.#popover);
  }

  #actionButton(action: string, className: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.dataset.action = action;
    return b;
  }

  #bindPopover(): void {
    this.#popover.addEventListener("click", this.#onPopoverClick);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJson(): void {
    if (this.#steps.length > 0) return;
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#steps = parsed.map((s) => ({ ...s }));
    } catch {
      console.warn("[junds] <jd-tour> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#live = true;
    this.#trap = this.own(createFocusTrap(this.#popover, { initialFocus: "[data-autofocus]" }));
    const view = this.ownerDocument.defaultView;
    if (view) {
      this.#offs.push(on(view, "scroll", this.#measure as (e: never) => void, true));
      this.#offs.push(on(view, "keydown", this.#onKeydown as (e: never) => void));
    }
    const size = this.own(createWindowSizeWatcher());
    this.#offs.push(size.subscribe(this.#measure));
    // 최초 연결: render-time update()가 이미 전이를 적용(#wasOpen=true)했고 트랩만
    // 늦게 합류한다. 재연결: disconnected가 #wasOpen을 되돌렸으니 전이를 다시 적용.
    if (this.open && !this.#wasOpen) this.#applyOpenChange(true);
    else if (this.open) {
      this.#trap?.activate();
      this.#measure();
    }
  }

  protected override disconnected(): void {
    if (this.#wasOpen) this.#applyOpenChange(false, { silent: true });
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#targetObserver?.destroy();
    this.#targetObserver = null;
    this.#observed = null;
    this.#live = false;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.#dimRect.setAttribute("fill", `rgba(0, 0, 0, ${clampDim(this.dim)})`);
    this.#cutout.setAttribute("rx", String(Math.max(0, this.radius)));
    this.#syncPopoverContent();

    if (this.open !== this.#wasOpen) {
      this.#applyOpenChange(this.open);
      return;
    }
    if (this.open) this.#measure(); // current/steps 변경 반영
  }

  #applyOpenChange(open: boolean, opts?: { silent?: boolean }): void {
    this.#wasOpen = open;
    if (open) {
      this.#measure();
      this.#trap?.activate();
      if (!opts?.silent) this.emit("jd-open");
    } else {
      this.#trap?.deactivate();
      this.#rect = null;
      this.#observe(null);
      if (!opts?.silent) this.emit("jd-close");
    }
  }

  #currentIndex(): number {
    const n = this.#steps.length;
    if (n === 0) return -1;
    return Math.min(Math.max(0, Math.floor(this.current) || 0), n - 1);
  }

  #syncPopoverContent(): void {
    const idx = this.#currentIndex();
    const step = idx >= 0 ? this.#steps[idx] : undefined;
    const total = this.#steps.length;
    this.#titleEl.textContent = step?.title ?? "";
    this.#descEl.textContent = step?.description ?? "";
    this.#descEl.hidden = !step?.description;
    this.#counter.textContent = total > 0 ? `${idx + 1} / ${total}` : "";

    const isFirst = idx <= 0;
    const isLast = idx >= total - 1;
    this.#prevBtn.textContent = this.prevLabel;
    this.#prevBtn.hidden = isFirst;
    this.#nextBtn.textContent = this.nextLabel;
    this.#nextBtn.hidden = isLast;
    this.#finishBtn.textContent = this.finishLabel;
    this.#finishBtn.hidden = !isLast;
    this.#closeBtn.textContent = this.closeLabel;
    // 초기 포커스 대상은 보이는 주 버튼으로 — 트랩 activate()가 이 표식을 읽는다
    this.#nextBtn.toggleAttribute("data-autofocus", !isLast);
    this.#finishBtn.toggleAttribute("data-autofocus", isLast);
  }

  /* ── 측정·배치 ───────────────────────────────────────────────────── */

  #measure = (): void => {
    if (!this.#live || !this.open) return;
    const idx = this.#currentIndex();
    const step = idx >= 0 ? this.#steps[idx] : undefined;
    const el = step?.target ? this.ownerDocument.querySelector(step.target) : null;
    this.#rect = el ? el.getBoundingClientRect() : null;
    this.#observe(el);
    this.#applyRect();
  };

  #observe(el: Element | null): void {
    if (el === this.#observed) return;
    this.#targetObserver?.destroy();
    this.#targetObserver = null;
    this.#observed = el;
    if (el) this.#targetObserver = createSizeObserver(el, this.#measure);
  }

  #applyRect(): void {
    const rect = this.#rect;
    const pad = Math.max(0, this.padding);
    if (!rect) {
      setNs(this.#cutout, { width: "0", height: "0" });
      this.#positionCentered();
      return;
    }
    setNs(this.#cutout, {
      x: String(rect.left - pad),
      y: String(rect.top - pad),
      width: String(Math.max(0, rect.width + pad * 2)),
      height: String(Math.max(0, rect.height + pad * 2)),
    });
    this.#positionPopover(rect);
  }

  #positionCentered(): void {
    const p = this.#popover.style;
    p.top = "50%";
    p.left = "50%";
    p.transform = "translate(-50%, -50%)";
  }

  #positionPopover(rect: DOMRect): void {
    const idx = this.#currentIndex();
    const placement = (idx >= 0 && this.#steps[idx]?.placement) || "bottom";
    const gap = this.gap;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const p = this.#popover.style;
    switch (placement) {
      case "top":
        p.top = `${rect.top - gap}px`;
        p.left = `${cx}px`;
        p.transform = "translate(-50%, -100%)";
        break;
      case "left":
        p.top = `${cy}px`;
        p.left = `${rect.left - gap}px`;
        p.transform = "translate(-100%, -50%)";
        break;
      case "right":
        p.top = `${cy}px`;
        p.left = `${rect.right + gap}px`;
        p.transform = "translateY(-50%)";
        break;
      case "bottom":
      default:
        p.top = `${rect.bottom + gap}px`;
        p.left = `${cx}px`;
        p.transform = "translateX(-50%)";
        break;
    }
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onPopoverClick = (e: Event): void => {
    const action = (e.target as Element | null)?.closest<HTMLElement>("[data-action]")?.dataset
      .action;
    if (!action) return;
    if (action === "prev") this.#goto(this.#currentIndex() - 1);
    else if (action === "next") this.#goto(this.#currentIndex() + 1);
    else if (action === "finish") {
      this.emit("jd-finish");
      this.#close();
    } else if (action === "close") this.#close();
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (!this.open) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      this.#close();
    } else if (e.key === "ArrowRight") {
      if (this.#currentIndex() < this.#steps.length - 1) this.#goto(this.#currentIndex() + 1);
    } else if (e.key === "ArrowLeft") {
      if (this.#currentIndex() > 0) this.#goto(this.#currentIndex() - 1);
    }
  };

  #goto(index: number): void {
    const n = this.#steps.length;
    if (n === 0) return;
    const next = Math.min(Math.max(0, index), n - 1);
    if (next === this.#currentIndex()) return;
    this.current = next; // reflect + requestUpdate → measure
    this.emit("jd-step-change", { current: next });
  }

  #close(): void {
    if (!this.open) return;
    this.open = false; // update()가 전이 부수효과(트랩 해제·jd-close) 수행
    this.current = 0; // v2 동형 — 닫으면 첫 단계로 복귀
  }

  /* ── 공개 메서드 ─────────────────────────────────────────────────── */

  next(): void {
    this.#goto(this.#currentIndex() + 1);
  }
  prev(): void {
    this.#goto(this.#currentIndex() - 1);
  }
  close(): void {
    this.#close();
  }
}

function setNs(el: Element, attrs: Record<string, string>): void {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}
function clampDim(v: number): number {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
}
