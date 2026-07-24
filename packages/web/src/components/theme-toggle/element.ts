/**
 * <jd-theme-toggle> — 라이트/다크 색 구성 토글 버튼 (v2 finance/ThemeToggle).
 *
 * v2는 useThemeMode(localStorage) + useCoreConfig().setColorMode를 엮었고, 하이드레이션
 * 전에는 빈 자리를 렌더해 SSR 불일치를 피했다. DS도 같은 전략:
 *  - render()는 **결정적**이다(프리렌더 규칙): 저장소·matchMedia를 읽지 않고 라이트
 *    기본(달 아이콘) 골격만 만든다. 브라우저 상태 반영은 이펙트 단계인 connected()에서만.
 *  - 모드는 저장값(jd-color-mode) 우선, 없으면 prefers-color-scheme. 토글 시 저장 +
 *    documentElement에 data-jd-theme(전환기 data-theme 병기)를 칠한다.
 *  - createStoredValue로 탭 간 동기화, 명시 저장값이 없을 때만 OS 변화 추종.
 *
 * jd-change{mode} 사후 발행 — 관찰자용.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createStoredValue, type StoredValue } from "../../behaviors/storage.js";
import { createColorSchemeWatcher, type JdColorScheme } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import themeToggleStyles from "./theme-toggle.css.js";

const NS = "http://www.w3.org/2000/svg";
const ICON_MOON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
const ICON_SUN =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';

export class JdThemeToggle extends JdElement {
  static override tag = "jd-theme-toggle";
  static override props = {
    /** localStorage 키 */
    storageKey: { type: String, default: "jd-color-mode" },
  };

  declare storageKey: string;

  #btn!: HTMLButtonElement;
  #icon!: SVGSVGElement;
  #store: StoredValue<JdColorScheme | null> | null = null;
  #os: Watcher<JdColorScheme> | null = null;
  #mode: JdColorScheme = "light";
  #explicit = false;

  protected render(): void {
    adoptStyles(themeToggleStyles);
    let btn = this.querySelector<HTMLButtonElement>(":scope > button.jd-theme-toggle");
    if (btn) {
      this.#btn = btn;
      this.#icon = btn.querySelector("svg")!;
    } else {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-theme-toggle";
      this.#icon = document.createElementNS(NS, "svg");
      this.#icon.setAttribute("viewBox", "0 0 24 24");
      this.#icon.setAttribute("width", "18");
      this.#icon.setAttribute("height", "18");
      this.#icon.setAttribute("fill", "none");
      this.#icon.setAttribute("stroke", "currentColor");
      this.#icon.setAttribute("stroke-width", "1.8");
      this.#icon.setAttribute("stroke-linecap", "round");
      this.#icon.setAttribute("stroke-linejoin", "round");
      this.#icon.setAttribute("aria-hidden", "true");
      btn.append(this.#icon);
      this.#btn = btn;
      this.append(btn);
    }
    // 결정적 기본 — 라이트(달). 브라우저 상태 반영은 connected()에서.
    this.#paint("light");
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
    // 이펙트 단계: 저장값 → prefers 순으로 실제 모드 해석 후 적용.
    this.#store = this.own(
      createStoredValue<JdColorScheme | null>(this.storageKey, null),
    );
    this.#os = this.own(createColorSchemeWatcher());
    const stored = this.#store.get();
    this.#explicit = stored === "light" || stored === "dark";
    this.#apply(this.#explicit ? (stored as JdColorScheme) : this.#os.get(), { persist: false });

    // 다른 탭에서 저장값이 바뀌면 따라간다
    this.own({
      destroy: this.#store.subscribe((v) => {
        this.#explicit = v === "light" || v === "dark";
        if (this.#explicit) this.#apply(v as JdColorScheme, { persist: false });
      }),
    });

    // 명시 저장값이 없을 때만 OS 색 구성을 추종한다
    this.own({
      destroy: this.#os.subscribe((mode) => {
        if (!this.#explicit) this.#apply(mode, { persist: false });
      }),
    });
  }

  protected override disconnected(): void {
    this.#btn.removeEventListener("click", this.#onClick);
  }

  #onClick = (): void => {
    this.#explicit = true;
    this.#apply(this.#mode === "dark" ? "light" : "dark", { persist: true });
  };

  /** 문서 루트에 색 구성을 칠하고 버튼 표시를 갱신 */
  #apply(mode: JdColorScheme, opts: { persist: boolean }): void {
    this.#mode = mode;
    const root = this.ownerDocument.documentElement;
    if (mode === "dark") {
      root.setAttribute("data-jd-theme", "dark");
      root.setAttribute("data-theme", "dark"); // 전환기 병기(02-tokens §4.1)
    } else {
      root.removeAttribute("data-jd-theme");
      root.removeAttribute("data-theme");
    }
    if (opts.persist) this.#store?.set(mode);
    this.#paint(mode);
    this.emit("jd-change", { mode });
  }

  /** 아이콘·라벨만 갱신 (결정적 — render/connected 공용) */
  #paint(mode: JdColorScheme): void {
    const dark = mode === "dark";
    this.#icon.innerHTML = dark ? ICON_SUN : ICON_MOON;
    this.#btn.setAttribute("aria-label", dark ? "라이트 모드로 전환" : "다크 모드로 전환");
    this.#btn.setAttribute("aria-pressed", String(dark));
  }
}
