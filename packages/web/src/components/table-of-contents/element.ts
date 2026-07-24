/**
 * <jd-table-of-contents> — 문서 헤딩을 모아 만드는 목차 (v2 composites/TableOfContents)
 * = ScrollSpy 파생(§6 R12).
 *
 * v2 ScrollSpy와 TableOfContents는 "세로 목록 + 왼쪽 2px 표시선 + 활성 하이라이트 +
 * 클릭 스무스 스크롤"이라는 **같은 몸통**에, 항목을 어디서 얻는지(명시 배열 vs 헤딩
 * 수집)와 여백만 다른 형제였다. v3는 몸통을 jd-scroll-spy가 갖고 여기서는
 * **수집기와 캡션, 여백만** 재정의한다(Drawer=Modal · Result=EmptyState 선례).
 * 파생의 실리: v2 ToC에는 없던 `offset`·`suspend`·JSON 슬롯·jd-select가 그냥 생긴다.
 *
 * v2 대비 교정 3건:
 *  1. **`title` 프롭 개명(→ `heading`)**: `title`은 HTMLElement의 네이티브 프로퍼티라
 *     프로토타입 접근자로 덮으면 `<jd-table-of-contents title="목차">`가 목차 전체에
 *     브라우저 툴팁을 띄운다. 캡션은 `heading`, 랜드마크 이름은 `label`로 분리했다.
 *  2. **랜드마크에 이름이 없었다**: v2는 nav에 `aria-label="목차"` 고정이라 한 페이지에
 *     목차가 둘이면 구분되지 않았다. v3는 보이는 캡션을 `aria-labelledby`로 잇고
 *     (APG 권장), `label` attribute를 명시하면 그쪽이 이긴다.
 *  3. **슬러그 충돌**: v2는 같은 제목 두 개에 같은 id를 부여해 두 항목이 같은 곳으로
 *     갔다. v3는 문서에 이미 있는 id까지 확인해 `-2`, `-3`을 붙인다(결정적 — Math.random 금지).
 *
 * 수집 시점 함정: 목차는 보통 본문보다 **앞에** 놓인다. JdElement의 지연 render는
 * "후행 형제 없음"일 때만 DOMContentLoaded를 기다리므로(core/element.ts), 사이드바
 * 배치에서는 최초 수집이 헤딩 파싱 전에 일어난다 — 파싱 중이면 완료 후 한 번 더 줍는다.
 */
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on } from "../../behaviors/input.js";
import { JdScrollSpy, type JdScrollSpySection } from "../scroll-spy/element.js";
import tocStyles from "./table-of-contents.css.js";

const DEFAULT_SELECTOR = "h2, h3";

/** v2 슬러그 규칙 그대로 — 공백은 하이픈, 한글·영숫자·하이픈만 남긴다 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

/** hN → N. 헤딩이 아닌 셀렉터를 받으면 2단계로 본다(v2 동형) */
function levelOf(el: Element): number {
  return parseInt(el.tagName.replace(/^H/, ""), 10) || 2;
}

export class JdTableOfContents extends JdScrollSpy {
  static override tag = "jd-table-of-contents";
  static override props = {
    ...JdScrollSpy.props,
    /** 수집할 헤딩 셀렉터 */
    selector: { type: String, default: DEFAULT_SELECTOR },
    /** 수집 범위 컨테이너 셀렉터 (v2 rootSelector). 없으면 문서 전체 */
    root: { type: String },
    /** 상단 캡션 (v2 title) */
    heading: { type: String, default: "목차" },
    /** 랜드마크 접근 이름 — 명시하면 캡션(aria-labelledby)보다 우선 */
    label: { type: String, default: "목차" },
  };

  declare selector: string;
  declare root: string;
  declare heading: string;

  protected override baseClass = "jd-scroll-spy"; // 골격 클래스는 공유

  #headingEl: HTMLElement | null = null;
  #collectSig: string | null = null;

  protected override render(): void {
    super.render(); // 수집 + 목록 골격 + 1차 update()
    adoptStyles(tocStyles);
    this.#mountHeading();
    this.update();
  }

  /** 캡션은 목록보다 위 — 입양(§3.3) 우선 */
  #mountHeading(): void {
    this.#headingEl = this.querySelector<HTMLElement>(":scope > .jd-table-of-contents__heading");
    if (this.#headingEl) return;
    const el = document.createElement("p");
    el.className = "jd-table-of-contents__heading";
    this.prepend(el);
    this.#headingEl = el;
  }

  protected override connected(): void {
    super.connected();
    const doc = this.ownerDocument;
    if (doc.readyState === "loading") {
      this.own({ destroy: on(doc, "DOMContentLoaded", () => this.refresh(), { once: true }) });
    }
  }

  /** 헤딩 수집 — sections를 명시 지정했으면 하지 않는다(v2 items 프롭 동형) */
  protected override collect(): void {
    if (this.hasExplicitSections) return;
    this.#collectSig = this.#signature();
    const doc = this.ownerDocument;
    const scope: ParentNode | null = this.root ? doc.querySelector(this.root) : doc;
    if (!scope) {
      this.setCollected([]);
      return;
    }

    const taken = new Set<string>();
    const rows: JdScrollSpySection[] = [];
    const heads = Array.from(scope.querySelectorAll<HTMLElement>(this.selector || DEFAULT_SELECTOR));
    heads.forEach((h, i) => {
      const text = (h.textContent ?? "").trim();
      if (!h.id && !text) return; // 앵커도 이름도 없는 노드는 목차에 올릴 수 없다
      if (!h.id) h.id = this.#uniqueId(slugify(text) || `section-${i}`, taken);
      taken.add(h.id);
      rows.push({ key: h.id, targetId: h.id, label: text || h.id, depth: levelOf(h) });
    });

    // 들여쓰기는 절대 레벨이 아니라 **최소 레벨 기준 상대 깊이** (v2 level - minLevel)
    const min = rows.length ? Math.min(...rows.map((r) => r.depth ?? 0)) : 0;
    for (const row of rows) row.depth = (row.depth ?? 0) - min;
    this.setCollected(rows);
  }

  /** 문서에 이미 있는 id·이번에 발급한 id 양쪽을 피한다 */
  #uniqueId(base: string, taken: Set<string>): string {
    const doc = this.ownerDocument;
    if (!taken.has(base) && !doc.getElementById(base)) return base;
    for (let n = 2; n < 1000; n++) {
      const candidate = `${base}-${n}`;
      if (!taken.has(candidate) && !doc.getElementById(candidate)) return candidate;
    }
    return jdUid(base); // 도달 불가에 가깝지만 무한 루프를 남기지 않는다
  }

  #signature(): string {
    return `${this.selector}|${this.root}`;
  }

  protected override update(): void {
    // selector·root가 바뀌면 다시 줍는다 (setCollected가 새 배열을 주므로 재진입 없음)
    if (!this.hasExplicitSections && this.#collectSig !== this.#signature()) this.collect();
    super.update();

    const el = this.#headingEl;
    if (!el) return;
    el.textContent = this.heading;
    el.hidden = !this.heading;
    // 보이는 캡션이 랜드마크 이름 — label attribute를 명시했으면 그쪽이 이긴다
    if (this.heading && !this.hasAttribute("label")) {
      if (!el.id) el.id = jdUid("jd-toc-heading");
      this.setAttribute("aria-labelledby", el.id);
      this.removeAttribute("aria-label");
    } else {
      this.removeAttribute("aria-labelledby");
    }
  }
}
