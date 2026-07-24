/**
 * <jd-reading-time> — 읽기 시간·난이도 추정 (v2 composites/ReadingTime).
 *
 * - 추정 알고리즘은 v2 그대로(라틴 230WPM · CJK 170CPM, 올림·최소 1분,
 *   난이도 점수 = 분 + h2/h3 개수×0.25 → 5/10 경계). 순수 함수로 export하므로
 *   같은 계열 후속(ReadingStats·ReadingGoal)이 재구현 없이 재사용한다.
 * - 입력 2경로: `content`(HTML 또는 평문 문자열, v2 표면) **또는** `for`(측정 대상
 *   요소의 id — light DOM id 참조 §8). `for`는 본문 HTML을 attribute에 밀어 넣지 않고
 *   실제 문서를 재는 바닐라 경로다. content가 있으면 content 우선.
 * - a11y 상위집합: 분 수는 `<time datetime="PT3M">`(기계 판독 가능 기간)로 내보내고,
 *   v2에서 문맥 없이 "중급"만 읽히던 난이도에는 스크린리더 전용 접두 "난이도 "를 붙였다.
 *   가운뎃점은 v2와 같이 aria-hidden.
 * - 결정적 render(§3.1-3): 시간·랜덤·네트워크 의존이 없어 update()가 순수하다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import readingTimeStyles from "./reading-time.css.js";

/** 난이도 레벨(한글) — v2 DifficultyKo 승계 */
export type JdDifficulty = "초급" | "중급" | "고급";

export interface JdReadingEstimate {
  minutes: number;
  words: number;
  cjkChars: number;
}

/** ASCII 스타일 훅 — 표시 문자열(한글)과 CSS 셀렉터를 분리 */
const LEVEL_KEY: Record<JdDifficulty, string> = {
  초급: "basic",
  중급: "intermediate",
  고급: "advanced",
};

/** 히라가나·가타카나 · 한자(확장A·기본) · 한글 음절 — v2 범위 그대로 */
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g;
const WPM_LATIN = 230;
const CPM_CJK = 170;

/** HTML 태그 제거 후 순수 텍스트 */
export function stripHtml(html: string): string {
  return String(html ?? "").replace(/<[^>]*>/g, "").trim();
}

/** HTML 문자열의 h2·h3 개수 */
export function countHeadings(content: string): number {
  return String(content ?? "").match(/<h[23][^>]*>/gi)?.length ?? 0;
}

/** CJK 문자와 라틴 단어를 분리해 읽기 시간 추정 (v2 estimateReadingTime 동형) */
export function estimateReadingTime(text: string): JdReadingEstimate {
  const cleaned = String(text ?? "").replace(/\s+/g, " ").trim();
  const cjkChars = cleaned.match(CJK)?.length ?? 0;
  const words = cleaned.replace(CJK, " ").split(" ").filter(Boolean).length;
  const base = words / WPM_LATIN + cjkChars / CPM_CJK;
  return { minutes: Math.max(1, Math.ceil(base)), words, cjkChars };
}

/** 분량 + 헤딩 수 → 난이도 (v2 estimateDifficulty 동형) */
export function estimateDifficulty(minutes: number, headingCount: number): JdDifficulty {
  const score = minutes * 1.0 + headingCount * 0.25;
  if (score < 5) return "초급";
  if (score < 10) return "중급";
  return "고급";
}

export class JdReadingTime extends JdElement {
  static override tag = "jd-reading-time";
  static override props = {
    /** 텍스트 내용(HTML 또는 평문) */
    content: { type: String },
    /** 측정 대상 요소의 id. content가 없을 때만 쓰인다 */
    for: { type: String },
    /** short: "3분 읽기" · long: "약 3분 소요"(난이도 항상 표시) */
    format: { type: String, default: "short", reflect: true },
    /** short에서도 난이도 표시 */
    showDifficulty: { type: Boolean, reflect: true },
  };

  declare content: string;
  declare for: string;
  declare format: string;
  declare showDifficulty: boolean;

  #time: HTMLTimeElement | undefined;
  #sep: HTMLElement | undefined;
  #level: HTMLElement | undefined;
  #levelText: Text | undefined;

  /** 현재 입력 기준 추정치 */
  get estimate(): JdReadingEstimate {
    const { text } = this.#source();
    return estimateReadingTime(stripHtml(text));
  }

  get minutes(): number {
    return this.estimate.minutes;
  }

  get difficulty(): JdDifficulty {
    const { text, headings } = this.#source();
    return estimateDifficulty(estimateReadingTime(stripHtml(text)).minutes, headings);
  }

  /** `for` 대상이 나중에 바뀌었을 때 강제 재계산 */
  refresh(): void {
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(readingTimeStyles);
    if (!this.#collect()) this.#build();
    this.update();
  }

  #collect(): boolean {
    const time = this.querySelector<HTMLTimeElement>(":scope > time.jd-reading-time__time");
    const sep = this.querySelector<HTMLElement>(":scope > .jd-reading-time__sep");
    const level = this.querySelector<HTMLElement>(":scope > .jd-reading-time__level");
    if (!time || !sep || !level) return false;
    this.#time = time;
    this.#sep = sep;
    this.#level = level;
    this.#levelText = this.#tailText(level);
    return true;
  }

  #build(): void {
    for (const n of Array.from(this.children)) n.remove();
    const time = document.createElement("time");
    time.className = "jd-reading-time__time";

    const sep = document.createElement("span");
    sep.className = "jd-reading-time__sep";
    sep.setAttribute("aria-hidden", "true");
    sep.textContent = "·";

    const level = document.createElement("span");
    level.className = "jd-reading-time__level";
    const sr = document.createElement("span");
    sr.className = "jd-reading-time__sr";
    sr.textContent = "난이도 ";
    const text = document.createTextNode("");
    level.append(sr, text);

    this.append(time, sep, level);
    this.#time = time;
    this.#sep = sep;
    this.#level = level;
    this.#levelText = text;
  }

  /** 입양 골격의 마지막 텍스트 노드를 난이도 슬롯으로 삼는다(없으면 만든다) */
  #tailText(level: HTMLElement): Text {
    const last = level.lastChild;
    if (last && last.nodeType === Node.TEXT_NODE) return last as Text;
    const text = document.createTextNode("");
    level.append(text);
    return text;
  }

  /** content 우선, 없으면 `for` 대상 요소 */
  #source(): { text: string; headings: number } {
    if (this.content) return { text: this.content, headings: countHeadings(this.content) };
    const id = this.for;
    if (id) {
      const el = this.ownerDocument.getElementById(id);
      if (el) {
        return { text: el.textContent ?? "", headings: el.querySelectorAll("h2, h3").length };
      }
    }
    return { text: "", headings: 0 };
  }

  protected override update(): void {
    const { text, headings } = this.#source();
    const { minutes } = estimateReadingTime(stripHtml(text));
    const difficulty = estimateDifficulty(minutes, headings);
    const long = this.format === "long";

    const time = this.#time;
    if (time) {
      time.textContent = long ? `약 ${minutes}분 소요` : `${minutes}분 읽기`;
      time.dateTime = `PT${minutes}M`; // ISO 8601 기간 — 기계 판독용
    }

    const show = long || this.showDifficulty;
    if (this.#sep) this.#sep.hidden = !show;
    if (this.#level) {
      this.#level.hidden = !show;
      this.#level.dataset["level"] = LEVEL_KEY[difficulty];
    }
    if (this.#levelText) this.#levelText.data = difficulty;
  }
}
