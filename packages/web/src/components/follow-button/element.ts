/**
 * <jd-follow-button> — 팔로우 토글 (v2 primitives/FollowButton).
 *
 * - 라벨 3종(팔로우 / 팔로잉 / 언팔로우)을 **전부 DOM에 두고 CSS가 고른다**. v2는
 *   hover/focus 상태를 React state로 들고 라벨을 갈아끼웠는데, 그건 포인터 이동마다
 *   리렌더가 도는 구조다. :hover/:focus-visible로 표시만 바꾸면 JS 0줄이고 포커스
 *   경로(v2 onFocus/onBlur)도 자동으로 같이 처리된다.
 * - 접근 이름은 상태 라벨이 아니라 aria-pressed + 고정 라벨로 준다 — 호버로 접근
 *   이름이 바뀌면 AT 사용자에게는 이유 없는 변화다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import followButtonStyles from "./follow-button.css.js";

export class JdFollowButton extends JdElement {
  static override tag = "jd-follow-button";
  static override props = {
    following: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    /** 팔로잉 상태에서 호버 시 언팔로우 강조 끄기 (v2 unfollowOnHover=false) */
    noUnfollowHover: { type: Boolean, reflect: true },
    followLabel: { type: String, default: "팔로우" },
    followingLabel: { type: String, default: "팔로잉" },
    unfollowLabel: { type: String, default: "언팔로우" },
    disabled: { type: Boolean, reflect: true },
  };

  declare following: boolean;
  declare size: string;
  declare noUnfollowHover: boolean;
  declare followLabel: string;
  declare followingLabel: string;
  declare unfollowLabel: string;
  declare disabled: boolean;

  #btn!: HTMLButtonElement;
  #labels: Record<string, HTMLSpanElement> = {};

  protected render(): void {
    adoptStyles(followButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-follow-button");
    if (existing) {
      this.#btn = existing;
      for (const key of ["follow", "following", "unfollow"]) {
        this.#labels[key] = existing.querySelector(`.jd-follow-button__${key}`)!;
      }
    } else {
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-follow-button";
      for (const key of ["follow", "following", "unfollow"]) {
        const span = document.createElement("span");
        span.className = `jd-follow-button__${key}`;
        this.#labels[key] = span;
        this.#btn.append(span);
      }
      this.append(this.#btn);
    }
    this.update();
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.following = !this.following;
    this.emit("jd-change", { following: this.following });
  };

  protected override update(): void {
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute("aria-pressed", String(this.following));
    this.#labels.follow!.textContent = this.followLabel;
    this.#labels.following!.textContent = this.followingLabel;
    this.#labels.unfollow!.textContent = this.unfollowLabel;
    // 호버로 접근 이름이 흔들리지 않도록 상태 기준 고정 라벨
    this.#btn.setAttribute("aria-label", this.following ? this.followingLabel : this.followLabel);
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
