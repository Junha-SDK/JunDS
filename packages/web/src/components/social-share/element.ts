/**
 * <jd-social-share> — 소셜 공유 버튼 그룹 (v2 composites/SocialShare).
 *
 * X / Facebook / LinkedIn / Kakao / Telegram / WhatsApp / Email / 복사. URL이 있는
 * 플랫폼은 `<a target="_blank">`, 복사·Kakao는 `<button>`으로 낸다. 복사는 내부에서
 * navigator.clipboard로 처리(1.5초 완료 표시), 그 외 클릭은 jd-share를 발행한다.
 *
 * 입력 경로: platforms는 문자열 목록이라 attribute(콤마 구분) 또는 property(Array)
 * 둘 다 받는다. url·title·size·shape는 스칼라 attribute.
 *
 * v2 대비 교정 3건:
 *  1. **Kakao가 죽은 버튼이었다.** v2는 href=null이라 클릭해도 아무 일이 없었다
 *     (SDK 미탑재). v3는 클릭 시 jd-share{platform:"kakao"}를 발행해 호스트가 Kakao
 *     SDK로 처리할 수 있게 한다 — 침묵 대신 이벤트.
 *  2. **복사 실패가 unhandled rejection이었다.** v2는 catch만 비워 뒀다. v3는
 *     jd-error를 발행한다(§1.5, copy-button 선례).
 *  3. **언마운트 후 타이머.** 복사 완료 타이머를 disconnected에서 해제한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import socialShareStyles from "./social-share.css.js";

export type JdSocialPlatform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "kakao"
  | "telegram"
  | "whatsapp"
  | "email"
  | "copy";

const ALL_PLATFORMS: readonly JdSocialPlatform[] = [
  "twitter",
  "facebook",
  "linkedin",
  "kakao",
  "telegram",
  "whatsapp",
  "email",
  "copy",
];

const DEFAULT_PLATFORMS: JdSocialPlatform[] = [
  "twitter",
  "facebook",
  "linkedin",
  "kakao",
  "email",
  "copy",
];

const LABELS: Record<JdSocialPlatform, string> = {
  twitter: "X(Twitter)",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  kakao: "KakaoTalk",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
  copy: "복사",
};

const GLYPHS: Record<JdSocialPlatform, string> = {
  twitter: "𝕏",
  facebook: "f",
  linkedin: "in",
  kakao: "K",
  telegram: "✈",
  whatsapp: "✆",
  email: "✉",
  copy: "⎘",
};

function buildShareUrl(p: JdSocialPlatform, url: string, title: string): string | null {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (p) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "email":
      return `mailto:?subject=${t}&body=${u}`;
    case "kakao":
    case "copy":
      return null;
  }
}

function isPlatform(v: string): v is JdSocialPlatform {
  return (ALL_PLATFORMS as readonly string[]).includes(v);
}

export class JdSocialShare extends JdElement {
  static override tag = "jd-social-share";
  static override props = {
    /** 공유할 URL */
    url: { type: String },
    /** 공유 제목/본문 */
    title: { type: String, default: "" },
    /** 크기 sm | md | lg */
    size: { type: String, default: "md", reflect: true },
    /** 모양 circle | square */
    shape: { type: String, default: "circle", reflect: true },
    // platforms는 attribute(콤마) 또는 property(Array) — 아래 접근자에서 처리
  };

  declare url: string;
  declare title: string;
  declare size: string;
  declare shape: string;

  #platforms: JdSocialPlatform[] = DEFAULT_PLATFORMS;
  #platformsSet = false;
  #built: readonly JdSocialPlatform[] | null = null;
  #copied = false;
  #timer = 0;

  get platforms(): JdSocialPlatform[] {
    return this.#platforms;
  }
  set platforms(v: JdSocialPlatform[] | string) {
    this.#platforms = this.#normalize(v);
    this.#platformsSet = true;
    this.#built = null;
    this.requestUpdate();
  }

  #normalize(v: JdSocialPlatform[] | string): JdSocialPlatform[] {
    const list = Array.isArray(v) ? v : String(v).split(",");
    const out = list
      .map((s) => String(s).trim())
      .filter((s): s is JdSocialPlatform => isPlatform(s));
    return out.length ? out : DEFAULT_PLATFORMS;
  }

  protected render(): void {
    adoptStyles(socialShareStyles);
    // attribute 경로 — property가 아직 안 왔으면 콤마 attribute를 읽는다
    if (!this.#platformsSet) {
      const attr = this.getAttribute("platforms");
      if (attr) this.#platforms = this.#normalize(attr);
    }
    this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "공유");
    this.update();
  }

  protected override disconnected(): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #onClick = (e: Event): void => {
    const control = (e.currentTarget as HTMLElement) ?? null;
    const p = control?.getAttribute("data-platform") as JdSocialPlatform | null;
    if (!p) return;
    this.emit("jd-share", { platform: p, url: this.url });
    if (p === "copy") {
      e.preventDefault();
      void this.copy();
    }
  };

  /** 명령형 API — URL을 클립보드에 복사한다 */
  async copy(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.url);
    } catch (error) {
      this.emit("jd-error", { error });
      return false;
    }
    this.#copied = true;
    this.emit("jd-copy", { text: this.url });
    this.requestUpdate();
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#timer = 0;
      this.#copied = false;
      this.requestUpdate();
    }, 1500) as unknown as number;
    return true;
  }

  protected override update(): void {
    const platforms = this.#platforms;
    if (this.#built !== platforms) this.#rebuild();

    // 링크 href / 라벨 / 글리프 갱신 (url·title 변화 반영)
    const controls = Array.from(
      this.querySelectorAll<HTMLElement>(":scope > .jd-social-share__btn"),
    );
    controls.forEach((control, i) => {
      const p = platforms[i];
      if (!p) return;
      const href = buildShareUrl(p, this.url, this.title);
      if (control instanceof HTMLAnchorElement && href) control.href = href;
      const isCopy = p === "copy";
      const label = isCopy && this.#copied ? "복사됨" : LABELS[p];
      control.setAttribute("aria-label", label);
      control.title = label;
      const glyph = control.querySelector<HTMLElement>(".jd-social-share__glyph");
      if (glyph) glyph.textContent = isCopy ? (this.#copied ? "✓" : GLYPHS.copy) : GLYPHS[p];
      if (isCopy) control.toggleAttribute("data-copied", this.#copied);
    });
  }

  #rebuild(): void {
    this.#built = this.#platforms;
    // 골격 재생성 — 기존 컨트롤 제거 후 다시 만든다
    for (const node of Array.from(
      this.querySelectorAll<HTMLElement>(":scope > .jd-social-share__btn"),
    )) {
      node.remove();
    }
    for (const p of this.#platforms) {
      const href = buildShareUrl(p, this.url, this.title);
      const control =
        href !== null
          ? (() => {
              const a = document.createElement("a");
              a.href = href;
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              return a;
            })()
          : (() => {
              const b = document.createElement("button");
              b.type = "button";
              return b;
            })();
      control.className = "jd-social-share__btn";
      control.setAttribute("data-platform", p);
      const glyph = document.createElement("span");
      glyph.className = "jd-social-share__glyph";
      glyph.setAttribute("aria-hidden", "true");
      control.append(glyph);
      control.addEventListener("click", this.#onClick);
      this.append(control);
    }
  }
}
