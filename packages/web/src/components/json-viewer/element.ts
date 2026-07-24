/**
 * <jd-json-viewer> — JSON 트리 뷰어 (v2 composites/JSONViewer).
 *
 * 데이터 2경로: `data` 프로퍼티(복합 데이터는 attribute 금지 §1.3) 또는 자식
 * `<script type="application/json">` 슬롯(DEC-023-3 선례).
 *
 * v2 대비 교정 4건:
 *  1. **개폐가 맨 `<button>`이었다.** aria-expanded도 제어 대상도 없어 AT에는
 *     "누를 수 있는 무언가"였다. v3는 네이티브 `<details>/<summary>`에 위임한다 —
 *     열고 닫기·키보드·상태 보고가 공짜다(Callout이 쓴 것과 같은 수법).
 *  2. **순환 참조에서 스택이 터졌다.** `Object.entries` 재귀뿐이라 `a.self = a`면
 *     RangeError로 앱이 죽었다. v3는 조상 집합으로 순환을 감지해 표식만 남긴다.
 *  3. **어두운 면 위에서 색 대비가 모자랐다.** 패널은 라이트/다크 모두 gray-950인데
 *     값 색이 semantic 원색이라 primary는 3.2:1로 AA 미달이었다. v3는 흰색과 섞은
 *     밝은 파생색을 패널 지역 변수로 둔다(DEC-027 · code.css.ts와 같은 판단).
 *  4. **빈 객체·배열도 접히는 노드였다.** `{0}`을 눌러 봐야 아무것도 없었다 —
 *     v3는 `{}`/`[]` 한 줄로 낸다.
 *
 * v2 `initialExpanded`는 "true면 depth<2까지 펼침"이라는 고정 규칙이었다. v3는 이를
 * `expandDepth`(기본 2)로 일반화한다 — `initialExpanded={false}`는 `expand-depth="0"`과
 * 같다. Boolean attribute는 존재 여부가 값이라(§1.3) 기본 true인 프롭을 HTML에서
 * 끌 방법이 없다는 함정도 함께 피한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import jsonViewerStyles from "./json-viewer.css.js";

const CHEVRON_SVG =
  `<svg class="jd-json-viewer__chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">` +
  `<path d="M3 2l4 3-4 3z" fill="currentColor"/></svg>`;

type ValueKind = "string" | "number" | "boolean" | "null" | "other";

function kindOf(v: unknown): ValueKind {
  if (v === null) return "null";
  switch (typeof v) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "other";
  }
}

function formatLeaf(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "bigint") return `${v}n`;
  return String(v);
}

const isBranch = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

export class JdJsonViewer extends JdElement {
  static override tag = "jd-json-viewer";
  static override props = {
    /** 이 깊이 미만의 노드를 펼친 채로 낸다 (v2 initialExpanded=true ≡ 2, false ≡ 0) */
    expandDepth: { type: Number, default: 2, reflect: true },
    /** 영역 접근 이름 */
    label: { type: String, default: "JSON" },
  };

  declare expandDepth: number;
  declare label: string;

  #data: unknown = null;
  /** 마지막으로 그린 (데이터, 깊이) — 둘 중 하나라도 바뀌면 트리를 다시 만든다 */
  #painted: { data: unknown; limit: number } | null = null;
  #limit = 2;
  #root!: HTMLElement;

  get data(): unknown {
    return this.#data;
  }
  set data(v: unknown) {
    this.#data = v;
    this.#painted = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(jsonViewerStyles);
    this.#readJson();
    // 입양(§3.3)
    const found = this.querySelector<HTMLElement>(":scope > .jd-json-viewer__root");
    if (found) {
      // 이미 그려진 트리는 현재 데이터의 결과로 신뢰한다 — 프리렌더 스냅샷을 지우고
      // 같은 것을 새로 만들지 않는다(§3.3)
      this.#root = found;
      this.#painted = { data: this.#data, limit: this.#normalizedLimit() };
    } else {
      this.#root = document.createElement("div");
      this.#root.className = "jd-json-viewer__root";
      this.append(this.#root);
    }
    // 가로로 넘치는 영역은 키보드로 도달 가능해야 한다 (WCAG 2.1.1)
    this.tabIndex = 0;
    this.setAttribute("role", "group");
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      this.#data = JSON.parse(script.textContent || "null") as unknown;
    } catch {
      console.warn("[junds] <jd-json-viewer> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #normalizedLimit(): number {
    const n = Math.floor(this.expandDepth);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    const limit = this.#normalizedLimit();
    if (this.#painted && this.#painted.data === this.#data && this.#painted.limit === limit) return;
    this.#painted = { data: this.#data, limit };
    this.#limit = limit;
    this.#root.textContent = "";
    this.#root.append(this.#node(this.#data, undefined, 0, new Set()));
  }

  /** 한 노드(잎 또는 가지)를 만든다. `seen`은 조상 경로 — 순환 감지용 */
  #node(value: unknown, name: string | undefined, depth: number, seen: Set<object>): Node {
    if (!isBranch(value)) return this.#leaf(name, formatLeaf(value), kindOf(value));
    if (seen.has(value)) return this.#leaf(name, "[순환 참조]", "other");

    const array = Array.isArray(value);
    const entries = Object.entries(value);
    if (entries.length === 0) return this.#leaf(name, array ? "[]" : "{}", "other");

    const details = document.createElement("details");
    details.className = "jd-json-viewer__node";
    details.open = depth < this.#limit;

    const summary = document.createElement("summary");
    summary.className = "jd-json-viewer__summary";
    summary.innerHTML = CHEVRON_SVG;
    if (name !== undefined) summary.append(this.#name(name));
    const count = document.createElement("span");
    count.className = "jd-json-viewer__count";
    count.textContent = array ? `[${entries.length}]` : `{${entries.length}}`;
    summary.append(count);

    const children = document.createElement("div");
    children.className = "jd-json-viewer__children";
    const next = new Set(seen).add(value);
    for (const [k, v] of entries) {
      children.append(this.#node(v, array ? undefined : k, depth + 1, next));
    }

    details.append(summary, children);
    return details;
  }

  #leaf(name: string | undefined, text: string, kind: ValueKind): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-json-viewer__leaf";
    if (name !== undefined) row.append(this.#name(name));
    const val = document.createElement("span");
    val.className = "jd-json-viewer__value";
    val.dataset.kind = kind;
    val.textContent = text;
    row.append(val);
    return row;
  }

  #name(name: string): HTMLElement {
    const el = document.createElement("span");
    el.className = "jd-json-viewer__name";
    el.textContent = `${name}: `;
    return el;
  }
}
