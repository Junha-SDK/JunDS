/**
 * <jd-skeleton> — 로딩 자리표시자 (v2 composites/Skeleton).
 *
 * v2 대비 교정 3건:
 *  1. **접근성 트리에서 뺀다.** v2는 의미 없는 `<div>` 더미를 그대로 남겼다 —
 *     스크린리더에는 정체 불명의 빈 노드 N개가 쌓인다. v3는 기본이
 *     `aria-hidden="true"`(순수 장식)이고, 이 영역 자체를 알려야 하는 경우에만
 *     `label`을 주면 `role="status" + aria-busy`로 승격한다. 목록 자리표시자
 *     20개가 저마다 "로딩 중"을 외치는 사고를 기본값으로 막는다.
 *  2. **다크 테마.** v2는 회색 리터럴 고정 — CSS 토큰 오버라이드로 교정(css 파일 주석).
 *  3. **줄 수가 바뀌어도 노드를 통째로 버리지 않는다.** 개수가 같으면 폭만 갱신한다.
 *
 * width/height는 CSS 길이 문자열 또는 숫자(px로 해석) 둘 다 받는다 — v2
 * `string | number` 표면 승계.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import skeletonStyles from "./skeleton.css.js";

/** 숫자(또는 숫자 문자열)는 px, 그 외는 CSS 길이 그대로 — v2 style={{width}} 동형 */
export function jdLength(v: unknown): string {
  if (v === undefined || v === null || v === "") return "";
  const s = String(v);
  return /^-?\d+(?:\.\d+)?$/.test(s) ? `${s}px` : s;
}

export class JdSkeleton extends JdElement {
  static override tag = "jd-skeleton";
  static override props = {
    /** text | circle | rect */
    variant: { type: String, default: "text", reflect: true },
    width: { type: String },
    height: { type: String },
    /** text 변형의 줄 수 */
    lines: { type: Number, default: 1 },
    /** 주면 장식이 아니라 상태 영역이 된다(role=status) */
    label: { type: String },
  };

  declare variant: string;
  declare width: string | number;
  declare height: string | number;
  declare lines: number;
  declare label: string;

  #lines: HTMLSpanElement[] = [];

  protected render(): void {
    adoptStyles(skeletonStyles);
    // 입양(§3.3): SSR/프리렌더 골격이 있으면 그대로 쓴다
    this.#lines = Array.from(this.querySelectorAll<HTMLSpanElement>(":scope > .jd-skeleton__line"));
    this.update();
  }

  /** circle·rect는 호스트 자체가 블록, text는 컨테이너 + 줄 N개 */
  #isText(): boolean {
    return this.variant !== "circle" && this.variant !== "rect";
  }

  #syncLines(count: number): void {
    if (this.#lines.length !== count) {
      for (const el of this.#lines) el.remove();
      this.#lines = [];
      for (let i = 0; i < count; i++) {
        const line = document.createElement("span");
        line.className = "jd-skeleton__line";
        this.#lines.push(line);
        this.append(line);
      }
    }
    if (count === 0) return;
    const w = jdLength(this.width) || "100%";
    // v2: 줄이 둘 이상이면 마지막 줄만 75% — 문단의 끝맺음을 흉내낸다
    this.#lines.forEach((el, i) => {
      el.style.width = count > 1 && i === count - 1 ? "75%" : w;
    });
  }

  protected override update(): void {
    const text = this.#isText();
    const lines = Math.floor(this.lines);
    this.#syncLines(text ? Math.max(1, Number.isFinite(lines) ? lines : 1) : 0);

    if (text) {
      // 컨테이너에는 v2도 치수를 주지 않았다 — 폭은 줄에 걸린다
      this.style.removeProperty("width");
      this.style.removeProperty("height");
    } else {
      const circle = this.variant === "circle";
      this.style.width = jdLength(this.width) || (circle ? "40px" : "100%");
      this.style.height = jdLength(this.height) || (circle ? "40px" : "100px");
    }

    if (this.label) {
      this.removeAttribute("aria-hidden");
      this.setAttribute("role", "status");
      this.setAttribute("aria-busy", "true");
      this.setAttribute("aria-label", this.label);
    } else {
      this.setAttribute("aria-hidden", "true");
      this.removeAttribute("role");
      this.removeAttribute("aria-busy");
      this.removeAttribute("aria-label");
    }
  }
}
