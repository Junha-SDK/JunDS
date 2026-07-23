/**
 * <jd-severity-badge> — 심각도 뱃지 (v2 primitives/SeverityBadge).
 * ok/warn/danger/info/neutral 5단계, dot은 CSS ::before(DOM 0).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import severityBadgeStyles from "./severity-badge.css.js";

export class JdSeverityBadge extends JdElement {
  static override tag = "jd-severity-badge";
  static override props = {
    severity: { type: String, default: "neutral", reflect: true },
    dot: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md
  };

  declare severity: string;
  declare dot: boolean;
  declare size: string;

  protected render(): void {
    adoptStyles(severityBadgeStyles);
  }
}
