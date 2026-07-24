/**
 * <jd-collapsible> — 접기/펼치기 단일 항목 (v2 composites/Collapsible) = **jd-disclosure 별칭 파생**.
 *
 * v2 Collapsible과 Disclosure는 같은 것을 두 번 만든 결과였다. 차이는 표면뿐이고
 * (Collapsible은 `trigger` 프롭 + 항상 애니메이션, Disclosure는 compound 파트 +
 * hidden 토글) 상태 기계·개폐 관용구는 동일했다. v3는 원형 하나만 두고
 * 태그와 스킨만 다르게 낸다(§6 R12 · DEC-023-5 Switch=Toggle 선례).
 *
 * v2 대비 그대로 얻는 것: aria-controls/id 결선(v2 Collapsible에는 aria-expanded만
 * 있고 가리키는 대상이 없었다) · role=region · 닫힌 본문의 탭 순서 제외 ·
 * 트리거에 버튼/링크를 넣어도 중첩 버튼이 되지 않는 것.
 *
 * v2 `aria-label` 프롭 → 원형의 `label` 프롭. v2가 라벨 없을 때 넣던 "토글" 폴백은
 * 이식하지 않았다 — 트리거 텍스트가 곧 접근 이름이고, 비어 있는데 "토글"이라고
 * 읽어 주는 것은 AT 사용자에게 아무 정보도 아니다.
 */
import { JdDisclosure } from "../disclosure/element.js";
import { adoptStyles } from "../../core/styles.js";
import collapsibleStyles from "./collapsible.css.js";

export class JdCollapsible extends JdDisclosure {
  static override tag = "jd-collapsible";
  static override props = { ...JdDisclosure.props };

  protected override render(): void {
    super.render();
    adoptStyles(collapsibleStyles);
  }
}
