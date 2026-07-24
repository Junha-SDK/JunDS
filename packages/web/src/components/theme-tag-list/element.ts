/**
 * <jd-theme-tag-list> — 해시태그 칩 줄 (v2 finance/ThemeTagList).
 *
 * 데이터 2경로(§1.3):
 *  1. `themes` 프로퍼티 (string[])
 *  2. 자식 `<script type="application/json">["A","B"]</script>` 슬롯
 *
 * 각 칩은 실제 `<a href>`(SSR·접근성)로, 경로 베이스를 `href-base`로 연다(v2는
 * /themes/daily?q= 고정). 클릭 시 jd-theme-select{theme}도 발행 — 오버레이를 앱이
 * 소유하는 sibling 규약(jd-daily-themes-calendar 동형)과 맞춘다.
 *
 * 색은 v2의 회전 팔레트(cat-3·2·4·8·5)를 data-accent 슬롯으로 옮겨 CSS가 칠한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import themeTagListStyles from "./theme-tag-list.css.js";

/** v2 ACCENTS 순서 — cat 슬롯 회전 */
const ACCENT_SLOTS = 5;

export class JdThemeTagList extends JdElement {
  static override tag = "jd-theme-tag-list";
  static override props = {
    /** 칩 링크 베이스 — `${base}${encodeURIComponent(theme)}` */
    hrefBase: { type: String, default: "/themes/daily?q=" },
    // themes(Array)는 property 전용(§1.3)
  };

  declare hrefBase: string;

  #themes: string[] = [];
  #root: HTMLElement | null = null;

  get themes(): string[] {
    return this.#themes;
  }
  set themes(v: string[]) {
    this.#themes = Array.isArray(v) ? v.map(String) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(themeTagListStyles);
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as string[];
        if (Array.isArray(parsed)) this.#themes = parsed.map(String);
      } catch {
        console.warn("[junds] <jd-theme-tag-list> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    this.#root = this.querySelector<HTMLElement>(":scope > .jd-theme-tag-list");
    if (!this.#root) {
      this.#root = document.createElement("div");
      this.#root.className = "jd-theme-tag-list";
      this.append(this.#root);
    }
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const chip = (e.target as Element).closest<HTMLElement>(".jd-theme-tag-list__chip");
    if (!chip || !this.contains(chip)) return;
    const theme = chip.dataset.theme;
    if (theme) this.emit("jd-theme-select", { theme });
  };

  protected override update(): void {
    const root = this.#root;
    if (!root) return;
    root.textContent = "";
    this.#themes.forEach((t, i) => {
      const chip = document.createElement("a");
      chip.className = "jd-theme-tag-list__chip";
      chip.dataset.theme = t;
      chip.dataset.accent = String(i % ACCENT_SLOTS);
      chip.href = `${this.hrefBase}${encodeURIComponent(t)}`;
      const hash = document.createElement("span");
      hash.className = "jd-theme-tag-list__hash";
      hash.setAttribute("aria-hidden", "true");
      hash.textContent = "#";
      chip.append(hash, document.createTextNode(t));
      root.append(chip);
    });
  }
}
