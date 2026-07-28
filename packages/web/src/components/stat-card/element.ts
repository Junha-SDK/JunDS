/**
 * <jd-stat-card> — 통계 카드 (v2 composites/StatCard) = **Stat 파생**.
 *
 * v2 StatCard와 Stat은 "라벨 + 큰 값 + 변화량 + 부가 설명"이라는 같은 골격에 카드
 * 크롬(테두리·radius·패딩·호버)만 더한 관계였다. 그래서 골격은 jd-stat이 갖고 여기서는
 * 크롬과 클릭 표면만 정의한다(§6 R12 — jd-drawer가 jd-modal 기하만 덮는 것과 같다).
 *
 * 판단 3건:
 * 1. **v2 `description`은 Stat의 `hint`와 같은 노드다.** 이름만 다른 같은 프롭이라
 *    노드를 늘리지 않고 hintText()만 재정의한다(description 우선, 없으면 hint).
 *    v2 마크업(`description="…"`)과 Stat 표면(`hint="…"`)이 둘 다 그대로 산다.
 * 2. **v2 onClick은 접근 불가능한 카드였다** — `<div onClick>`에 tabindex도 role도
 *    키보드 경로도 없었다. v3는 `clickable`을 켜면 role="button" + tabindex="0" +
 *    Enter/Space가 붙는다(키 처리는 behaviors/createKeyHandler 재사용 — 새로 만들지 않음).
 *    클릭 자체는 네이티브 click 이벤트가 그대로 버블하므로 `jd-click` 같은 재발명은 없다(§1.5).
 * 3. **change 칩(배경 있는 pill)은 StatCard 고유 표현**이라 여기서만 켠다. Stat·
 *    MetricCard의 변화량은 배경 없는 텍스트다(v2 3종의 실제 차이 그대로).
 */
import { JdStat } from "../stat/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import statCardStyles from "./stat-card.css.js";

export class JdStatCard extends JdStat {
  static override tag = "jd-stat-card";
  static override props = {
    ...JdStat.props,
    /** v2 description — hint와 같은 노드(판단 1) */
    description: { type: String },
    /** 카드 전체를 버튼처럼 다룬다 (v2 onClick의 접근 가능한 표면) */
    clickable: { type: Boolean, reflect: true },
  };

  declare description: string;
  declare clickable: boolean;

  protected override render(): void {
    super.render();
    adoptStyles(statCardStyles);
  }

  protected override hintText(): string {
    return this.description || this.hint;
  }

  protected override connected(): void {
    // clickable 여부는 콜백 안에서 본다 — 프로퍼티가 나중에 켜져도 동작한다.
    // 카드 안의 버튼·링크에 포커스가 있을 때는 그쪽 기본 동작이 정본이므로 비켜준다.
    const activate = (e: KeyboardEvent): void => {
      if (!this.clickable || e.target !== this) return;
      e.preventDefault(); // Space 스크롤 차단 — 우리가 처리한 키에만
      this.click(); // 네이티브 click으로 합류 — 리스너는 하나면 된다(§1.5)
    };
    // preventDefault는 우리가 직접 한다: Behavior 기본값(true)은 매칭 즉시 취소해
    // 카드 안 네이티브 버튼의 Space 활성화까지 막는다.
    this.own(
      createKeyHandler(this, { enter: activate, space: activate }, { preventDefault: false }),
    );
  }

  protected override update(): void {
    super.update();
    if (this.clickable) {
      this.setAttribute("role", "button");
      if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    } else {
      this.removeAttribute("role");
      if (this.getAttribute("tabindex") === "0") this.removeAttribute("tabindex");
    }
  }
}
