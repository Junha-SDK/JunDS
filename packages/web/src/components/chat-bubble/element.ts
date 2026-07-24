/**
 * <jd-chat-bubble> — 채팅 메시지 말풍선 (v2 composites/ChatBubble).
 *
 * 본문은 무슬롯 children, 아바타는 `slot="avatar"` children(DEC-014-4 규약) —
 * v2의 `avatar: ReactNode`는 attribute에 실을 수 없기 때문이다.
 *
 * v2 대비 교정 3건:
 *  1. **시각이 `<p>`였다.** 기계 판독이 불가능했고 문단 의미도 아니었다. v3는
 *     `<time>`이고 `dateTime`을 주면 `datetime` 속성이 실린다.
 *  2. **말풍선 경계가 AT에 없었다.** 스레드에서 연달아 놓이면 "이름·본문·시각"이
 *     끊김 없이 이어져 어디까지가 한 메시지인지 알 수 없었다. sender가 있으면
 *     호스트에 role=group + aria-label(보낸 사람)을 걸어 경계를 만든다.
 *  3. **variant가 side=right에서만 먹었다.** v2는 왼쪽이면 primary를 통째로 무시했다
 *     (사양에 없는 분기 — 삼항 중첩의 부작용). v3는 양쪽에서 동일하게 적용한다.
 *
 * side·variant 분기는 호스트 속성 셀렉터가 담당한다(§4.3) — JS 분기 없음.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import chatBubbleStyles from "./chat-bubble.css.js";

export class JdChatBubble extends JdElement {
  static override tag = "jd-chat-bubble";
  static override props = {
    /** 보낸 사람 이름 — 있으면 호스트의 접근 이름이 된다 */
    sender: { type: String },
    /** 표시용 시각 텍스트 */
    timestamp: { type: String },
    /** `<time datetime>` 기계 판독 값 (ISO 8601) */
    dateTime: { type: String },
    /** left | right */
    side: { type: String, default: "left", reflect: true },
    /** default | primary */
    variant: { type: String, default: "default", reflect: true },
  };

  declare sender: string;
  declare timestamp: string;
  declare dateTime: string;
  declare side: string;
  declare variant: string;

  #avatar!: HTMLElement;
  #sender!: HTMLElement;
  #time!: HTMLTimeElement;

  protected render(): void {
    adoptStyles(chatBubbleStyles);
    // 입양(§3.3)
    const found = this.querySelector<HTMLElement>(":scope > .jd-chat-bubble__main");
    if (found) {
      this.#avatar = this.querySelector(".jd-chat-bubble__avatar")!;
      this.#sender = this.querySelector(".jd-chat-bubble__sender")!;
      this.#time = this.querySelector(".jd-chat-bubble__time")!;
      this.update();
      return;
    }

    const slotted = this.querySelector(':scope > [slot="avatar"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== slotted);

    this.#avatar = document.createElement("div");
    this.#avatar.className = "jd-chat-bubble__avatar";
    if (slotted) this.#avatar.append(slotted);
    else this.#avatar.hidden = true;

    this.#sender = document.createElement("p");
    this.#sender.className = "jd-chat-bubble__sender";
    const bubble = document.createElement("div");
    bubble.className = "jd-chat-bubble__bubble";
    bubble.append(...rest);
    this.#time = document.createElement("time");
    this.#time.className = "jd-chat-bubble__time";

    const main = document.createElement("div");
    main.className = "jd-chat-bubble__main";
    main.append(this.#sender, bubble, this.#time);

    this.append(this.#avatar, main);
    this.update();
  }

  protected override update(): void {
    this.#sender.textContent = this.sender;
    this.#sender.hidden = !this.sender;
    // 이름이 있을 때만 그룹 경계를 만든다 — 이름 없는 group은 AT에 잡음만 남긴다
    if (this.sender) {
      this.setAttribute("role", "group");
      this.setAttribute("aria-label", this.sender);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    }

    this.#time.textContent = this.timestamp;
    this.#time.hidden = !this.timestamp;
    if (this.dateTime) this.#time.setAttribute("datetime", this.dateTime);
    else this.#time.removeAttribute("datetime");
  }
}
