/**
 * <jd-grid-layout> — grid 컨테이너 (v2 core/GridLayout). 기본 cols 1 · gap md는 base CSS.
 * R12 단일 구현: layout Grid의 auto-fit/auto-fill·SimpleGrid의 min-child-width까지
 * 이 클래스가 수용하고, <jd-grid>/<jd-simple-grid>는 태그 별칭 파생이다 (DECISIONS B2).
 * 우선순위: autoFit > autoFill > minChildWidth > cols(스타일 프롭) — v2 분기 동형.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import gridLayoutStyles from "./grid-layout.css.js";

export class JdGridLayout extends JdBox {
  static override tag = "jd-grid-layout";
  static override styles = gridLayoutStyles;
  static override props = {
    ...STYLE_PROPS,
    autoFit: { type: Number },       // repeat(auto-fit, minmax(Npx, 1fr))
    autoFill: { type: Number },      // repeat(auto-fill, minmax(Npx, 1fr))
    minChildWidth: { type: Number }, // SimpleGrid 표면 — auto-fill과 동형
  };

  declare autoFit: number;
  declare autoFill: number;
  declare minChildWidth: number;

  #gtcOverridden = false;

  protected override update(): void {
    super.update(); // 스타일 프롭(cols 포함) 반영
    const min = this.autoFit || this.autoFill || this.minChildWidth;
    if (min > 0) {
      const mode = this.autoFit ? "auto-fit" : "auto-fill";
      this.style.setProperty("grid-template-columns", `repeat(${mode}, minmax(${min}px, 1fr))`);
      this.#gtcOverridden = true;
    } else if (this.#gtcOverridden) {
      this.#gtcOverridden = false;
      // cols 프롭이 있으면 super.update()가 이미 재설정했다 — 없을 때만 제거
      if (!this.cols) this.style.removeProperty("grid-template-columns");
    }
  }
}
