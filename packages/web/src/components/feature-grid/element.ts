/**
 * <jd-feature-grid> — 마케팅 기능/혜택 그리드 (v2 patterns/FeatureGrid).
 *
 * v2 프롭 표면 승계: title/subtitle, features(아이콘·제목·설명·href·highlighted),
 * columns(2|3|4 반응형), layout 3종(card · minimal · iconLeft).
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `features` 프로퍼티 (Array<JdFeatureItem>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (radio-group·accordion 선례)
 *
 * v2는 layout마다 Tailwind 클래스 조합을 런타임에 갈아끼웠다. v3는 골격 1개로 통일하고
 * 카드/미니멀/아이콘좌 배치·치수는 호스트 [layout]/[columns] 속성 셀렉터가 CSS로 처리한다
 * (§4.3) — layout·columns 런타임 변경에 재구축이 없다.
 *
 * v2 대비 개선:
 *  - **섹션에 접근 이름을 준다.** title이 있으면 호스트를 role="region" +
 *    aria-labelledby(제목 id)로 묶어 스크린리더 지형에 이름 있는 랜드마크로 노출한다.
 *  - 아이콘 컨테이너는 aria-hidden(장식), 제목은 <h3>, 링크는 네이티브 <a>.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import featureGridStyles from "./feature-grid.css.js";

export interface JdFeatureItem {
  /** 아이콘/이미지. 마크업 문자열(신뢰된 값만)·이모지·DOM 노드 */
  icon?: string | Node;
  /** 제목. 마크업 문자열 또는 DOM 노드 */
  title: string | Node;
  /** 설명. 마크업 문자열 또는 DOM 노드 */
  description?: string | Node;
  /** 링크 — 있으면 카드 전체가 <a>가 된다 */
  href?: string;
  /** 강조 (card 레이아웃에서만 테두리·링) */
  highlighted?: boolean;
}

/**
 * 슬롯 채우기 — 문자열이 마크업이면 innerHTML(신뢰된 값만), 아니면 텍스트.
 * 마크업 경로는 HTML 파서 재파싱이라 SVG 네임스페이스도 올바르게 생긴다(accordion 선례).
 */
function fillSlot(slot: HTMLElement, value: string | Node | undefined, keep = false): void {
  slot.textContent = "";
  const empty = value === undefined || value === null || value === "";
  if (!keep) slot.hidden = empty;
  if (empty) return;
  if (typeof value === "string") {
    if (value.trimStart().startsWith("<")) slot.innerHTML = value;
    else slot.textContent = value;
  } else {
    slot.append(value);
  }
}

export class JdFeatureGrid extends JdElement {
  static override tag = "jd-feature-grid";
  static override props = {
    title: { type: String },
    subtitle: { type: String },
    /** 2 | 3 | 4 (그 밖의 값은 기본 3열 반응형으로 폴백) */
    columns: { type: Number, default: 3, reflect: true },
    /** card | minimal | iconLeft */
    layout: { type: String, default: "card", reflect: true },
    // features(Array)는 property 전용(§1.3) — 아래 접근자로 선언.
  };

  declare title: string;
  declare subtitle: string;
  declare columns: number;
  declare layout: string;

  #features: JdFeatureItem[] = [];
  /** 마지막으로 골격에 반영한 배열 — 데이터 동기화 1회 판정 (accordion 선례) */
  #built: readonly JdFeatureItem[] | null = null;
  #header!: HTMLElement;
  #titleEl!: HTMLHeadingElement;
  #subtitleEl!: HTMLParagraphElement;
  #grid!: HTMLElement;
  #titleId = "";

  get features(): JdFeatureItem[] {
    return this.#features;
  }
  set features(v: JdFeatureItem[]) {
    this.#features = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화한다
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(featureGridStyles);
    this.#readJson();
    // 입양 규칙(§3.3): 프리렌더가 그린 골격 위에서 재구축하지 않는다
    const grid = this.querySelector<HTMLElement>(":scope > .jd-feature-grid__grid");
    if (grid) {
      this.#header = this.querySelector<HTMLElement>(":scope > .jd-feature-grid__header")!;
      this.#titleEl = this.#header.querySelector<HTMLHeadingElement>(".jd-feature-grid__title")!;
      this.#subtitleEl = this.#header.querySelector<HTMLParagraphElement>(
        ".jd-feature-grid__subtitle",
      )!;
      this.#grid = grid;
      this.#titleId = this.#titleEl.id || "";
    } else {
      this.#build();
    }
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·accordion 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdFeatureItem[];
      if (Array.isArray(parsed)) this.#features = parsed;
    } catch {
      console.warn("[junds] <jd-feature-grid> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    this.#header = document.createElement("div");
    this.#header.className = "jd-feature-grid__header";
    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-feature-grid__title";
    this.#titleId = jdUid("jd-fg-title");
    this.#titleEl.id = this.#titleId;
    this.#subtitleEl = document.createElement("p");
    this.#subtitleEl.className = "jd-feature-grid__subtitle";
    this.#header.append(this.#titleEl, this.#subtitleEl);
    this.#grid = document.createElement("div");
    this.#grid.className = "jd-feature-grid__grid";
    this.append(this.#header, this.#grid);
  }

  protected override update(): void {
    fillSlot(this.#titleEl, this.title);
    fillSlot(this.#subtitleEl, this.subtitle);
    const hasHeader = Boolean(this.title || this.subtitle);
    this.#header.hidden = !hasHeader;

    // 섹션 접근 이름 — 제목이 있을 때만 이름 있는 region으로 노출 (v2 개선)
    if (this.title) {
      if (!this.#titleEl.id) this.#titleEl.id = this.#titleId ||= jdUid("jd-fg-title");
      this.setAttribute("role", "region");
      this.setAttribute("aria-labelledby", this.#titleEl.id);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-labelledby");
    }

    if (this.#built !== this.#features) this.#syncCards();
  }

  /** 카드 재구축 — features 배열 정체성이 바뀔 때만 (accordion #built 선례) */
  #syncCards(): void {
    this.#built = this.#features;
    this.#grid.textContent = "";
    for (const item of this.#features) this.#grid.append(this.#buildCard(item));
  }

  #buildCard(item: JdFeatureItem): HTMLElement {
    const isLink = typeof item.href === "string" && item.href.length > 0;
    const el = document.createElement(isLink ? "a" : "div");
    el.className = "jd-feature-grid__item";
    if (isLink) (el as HTMLAnchorElement).href = item.href!;
    if (item.highlighted) el.setAttribute("data-highlighted", "");

    const icon = document.createElement("span");
    icon.className = "jd-feature-grid__icon";
    icon.setAttribute("aria-hidden", "true");
    fillSlot(icon, item.icon);

    const body = document.createElement("div");
    body.className = "jd-feature-grid__body";
    const title = document.createElement("h3");
    title.className = "jd-feature-grid__item-title";
    fillSlot(title, item.title, true);
    const desc = document.createElement("p");
    desc.className = "jd-feature-grid__item-desc";
    fillSlot(desc, item.description);
    body.append(title, desc);

    el.append(icon, body);
    return el;
  }
}
