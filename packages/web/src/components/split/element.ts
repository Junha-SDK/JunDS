/**
 * <jd-split> — 두 덩어리를 양끝으로 (DEC-052).
 *
 * ## 왜 새 태그인가
 * `<jd-hstack justify="between" align="center" wrap="wrap">`로 같은 결과가 나온다.
 * 문제는 그 네 단어를 **먼저 알아야** 한다는 것이다. 화면을 짜는 사람이 떠올리는 말은
 * "제목은 왼쪽, 버튼은 오른쪽"이지 "justify-content: space-between"이 아니다.
 * 의도에 이름을 붙이면 CSS 배치 모델을 몰라도 맞는 것을 고를 수 있다.
 *
 * ## 사용
 * ```html
 * <jd-split>
 *   <jd-heading level="3">주문 내역</jd-heading>
 *   <jd-group><jd-button>내보내기</jd-button><jd-button>새로 만들기</jd-button></jd-group>
 * </jd-split>
 * ```
 *
 * children이 셋 이상이면 균등 분배된다(space-between 그대로). "하나만 왼쪽, 나머지
 * 오른쪽"이 필요하면 위 예시처럼 오른쪽을 `<jd-group>`으로 묶는다 — 규칙을 하나 더
 * 만드는 것보다 묶는 편이 읽는 사람에게 분명하다.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import splitStyles from "./split.css.js";

export class JdSplit extends JdBox {
  static override tag = "jd-split";
  static override styles = splitStyles;
  static override props = {
    ...STYLE_PROPS,
    /** 좁아져도 줄바꿈하지 않는다 (attr: no-wrap) */
    noWrap: { type: Boolean, reflect: true },
  };

  declare noWrap: boolean;
}
