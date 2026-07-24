/**
 * <jd-result> — 결과/상태 화면 (v2 composites/Result) = EmptyState 파생.
 * 골격(아이콘·제목·설명·액션)이 같고 status별 큰 아이콘만 다르다(§6 R12).
 */
import { JdEmptyState } from "../empty-state/element.js";
import resultStyles from "./result.css.js";

const S = `stroke="currentColor" stroke-width="2.5"`;
const ICONS: Record<string, string> = {
  success: `<circle cx="32" cy="32" r="30" ${S}/><path d="M20 33l8 8 16-16" ${S} stroke-linecap="round" stroke-linejoin="round"/>`,
  error: `<circle cx="32" cy="32" r="30" ${S}/><path d="M22 22l20 20M42 22L22 42" ${S} stroke-linecap="round"/>`,
  warning: `<path d="M32 6L2 58h60L32 6z" ${S} stroke-linejoin="round"/><path d="M32 26v14" ${S} stroke-linecap="round"/><circle cx="32" cy="47" r="1.5" fill="currentColor"/>`,
  info: `<circle cx="32" cy="32" r="30" ${S}/><path d="M32 28v16" ${S} stroke-linecap="round"/><circle cx="32" cy="20" r="1.5" fill="currentColor"/>`,
};

export class JdResult extends JdEmptyState {
  static override tag = "jd-result";
  static override styles = resultStyles;
  static override props = {
    ...JdEmptyState.props,
    /** success | error | warning | info | 404 | 403 */
    status: { type: String, default: "info", reflect: true },
  };

  declare status: string;

  protected override baseClass = "jd-empty-state"; // 골격 클래스는 공유

  protected override defaultIcon(): string {
    // 404·403은 전용 그림 대신 info 도형 + 코드 텍스트로 — v2의 얼굴 일러스트는
    // 정보 없는 장식이라 승계하지 않는다(코드 자체가 더 정확한 안내다)
    const body = ICONS[this.status] ?? ICONS.info!;
    return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">${body}</svg>`;
  }
}
