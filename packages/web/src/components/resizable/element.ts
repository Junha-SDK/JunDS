/**
 * <jd-resizable> — 테두리 있는 2분할 + 그립 표식 (v2 composites/Resizable)
 *   = **jd-split-pane 파생**(§6 R12).
 *
 * v2에서 SplitPane과 Resizable은 같은 컴포넌트를 두 번 쓴 것이었다. 차이는 딱 셋:
 *  (a) 기본 범위 min 10 / max 90 (SplitPane은 20/80)
 *  (b) 컨테이너 테두리 + 라운드
 *  (c) 분리대가 6px이고 가운데 알약 그립이 있다
 * 로직은 한 줄도 다르지 않았으므로(둘 다 %, 둘 다 클램프) 여기서는 **기본값과 스킨만**
 * 재정의한다. 포인터 캡처·키보드 조절·role=separator는 원형에서 그대로 따라온다 —
 * v2 Resizable에는 셋 다 없었다.
 *
 * 남은 v2 차이 1건은 의도적으로 버렸다: v2 Resizable은 컨테이너 높이를 주지 않아
 * 패널이 콘텐츠 높이로 늘어났다. 원형이 `height:100%`를 갖고 있고, 높이가 없으면
 * **세로 분할이 성립하지 않는다**(0px 컨테이너에서 %는 무의미). 소비자가 감싸는
 * 요소의 높이를 정하는 것이 정상 사용법이며, 필요하면 `jd-resizable { height: auto }`로
 * 되돌릴 수 있다(레이어 밖 소비자 CSS가 언제나 이긴다 — §4.4).
 */
import { JdSplitPane } from "../split-pane/element.js";
import { adoptStyles } from "../../core/styles.js";
import resizableStyles from "./resizable.css.js";

export class JdResizable extends JdSplitPane {
  static override tag = "jd-resizable";
  static override props = {
    ...JdSplitPane.props,
    minSize: { type: Number, default: 10 },
    maxSize: { type: Number, default: 90 },
  };

  protected override render(): void {
    super.render();
    adoptStyles(resizableStyles);
  }
}
