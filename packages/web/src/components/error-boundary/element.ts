/**
 * <jd-error-boundary> — 실패 시 대체 UI로 갈아끼우는 경계 (v2 primitives/ErrorBoundary).
 *
 * **능력 범위를 분명히 한다**: React의 경계는 *렌더 단계 예외*를 가로챈다. 바닐라에는
 * 그런 훅이 없다 — 자손 컴포넌트가 던진 예외는 조상으로 전파되지 않고 window로 간다.
 * 그래서 이 요소가 제공하는 것은 (a) 실패 상태 기계 + 대체 UI + 재시도, (b) **선택적**
 * 자동 포착(`auto`)이다. v2와 동일한 "렌더 예외 포착"이 필요하면 react 어댑터에서
 * 진짜 클래스 경계를 쓰는 것이 정답이며, 이 CE는 그 대체재가 아니다.
 *
 * `auto`가 켜지면 두 신호를 듣는다:
 *  - 자손의 리소스 `error`(img/script 로드 실패) — 버블하지 않지만 캡처 단계로 온다
 *  - 자손이 올린 `jd-error` CustomEvent(§1.5 canonical)
 * 기본이 꺼짐인 이유: 이미지 한 장 실패로 섹션 전체를 대체 UI로 바꾸는 것은 과잉이다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import errorBoundaryStyles from "./error-boundary.css.js";

export class JdErrorBoundary extends JdElement {
  static override tag = "jd-error-boundary";
  static override props = {
    /** 실패 상태 — CSS 훅 겸 상태 */
    failed: { type: Boolean, reflect: true },
    /** 실패 사유(대체 UI 본문) */
    message: { type: String },
    heading: { type: String, default: "오류가 발생했습니다" },
    retryLabel: { type: String, default: "다시 시도" },
    /** 자손 error·jd-error를 자동 포착 */
    auto: { type: Boolean, reflect: true },
  };

  declare failed: boolean;
  declare message: string;
  declare heading: string;
  declare retryLabel: string;
  declare auto: boolean;

  #fallback!: HTMLDivElement;
  #heading!: HTMLParagraphElement;
  #message!: HTMLParagraphElement;
  #retry!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(errorBoundaryStyles);
    const existing = this.querySelector<HTMLDivElement>(":scope > .jd-error-boundary__fallback");
    if (existing) {
      this.#fallback = existing;
      this.#heading = existing.querySelector(".jd-error-boundary__heading")!;
      this.#message = existing.querySelector(".jd-error-boundary__message")!;
      this.#retry = existing.querySelector(".jd-error-boundary__retry")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#fallback = document.createElement("div");
    this.#fallback.className = "jd-error-boundary__fallback";
    this.#fallback.setAttribute("role", "alert");
    const icon = document.createElement("span");
    icon.className = "jd-error-boundary__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⚠";
    this.#heading = document.createElement("p");
    this.#heading.className = "jd-error-boundary__heading";
    this.#message = document.createElement("p");
    this.#message.className = "jd-error-boundary__message";
    this.#retry = document.createElement("button");
    this.#retry.type = "button";
    this.#retry.className = "jd-error-boundary__retry";
    this.#fallback.append(icon, this.#heading, this.#message, this.#retry);
    this.append(this.#fallback);
  }

  protected override connected(): void {
    this.#retry.addEventListener("click", this.#onRetry);
    // 리소스 error는 버블하지 않는다 — 캡처 단계로 받아야 자손 실패가 잡힌다
    this.addEventListener("error", this.#onDescendantError, true);
    this.addEventListener("jd-error", this.#onDescendantError);
  }

  protected override disconnected(): void {
    this.#retry?.removeEventListener("click", this.#onRetry);
    this.removeEventListener("error", this.#onDescendantError, true);
    this.removeEventListener("jd-error", this.#onDescendantError);
  }

  #onDescendantError = (e: Event): void => {
    if (!this.auto || this.failed) return;
    if (e.target === this) return; // 자기 자신이 올린 것은 무시
    const detail = (e as CustomEvent<{ error?: unknown }>).detail;
    const reason =
      detail?.error instanceof Error
        ? detail.error.message
        : `${(e.target as Element)?.tagName?.toLowerCase() ?? "자손"} 요소가 실패했습니다`;
    this.fail(reason);
  };

  #onRetry = (): void => {
    this.reset();
  };

  /** 실패 상태로 전환 */
  fail(reason: unknown): void {
    this.message = reason instanceof Error ? reason.message : String(reason ?? "");
    this.failed = true;
  }

  /** 실패 해제 — 소비자가 jd-change를 듣고 재시도 로직을 돌린다 */
  reset(): void {
    this.failed = false;
    this.message = "";
    this.emit("jd-change", { failed: false });
  }

  protected override update(): void {
    this.#heading.textContent = this.heading;
    this.#message.textContent = this.message;
    this.#message.hidden = !this.message;
    this.#retry.textContent = this.retryLabel;
  }
}
