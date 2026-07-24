/**
 * <jd-diff-viewer> — 두 텍스트의 줄 단위 차이 표시 (v2 composites/DiffViewer).
 *
 * v2 대비 실질 개선 5건:
 *  1. **diff 알고리즘을 고쳤다.** v2 computeDiff는 `!newLines.includes(oldLines[oi])`로
 *     "이 줄이 새 텍스트 어딘가에 있나"를 물었다 — (a) 매 줄마다 전체 배열을 훑어 O(n·m)
 *     비교가 나가고, (b) **위치를 무시**하므로 이미 지나온 구간에 같은 문자열이 있으면
 *     삭제가 아니라고 판정해 그 뒤가 통째로 어긋났다(반복 줄이 많은 코드에서 특히).
 *     v3는 공통 접두·접미를 벗겨낸 뒤 LCS 역추적으로 최소 편집을 낸다. 남은 창이
 *     너무 크면(MAX_LCS_CELLS 초과) 블록 치환으로 접어 메모리를 지킨다.
 *  2. **표를 표로 그린다.** v2는 div 4개를 flex로 늘어놓아 낭독기에 "1 1 + 코드"가
 *     구조 없이 흘렀다. v3는 <table> + 행 유형 라벨(추가/삭제)을 숨은 텍스트로 준다.
 *  3. **복사하면 코드만 붙는다.** 줄 번호·부호 칸은 user-select:none — v2는 diff를
 *     드래그 복사하면 "1 1 + " 가 줄마다 섞여 들어왔다.
 *  4. **가로 스크롤 영역에 키보드가 닿는다**(tabindex="0" + role="group", WCAG 2.1.1).
 *     v2의 overflow-x div는 마우스 휠/트랙패드로만 움직였다.
 *  5. **요약을 준다.** <caption>(시각적으로 숨김)이 "N줄 추가, M줄 삭제"를 알려
 *     표의 접근 이름이 된다. `stats` getter로 같은 값을 프로그램에도 노출한다.
 *
 * 입력 2경로(§1.3): oldText/newText는 문자열이라 attribute도 되지만 여러 줄 텍스트를
 * attribute에 넣는 것은 실무에서 고통스럽다 — 자식
 * `<script type="application/json">{"oldText":"…","newText":"…"}</script>` 슬롯을
 * 선언적 초기화 경로로 함께 연다(jd-radio-group 선례).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import type { Behavior } from "../../behaviors/types.js";
import diffViewerStyles from "./diff-viewer.css.js";

export type JdDiffType = "same" | "add" | "remove";

export interface JdDiffLine {
  type: JdDiffType;
  content: string;
  /** 이전 텍스트에서의 줄 번호(1-based). 추가 줄에는 없다 */
  oldNum?: number;
  /** 새 텍스트에서의 줄 번호(1-based). 삭제 줄에는 없다 */
  newNum?: number;
}

export interface JdDiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

/** LCS DP 표의 상한. 초과하면 블록 치환으로 접는다(1e6 셀 ≈ 4MB Uint32) */
const MAX_LCS_CELLS = 1_000_000;

const MARKER: Record<JdDiffType, string> = { same: " ", add: "+", remove: "-" };
const MARKER_TEXT: Record<JdDiffType, string> = { same: "", add: "추가", remove: "삭제" };

/**
 * 줄 단위 최소 편집 스크립트. 공통 접두/접미를 먼저 벗기면 실무 diff(대부분 국소 수정)의
 * DP 창이 몇 줄로 줄어든다.
 */
