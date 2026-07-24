/**
 * <jd-bento-grid> / <jd-bento-grid-item> — 비대칭 벤토 레이아웃 (v2 composites/BentoGrid).
 * ledger 1행(BentoGrid)에 속하는 2태그 — Dock(2태그)·Page(3태그) 선례.
 *
 * R12 파생: 격자는 <jd-grid-layout>이 이미 전부 갖고 있다(cols·gap·auto-fit/auto-fill·
 * 반응형 마이크로문법). 벤토가 더하는 것은 **행 높이 하나**뿐이라 그것만 재정의한다.
 * 아이템도 마찬가지로 <jd-box> 파생이면 v2의 colSpan/rowSpan이 스타일 프롭으로 그대로
 * 성립한다(`colSpan` → `grid-column: span N`) — 별도 프롭 선언이 없다.
 *
 * v2 대비 3가지:
 *  1. **cols=1과 7 이상이 조용히 4열이 됐다.** v2 colsClass 맵에 2~6만 있어서 그 밖의
 *     값은 `?? "grid-cols-4"` 폴백에 걸렸다. 스타일 프롭은 임의 N을 그대로 받는다.
 *  2. **반응형 열 수가 없었다.** v2는 고정 열이라 좁은 화면에서 4열이 그대로 눌렸다.
 *     v3는 `cols="1 md:4"` 마이크로문법을 그대로 쓴다(§style-props 반응형).
 *  3. `colSpan`이 1|2|3으로 막혀 있던 타입 제약이 사라진다(격자 열 수와 무관하게 동작).
 */
import { JdBox } from "../box/element.js";
import { JdGridLayout } from "../grid-layout/element.js";
import bentoGridStyles from "./bento-grid.css.js";

export class JdBentoGrid extends JdGridLayout {
  static override tag = "jd-bento-grid";
  static override styles = bentoGridStyles;
  static override props = {
    ...JdGridLayout.props,
    /** 행 높이(px). v2 auto-rows-[180px] */
    rowHeight: { type: Number },
  };

  declare rowHeight: number;

  #rowHeightSet = false;

  protected override update(): void {
    super.update(); // 스타일 프롭 + auto-fit/auto-fill
    if (this.rowHeight > 0) {
      this.style.setProperty("grid-auto-rows", `${this.rowHeight}px`);
      this.#rowHeightSet = true;
    } else if (this.#rowHeightSet) {
      this.#rowHeightSet = false;
      this.style.removeProperty("grid-auto-rows"); // CSS 기본 180px으로 복귀
    }
  }
}

export class JdBentoGridItem extends JdBox {
  static override tag = "jd-bento-grid-item";
  static override styles = bentoGridStyles;
}
