/**
 * <jd-photo-grid> — 사진 배열 컨테이너 (v2 composites/PhotoGrid).
 * uniform(균등 반응형) · masonry(폭만 같음) · mosaic(첫 항목 2×2 강조) 3종.
 *
 * **JdBox 파생**(§6 R12 · jd-card 선례): v2의 `gap` 프롭(1|2|3|4)은 스타일 프롭 `gap`과
 * 값이 정확히 같다(Tailwind gap-2 0.5rem == --jd-space-2). 기반의 스타일 프롭을 그대로
 * 쓰면 v2 표면이 공짜로 성립하고, 덤으로 반응형(`gap="2 md:4"`)과 p·maxW 같은 탈출구가
 * 붙는다 — 전용 gap 프롭을 새로 만들면 그 전부를 잃는다.
 *
 * jd-grid-layout이 아니라 jd-box를 상속하는 이유: grid-layout은 auto-fit/auto-fill/
 * minChildWidth 3프롭이 grid-template-columns를 인라인으로 덮어쓰고 `display: grid`를
 * 못박는다. 여기 masonry는 grid가 아니라 multicol이고, 컬럼 수는 v2의 **반응형 사다리**
 * (base/sm/lg)라 인라인 1값으로 표현되지 않는다 — 두 축이 정면으로 충돌한다.
 *
 * layout·columns는 reflect되어 CSS가 전부 처리한다 — JS 분기 없음(§4.3).
 * 그래서 이 클래스에는 update()도 render()도 없다.
 */
import { JdBox } from "../box/element.js";
import photoGridStyles from "./photo-grid.css.js";

export class JdPhotoGrid extends JdBox {
  static override tag = "jd-photo-grid";
  static override styles = photoGridStyles;
  static override props = {
    ...JdBox.props,
    /** uniform | masonry | mosaic */
    layout: { type: String, default: "uniform", reflect: true },
    /** 2 | 3 | 4 | 5 — 기본 3(반영되지 않는 기본값이므로 base 규칙이 담당, §1.3) */
    columns: { type: Number, default: 3, reflect: true },
  };

  declare layout: string;
  declare columns: number;
}
