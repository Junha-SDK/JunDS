/**
 * <jd-number-formatter> — 로케일 기반 숫자·통화·퍼센트 표기 (v2 primitives/NumberFormatter).
 *
 * - 호스트가 곧 텍스트 노드의 자리다(골격 0). Intl은 (locale, format, currency)에 대해
 *   결정적이라 프리렌더 규칙(§3.1-3)과 충돌하지 않는다 — locale 기본값도 navigator가
 *   아닌 상수 "ko-KR".
 * - decimals 미지정은 NaN 센티널(DEC-029-1). currency에서 자릿수를 지정하지 않으면
 *   Intl 통화 기본값을 쓴다 — v2 `KRW ? 0 : 2` 하드코딩의 0자리 통화 오표기 교정
 *   (DEC-029-8과 같은 판단, 같은 이유).
 */
import { JdElement } from "../../core/element.js";

export class JdNumberFormatter extends JdElement {
  static override tag = "jd-number-formatter";
  static override props = {
    value: { type: Number, default: 0 },
    format: { type: String, default: "decimal" }, // decimal | currency | percent | compact
    currency: { type: String, default: "KRW" },
    locale: { type: String, default: "ko-KR" },
    /** 소수 자릿수. 미지정(NaN)이면 포맷별 기본값 */
    decimals: { type: Number, default: NaN },
    prefix: { type: String },
    suffix: { type: String },
  };

  declare value: number;
  declare format: string;
  declare currency: string;
  declare locale: string;
  declare decimals: number;
  declare prefix: string;
  declare suffix: string;

  /** 접두·접미를 뺀 포맷 결과 */
  get formatted(): string {
    const d = this.decimals;
    const fixed = Number.isNaN(d) ? undefined : d;
    let opts: Intl.NumberFormatOptions;
    switch (this.format) {
      case "currency":
        opts = { style: "currency", currency: this.currency };
        break;
      case "percent":
        // v2 기본 min 0 / max 1 — 지정 시 양쪽 고정
        opts = {
          style: "percent",
          minimumFractionDigits: fixed ?? 0,
          maximumFractionDigits: fixed ?? 1,
        };
        break;
      case "compact":
        opts = { notation: "compact", maximumFractionDigits: fixed ?? 1 };
        break;
      default:
        opts = {};
    }
    if (fixed !== undefined && this.format !== "percent" && this.format !== "compact") {
      opts.minimumFractionDigits = fixed;
      opts.maximumFractionDigits = fixed;
    }
    return new Intl.NumberFormat(this.locale, opts).format(this.value);
  }

  protected render(): void {
    this.update();
  }

  protected override update(): void {
    const text = `${this.prefix}${this.formatted}${this.suffix}`;
    if (this.textContent !== text) this.textContent = text;
  }
}
