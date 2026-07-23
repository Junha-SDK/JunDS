/**
 * <jd-avatar> — 아바타 (v2 primitives/Avatar).
 * src 있으면 이미지, 없으면 이름 이니셜 + 이름 해시 팔레트(결정적 — §3.1-3 랜덤 금지와
 * 정합: 같은 이름 = 같은 색). status 점은 우하단 화이트 링.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import avatarStyles from "./avatar.css.js";

/** v2 팔레트 8종 (Tailwind 100/700 계 리터럴 승계) */
const PALETTE_COUNT = 8;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return ((parts[0]![0] ?? "") + (parts[1]![0] ?? "")).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** v2 해시 동형 — charCode + (hash<<5) - hash */
function paletteIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % PALETTE_COUNT;
}

export class JdAvatar extends JdElement {
  static override tag = "jd-avatar";
  static override props = {
    name: { type: String },
    src: { type: String },
    size: { type: String, default: "md", reflect: true }, // xs~xl
    status: { type: String, reflect: true }, // online | offline | away | busy
  };

  declare name: string;
  declare src: string;
  declare size: string;
  declare status: string;

  #img: HTMLImageElement | null = null;
  #fallback: HTMLDivElement | null = null;
  #dot: HTMLSpanElement | null = null;

  protected render(): void {
    adoptStyles(avatarStyles);
    this.#img = this.querySelector(":scope > img.jd-avatar__img");
    this.#fallback = this.querySelector(":scope > .jd-avatar__fallback");
    this.#dot = this.querySelector(":scope > .jd-avatar__status");
    this.update();
  }

  protected override update(): void {
    if (this.src) {
      this.#fallback?.remove();
      this.#fallback = null;
      if (!this.#img) {
        this.#img = document.createElement("img");
        this.#img.className = "jd-avatar__img";
        this.prepend(this.#img);
      }
      this.#img.src = this.src;
      this.#img.alt = this.name || "avatar";
    } else {
      this.#img?.remove();
      this.#img = null;
      if (!this.#fallback) {
        this.#fallback = document.createElement("div");
        this.#fallback.className = "jd-avatar__fallback";
        this.prepend(this.#fallback);
      }
      this.#fallback.textContent = this.name ? initials(this.name) : "?";
      if (this.name) this.#fallback.setAttribute("data-palette", String(paletteIndex(this.name)));
      else this.#fallback.removeAttribute("data-palette");
    }

    if (this.status) {
      if (!this.#dot) {
        this.#dot = document.createElement("span");
        this.#dot.className = "jd-avatar__status";
        this.append(this.#dot);
      }
    } else {
      this.#dot?.remove();
      this.#dot = null;
    }
  }
}
