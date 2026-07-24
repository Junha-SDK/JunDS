/**
 * <jd-hot-pct-chip> — "급등" 강조 칩 (v2 finance/PriceBadge의 HotPctChip).
 *
 * v2: up색 세로 그라디언트 알약(위=up 72%+흰색, 아래=up 원색), 흰 글자 800/12px,
 * "↑ {pct.toFixed(2)}%". 늘 상승 표시라 부호·색 분기가 없다 — 같은 파일의 PriceBadge와
 * 골격이 겹치지 않아(알약 vs 인라인 아이콘) 독립 구현한다.
 *
 * 번역: up색을 finance 폴백 체인(--jd-finance-up)으로 옮긴다. 값은 텍스트 노드 하나로
 * 그리고 update()에서 갱신 — DOM 재생성 없음. toFixed(2)는 로케일 비의존이라 프리렌더
 * 스냅샷이 결정적이다(§3.1-3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import hotPctChipStyles from "./hot-pct-chip.css.js";

export class JdHotPctChip extends JdElement {
  static override tag = "jd-hot-pct-chip";
  static override props = {
    /** 등락률(%) — 표시는 항상 "↑ n%" */
    pct: { type: Number },
  };

  declare pct: number;

  #node!: Text;

  protected render(): void {
    adoptStyles(hotPctChipStyles);
    const existing = this.firstChild;
    this.#node = existing instanceof Text ? existing : this.ownerDocument.createTextNode("");
    if (this.#node.parentNode !== this) this.replaceChildren(this.#node);
    this.update();
  }

  protected override update(): void {
    const pct = Number.isFinite(this.pct) ? this.pct : 0;
    const text = `↑ ${pct.toFixed(2)}%`;
    if (this.#node.data !== text) this.#node.data = text;
  }
}
