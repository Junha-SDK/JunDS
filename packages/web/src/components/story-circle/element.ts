/**
 * <jd-story-circle> — 스토리 링 (v2 composites/StoryCircle).
 *
 * Instagram식 그라디언트 링 + 상태(unread/read/live/muted) + LIVE 배지. 내부에
 * 진짜 `<button>` 하나를 두고(follow-button 선례) 클릭은 네이티브 click이 그대로
 * 버블한다 — `jd-click` 재발명 금지(§1.5).
 *
 * v2 대비 개선: state·size 분기를 전부 CSS(호스트 속성 셀렉터 + CSS 변수)로 옮겨
 * JS에 색/치수 표가 없다(§4.3). 접근 이름은 `${name} 스토리`로 고정.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import storyCircleStyles from "./story-circle.css.js";

export type JdStoryRingState = "unread" | "read" | "live" | "muted";

export class JdStoryCircle extends JdElement {
  static override tag = "jd-story-circle";
  static override props = {
    /** 사용자 표시 이름 — 접근 이름과 라벨에 쓰인다 */
    name: { type: String },
    /** 아바타 이미지 URL — 없으면 이니셜 폴백 */
    avatar: { type: String },
    /** unread | read | live | muted */
    state: { type: String, default: "unread", reflect: true },
    /** 지름(px) */
    size: { type: Number, default: 64 },
    /** LIVE 배지 문구 */
    liveLabel: { type: String, default: "LIVE" },
  };

  declare name: string;
  declare avatar: string;
  declare state: JdStoryRingState;
  declare size: number;
  declare liveLabel: string;

  #btn!: HTMLButtonElement;
  #img!: HTMLImageElement;
  #fallback!: HTMLSpanElement;
  #live!: HTMLSpanElement;
  #name!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(storyCircleStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-story-circle");
    if (existing) {
      this.#btn = existing;
      this.#img = existing.querySelector(".jd-story-circle__img")!;
      this.#fallback = existing.querySelector(".jd-story-circle__fallback")!;
      this.#live = existing.querySelector(".jd-story-circle__live")!;
      this.#name = existing.querySelector(".jd-story-circle__name")!;
    } else {
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-story-circle";

      const ring = document.createElement("span");
      ring.className = "jd-story-circle__ring";
      const frame = document.createElement("span");
      frame.className = "jd-story-circle__frame";

      this.#img = document.createElement("img");
      this.#img.className = "jd-story-circle__img";
      this.#img.alt = "";
      this.#fallback = document.createElement("span");
      this.#fallback.className = "jd-story-circle__fallback";
      this.#fallback.setAttribute("aria-hidden", "true");
      frame.append(this.#img, this.#fallback);

      this.#live = document.createElement("span");
      this.#live.className = "jd-story-circle__live";
      ring.append(frame, this.#live);

      this.#name = document.createElement("span");
      this.#name.className = "jd-story-circle__name";

      this.#btn.append(ring, this.#name);
      this.append(this.#btn);
    }
    this.update();
  }

  protected override update(): void {
    // size는 인스턴스 고유 지오메트리 — 인라인 CSS 변수로 전달(§4.3 emoji-picker 선례)
    this.style.setProperty("--_jd-story-size", `${this.size > 0 ? this.size : 64}px`);

    const label = this.name || "";
    this.#btn.setAttribute("aria-label", label ? `${label} 스토리` : "스토리");
    this.#name.textContent = label;
    this.#name.hidden = !label;

    const hasImg = Boolean(this.avatar);
    this.#img.hidden = !hasImg;
    this.#fallback.hidden = hasImg;
    if (hasImg) {
      if (this.#img.getAttribute("src") !== this.avatar) this.#img.src = this.avatar;
    } else {
      this.#img.removeAttribute("src");
      this.#fallback.textContent = label ? label.slice(0, 1) : "";
    }

    const live = this.state === "live";
    this.#live.textContent = this.liveLabel;
    this.#live.hidden = !live;
  }

  /** 트리거로 프로그램적 포커스 위임 */
  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
