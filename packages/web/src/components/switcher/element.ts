/**
 * <jd-switcher> — 자리가 좁으면 알아서 세로로 쌓이는 배치 (DEC-052).
 *
 * ## 왜 새 태그인가
 * "넓으면 나란히, 좁으면 위아래"는 가장 흔한 반응형 요구인데, 지금까지는 그걸 적으려면
 * 브레이크포인트를 **직접 고르고** `direction="row md:column"` 같은 식으로 두 상태를
 * 손으로 적어야 했다. 어느 폭에서 꺾을지는 사실 콘텐츠가 정하는 것이라 처음 쓰는 사람이
 * 맞게 고르기 어렵고, 골라도 그 컴포넌트를 좁은 자리로 옮기면 다시 틀린다.
 *
 * 이 태그는 브레이크포인트를 **고르지 않아도** 동작한다. 기본값으로 두면 자기 자리가
 * 좁아지는 순간 스스로 쌓인다.
 *
 * ```html
 * <jd-switcher>
 *   <jd-card>왼쪽</jd-card>
 *   <jd-card>오른쪽</jd-card>
 * </jd-switcher>
 * ```
 *
 * 꺾이는 지점을 조정하고 싶을 때만 `threshold`를 준다(브레이크포인트 이름). 토큰 척도
 * 밖의 값이 필요하면 `--jd-switcher-threshold`를 직접 설정한다 — 단, 그 순간 그 값은
 * 토큰이 아니라 그 화면만의 숫자가 된다.
 *
 * ⚠️ `calc((임계값 - 100%) * 999)`는 **길이**여야 한다. `--jd-switcher-threshold`에
 * 단위 없는 수(`640`)를 넣으면 계산이 무효가 되어 배치가 조용히 한 줄로 남는다.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import switcherStyles from "./switcher.css.js";

export class JdSwitcher extends JdBox {
  static override tag = "jd-switcher";
  static override styles = switcherStyles;
  static override props = {
    ...STYLE_PROPS,
    /** 꺾이는 폭 — sm | md | lg | xl | 2xl (기본 sm) */
    threshold: { type: String, reflect: true },
  };

  declare threshold: string;
}
