/**
 * <jd-emoji-reaction> — Slack/GitHub식 이모지 반응 바 (v2 composites/EmojiReaction).
 *
 * 반응 목록은 복합 데이터라 attribute 금지(§1.3) — `reactions` 프로퍼티 또는 자식
 * `<script type="application/json">` 슬롯으로 받는다(radio-group·action-sheet 선례).
 *
 * v2 대비 개선:
 *  1. v2 `showAddButton`(기본 true)은 boolean attribute로 옮기면 "부재=false" 규칙과
 *     충돌한다(존재만으로 true) — 의미를 뒤집어 `hide-add-button`(기본 false)으로 둔다
 *     (follow-button `no-unfollow-hover` 선례).
 *  2. 반응 하나하나가 토글 버튼이므로 호스트에 role=group + aria-label을 두고 각 칩은
 *     aria-pressed로 반응 여부를 노출(v2 동일)하되, 카운트는 tabular-nums로 폭이 튀지
 *     않는다.
 *
 * 이벤트: `jd-toggle`{emoji, reactedByMe} — 칩 클릭 · `jd-add-reaction` — + 버튼. 둘 다
 * 사후 통지라 cancelable=false(§1.5).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import emojiReactionStyles from "./emoji-reaction.css.js";

export interface JdEmojiReactionItem {
  /** 이모지 캐릭터 */
  emoji: string;
  /** 카운트 */
  count: number;
  /** 현재 사용자가 반응했는지 */
  reactedByMe?: boolean;
  /** 사용자 라벨(title 툴팁용) */
  users?: string[];
}

export class JdEmojiReaction extends JdElement {
  static override tag = "jd-emoji-reaction";
  static override props = {
    /** 반응 바 전체 접근 이름 */
    label: { type: String, default: "반응" },
    /** + 버튼 숨김 (v2 showAddButton=false 대응) */
    hideAddButton: { type: Boolean, reflect: true },
    /** + 버튼 접근 이름 */
    addLabel: { type: String, default: "반응 추가" },
    // reactions(Array)는 property 전용(§1.3) — 아래 접근자로 선언
  };

  declare label: string;
  declare hideAddButton: boolean;
  declare addLabel: string;

  #reactions: JdEmojiReactionItem[] = [];
  #items: HTMLButtonElement[] = [];
  #add!: HTMLButtonElement;

  get reactions(): JdEmojiReactionItem[] {
    return this.#reactions;
  }
  set reactions(v: JdEmojiReactionItem[]) {
    this.#reactions = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(emojiReactionStyles);
    this.#readJson();
    this.setAttribute("role", "group");

    this.#add = this.querySelector<HTMLButtonElement>(":scope > .jd-emoji-reaction__add") ?? (() => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-emoji-reaction__add";
      b.textContent = "＋";
      this.append(b);
      return b;
    })();
    // 입양(§3.3): 기존 칩을 회수해 재사용
    this.#items = Array.from(
      this.querySelectorAll<HTMLButtonElement>(":scope > .jd-emoji-reaction__item"),
    );
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdEmojiReactionItem[];
      if (Array.isArray(parsed)) this.#reactions = parsed;
    } catch {
      console.warn("[junds] <jd-emoji-reaction> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target.closest(".jd-emoji-reaction__add")) {
      if (!this.hideAddButton) this.emit("jd-add-reaction");
      return;
    }
    const chip = target.closest<HTMLButtonElement>(".jd-emoji-reaction__item");
    if (!chip) return;
    const i = this.#items.indexOf(chip);
    const item = this.#reactions[i];
    if (!item) return;
    this.emit("jd-toggle", { emoji: item.emoji, reactedByMe: Boolean(item.reactedByMe) });
  };

  protected override update(): void {
    this.setAttribute("aria-label", this.label);

    // 칩 개수 동기화 — + 버튼은 항상 마지막
    if (this.#items.length !== this.#reactions.length) {
      for (const b of this.#items) b.remove();
      this.#items = this.#reactions.map(() => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "jd-emoji-reaction__item";
        const emoji = document.createElement("span");
        emoji.className = "jd-emoji-reaction__emoji";
        const count = document.createElement("span");
        count.className = "jd-emoji-reaction__count";
        b.append(emoji, count);
        this.insertBefore(b, this.#add);
        return b;
      });
    }

    this.#items.forEach((b, i) => {
      const r = this.#reactions[i]!;
      b.querySelector(".jd-emoji-reaction__emoji")!.textContent = r.emoji;
      b.querySelector(".jd-emoji-reaction__count")!.textContent = String(r.count);
      const reacted = Boolean(r.reactedByMe);
      b.toggleAttribute("data-reacted", reacted);
      if (reacted) b.setAttribute("aria-pressed", "true");
      else b.removeAttribute("aria-pressed");
      const title = r.users?.join(", ");
      if (title) b.title = title;
      else b.removeAttribute("title");
    });

    this.#add.hidden = this.hideAddButton;
    this.#add.setAttribute("aria-label", this.addLabel);
  }
}
