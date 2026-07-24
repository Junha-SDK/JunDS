/**
 * <jd-announcer> — 스크린리더 공지용 live region 쌍 (v2 primitives/Announcer).
 *
 * - v2는 Context로 announce()를 내려줬다. 바닐라엔 Context가 없으니 (a) 요소의
 *   announce() 메서드와 (b) 문서당 하나를 지연 생성하는 모듈 함수 `announce()`로 나눈다.
 *   지연 생성이라 import만으로 DOM을 건드리지 않는다(§3.1 SSR 안전).
 * - 같은 문구를 연달아 공지하면 AT가 "변화 없음"으로 무시한다 — v2처럼 비우고 다음
 *   프레임에 채워 변화를 만든다. rAF는 렌더 단계가 아니라 호출 시점이라 §3.1-3과 무관.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import announcerStyles from "./announcer.css.js";

export type JdPoliteness = "polite" | "assertive";

export class JdAnnouncer extends JdElement {
  static override tag = "jd-announcer";

  #polite!: HTMLDivElement;
  #assertive!: HTMLDivElement;

  protected render(): void {
    adoptStyles(announcerStyles);
    const existing = this.querySelector<HTMLDivElement>(':scope > [aria-live="polite"]');
    if (existing) {
      this.#polite = existing;
      this.#assertive = this.querySelector<HTMLDivElement>(':scope > [aria-live="assertive"]')!;
      return;
    }
    this.#polite = this.#region("polite", "status");
    this.#assertive = this.#region("assertive", "alert");
    this.append(this.#polite, this.#assertive);
  }

  #region(live: JdPoliteness, role: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "jd-announcer__region";
    el.setAttribute("aria-live", live);
    el.setAttribute("aria-atomic", "true");
    el.setAttribute("role", role);
    return el;
  }

  /** 메시지 공지. 같은 문구 반복도 전달되도록 비웠다가 다음 프레임에 채운다 */
  announce(message: string, politeness: JdPoliteness = "polite"): void {
    const region = politeness === "assertive" ? this.#assertive : this.#polite;
    if (!region) return;
    region.textContent = "";
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }
}

/** 문서당 하나를 지연 생성해 재사용 — v2 AnnouncerProvider Context의 바닐라 대응 */
export function announce(message: string, politeness: JdPoliteness = "polite"): void {
  let el = document.querySelector<JdAnnouncer>("jd-announcer");
  if (!el) {
    el = document.createElement(JdAnnouncer.tag) as JdAnnouncer;
    document.body.append(el);
  }
  // 방금 만든 요소는 render가 아직이다 — 업그레이드 완료 후 호출
  queueMicrotask(() => el!.announce(message, politeness));
}
