/**
 * <jd-logo-cloud> — "사용 중인 회사들" 로고 그리드/마퀴 (v2 composites/LogoCloud).
 *
 * 로고 목록 입력 2경로(§1.3 — 복합 데이터 attribute 금지):
 *  1. `logos` 프로퍼티 (Array<{name, src?, href?}>)
 *  2. 선언적 초기화: 자식 <script type="application/json">[…]</script> 슬롯(WEB-03 예외)
 *
 * layout(grid·marquee)·columns은 호스트 속성이 CSS 훅. 회색조는 기본 ON이며
 * `no-grayscale` 속성으로 해제한다(Boolean은 존재=true라 default:true를 못 끄므로 반전).
 * 내부적으로는 파생 `data-grayscale`(회색조 ON일 때만 존재)가 CSS 훅. marquee는 무한
 * 루프를 위해 셀을 2벌 렌더하고 복제본은 aria-hidden(스크린리더 중복 차단) —
 * prefers-reduced-motion에서는 애니메이션을 멈춘다(§8).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import logoCloudStyles from "./logo-cloud.css.js";

export interface JdLogoItem {
  name: string;
  src?: string;
  href?: string;
}

export class JdLogoCloud extends JdElement {
  static override tag = "jd-logo-cloud";
  static override props = {
    title: { type: String },
    columns: { type: Number, default: 5, reflect: true }, // 3 | 4 | 5 | 6
    noGrayscale: { type: Boolean }, // no-grayscale 속성으로 회색조 해제. 기본 회색조 ON
    layout: { type: String, default: "grid", reflect: true }, // grid | marquee
  };

  declare title: string;
  declare columns: number;
  declare noGrayscale: boolean;
  declare layout: string;

  #titleEl!: HTMLElement;
  #viewport!: HTMLDivElement;
  #logos: JdLogoItem[] = [];
  #sig = "";

  get logos(): JdLogoItem[] {
    return this.#logos;
  }
  set logos(v: JdLogoItem[]) {
    this.#logos = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(logoCloudStyles);
    // 선언적 JSON 슬롯 — 1회 소비
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdLogoItem[];
        if (Array.isArray(parsed)) this.#logos = parsed;
      } catch {
        console.warn("[junds] <jd-logo-cloud> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    // 입양(§3.3)
    const vp = this.querySelector<HTMLDivElement>(":scope > .jd-logo-cloud__viewport");
    if (vp) {
      this.#titleEl = this.querySelector<HTMLElement>(".jd-logo-cloud__title")!;
      this.#viewport = vp;
    } else {
      this.#titleEl = document.createElement("div");
      this.#titleEl.className = "jd-logo-cloud__title";
      this.#viewport = document.createElement("div");
      this.#viewport.className = "jd-logo-cloud__viewport";
      this.append(this.#titleEl, this.#viewport);
    }
    this.update();
  }

  #buildCell(item: JdLogoItem, decorative: boolean): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-logo-cloud__item";
    cell.title = item.name;
    if (item.src) {
      const img = document.createElement("img");
      img.className = "jd-logo-cloud__img";
      img.src = item.src;
      img.alt = decorative ? "" : item.name;
      img.loading = "lazy";
      cell.append(img);
    } else {
      const label = document.createElement("span");
      label.className = "jd-logo-cloud__label";
      label.textContent = item.name;
      cell.append(label);
    }
    if (item.href) {
      const a = document.createElement("a");
      a.className = "jd-logo-cloud__link";
      a.href = item.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      if (decorative) {
        a.setAttribute("aria-hidden", "true");
        a.tabIndex = -1;
      } else {
        a.setAttribute("aria-label", item.name);
      }
      a.append(cell);
      return a;
    }
    if (decorative) cell.setAttribute("aria-hidden", "true");
    return cell;
  }

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;
    this.toggleAttribute("data-grayscale", !this.noGrayscale);

    const marquee = this.layout === "marquee";
    const sig = JSON.stringify([this.#logos, marquee]);
    if (sig === this.#sig) return;
    this.#sig = sig;

    this.#viewport.textContent = "";
    if (marquee) {
      this.#viewport.setAttribute("aria-label", "logos");
      const track = document.createElement("div");
      track.className = "jd-logo-cloud__track";
      for (const item of this.#logos) track.append(this.#buildCell(item, false));
      for (const item of this.#logos) track.append(this.#buildCell(item, true)); // 이음매 없는 루프용 복제
      this.#viewport.append(track);
    } else {
      this.#viewport.removeAttribute("aria-label");
      for (const item of this.#logos) this.#viewport.append(this.#buildCell(item, false));
    }
  }
}