export function diffLines(oldLines: string[], newLines: string[]): JdDiffLine[] {
  const head: JdDiffLine[] = [];
  let a = 0;
  let b = 0;
  let aEnd = oldLines.length;
  let bEnd = newLines.length;

  while (a < aEnd && b < bEnd && oldLines[a] === newLines[b]) {
    head.push({ type: "same", content: oldLines[a] ?? "", oldNum: a + 1, newNum: b + 1 });
    a += 1;
    b += 1;
  }
  const tail: JdDiffLine[] = [];
  while (aEnd > a && bEnd > b && oldLines[aEnd - 1] === newLines[bEnd - 1]) {
    aEnd -= 1;
    bEnd -= 1;
    tail.unshift({
      type: "same",
      content: oldLines[aEnd] ?? "",
      oldNum: aEnd + 1,
      newNum: bEnd + 1,
    });
  }

  const m = aEnd - a;
  const n = bEnd - b;
  const mid: JdDiffLine[] = [];

  if (m === 0 || n === 0 || m * n > MAX_LCS_CELLS) {
    for (let i = a; i < aEnd; i++) {
      mid.push({ type: "remove", content: oldLines[i] ?? "", oldNum: i + 1 });
    }
    for (let j = b; j < bEnd; j++) {
      mid.push({ type: "add", content: newLines[j] ?? "", newNum: j + 1 });
    }
    return [...head, ...mid, ...tail];
  }

  // dp[i][j] = oldLines[a+i…] 와 newLines[b+j…] 의 LCS 길이 (뒤에서부터 채운다)
  const w = n + 1;
  const dp = new Uint32Array((m + 1) * w);
  for (let i = m - 1; i >= 0; i--) {
    const row = i * w;
    const next = row + w;
    for (let j = n - 1; j >= 0; j--) {
      dp[row + j] =
        oldLines[a + i] === newLines[b + j]
          ? (dp[next + j + 1] ?? 0) + 1
          : Math.max(dp[next + j] ?? 0, dp[row + j + 1] ?? 0);
    }
  }

  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[a + i] === newLines[b + j]) {
      mid.push({ type: "same", content: oldLines[a + i] ?? "", oldNum: a + i + 1, newNum: b + j + 1 });
      i += 1;
      j += 1;
    } else if ((dp[(i + 1) * w + j] ?? 0) >= (dp[i * w + j + 1] ?? 0)) {
      // 동률이면 삭제를 먼저 — v2와 같은 "삭제 위, 추가 아래" 배치를 유지한다
      mid.push({ type: "remove", content: oldLines[a + i] ?? "", oldNum: a + i + 1 });
      i += 1;
    } else {
      mid.push({ type: "add", content: newLines[b + j] ?? "", newNum: b + j + 1 });
      j += 1;
    }
  }
  while (i < m) {
    mid.push({ type: "remove", content: oldLines[a + i] ?? "", oldNum: a + i + 1 });
    i += 1;
  }
  while (j < n) {
    mid.push({ type: "add", content: newLines[b + j] ?? "", newNum: b + j + 1 });
    j += 1;
  }

  return [...head, ...mid, ...tail];
}

export class JdDiffViewer extends JdElement {
  static override tag = "jd-diff-viewer";
  static override props = {
    /** 이전 텍스트 */
    oldText: { type: String }, // attr: old-text
    /** 새 텍스트 */
    newText: { type: String }, // attr: new-text
    /** 좌측(이전) 제목. 둘 다 비면 제목 줄 자체가 없다 */
    oldTitle: { type: String },
    /** 우측(새) 제목 */
    newTitle: { type: String },
  };

  declare oldText: string;
  declare newText: string;
  declare oldTitle: string;
  declare newTitle: string;

  #header!: HTMLDivElement;
  #oldTitleEl!: HTMLSpanElement;
  #newTitleEl!: HTMLSpanElement;
  #scroll!: HTMLDivElement;
  #tbody!: HTMLTableSectionElement;
  #caption!: HTMLTableCaptionElement;

  #lines: JdDiffLine[] = [];
  /** 마지막으로 계산한 입력. null이면 아직 한 번도 계산하지 않았다 */
  #key: string | null = null;
  /** 측정은 연결 이후에만 — render()는 언제나 같은 HTML을 낸다(§3.1-3) */
  #live = false;
  #sizeObserver: Behavior | null = null;

  /** 현재 diff 결과(읽기 전용 사본) */
  get lines(): JdDiffLine[] {
    return this.#lines.map((l) => ({ ...l }));
  }

