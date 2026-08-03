/**
 * <jd-skeleton-preset> — 자주 쓰는 자리표시자 묶음 (v2 composites/SkeletonPreset).
 *
 * **파생 판단(§6 R12): 상속이 아니라 시트 공유.** jd-skeleton과 겹치는 것은 골격이
 * 아니라 "반짝이는 회색 블록" 하나뿐이다(프리셋의 골격은 카드·표·프로필로 전부
 * 다르다). 그래서 클래스를 상속하는 대신 skeleton.css의 `.jd-skeleton-block`을
 * 채택해 쓴다 — 색·박자·다크·reduced-motion이 한 곳에만 있고, 프리셋 하나가
 * `<jd-skeleton>` 스무 개를 업그레이드시키는 비용(05-perf)도 없다.
 *
 * v2 대비 교정 2건:
 *  1. **접근성 트리에서 뺀다** — jd-skeleton과 같은 규율(기본 aria-hidden,
 *     `label`을 주면 role=status로 승격). v2는 순수 장식 div 수십 개를 그대로 노출했다.
 *  2. **치수를 CSS로 내린다.** v2는 유틸 클래스로 JSX 안에 흩어져 있어 표 한 줄의
 *     높이를 바꾸려면 다섯 군데를 고쳐야 했다. v3는 골격(JS)과 치수(CSS)가 분리된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import skeletonStyles from "../skeleton/skeleton.css.js";
import skeletonPresetStyles from "./skeleton-preset.css.js";

const B = "jd-skeleton-preset";
/** 표 헤더·본문 열 수 — v2 [...Array(4)] */
const TABLE_COLS = 4;

/** 반짝이는 블록 하나. 공용 클래스 + 역할별 클래스 */
function block(role: string): HTMLSpanElement {
  const el = document.createElement("span");
  el.className = `jd-skeleton-block ${B}__${role}`;
  return el;
}

function group(role: string, ...children: HTMLElement[]): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `${B}__${role}`;
  el.append(...children);
  return el;
}

function cells(count: number): HTMLSpanElement[] {
  return Array.from({ length: count }, () => block("cell"));
}

export class JdSkeletonPreset extends JdElement {
  static override tag = "jd-skeleton-preset";
  static override props = {
    /** card | table | profile | article | list */
    variant: { type: String, default: "card", reflect: true },
    /** table·list의 행 수 */
    rows: { type: Number, default: 5 },
    /** 주면 장식이 아니라 상태 영역이 된다(role=status) */
    label: { type: String },
  };

  declare variant: string;
  declare rows: number;
  declare label: string;

  /** 마지막으로 그린 조합 — 같으면 다시 만들지 않는다 */
  #built = "";

  protected render(): void {
    adoptStyles(skeletonStyles); // 반짝임의 단일 출처
    adoptStyles(skeletonPresetStyles);
    // 입양(§3.3): 이미 같은 조합의 골격이 있으면 재사용
    const marker = this.dataset.built;
    if (marker && this.childElementCount > 0) this.#built = marker;
    this.update();
  }

  #rowCount(): number {
    const n = Math.floor(this.rows);
    return Number.isFinite(n) && n > 0 ? n : 5;
  }

  #rebuild(): void {
    const rows = this.#rowCount();
    this.textContent = "";
    switch (this.variant) {
      case "table": {
        this.append(group("head", ...cells(TABLE_COLS)));
        for (let r = 0; r < rows; r++) this.append(group("row", ...cells(TABLE_COLS)));
        break;
      }
      case "profile": {
        this.append(block("avatar"), group("body", block("name"), block("meta")));
        break;
      }
      case "article": {
        const para = group("para", block("p"), block("p"), block("p"));
        // v2 마지막 줄 w-5/6 — 치수는 CSS가 [data-last]로 잡는다
        para.lastElementChild?.setAttribute("data-last", "");
        this.append(
          block("headline"),
          group("byline", block("avatar"), block("by-name"), block("by-date")),
          block("hero"),
          para,
        );
        break;
      }
      case "list": {
        for (let r = 0; r < rows; r++) {
          this.append(
            group("item", block("icon"), group("body", block("item-title"), block("item-sub"))),
          );
        }
        break;
      }
      default: {
        // card — 알 수 없는 variant도 여기로 떨어진다(v2 switch는 undefined를 반환했다)
        this.append(
          block("thumb"),
          block("title"),
          block("subtitle"),
          group("actions", block("chip"), block("chip")),
        );
      }
    }
  }

  protected override update(): void {
    // rows는 table·list에서만 골격을 바꾼다 — 나머지는 rows가 흔들려도 재구축 없음
    const sized = this.variant === "table" || this.variant === "list";
    const key = `${this.variant}|${sized ? this.#rowCount() : 0}`;
    if (key !== this.#built) {
      this.#built = key;
      this.dataset.built = key;
      this.#rebuild();
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
