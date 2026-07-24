/**
 * <jd-login-form> — 보안 로그인/회원가입 폼 (v2 patterns/LoginForm).
 *
 * 기존 컴포넌트를 조합한다: <jd-alert>(에러) · <jd-password-input>(토글·강도·규칙) ·
 * <jd-checkbox>(자동 로그인) · <jd-divider>(소셜 구분) · <jd-button>(제출). 이메일은
 * 네이티브 <input type=email autocomplete=email>로 브라우저 자동완성·폼 참여를 살린다.
 *
 * 슬롯: slot="logo"(상단 로고) · slot="social"(소셜 로그인 버튼들).
 * 검증(v2 동형): 이메일 필수·형식, 비밀번호 필수, (회원가입) 비밀번호 확인 일치.
 * 서버 에러(error 프롭)와 로컬 검증 에러를 함께 상단 <jd-alert>로 노출한다.
 *
 * - 이벤트(§1.5): jd-submit { email, password, remember }(검증 통과 시).
 * - autocomplete: email=email, 로그인 비밀번호=current-password, 회원가입=new-password.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import loginFormStyles from "./login-form.css.js";

type ValueEl = HTMLElement & { value: string };
type CheckEl = HTMLElement & { checked: boolean };

const SHIELD_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M6 1c-.4.2-1.3.6-2.5.8C3.2 3 3 4.2 3 5.2c0 2.5 1.4 4.2 3 5 1.6-.8 3-2.5 3-5 ` +
  `0-1-.2-2.2-.5-3.4C7.3 1.6 6.4 1.2 6 1z" stroke="currentColor" stroke-width="0.8"/></svg>`;

export class JdLoginForm extends JdElement {
  static override tag = "jd-login-form";
  static override props = {
    title: { type: String, default: "로그인" },
    subtitle: { type: String },
    error: { type: String }, // 서버 에러 메시지
    loading: { type: Boolean, reflect: true },
    signupHref: { type: String }, // attr: signup-href
    forgotHref: { type: String }, // attr: forgot-href
    showPasswordStrength: { type: Boolean }, // attr: show-password-strength
    showConfirmPassword: { type: Boolean }, // attr: show-confirm-password
  };

  declare title: string;
  declare subtitle: string;
  declare error: string;
  declare loading: boolean;
  declare signupHref: string;
  declare forgotHref: string;
  declare showPasswordStrength: boolean;
  declare showConfirmPassword: boolean;

  #localError = "";

  #logo!: HTMLElement;
  #title!: HTMLHeadingElement;
  #subtitle!: HTMLParagraphElement;
  #alert!: HTMLElement;
  #alertText!: HTMLSpanElement;
  #form!: HTMLFormElement;
  #email!: HTMLInputElement;
  #pw!: ValueEl;
  #confirmField!: HTMLElement;
  #confirm!: ValueEl;
  #mismatch!: HTMLParagraphElement;
  #forgot!: HTMLAnchorElement;
  #remember!: CheckEl;
  #submit!: HTMLElement;
  #social!: HTMLElement;
  #socialList!: HTMLElement;
  #signup!: HTMLParagraphElement;
  #signupLink!: HTMLAnchorElement;

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(loginFormStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-login-form");
    if (existing) {
      this.#adopt(existing);
    } else {
      this.#build();
    }
    this.update();
  }

  #adopt(root: HTMLElement): void {
    this.#logo = root.querySelector(".jd-login-form__logo")!;
    this.#title = root.querySelector(".jd-login-form__title")!;
    this.#subtitle = root.querySelector(".jd-login-form__subtitle")!;
    this.#alert = root.querySelector(".jd-login-form__alert")!;
    this.#alertText = this.#alert.querySelector(".jd-login-form__alert-text")!;
    this.#form = root.querySelector(".jd-login-form__form")!;
    this.#email = root.querySelector(".jd-login-form__email")!;
    this.#pw = root.querySelector(".jd-login-form__password")!;
    this.#confirmField = root.querySelector(".jd-login-form__confirm-field")!;
    this.#confirm = root.querySelector(".jd-login-form__confirm")!;
    this.#mismatch = root.querySelector(".jd-login-form__mismatch")!;
    this.#forgot = root.querySelector(".jd-login-form__forgot")!;
    this.#remember = root.querySelector(".jd-login-form__remember")!;
    this.#submit = root.querySelector(".jd-login-form__submit")!;
    this.#social = root.querySelector(".jd-login-form__social")!;
    this.#socialList = root.querySelector(".jd-login-form__social-list")!;
    this.#signup = root.querySelector(".jd-login-form__signup")!;
    this.#signupLink = root.querySelector(".jd-login-form__signup-link")!;
  }

  #build(): void {
    const logoNodes = Array.from(this.children).filter((n) => n.getAttribute("slot") === "logo");
    const socialNodes = Array.from(this.children).filter((n) => n.getAttribute("slot") === "social");
    const emailId = jdUid("jd-login-email");

    const root = document.createElement("div");
    root.className = "jd-login-form";

    // 헤더
    const header = document.createElement("div");
    header.className = "jd-login-form__header";
    this.#logo = document.createElement("div");
    this.#logo.className = "jd-login-form__logo";
    this.#logo.append(...logoNodes);
    this.#title = document.createElement("h1");
    this.#title.className = "jd-login-form__title";
    this.#subtitle = document.createElement("p");
    this.#subtitle.className = "jd-login-form__subtitle";
    header.append(this.#logo, this.#title, this.#subtitle);

    // 에러 알림
    this.#alert = document.createElement("jd-alert");
    this.#alert.className = "jd-login-form__alert";
    this.#alert.setAttribute("variant", "danger");
    this.#alertText = document.createElement("span");
    this.#alertText.className = "jd-login-form__alert-text";
    this.#alert.append(this.#alertText);

    // 폼
    this.#form = document.createElement("form");
    this.#form.className = "jd-login-form__form";

    // 이메일
    const emailField = document.createElement("div");
    emailField.className = "jd-login-form__field";
    const emailLabel = document.createElement("label");
    emailLabel.className = "jd-login-form__label";
    emailLabel.setAttribute("data-required", "");
    emailLabel.htmlFor = emailId;
    emailLabel.textContent = "이메일";
    this.#email = document.createElement("input");
    this.#email.className = "jd-login-form__input jd-login-form__email";
    this.#email.type = "email";
    this.#email.id = emailId;
    this.#email.name = "email";
    this.#email.autocomplete = "email";
    this.#email.placeholder = "name@company.com";
    emailField.append(emailLabel, this.#email);

    // 비밀번호
    const pwField = document.createElement("div");
    pwField.className = "jd-login-form__field";
    const pwLabelRow = document.createElement("div");
    pwLabelRow.className = "jd-login-form__label-row";
    const pwLabel = document.createElement("span");
    pwLabel.className = "jd-login-form__label";
    pwLabel.setAttribute("data-required", "");
    pwLabel.textContent = "비밀번호";
    this.#forgot = document.createElement("a");
    this.#forgot.className = "jd-login-form__forgot";
    this.#forgot.textContent = "비밀번호 찾기";
    pwLabelRow.append(pwLabel, this.#forgot);
    this.#pw = document.createElement("jd-password-input") as ValueEl;
    this.#pw.classList.add("jd-login-form__password");
    this.#pw.setAttribute("name", "password");
    this.#pw.setAttribute("label", "비밀번호");
    pwField.append(pwLabelRow, this.#pw as unknown as Node);

    // 비밀번호 확인 (회원가입)
    this.#confirmField = document.createElement("div");
    this.#confirmField.className = "jd-login-form__field jd-login-form__confirm-field";
    const confirmLabel = document.createElement("span");
    confirmLabel.className = "jd-login-form__label";
    confirmLabel.setAttribute("data-required", "");
    confirmLabel.textContent = "비밀번호 확인";
    this.#confirm = document.createElement("jd-password-input") as ValueEl;
    this.#confirm.classList.add("jd-login-form__confirm");
    this.#confirm.setAttribute("name", "confirm");
    this.#confirm.setAttribute("label", "비밀번호 확인");
    this.#mismatch = document.createElement("p");
    this.#mismatch.className = "jd-login-form__mismatch";
    this.#mismatch.textContent = "비밀번호가 일치하지 않습니다";
    this.#confirmField.append(confirmLabel, this.#confirm as unknown as Node, this.#mismatch);

    // 자동 로그인
    const rememberRow = document.createElement("div");
    rememberRow.className = "jd-login-form__remember-row";
    this.#remember = document.createElement("jd-checkbox") as CheckEl;
    this.#remember.classList.add("jd-login-form__remember");
    this.#remember.setAttribute("label", "자동 로그인");
    this.#remember.setAttribute("size", "sm");
    rememberRow.append(this.#remember as unknown as Node);

    // 제출
    this.#submit = document.createElement("jd-button");
    this.#submit.className = "jd-login-form__submit";
    this.#submit.setAttribute("type", "submit");
    this.#submit.setAttribute("full-width", "");

    // 소셜
    this.#social = document.createElement("div");
    this.#social.className = "jd-login-form__social";
    const divider = document.createElement("jd-divider");
    divider.setAttribute("label", "또는");
    this.#socialList = document.createElement("div");
    this.#socialList.className = "jd-login-form__social-list";
    this.#socialList.append(...socialNodes);
    this.#social.append(divider, this.#socialList);

    // 회원가입 링크
    this.#signup = document.createElement("p");
    this.#signup.className = "jd-login-form__signup";
    const signupPrefix = document.createTextNode("계정이 없으신가요? ");
    this.#signupLink = document.createElement("a");
    this.#signupLink.className = "jd-login-form__signup-link";
    this.#signupLink.textContent = "회원가입";
    this.#signup.append(signupPrefix, this.#signupLink);

    this.#form.append(
      emailField,
      pwField,
      this.#confirmField,
      rememberRow,
      this.#submit,
      this.#social,
      this.#signup,
    );

    // 보안 안내
    const notice = document.createElement("div");
    notice.className = "jd-login-form__notice";
    notice.innerHTML = SHIELD_SVG;
    const noticeText = document.createElement("span");
    noticeText.textContent = "보안 연결 (TLS 1.3)";
    notice.append(noticeText);

    root.append(header, this.#alert, this.#form, notice);
    this.append(root);
  }

  protected override connected(): void {
    this.#form.addEventListener("submit", this.#onSubmit);
    this.#form.addEventListener("input", this.#onInput);
  }

  protected override disconnected(): void {
    this.#form?.removeEventListener("submit", this.#onSubmit);
    this.#form?.removeEventListener("input", this.#onInput);
  }

  /* ── 이벤트 ───────────────────────────────────────────────────────── */

  #onInput = (): void => {
    // 입력에 따라 무효 테두리·불일치 안내를 실시간 재계산(v2 controlled 재렌더 동형)
    this.requestUpdate();
  };

  #onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    this.#localError = "";
    const email = this.#email.value;
    const password = this.#pw.value;
    const confirm = this.#confirm.value;
    const remember = this.#remember.checked;

    if (!email.trim()) this.#localError = "이메일을 입력하세요";
    else if (!/\S+@\S+\.\S+/.test(email)) this.#localError = "올바른 이메일 형식이 아닙니다";
    else if (!password) this.#localError = "비밀번호를 입력하세요";
    else if (this.showConfirmPassword && password !== confirm)
      this.#localError = "비밀번호가 일치하지 않습니다";

    if (this.#localError) {
      this.requestUpdate();
      return;
    }
    this.emit("jd-submit", { email, password, remember });
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const displayError = this.error || this.#localError;

    this.#logo.hidden = this.#logo.childElementCount === 0;
    this.#title.textContent = this.title;
    this.#subtitle.textContent = this.subtitle;
    this.#subtitle.hidden = !this.subtitle;

    this.#alertText.textContent = displayError;
    this.#alert.hidden = !displayError;

    this.#forgot.hidden = !this.forgotHref;
    if (this.forgotHref) this.#forgot.href = this.forgotHref;

    // 비밀번호 강도/규칙 (회원가입 폼)
    this.#pw.toggleAttribute("show-strength", this.showPasswordStrength);
    this.#pw.toggleAttribute("show-rules", this.showPasswordStrength);

    // 비밀번호 확인
    this.#confirmField.hidden = !this.showConfirmPassword;
    const confirmVal = this.#confirm.value;
    const pwVal = this.#pw.value;
    const mismatch = this.showConfirmPassword && Boolean(confirmVal) && pwVal !== confirmVal;
    this.#mismatch.hidden = !mismatch;
    this.#confirm.toggleAttribute("error", mismatch);

    // 무효 필드 테두리 (v2: displayError && 빈 값)
    const emailInvalid = Boolean(displayError) && !this.#email.value;
    this.#email.toggleAttribute("data-error", emailInvalid);
    this.#email.setAttribute("aria-invalid", emailInvalid ? "true" : "false");
    this.#pw.toggleAttribute("error", Boolean(displayError) && !pwVal);

    // 소셜 / 회원가입 링크
    this.#social.hidden = this.#socialList.childElementCount === 0;
    this.#signup.hidden = !this.signupHref;
    if (this.signupHref) this.#signupLink.href = this.signupHref;

    // 제출 버튼
    this.#submit.textContent = this.title;
    this.#submit.toggleAttribute("loading", this.loading);
  }
}
