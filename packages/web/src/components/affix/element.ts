/**
 * <jd-affix> — 뷰포트에 고정되는 컨테이너 (v2 composites/Affix).
 *
 * v2 표면은 `position={{ top?, bottom?, left?, right? }}` 객체 1개였다. 객체는
 * attribute로 받을 수 없으므로(§3) **네 변을 각각 Number 프롭**으로 폈고,
 * "미지정"과 0을 구별해야 하므로(0은 유효한 오프셋) `default: NaN` 센티널을 쓴다.
 *
 * v2 기본값 `{ bottom: 20, right: 20 }`은 **객체 전체가 없을 때만** 적용됐다
 * (스프레드라 `{ top: 10 }`을 주면 bottom/right가 사라졌다). 그 의미론을 지킨다:
 * 네 변 중 하나라도 지정되면 기본 쌍은 적용하지 않는다.
 *
 * 값은 longhand가 아니라 --jd-affix-* 커스텀 프로퍼티로 낸다. 인라인 longhand는
 * 소비자 CSS가 !important 없이 못 이기지만(오버라이드 서열 계약 위반), 커스텀
 * 프로퍼티는 규칙이 @layer 안에 남아 서열이 유지된다. **네 변을 항상 전부 쓴다**
 * (미지정은 auto) — 커스텀 프로퍼티는 상속되므로 중첩 시 부모 값이 새어 들어온다.
 *
 * <jd-sticky>가 이 클래스를 파생한다 — 오프셋 기록기는 같고 position 키워드와
 * 기본값만 다르다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import type { JdStyles } from "../../core/styles.js";
import affixStyles from "./affix.css.js";

export type JdAffixSide = "top" | "bottom" | "left" | "right";

const SIDES: readonly JdAffixSide[] = ["top", "bottom", "left", "right"];

/** 유한수만 "지정됨" — NaN 센티널·null·Infinity를 한 곳에서 걸러낸다 */
const inset = (v: number): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export class JdAffix extends JdElement {
  static override tag = "jd-affix";
  /** 파생(Sticky)이 자기 시트로 교체한다 — jd-box 선례 */
  static styles: JdStyles = affixStyles;
  /** 네 변이 모두 미지정일 때 적용할 오프셋(px). v2 Affix = 우하단 20 */
  static defaultInset: Record<JdAffixSide, number | null> = {
    top: null,
    bottom: 20,
    left: null,
    right: 20,
  };
  static override props = {
    top: { type: Number, default: NaN },
    bottom: { type: Number, default: NaN },
    left: { type: Number, default: NaN },
    right: { type: Number, default: NaN },
    /** attr: z-index. v2 Affix 기본 40 */
    zIndex: { type: Number, default: 40 },
  };

  declare top: number;
  declare bottom: number;
  declare left: number;
  declare right: number;
  declare zIndex: number;

  protected render(): void {
    adoptStyles((this.constructor as typeof JdAffix).styles);
    this.update();
  }

  protected override update(): void {
    const fallback = (this.constructor as typeof JdAffix).defaultInset;
    const given = SIDES.map((side) => inset(this[side]));
    const explicit = given.some((v) => v !== null);
    SIDES.forEach((side, i) => {
      const px = given[i] ?? (explicit ? null : fallback[side]);
      this.style.setProperty(`--jd-affix-${side}`, px === null ? "auto" : `${px}px`);
    });
    const z = inset(this.zIndex);
    if (z === null) this.style.removeProperty("--jd-affix-z");
    else this.style.setProperty("--jd-affix-z", String(z));
  }
}
