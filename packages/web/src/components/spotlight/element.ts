/**
 * <jd-spotlight> — 대상 요소만 남기고 화면을 덮는 강조 오버레이 (v2 composites/Spotlight).
 *
 * SVG 노드는 전부 createElementNS로 만든다 — innerHTML/createElement로 만든 <svg>는
 * HTML 네임스페이스에 들어가 렌더되지 않는다(§6-1 네임스페이스 함정).
 *
 * 프리렌더 결정성(§3.1-3): render()는 **절대 측정하지 않는다**. 최초 골격의 컷아웃은
 * 항상 0×0이고 첫 측정은 connected() 이후 — back-top·junds.page.tsx와 같은 규율이다.
 * getBoundingClientRect는 실행 환경(뷰포트)에 따라 값이 달라지므로 render 단계에
 * 두면 SSG 스냅샷이 흔들린다.
 *
 * v2 대비 개선 3가지:
 *  1. **좌표계를 고쳤다.** v2는 `rect.top + scrollY`(문서 좌표)로 컷아웃을 그리면서
 *     오버레이는 `fixed`(뷰포트 좌표)로 띄웠다 — 스크롤된 페이지에서 구멍이 대상에서
 *     스크롤 양만큼 어긋났다. v3는 양쪽 다 뷰포트 좌표로 통일한다.
 *  2. **mask id가 문서 유일**하다(jdUid). v2는 "spotlight-mask" 고정이라 두 개를 띄우면
 *     둘 다 첫 번째 마스크를 참조했다.
 *  3. 대상 크기 변화도 따라간다(ResizeObserver) — v2는 scroll/resize만 봤다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on } from "../../behaviors/input.js";
import { createWindowSizeWatcher, createSizeObserver } from "../../behaviors/viewport.js";
import type { Behavior } from "../../behaviors/types.js";
import spotlightStyles from "./spotlight.css.js";

const SVG_NS = "http://www.w3.org/2000/svg";
/** v2: 컷아웃 아래 콘텐츠 간격 8px */
const CONTENT_GAP = 8;

export class JdSpotlight extends JdElement {
  static override tag = "jd-spotlight";
  static override props = {
    /** 강조 대상 셀렉터 */
    target: { type: String },
    active: { type: Boolean, reflect: true },
    /** 컷아웃 여백(px). v2 기본 8 */
    padding: { type: Number, default: 8 },
    /** 컷아웃 모서리 반경(px). v2 rx=8 고정 */
    radius: { type: Number, default: 8 },
    /** 딤 불투명도. v2 rgba(0,0,0,0.5) */
    dim: { type: Number, default: 0.5 },
  };

  declare target: string;
  declare active: boolean;
  declare padding: number;
  declare radius: number;
  declare dim: number;

  #cutout: SVGRectElement | null = null;
  #dimRect: SVGRectElement | null = null;
  #content: HTMLElement | null = null;
  #rect: DOMRect | null = null;
  #observed: Element | null = null;
  #targetObserver: Behavior | null = null;
  #offs: Array<() => void> = [];
  #wasActive = false;
  #live = false;

  protected render(): void {
    adoptStyles(spotlightStyles);
    let svg = this.querySelector<SVGSVGElement>(":scope > svg.jd-spotlight__canvas");
    if (!svg) {
      const kids = Array.from(this.childNodes);
      svg = this.#buildCanvas();
      const content = document.createElement("div");
      content.className = "jd-spotlight__content";
      content.append(...kids);
      content.hidden = true;
      this.append(svg, content);
    }
    this.#cutout = svg.querySelector<SVGRectElement>(".jd-spotlight__cutout");
    this.#dimRect = svg.querySelector<SVGRectElement>(".jd-spotlight__dim");
    this.#content = this.querySelector<HTMLElement>(":scope > .jd-spotlight__content");
    this.update();
  }

  #buildCanvas(): SVGSVGElement {
    const doc = this.ownerDocument;
    const svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "jd-spotlight__canvas");
    svg.setAttribute("aria-hidden", "true"); // 딤은 순수 장식 — 콘텐츠는 바깥에 둔다
    const defs = doc.createElementNS(SVG_NS, "defs");
    const mask = doc.createElementNS(SVG_NS, "mask");
    const maskId = jdUid("jd-spotlight-mask");
    mask.setAttribute("id", maskId);
    const sheet = doc.createElementNS(SVG_NS, "rect");
    sheet.setAttribute("x", "0");
    sheet.setAttribute("y", "0");
    sheet.setAttribute("width", "100%");
    sheet.setAttribute("height", "100%");
    sheet.setAttribute("fill", "#ffffff"); // 흰색 = 덮는다
    const cutout = doc.createElementNS(SVG_NS, "rect");
    cutout.setAttribute("class", "jd-spotlight__cutout");
    cutout.setAttribute("fill", "#000000"); // 검정 = 뚫는다
    cutout.setAttribute("width", "0");
    cutout.setAttribute("height", "0");
    mask.append(sheet, cutout);
    defs.append(mask);
    const dim = doc.createElementNS(SVG_NS, "rect");
    dim.setAttribute("class", "jd-spotlight__dim");
    dim.setAttribute("x", "0");
    dim.setAttribute("y", "0");
    dim.setAttribute("width", "100%");
    dim.setAttribute("height", "100%");
    dim.setAttribute("mask", `url(#${maskId})`);
    svg.append(defs, dim);
    return svg;
  }

  protected override connected(): void {
    this.#live = true;
    const view = this.ownerDocument.defaultView;
    if (view) {
      // capture — 내부 스크롤 컨테이너의 스크롤도 잡는다(v2 동형)
      this.#offs.push(on(view, "scroll", this.#measure as (e: never) => void, true));
    }
    const size = this.own(createWindowSizeWatcher());
    this.#offs.push(size.subscribe(this.#measure));
    if (this.active) this.#measure();
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#targetObserver?.destroy();
    this.#targetObserver = null;
    this.#observed = null;
    this.#live = false;
  }

  protected override update(): void {
    this.#dimRect?.setAttribute("fill", `rgba(0, 0, 0, ${this.dim})`);
    this.#cutout?.setAttribute("rx", String(this.radius));
    if (this.active !== this.#wasActive) {
      this.#wasActive = this.active;
      if (this.active) {
        this.#measure();
        this.emit("jd-open");
      } else {
        this.#rect = null;
        this.#applyRect();
        this.emit("jd-close");
      }
      return;
    }
    if (this.active) this.#measure(); // target·padding 변경 반영
  }

  /** 측정은 연결 이후에만 — render 단계에서 레이아웃을 읽지 않는다(§3.1-3) */
  #measure = (): void => {
    if (!this.#live || !this.active) return;
    const el = this.target ? this.ownerDocument.querySelector(this.target) : null;
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
    const cutout = this.#cutout;
    const content = this.#content;
    const rect = this.#rect;
    if (!cutout) return;
    if (!rect) {
      cutout.setAttribute("width", "0");
      cutout.setAttribute("height", "0");
      if (content) content.hidden = true;
      return;
    }
    const pad = this.padding;
    cutout.setAttribute("x", String(rect.left - pad));
    cutout.setAttribute("y", String(rect.top - pad));
    cutout.setAttribute("width", String(Math.max(0, rect.width + pad * 2)));
    cutout.setAttribute("height", String(Math.max(0, rect.height + pad * 2)));
    if (content) {
      content.hidden = content.childNodes.length === 0;
      content.style.top = `${rect.bottom + pad + CONTENT_GAP}px`;
      content.style.left = `${rect.left + rect.width / 2}px`;
    }
  }
}
