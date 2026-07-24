/**
 * <jd-file-upload> — 드래그앤드롭 + 클릭 파일 선택 (v2 primitives/FileUpload).
 *
 * - 실제 선택은 항상 숨은 네이티브 <input type="file">이 한다(§1.6-1): 접근성 있는
 *   파일 피커·accept 필터·다중 선택·폼 참여가 브라우저 몫. 드롭존은 그 위의 표면.
 * - 커스텀 트리거는 v2 `trigger` prop 대신 **light DOM children**으로 받는다
 *   (§1.3: 노드를 attribute로 실을 수 없다). children이 있으면 트리거 모드,
 *   없으면 드롭존 모드 — 두 모드 모두 같은 input을 클릭한다.
 * - File 객체는 attribute로 표현 불가 → 결과는 이벤트 detail과 files 게터로만 준다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import fileUploadStyles from "./file-upload.css.js";

const UPLOAD_SVG =
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">` +
  `<path d="M16 20V8m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M4 22v2a4 4 0 004 4h16a4 4 0 004-4v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

export class JdFileUpload extends JdElement {
  static override tag = "jd-file-upload";
  static override props = {
    accept: { type: String },
    multiple: { type: Boolean, reflect: true },
    /** 파일당 최대 바이트. NaN = 제한 없음 */
    maxSize: { type: Number, default: NaN },
    disabled: { type: Boolean, reflect: true },
    description: { type: String, default: "파일을 드래그하거나 클릭하여 업로드" },
    name: { type: String },
    /** 최근 거부 사유 — 내부에서 설정, CSS 훅 겸용 */
    error: { type: String, reflect: true },
  };

  declare accept: string;
  declare multiple: boolean;
  declare maxSize: number;
  declare disabled: boolean;
  declare description: string;
  declare name: string;
  declare error: string;

  #input!: HTMLInputElement;
  #zone: HTMLDivElement | null = null;
  #trigger: HTMLDivElement | null = null;
  #desc: HTMLParagraphElement | null = null;
  #hint: HTMLParagraphElement | null = null;
  #errorEl!: HTMLParagraphElement;
  #files: File[] = [];

  /** 마지막으로 통과한 파일들 */
  get files(): File[] {
    return this.#files;
  }

  protected render(): void {
    adoptStyles(fileUploadStyles);
    const existing = this.querySelector<HTMLInputElement>("input.jd-file-upload__input");
    if (existing) {
      this.#input = existing;
      this.#zone = this.querySelector(".jd-file-upload__zone");
      this.#trigger = this.querySelector(".jd-file-upload__trigger");
      this.#desc = this.querySelector(".jd-file-upload__desc");
      this.#hint = this.querySelector(".jd-file-upload__hint");
      this.#errorEl = this.querySelector(".jd-file-upload__error")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    // children이 남아 있으면 커스텀 트리거 — 우리 골격을 만들기 전에 판정한다
    const custom = Array.from(this.children);
    this.#input = document.createElement("input");
    this.#input.type = "file";
    this.#input.className = "jd-file-upload__input";
    this.#input.tabIndex = -1;
    this.#input.setAttribute("aria-label", "파일 선택");

    if (custom.length > 0) {
      this.#trigger = document.createElement("div");
      this.#trigger.className = "jd-file-upload__trigger";
      this.#trigger.append(...custom);
      this.append(this.#trigger);
    } else {
      this.#zone = document.createElement("div");
      this.#zone.className = "jd-file-upload__zone";
      this.#zone.setAttribute("role", "button");
      const icon = document.createElement("span");
      icon.className = "jd-file-upload__icon";
      icon.innerHTML = UPLOAD_SVG;
      this.#desc = document.createElement("p");
      this.#desc.className = "jd-file-upload__desc";
      this.#hint = document.createElement("p");
      this.#hint.className = "jd-file-upload__hint";
      this.#zone.append(icon, this.#desc, this.#hint);
      this.append(this.#zone);
    }

    this.#errorEl = document.createElement("p");
    this.#errorEl.className = "jd-file-upload__error";
    this.append(this.#errorEl, this.#input);
  }

  protected override connected(): void {
    this.#input.addEventListener("change", this.#onPick);
    const surface = this.#zone ?? this.#trigger;
    surface?.addEventListener("click", this.#onOpen);
    if (this.#zone) {
      this.#zone.addEventListener("keydown", this.#onKeyDown);
      this.#zone.addEventListener("dragover", this.#onDragOver);
      this.#zone.addEventListener("dragleave", this.#onDragLeave);
      this.#zone.addEventListener("drop", this.#onDrop);
    }
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("change", this.#onPick);
    const surface = this.#zone ?? this.#trigger;
    surface?.removeEventListener("click", this.#onOpen);
    if (this.#zone) {
      this.#zone.removeEventListener("keydown", this.#onKeyDown);
      this.#zone.removeEventListener("dragover", this.#onDragOver);
      this.#zone.removeEventListener("dragleave", this.#onDragLeave);
      this.#zone.removeEventListener("drop", this.#onDrop);
    }
  }

  #onOpen = (): void => {
    if (!this.disabled) this.#input.click();
  };

  #onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Space의 스크롤 억제
    this.#onOpen();
  };

  #onDragOver = (e: DragEvent): void => {
    e.preventDefault(); // 기본 동작(파일 열기)을 막아야 drop이 온다
    if (!this.disabled) this.#zone?.toggleAttribute("data-drag", true);
  };

  #onDragLeave = (): void => {
    this.#zone?.toggleAttribute("data-drag", false);
  };

  #onDrop = (e: DragEvent): void => {
    e.preventDefault();
    this.#zone?.toggleAttribute("data-drag", false);
    if (this.disabled) return;
    this.#accept(e.dataTransfer?.files ?? null);
  };

  #onPick = (): void => {
    this.#accept(this.#input.files);
  };

  /** 크기 검사 후 통과분만 통지 — 하나라도 초과면 전량 거부(v2 동형) */
  #accept(list: FileList | null): void {
    if (!list) return;
    const files = Array.from(list);
    if (!Number.isNaN(this.maxSize) && files.some((f) => f.size > this.maxSize)) {
      const mb = (this.maxSize / 1024 / 1024).toFixed(0);
      this.error = `파일 크기가 ${mb}MB를 초과합니다`;
      this.emit("jd-error", { reason: "max-size", maxSize: this.maxSize, files });
      return;
    }
    this.error = "";
    this.#files = files;
    this.emit("jd-change", { files });
  }

  protected override update(): void {
    const input = this.#input;
    input.multiple = this.multiple;
    input.disabled = this.disabled;
    if (this.accept) input.accept = this.accept;
    else input.removeAttribute("accept");
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");

    if (this.#zone) {
      this.#zone.tabIndex = this.disabled ? -1 : 0;
      this.#zone.setAttribute("aria-label", this.description);
      this.#zone.setAttribute("aria-disabled", String(this.disabled));
      this.#desc!.textContent = this.description;
      const hints: string[] = [];
      if (this.accept) hints.push(this.accept.replace(/,/g, ", "));
      if (!Number.isNaN(this.maxSize)) hints.push(`최대 ${(this.maxSize / 1024 / 1024).toFixed(0)}MB`);
      this.#hint!.textContent = hints.join(" · ");
      this.#hint!.hidden = hints.length === 0;
    }

    this.#errorEl.textContent = this.error;
    this.#errorEl.hidden = !this.error;
  }
}
