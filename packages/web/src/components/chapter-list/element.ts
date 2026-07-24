/**
 * <jd-chapter-list> — 챕터 목차 (v2 composites/ChapterList).
 *
 * 데이터 입력 2경로(§1.3): `chapters` 프로퍼티(트리) 또는 자식
 * `<script type="application/json">` 슬롯. 완독 집합은 `completedIds` 프로퍼티
 * (Array | Set) 또는 `completed-ids` attribute(쉼표/공백 구분).
 *
 * 구조는 chapters가 바뀔 때만 다시 세우고(트리 재귀), 활성·완독·잠금 같은 상태는
 * update()가 재구축 없이 다시 칠한다(radio-group 입양 선례의 트리 확장판).
 *
 * v2 대비 교정 2건:
 *  1. **목차가 랜드마크가 아니었다** — v2 <nav>는 살았지만 CE 호스트는 아무 역할이
 *     없어 이름 있는 탐색 랜드마크가 사라졌다. v3는 호스트에 role="navigation" +
 *     aria-label(label, 기본 "목차")을 실어 여러 목차를 구분 가능하게 한다.
 *  2. **완독 체크·잠금 자물쇠가 색/글리프로만 전달됐다.** 상태 원 마커는 aria-hidden
 *     장식으로 내리고, 잠금은 버튼 disabled로, 활성은 aria-current로 의미를 전한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import chapterListStyles from "./chapter-list.css.js";

export interface JdChapter {
  id: string;
  title: string;
  page?: number;
  durationMinutes?: number;
  subChapters?: JdChapter[];
  locked?: boolean;
}

const CLS = "jd-chapter-list";

interface RowRef {
  chapter: JdChapter;
  button: HTMLButtonElement;
  marker: HTMLElement;
}

export class JdChapterList extends JdElement {
  static override tag = "jd-chapter-list";
  static override props = {
    activeId: { type: String }, // attr: active-id
    /** 랜드마크 이름 (기본 "목차") */
    label: { type: String, default: "목차" },
  };

  declare activeId: string;
  declare label: string;

  #chapters: JdChapter[] = [];
  #completed = new Set<string>();
  #rows: RowRef[] = [];
  #root!: HTMLUListElement;

  get chapters(): JdChapter[] {
    return this.#chapters;
  }
  set chapters(v: JdChapter[]) {
    this.#chapters = Array.isArray(v) ? v : [];
    if (this.#root) this.#rebuild();
    this.requestUpdate();
  }

  get completedIds(): string[] {
    return [...this.#completed];
  }
  set completedIds(v: ReadonlyArray<string> | Set<string> | null | undefined) {
    this.#completed = v instanceof Set ? new Set(v) : new Set(v ?? []);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(chapterListStyles);
    this.#readJson();
    this.#readCompletedAttr();
    this.setAttribute("role", "navigation");
    // 슬롯 없는 데이터 컴포넌트 — SSR 골격이 있으면 지우고 새로 세운다(§3.3 멱등, 이중 방지)
    this.textContent = "";

    this.#root = document.createElement("ul");
    this.#root.className = `${CLS}__root`;
    this.append(this.#root);
    this.#rebuild();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdChapter[];
      if (Array.isArray(parsed)) this.#chapters = parsed;
    } catch {
      console.warn("[junds] <jd-chapter-list> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #readCompletedAttr(): void {
    const raw = this.getAttribute("completed-ids");
    if (raw == null) return;
    this.#completed = new Set(raw.split(/[\s,]+/).filter(Boolean));
  }

  #rebuild(): void {
    this.#rows = [];
    this.#root.textContent = "";
    for (const c of this.#chapters) this.#root.append(this.#buildRow(c, 0));
  }

  #buildRow(chapter: JdChapter, depth: number): HTMLLIElement {
    const li = document.createElement("li");
    li.className = `${CLS}__item`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `${CLS}__row`;
    button.style.paddingInlineStart = `${8 + depth * 16}px`;
    button.addEventListener("click", () => {
      if (chapter.locked) return;
      this.emit("jd-select", { chapter });
    });

    const marker = document.createElement("span");
    marker.className = `${CLS}__marker`;
    marker.setAttribute("aria-hidden", "true");

    const title = document.createElement("span");
    title.className = `${CLS}__title`;
    title.textContent = chapter.title;

    const lead = document.createElement("span");
    lead.className = `${CLS}__lead`;
    lead.append(marker, title);

    const meta = document.createElement("span");
    meta.className = `${CLS}__meta`;
    const parts: string[] = [];
    if (chapter.page !== undefined) parts.push(`p.${chapter.page}`);
    if (chapter.durationMinutes !== undefined) parts.push(`${chapter.durationMinutes}분`);
    meta.textContent = parts.join(" · ");
    meta.hidden = parts.length === 0;

    button.append(lead, meta);
    li.append(button);
    this.#rows.push({ chapter, button, marker });

    if (chapter.subChapters?.length) {
      const sub = document.createElement("ul");
      sub.className = `${CLS}__sub`;
      for (const child of chapter.subChapters) sub.append(this.#buildRow(child, depth + 1));
      li.append(sub);
    }
    return li;
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label || "목차");
    for (const { chapter, button, marker } of this.#rows) {
      const active = chapter.id === this.activeId;
      const done = this.#completed.has(chapter.id);
      const locked = Boolean(chapter.locked);

      button.disabled = locked;
      button.toggleAttribute("data-active", active);
      button.toggleAttribute("data-done", !active && done);
      button.toggleAttribute("data-locked", locked);
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");

      // 상태 마커: 활성=data-active(원), 완독=✓, 잠금=🔒, 그 외 빈 원
      marker.toggleAttribute("data-active", active);
      marker.toggleAttribute("data-done", done);
      marker.textContent = done ? "✓" : locked ? "🔒" : "";
    }
  }
}
