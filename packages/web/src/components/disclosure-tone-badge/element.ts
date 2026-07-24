/**
 * <jd-disclosure-tone-badge> — DART 공시 톤 분류 라벨 (v2 finance/DisclosureToneBadge).
 *
 * v2는 `classification` 객체(tone·category·confidence·matched)를 통째로 받아
 * TONE_TOKENS·CATEGORY_LABELS 조회로 그렸다. v3는 분류 로직(disclosureTone.ts)을
 * 앱에 남기고 이 컴포넌트는 **표시 전용**으로 둔다 — attribute로 tone/category/confidence를,
 * property로 matched(툴팁)를 받는다. tone 색은 host CSS의 finance 토큰(--bm-* → jd 폴백)이 실린다.
 *
 * v2 대비 개선: host에 aria-label을 붙여, category·confidence를 숨기는 compact 모드에서도
 * 스크린리더가 "호재 · 실적 · 신뢰도 87%"를 온전히 읽는다(v2는 접근 이름이 없었다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import disclosureToneBadgeStyles from "./disclosure-tone-badge.css.js";

/** disclosureTone.ts와 동형 — 순수 표시 라벨(9종). */
const CATEGORY_LABELS: Record<string, string> = {
  earnings: "실적",
  financing: "자금조달",
  treasury: "자사주",
  governance: "지배구조",
  ownership: "지분",
  dividend: "배당",
  guidance: "사업",
  litigation: "분쟁/제재",
  other: "기타",
};

const TONE_LABELS: Record<string, string> = {
  positive: "호재",
  negative: "악재",
  neutral: "중립",
};

export class JdDisclosureToneBadge extends JdElement {
  static override tag = "jd-disclosure-tone-badge";
  static override props = {
    /** positive | negative | neutral */
    tone: { type: String, default: "neutral", reflect: true },
    /** disclosureTone 카테고리 키(earnings…other) 또는 이미 번역된 라벨 */
    category: { type: String, default: "other" },
    /** 0~1 — 0이면 신뢰도 숨김 */
    confidence: { type: Number, default: 0 },
    /** 표(row)용 축약형 — 톤 라벨만 노출 */
    compact: { type: Boolean, reflect: true },
  };

  declare tone: string;
  declare category: string;
  declare confidence: number;
  declare compact: boolean;

  #matched: string[] = [];
  #tone!: HTMLSpanElement;
  #cat!: HTMLSpanElement;
  #conf!: HTMLSpanElement;

  /** 매칭 키워드 — 툴팁 표시용(복합 데이터 → property, §1.3) */
  get matched(): string[] {
    return this.#matched;
  }
  set matched(v: string[]) {
    this.#matched = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(disclosureToneBadgeStyles);
    // 입양(§3.3): 이미 골격이 있으면 재사용
    const existing = this.querySelector<HTMLSpanElement>(":scope > .jd-disclosure-tone-badge__tone");
    if (existing) {
      this.#tone = existing;
      this.#cat = this.querySelector<HTMLSpanElement>(":scope > .jd-disclosure-tone-badge__cat")!;
      this.#conf = this.querySelector<HTMLSpanElement>(":scope > .jd-disclosure-tone-badge__conf")!;
    } else {
      this.#tone = document.createElement("span");
      this.#tone.className = "jd-disclosure-tone-badge__tone";
      this.#cat = document.createElement("span");
      this.#cat.className = "jd-disclosure-tone-badge__cat";
      this.#conf = document.createElement("span");
      this.#conf.className = "jd-disclosure-tone-badge__conf";
      this.append(this.#tone, this.#cat, this.#conf);
    }
    this.update();
  }

  #categoryLabel(): string {
    return CATEGORY_LABELS[this.category] ?? this.category;
  }

  protected override update(): void {
    const toneLabel = TONE_LABELS[this.tone] ?? this.tone;
    const catLabel = this.#categoryLabel();
    const conf = Math.round((Number(this.confidence) || 0) * 100);
    const showConf = Number(this.confidence) > 0;

    this.#tone.textContent = toneLabel;
    this.#cat.textContent = catLabel;
    this.#conf.textContent = `${conf}%`;
    this.#conf.hidden = !showConf;

    // 접근 이름 — compact가 category/confidence를 감춰도 온전히 읽힌다
    const parts = [toneLabel, catLabel];
    if (showConf) parts.push(`신뢰도 ${conf}%`);
    if (this.#matched.length) parts.push(this.#matched.join(", "));
    const desc = parts.join(" · ");
    this.setAttribute("aria-label", desc);
    // compact는 v2와 동일하게 툴팁(title)로 전체 맥락 제공
    if (this.compact) this.setAttribute("title", desc);
    else this.removeAttribute("title");
  }
}
