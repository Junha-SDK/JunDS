/**
 * <jd-live-pct-badge> — 색까지 칠한 등락률 배지 = **jd-live-pct-text 파생**
 * (v2 finance/LivePrice `LivePctBadge`).
 *
 * v2 LivePctText/LivePctBadge는 부호·퍼센트 포맷이 같고, 배지가 더한 것은 up/flat/down
 * 색과 bold·12px 뿐이다. 그래서 포맷 리프를 상속하고 색만 얹는다(§6 R12). 판정 결과는
 * data-trend로 호스트에 실어 CSS가 색을 고른다(jd-stat data-trend 선례).
 *
 * v2 판정 규칙 보존: `up = change > 0`이 flat보다 **우선**한다 — 아주 작은 양수(+0.003)는
 * 상승(초록)이고, flat(회색)은 [-0.005, 0] 구간뿐이다. 다만 색이 화면의 숫자와 어긋나지
 * 않게 raw change가 아니라 **표시값(fallback 반영)**으로 판정한다(v2는 fallback이 없어
 * 둘이 같았다 — 표면 동형, fallback 사용 시 더 정합).
 */
import { JdLivePctText } from "../live-pct-text/element.js";
import { adoptStyles } from "../../core/styles.js";
import styles from "./live-pct-badge.css.js";

type Trend = "up" | "down" | "flat";

export class JdLivePctBadge extends JdLivePctText {
  static override tag = "jd-live-pct-badge";
  // 프롭 상속: change/fallback/decimals(기본 2)/hideSign/hidePercent 그대로

  protected override render(): void {
    super.render();
    adoptStyles(styles);
  }

  protected override update(): void {
    super.update(); // 부호·퍼센트 도색(포맷 골격 재사용)
    this.setAttribute("data-trend", this.#trend());
  }

  /** v2: up(>0)이 flat(|v|<0.005)보다 우선, 나머지는 down */
  #trend(): Trend {
    const v = this.resolvedValue;
    if (v > 0) return "up";
    if (Math.abs(v) < 0.005) return "flat";
    return "down";
  }
}
