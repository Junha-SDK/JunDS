/**
 * <jd-page-empty-state> — 페이지 폭 빈 상태 카드 (v2 finance/PageEmptyState).
 *
 * v2는 EmptyState를 `.bm-card`로 감싸고 size별 패딩만 얹은 얇은 래퍼였다. 골격
 * (아이콘·제목·설명·액션)이 jd-empty-state와 같으므로 **파생**한다(§6 R12 — Result가
 * EmptyState를 파생하는 것과 동일한 판단). 이 클래스가 더하는 것은 셋뿐이다:
 *   - host를 카드로(배경·테두리·라운드), size로 패딩 3단
 *   - `emoji` 프롭 → 아이콘 자리에 큰 이모지(v2 resolvedIcon 분기)
 *   - baseClass는 "jd-empty-state" 그대로 — 내부 클래스 규칙·슬롯(icon/action)을 승계
 */
import { JdEmptyState } from "../empty-state/element.js";
import pageEmptyStateStyles from "./page-empty-state.css.js";

export class JdPageEmptyState extends JdEmptyState {
  static override tag = "jd-page-empty-state";
  static override styles = pageEmptyStateStyles;
  static override props = {
    ...JdEmptyState.props,
    /** sm | md | lg — host 패딩 3단 (v2 PADDING) */
    size: { type: String, default: "md", reflect: true },
    /** 아이콘 슬롯이 없을 때 아이콘 자리에 놓는 이모지 */
    emoji: { type: String, default: "" },
  };

  declare size: string;
  declare emoji: string;

  protected override baseClass = "jd-empty-state"; // 골격 클래스는 공유

  /** emoji가 있으면 큰 이모지, 없으면 EmptyState 기본 도형(v2는 null이었지만
   *  아이콘 없는 빈 상태보다 기본 도형이 안내에 낫다 — 의도적 개선) */
  protected override defaultIcon(): string {
    if (this.emoji) {
      return `<span class="jd-page-empty-state__emoji" aria-hidden="true">${this.emoji}</span>`;
    }
    return super.defaultIcon();
  }
}
