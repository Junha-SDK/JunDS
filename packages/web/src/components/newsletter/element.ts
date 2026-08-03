/**
 * <jd-newsletter> — 뉴스레터 구독 폼 (v2 composites/Newsletter).
 *
 * 네이티브 위임(§1.6-1): 내부 <form> + <input type="email" required>가 값 직렬화·
 * :invalid·IME·자동완성을 브라우저 기본으로 가진다. v2의 onSubscribe(Promise) 콜백은
 * 바닐라에서 이벤트+상태로 분리한다 — 제출 시 jd-subscribe(detail { email }) 발행,
 * 비동기 결과는 소비자가 `status` 프로퍼티(idle·submitting·success·error)로 되먹인다
 * (finance UI 규약과 동일: 컴포넌트는 fetch를 소유하지 않는다, §6.3).
 *
 * 검증(이메일 형식·동의 필수)은 컴포넌트가 로컬로 수행하고 aria-invalid + 에러 행으로
 * 표시한다. variant(inline·stacked·card)는 호스트 속성이 CSS 훅(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import newsletterStyles from "./newsletter.css.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class JdNewsletter extends JdElement {
  static override tag = "jd-newsletter";
  static override props = {
    title: { type: String },
    description: { type: String },
    placeholder: { type: String, default: "이메일 주소" },
    submitLabel: { type: String, default: "구독하기" },
    successMessage: { type: String, default: "구독 완료! 받은 편지함을 확인해주세요." },
    errorMessage: { type: String, default: "문제가 발생했습니다. 다시 시도해주세요." },
    consentLabel: { type: String, default: "개인정보 수집·이용에 동의합니다" },
    requireConsent: { type: Boolean },
    name: { type: String, default: "email" },
    variant: { type: String, default: "stacked", reflect: true }, // inline | stacked | card
    /** 소비자 되먹임 상태(§6.3): idle | submitting | success | error */
    status: { type: String, default: "idle", reflect: true },
  };

  declare title: string;
  declare description: string;
  declare placeholder: string;
  declare submitLabel: string;
  declare successMessage: string;
  declare errorMessage: string;
  declare consentLabel: string;
  declare requireConsent: boolean;
  declare name: string;
  declare variant: string;
  declare status: string;

  #header!: HTMLDivElement;
  #titleEl!: HTMLHeadingElement;
  #descEl!: HTMLParagraphElement;
  #form!: HTMLFormElement;
  #input!: HTMLInputElement;
  #submit!: HTMLButtonElement;
  #consentRow!: HTMLLabelElement;
  #consent!: HTMLInputElement;
  #consentText!: HTMLSpanElement;
  #message!: HTMLDivElement;
  #validationError = "";
  #prevStatus = "idle";

  protected render(): void {
    adoptStyles(newsletterStyles);
    const existing = this.querySelector<HTMLFormElement>(":scope > form.jd-newsletter__form");
    if (existing) {
      this.#header = this.querySelector<HTMLDivElement>(".jd-newsletter__header")!;
      this.#titleEl = this.querySelector<HTMLHeadingElement>(".jd-newsletter__title")!;
      this.#descEl = this.querySelector<HTMLParagraphElement>(".jd-newsletter__desc")!;
      this.#form = existing;
      this.#input = this.querySelector<HTMLInputElement>(".jd-newsletter__input")!;
      this.#submit = this.querySelector<HTMLButtonElement>(".jd-newsletter__submit")!;
      this.#consentRow = this.querySelector<HTMLLabelElement>(".jd-newsletter__consent")!;
      this.#consent = this.#consentRow.querySelector("input")!;
      this.#consentText = this.#consentRow.querySelector<HTMLSpanElement>(
        ".jd-newsletter__consent-text",
      )!;
      this.#message = this.querySelector<HTMLDivElement>(".jd-newsletter__message")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const id = jdUid("jd-nl");
    this.#header = document.createElement("div");
    this.#header.className = "jd-newsletter__header";
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-newsletter__title";
    this.#descEl = document.createElement("p");
    this.#descEl.className = "jd-newsletter__desc";
    this.#header.append(this.#titleEl, this.#descEl);

    this.#form = document.createElement("form");
    this.#form.className = "jd-newsletter__form";
    this.#form.noValidate = true;

    const field = document.createElement("div");
    field.className = "jd-newsletter__field";
    this.#input = document.createElement("input");
    this.#input.className = "jd-newsletter__input";
    this.#input.type = "email";
    this.#input.required = true;
    this.#input.id = `${id}-input`;
    this.#input.setAttribute("aria-label", "이메일");
    this.#submit = document.createElement("button");
    this.#submit.className = "jd-newsletter__submit";
    this.#submit.type = "submit";
    field.append(this.#input, this.#submit);
    this.#form.append(field);

    this.#consentRow = document.createElement("label");
    this.#consentRow.className = "jd-newsletter__consent";
    this.#consent = document.createElement("input");
    this.#consent.type = "checkbox";
    this.#consentText = document.createElement("span");
    this.#consentText.className = "jd-newsletter__consent-text";
    this.#consentRow.append(this.#consent, this.#consentText);
    this.#form.append(this.#consentRow);

    this.#message = document.createElement("div");
    this.#message.className = "jd-newsletter__message";
    this.#message.id = `${id}-msg`;
    this.#form.append(this.#message);

    this.append(this.#header, this.#form);
  }

  protected override connected(): void {
    this.#form.addEventListener("submit", this.#onSubmit);
  }

  protected override disconnected(): void {
    this.#form?.removeEventListener("submit", this.#onSubmit);
  }

  #onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    const email = this.#input.value.trim();
    if (!EMAIL_RE.test(email)) {
      this.#validationError = "올바른 이메일을 입력해주세요";
      this.update();
      this.#input.focus();
      return;
    }
    if (this.requireConsent && !this.#consent.checked) {
      this.#validationError = "개인정보 처리 동의가 필요합니다";
      this.update();
      return;
    }
    this.#validationError = "";
    this.status = "submitting"; // reflect → update()
    this.emit("jd-subscribe", { email });
  };

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;
    this.#descEl.textContent = this.description;
    this.#descEl.hidden = !this.description;
    this.#header.hidden = !this.title && !this.description;

    this.#input.placeholder = this.placeholder;
    this.#input.name = this.name;
    const submitting = this.status === "submitting";
    this.#submit.disabled = submitting;
    this.#submit.textContent = submitting
      ? this.variant === "inline"
        ? "…"
        : "구독 중..."
      : this.submitLabel;

    this.#consentRow.hidden = !this.requireConsent;
    this.#consentText.textContent = this.consentLabel;

    // 성공 전이 시 입력 비우기(v2 동형)
    if (this.status === "success" && this.#prevStatus !== "success") this.#input.value = "";
    this.#prevStatus = this.status;

    // 메시지 우선순위: 로컬 검증 에러 > 제출 성공 > 제출 실패
    let text = "";
    let role = "";
    let tone = "";
    if (this.#validationError) {
      text = this.#validationError;
      role = "alert";
      tone = "danger";
    } else if (this.status === "success") {
      text = this.successMessage;
      role = "status";
      tone = "success";
    } else if (this.status === "error") {
      text = this.errorMessage;
      role = "alert";
      tone = "danger";
    }
    this.#message.textContent = text;
    this.#message.hidden = !text;
    if (role) this.#message.setAttribute("role", role);
    else this.#message.removeAttribute("role");
    this.#message.dataset.tone = tone;

    const invalid = Boolean(this.#validationError);
    this.#input.toggleAttribute("aria-invalid", invalid);
    if (text) this.#input.setAttribute("aria-describedby", this.#message.id);
    else this.#input.removeAttribute("aria-describedby");
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
