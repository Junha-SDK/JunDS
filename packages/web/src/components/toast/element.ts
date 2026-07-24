/**
 * <jd-toast> — 토스트 스택 호스트 (v2 providers/DsToastProvider).
 *
 * v2는 Context Provider로 `toast()`를 내려줬다. 바닐라에는 Context가 없으니
 * jd-announcer와 같은 규약을 쓴다(DEC-031-4): 요소의 메서드 + **문서당 하나를 지연
 * 생성하는 모듈 함수** `toast()`. import만으로 DOM을 건드리지 않는다.
 *
 * 스택 자체가 live region(aria-live=polite)이라 개별 토스트에 role을 또 얹지 않는다 —
 * 중첩 live region은 낭독이 겹친다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import toastStyles from "./toast.css.js";

export interface ToastOptions {
  title?: string;
  description?: string;
  /** info | success | warning | danger */
  variant?: string;
  /** 자동 닫힘(ms). 0이면 수동 */
  duration?: number;
}

export class JdToast extends JdElement {
  static override tag = "jd-toast";
  static override props = {
    /** top-right | top-left | bottom-right | bottom-left | top | bottom */
    position: { type: String, default: "top-right", reflect: true },
    /** 동시에 쌓이는 최대 개수 — 넘치면 가장 오래된 것부터 제거 */
    max: { type: Number, default: 4 },
  };

  declare position: string;
  declare max: number;

  protected render(): void {
    adoptStyles(toastStyles);
    this.setAttribute("role", "region");
    this.setAttribute("aria-live", "polite");
    this.setAttribute("aria-label", "알림");
  }

  /** 토스트 하나를 띄운다. 반환값으로 직접 닫을 수 있다 */
  show(opts: ToastOptions): { close(): void } {
    const item = document.createElement("div");
    item.className = "jd-toast__item";
    item.dataset.variant = opts.variant ?? "info";

    if (opts.title) {
      const t = document.createElement("p");
      t.className = "jd-toast__title";
      t.textContent = opts.title;
      item.append(t);
    }
    if (opts.description) {
      const d = document.createElement("p");
      d.className = "jd-toast__desc";
      d.textContent = opts.description;
      item.append(d);
    }

    const close = (): void => {
      if (timer) clearTimeout(timer);
      item.remove();
    };
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-toast__close";
    btn.setAttribute("aria-label", "알림 닫기");
    btn.textContent = "×";
    btn.addEventListener("click", close);
    item.append(btn);

    this.append(item);
    while (this.children.length > this.max) this.firstElementChild?.remove();

    const ms = opts.duration ?? 4000;
    let timer = 0;
    if (ms > 0) timer = setTimeout(close, ms) as unknown as number;
    // 포인터가 올라가면 자동 닫힘을 멈춘다(WCAG 2.2.1 — 읽는 중 사라짐 방지)
    item.addEventListener("pointerenter", () => {
      if (timer) clearTimeout(timer);
      timer = 0;
    });
    item.addEventListener("pointerleave", () => {
      if (ms > 0 && !timer) timer = setTimeout(close, ms) as unknown as number;
    });

    return { close };
  }

  /** 쌓인 토스트 전부 제거 */
  clear(): void {
    this.textContent = "";
  }
}

/** 문서당 하나를 지연 생성해 재사용 — v2 DsToastProvider Context의 바닐라 대응 */
export function toast(opts: ToastOptions): void {
  let host = document.querySelector<JdToast>("jd-toast");
  if (!host) {
    host = document.createElement(JdToast.tag) as JdToast;
    document.body.append(host);
  }
  // 방금 만든 요소는 render 전이다 — 업그레이드 후 호출
  queueMicrotask(() => host!.show(opts));
}