  get stats(): JdDiffStats {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const l of this.#lines) {
      if (l.type === "add") added += 1;
      else if (l.type === "remove") removed += 1;
      else unchanged += 1;
    }
    return { added, removed, unchanged };
  }

  protected render(): void {
    adoptStyles(diffViewerStyles);
    this.#consumeJsonSlot();

    const existing = this.querySelector<HTMLTableSectionElement>(
      ":scope > .jd-diff-viewer__scroll > table > tbody",
    );
    if (existing) {
      this.#tbody = existing;
      this.#scroll = this.querySelector<HTMLDivElement>(":scope > .jd-diff-viewer__scroll")!;
      this.#caption = this.#scroll.querySelector<HTMLTableCaptionElement>("caption")!;
      if (!this.#caption.id) this.#caption.id = jdUid("jd-diff-caption");
      this.#header = this.querySelector<HTMLDivElement>(":scope > .jd-diff-viewer__header")!;
      this.#oldTitleEl = this.#header.querySelector<HTMLSpanElement>('[data-side="old"]')!;
      this.#newTitleEl = this.#header.querySelector<HTMLSpanElement>('[data-side="new"]')!;
    } else {
      this.#build();
    }
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (WEB-03 예외 패턴) */
  #consumeJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "{}");
      if (parsed && typeof parsed === "object") {
        const o = parsed as Record<string, unknown>;
        if (typeof o.oldText === "string") this.oldText = o.oldText;
        if (typeof o.newText === "string") this.newText = o.newText;
        if (typeof o.oldTitle === "string") this.oldTitle = o.oldTitle;
        if (typeof o.newTitle === "string") this.newTitle = o.newTitle;
      }
    } catch {
      console.warn("[junds] <jd-diff-viewer> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.replaceChildren(); // 업그레이드 전 폴백 텍스트는 치운다

    this.#header = doc.createElement("div");
    this.#header.className = "jd-diff-viewer__header";
    this.#oldTitleEl = doc.createElement("span");
    this.#oldTitleEl.className = "jd-diff-viewer__title";
    this.#oldTitleEl.dataset.side = "old";
    this.#newTitleEl = doc.createElement("span");
    this.#newTitleEl.className = "jd-diff-viewer__title";
    this.#newTitleEl.dataset.side = "new";
    this.#header.append(this.#oldTitleEl, this.#newTitleEl);

    this.#scroll = doc.createElement("div");
    this.#scroll.className = "jd-diff-viewer__scroll";

    const table = doc.createElement("table");
    table.className = "jd-diff-viewer__table";
    this.#caption = doc.createElement("caption");
    this.#caption.className = "jd-diff-viewer__caption";
    this.#caption.id = jdUid("jd-diff-caption");
    this.#tbody = doc.createElement("tbody");
    table.append(this.#caption, this.#tbody);
    this.#scroll.append(table);

    this.append(this.#header, this.#scroll);
  }

  protected override update(): void {
    const key = `${this.oldText}\u0000${this.newText}`;
    if (key !== this.#key) {
      this.#key = key;
      // 양쪽이 모두 비면 "빈 줄 1개가 그대로다"가 아니라 표 자체가 비는 것이 옳다
      this.#lines =
        this.oldText || this.newText
          ? diffLines(this.oldText.split("\n"), this.newText.split("\n"))
          : [];
      this.#paintRows();
    }

    this.#oldTitleEl.textContent = this.oldTitle;
    this.#newTitleEl.textContent = this.newTitle;
    this.#oldTitleEl.hidden = !this.oldTitle;
    this.#newTitleEl.hidden = !this.newTitle;
    this.#header.hidden = !this.oldTitle && !this.newTitle;

    const { added, removed } = this.stats;
    this.#caption.textContent = `차이 비교: ${added}줄 추가, ${removed}줄 삭제`;
    this.#syncScrollAffordance();
  }

  protected override connected(): void {
    this.#live = true;
    this.#sizeObserver ??= this.own(createSizeObserver(this, this.#syncScrollAffordance));
    this.#syncScrollAffordance();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.#sizeObserver = null; // own()이 이미 destroy했다
  }

  /**
   * 가로로 **실제 넘칠 때만** 스크롤 영역을 탭 스톱으로 만든다(WCAG 2.1.1).
   * v2의 overflow-x div는 마우스 휠로만 움직였고, 반대로 무조건 tabindex를 주면
   * 넘치지 않는 diff마다 의미 없는 탭 스톱이 하나씩 늘어난다 — 측정으로 가른다.
   */
  #syncScrollAffordance = (): void => {
    if (!this.#live) return;
    const overflows = this.#scroll.scrollWidth > this.#scroll.clientWidth;
    if (overflows) {
      this.#scroll.tabIndex = 0;
      this.#scroll.setAttribute("role", "group");
      this.#scroll.setAttribute("aria-labelledby", this.#caption.id);
    } else {
      this.#scroll.removeAttribute("tabindex");
      this.#scroll.removeAttribute("role");
      this.#scroll.removeAttribute("aria-labelledby");
    }
  };

  /** 행은 인덱스 기준으로 재사용한다 — diff가 조금 바뀌면 DOM도 조금만 바뀐다 */
  #paintRows(): void {
    const doc = this.ownerDocument;
    const rows = this.#tbody.rows;
    for (let i = 0; i < this.#lines.length; i++) {
      const line = this.#lines[i]!;
      let row = rows.item(i);
      if (!row) {
        row = doc.createElement("tr");
        row.className = "jd-diff-viewer__row";
        const oldNum = doc.createElement("td");
        oldNum.className = "jd-diff-viewer__num";
        oldNum.dataset.side = "old";
        const newNum = doc.createElement("td");
        newNum.className = "jd-diff-viewer__num";
        newNum.dataset.side = "new";
        const marker = doc.createElement("td");
        marker.className = "jd-diff-viewer__marker";
        const markerText = doc.createElement("span");
        markerText.className = "jd-diff-viewer__sr";
        const markerGlyph = doc.createElement("span");
        markerGlyph.setAttribute("aria-hidden", "true");
        marker.append(markerText, markerGlyph);
        const content = doc.createElement("td");
        content.className = "jd-diff-viewer__content";
        row.append(oldNum, newNum, marker, content);
        this.#tbody.append(row);
      }
      const cells = row.cells;
      row.dataset.type = line.type;
      cells.item(0)!.textContent = line.oldNum === undefined ? "" : String(line.oldNum);
      cells.item(1)!.textContent = line.newNum === undefined ? "" : String(line.newNum);
      const marker = cells.item(2)!;
      marker.children.item(0)!.textContent = MARKER_TEXT[line.type];
      marker.children.item(1)!.textContent = MARKER[line.type];
      cells.item(3)!.textContent = line.content;
    }
    while (rows.length > this.#lines.length) {
      const last = rows.item(rows.length - 1);
      if (!last) break;
      last.remove();
    }
  }
}
