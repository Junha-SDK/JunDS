/**
 * <jd-virtual-list> — 고정 높이 항목 가상 리스트 (v2 patterns/VirtualList) = **jd-virtual-scroll 파생**.
 *
 * v2의 VirtualList(패턴)와 VirtualScroll(컴포짓)은 같은 컴포넌트였다 — `items` ·
 * `itemHeight` · `height` · `overscan` · `renderItem` · `keyExtractor`로 고정 높이 항목을
 * 가상화한다. 두 파일의 알고리즘 차이는 배치 방식뿐이었고(VirtualList=positioned
 * translateY, VirtualScroll=행별 top), v3 jd-virtual-scroll이 이미 그 둘을 통합해
 * **행 재사용 · transform 배치 · role=list · 결정적 render**로 정본화했다. 그래서 §6 R12대로
 * 여기서는 태그 별칭만 두고 골격은 상속한다. v2의 두 이름 모두 무수정으로 산다.
 *
 * 판단 2건:
 * 1. **v2 `keyExtractor`는 무대응이 정답이다.** 그 프롭은 React 재조정 키 용도였는데,
 *    jd-virtual-scroll은 창 안 행을 **인덱스로 재사용**하므로(§WEB-02, VDOM 없음) 키가
 *    필요 없다. React 어댑터 표면 호환을 위해 property로 받아 두되 동작에는 쓰지 않는다
 *    (값을 무시해도 렌더 결과가 같다). attribute로는 노출하지 않는다(함수 — §1.3).
 * 2. **호스트 셀렉터는 태그별이라 상속되지 않는다.** jd-virtual-scroll 시트의 host 규칙
 *    (display·overflow·height 변수)은 `jd-virtual-scroll` 태그에만 붙는다 — 내부
 *    `.jd-virtual-scroll__*` 클래스 규칙은 그대로 상속되므로, 여기서는 host 규칙만
 *    같은 태그로 다시 깐다(jd-drawer가 .jd-modal__panel 기하만 덮는 것과 같은 최소 델타).
 */
import { JdVirtualScroll } from "../virtual-scroll/element.js";
import { adoptStyles } from "../../core/styles.js";
import virtualListStyles from "./virtual-list.css.js";

export type { JdVirtualItemContent, JdVirtualRenderItem } from "../virtual-scroll/element.js";

export class JdVirtualList extends JdVirtualScroll {
  static override tag = "jd-virtual-list";

  /** v2 표면 호환 — jd-virtual-scroll은 인덱스 기반 행 재사용이라 키가 불필요(무시, 판단 1) */
  keyExtractor: ((item: unknown, index: number) => string) | null = null;

  protected override render(): void {
    super.render(); // 베이스 시트(내부 클래스) + 골격 + update()
    adoptStyles(virtualListStyles); // host 규칙만 같은 태그로 재선언(판단 2)
  }
}
