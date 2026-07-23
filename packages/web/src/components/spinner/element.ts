/**
 * <jd-spinner> — 로딩 스피너 (v2 primitives/Spinner). jd-button 스피너와 동일 SVG.
 * role=status + aria-label(기본 "로딩 중").
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import spinnerStyles from "./spinner.css.js";

const SPINNER_SVG =
  `<svg class="jd-spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

export class JdSpinner extends JdElement {
  static override tag = "jd-spinner";
  static override props = {
    size: { type: String, default: "md", reflect: true },       // xs | sm | md | lg
    color: { type: String, default: "primary", reflect: true }, // primary | white | muted
    label: { type: String, default: "로딩 중" },
  };

  declare size: string;
  declare color: string;
  declare label: string;

  protected render(): void {
    adoptStyles(spinnerStyles);
    if (!this.querySelector(":scope > .jd-spinner__svg")) this.innerHTML = SPINNER_SVG;
    this.setAttribute("role", "status");
    this.update();
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
  }
}
