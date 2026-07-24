/**
 * <jd-theme-news-summary> — 추출식 뉴스 요약 카드 (v2 finance/ThemeNewsSummary).
 *
 * v2는 컴포넌트 안에서 /api/news를 fetch하고 summarizeNews()로 요약했다. DS 컴포넌트는
 * 네트워크·요약(newsSummary.ts)을 앱에 남기고 **표시 전용**으로 둔다: 앱이 요약 결과를
 * `summary` property로 싣고 `loading`을 토글한다. 세 상태(로딩·빈결과·데이터)를 한 골격에서
 * 토글로 전환한다(§3.3 멱등 — innerHTML 재구축 없이).
 *
 * v2 대비 개선: 문장 목록을 시맨틱 <ol>로(v2는 <p>+수동 번호칩), tone 배지는 aria-label로
 * 부호를 말로 읽힌다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import themeNewsSummaryStyles from "./theme-news-summary.css.js";

export interface JdNewsSummary {
  sentences: string[];
  keyTerms: { term: string; count: number }[];
  /** 순 톤 [-1,1] */
  tone: number;
  itemCount: number;
}

const ICON_SPARKLES =
  '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>';
const SVG_NS = "http://www.w3.org/2000/svg";

function iconSvg(paths: string, size: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "jd-theme-news-summary__icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.4");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

export class JdThemeNewsSummary extends JdElement {
  static override tag = "jd-theme-news-summary";
  static override props = {
    /** 요약 대상 질의(테마·종목명) — 헤더에 표기 */
    query: { type: String, default: "" },
    /** 사이드바용 축약형 — 키워드 푸터 숨김 */
    compact: { type: Boolean, reflect: true },
    /** 앱이 fetch 중이면 true → 스켈레톤 */
    loading: { type: Boolean, reflect: true },
  };

  declare query: string;
  declare compact: boolean;
  declare loading: boolean;

  #summary: JdNewsSummary | null = null;
  #skeleton!: HTMLElement;
  #empty!: HTMLElement;
  #main!: HTMLElement;
  #meta!: HTMLElement;
  #toneChip!: HTMLElement;
  #list!: HTMLOListElement;
  #terms!: HTMLElement;
  #termsWrap!: HTMLElement;

  get summary(): JdNewsSummary | null {
    return this.#summary;
  }
  set summary(v: JdNewsSummary | null) {
    this.#summary = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(themeNewsSummaryStyles);
    this.#readJson();
    if (!this.querySelector(":scope > .jd-theme-news-summary__skeleton")) this.#build();
    else this.#adopt();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdNewsSummary;
      if (parsed && typeof parsed === "object") this.#summary = parsed;
    } catch {
      /* 잘못된 JSON은 무시 */
    }
    script.remove();
  }

  #adopt(): void {
    this.#skeleton = this.querySelector(":scope > .jd-theme-news-summary__skeleton")!;
    this.#empty = this.querySelector(":scope > .jd-theme-news-summary__empty")!;
    this.#main = this.querySelector(":scope > .jd-theme-news-summary__main")!;
    this.#meta = this.#main.querySelector(".jd-theme-news-summary__meta")!;
    this.#toneChip = this.#main.querySelector(".jd-theme-news-summary__tone")!;
    this.#list = this.#main.querySelector(".jd-theme-news-summary__list")!;
    this.#termsWrap = this.#main.querySelector(".jd-theme-news-summary__terms")!;
    this.#terms = this.#termsWrap.querySelector(".jd-theme-news-summary__term-list")!;
  }

  #build(): void {
    // 스켈레톤
    this.#skeleton = document.createElement("div");
    this.#skeleton.className = "jd-theme-news-summary__skeleton";
    for (const w of ["32%", "100%", "92%", "75%"]) {
      const bar = document.createElement("div");
      bar.className = "jd-theme-news-summary__bar";
      bar.style.width = w;
      this.#skeleton.append(bar);
    }

    // 빈 결과
    this.#empty = document.createElement("div");
    this.#empty.className = "jd-theme-news-summary__empty";
    this.#empty.textContent = "관련 뉴스를 가져오지 못했습니다.";

    // 본문
    this.#main = document.createElement("div");
    this.#main.className = "jd-theme-news-summary__main";

    const head = document.createElement("div");
    head.className = "jd-theme-news-summary__head";
    const titleGroup = document.createElement("div");
    titleGroup.className = "jd-theme-news-summary__title";
    titleGroup.append(iconSvg(ICON_SPARKLES, 14));
    const titleText = document.createElement("span");
    titleText.textContent = "뉴스 한눈에";
    this.#meta = document.createElement("span");
    this.#meta.className = "jd-theme-news-summary__meta";
    titleGroup.append(titleText, this.#meta);
    this.#toneChip = document.createElement("span");
    this.#toneChip.className = "jd-theme-news-summary__tone";
    head.append(titleGroup, this.#toneChip);

    this.#list = document.createElement("ol");
    this.#list.className = "jd-theme-news-summary__list";

    this.#termsWrap = document.createElement("div");
    this.#termsWrap.className = "jd-theme-news-summary__terms";
    const termsLabel = document.createElement("span");
    termsLabel.className = "jd-theme-news-summary__terms-label";
    termsLabel.textContent = "키워드";
    this.#terms = document.createElement("div");
    this.#terms.className = "jd-theme-news-summary__term-list";
    this.#termsWrap.append(termsLabel, this.#terms);

    this.#main.append(head, this.#list, this.#termsWrap);
    this.append(this.#skeleton, this.#empty, this.#main);
  }

  #toneMeta(tone: number): { state: string; label: string } {
    if (tone > 0.15) return { state: "positive", label: "전반 호재" };
    if (tone < -0.15) return { state: "negative", label: "전반 악재" };
    return { state: "neutral", label: "혼조" };
  }

  protected override update(): void {
    const s = this.#summary;
    const hasData = !this.loading && !!s && s.itemCount > 0;
    const isEmpty = !this.loading && !hasData;

    this.#skeleton.hidden = !this.loading;
    this.#empty.hidden = !isEmpty;
    this.#main.hidden = !hasData;
    if (!hasData || !s) return;

    // 메타: "query" · N건
    this.#meta.textContent = `“${this.query}” · ${s.itemCount}건`;

    // 톤 배지
    const tm = this.#toneMeta(s.tone);
    const signed = `${s.tone >= 0 ? "+" : ""}${s.tone.toFixed(2)}`;
    this.#toneChip.dataset.state = tm.state;
    this.#toneChip.textContent = `${tm.label} ${signed}`;
    this.#toneChip.setAttribute("aria-label", `${tm.label}, 톤 점수 ${signed}`);

    // 문장 목록 정합
    this.#reconcile(this.#list, s.sentences.length, "li", "jd-theme-news-summary__item");
    s.sentences.forEach((text, i) => {
      (this.#list.children[i] as HTMLElement).textContent = text;
    });

    // 키워드 푸터
    const showTerms = !this.compact && s.keyTerms.length > 0;
    this.#termsWrap.hidden = !showTerms;
    if (showTerms) {
      this.#reconcile(this.#terms, s.keyTerms.length, "span", "jd-theme-news-summary__chip");
      s.keyTerms.forEach((k, i) => {
        const chip = this.#terms.children[i] as HTMLElement;
        chip.textContent = k.term;
        const count = document.createElement("span");
        count.className = "jd-theme-news-summary__chip-count";
        count.textContent = String(k.count);
        chip.append(count);
      });
    }
  }

  /** 자식 개수를 count에 맞춘다(초과 제거·부족 추가). 텍스트는 호출부가 채운다. */
  #reconcile(parent: HTMLElement, count: number, tag: string, className: string): void {
    while (parent.children.length > count) parent.lastElementChild!.remove();
    while (parent.children.length < count) {
      const el = document.createElement(tag);
      el.className = className;
      parent.append(el);
    }
  }
}
