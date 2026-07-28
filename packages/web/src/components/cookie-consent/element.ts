/**
 * <jd-cookie-consent> — GDPR/CCPA 쿠키 동의 배너 (v2 composites/CookieConsent).
 *
 * 비모달 배너다(포커스 감금·페이지 차단 없음) — role="dialog"만 부여하고 오버레이류
 * 파생은 쓰지 않는다. 저장소 게이트가 핵심 함정: render()는 결정적이어야 하므로
 * (§3.1-3, 스토리지 접근 금지) **항상 닫힘으로 그린 뒤** connected()에서 localStorage를
 * 읽어(효과 단계 허용) 미동의 사용자에게만 연다. 이 순서 덕에 SSG 프리렌더 스냅샷이
 * 결정적이고, 재방문자는 스냅샷 HTML을 받아도 connected()가 다시 닫는다.
 *
 * 저장은 behaviors/createStoredValue 재사용(§5 — 저장소 계열 새로 만들지 않음).
 * 카테고리는 property(Array) 또는 자식 <script type="application/json">(WEB-03 예외).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createStoredValue, type StoredValue } from "../../behaviors/storage.js";
import cookieConsentStyles from "./cookie-consent.css.js";

export interface JdCookieCategory {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

interface StoredConsent {
  at: number;
  result: Record<string, boolean>;
}

export class JdCookieConsent extends JdElement {
  static override tag = "jd-cookie-consent";
  static override props = {
    message: { type: String, default: "더 나은 경험을 위해 쿠키를 사용합니다." },
    acceptLabel: { type: String, default: "모두 수락" },
    rejectLabel: { type: String, default: "필수만" },
    customizeLabel: { type: String, default: "맞춤 설정" },
    policyLabel: { type: String, default: "정책 보기" },
    policyHref: { type: String },
    storageKey: { type: String, default: "junds-cookie-consent" },
    position: { type: String, default: "bottom", reflect: true }, // bottom | bottom-left | bottom-right
  };

  declare message: string;
  declare acceptLabel: string;
  declare rejectLabel: string;
  declare customizeLabel: string;
  declare policyLabel: string;
  declare policyHref: string;
  declare storageKey: string;
  declare position: string;

  #messageText!: HTMLSpanElement;
  #policy!: HTMLAnchorElement;
  #panel!: HTMLDivElement;
  #btnCustomize!: HTMLButtonElement;
  #btnReject!: HTMLButtonElement;
  #btnPrimary!: HTMLButtonElement;

  #categories: JdCookieCategory[] = [];
  #selected: Record<string, boolean> = {};
  #showCustom = false;
  #open = false;
  #catSig = "";
  #store: StoredValue<StoredConsent | null> | null = null;

  get categories(): JdCookieCategory[] {
    return this.#categories;
  }
  set categories(v: JdCookieCategory[]) {
    this.#setCategories(Array.isArray(v) ? v : []);
    this.requestUpdate();
  }

  #setCategories(list: JdCookieCategory[]): void {
    this.#categories = list;
    this.#selected = Object.fromEntries(list.map((c) => [c.id, c.required ?? false]));
  }

  protected render(): void {
    adoptStyles(cookieConsentStyles);
    // 선언적 JSON 슬롯(결정적 DOM 읽기 — 스토리지 아님)
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdCookieCategory[];
        if (Array.isArray(parsed)) this.#setCategories(parsed);
      } catch {
        console.warn("[junds] <jd-cookie-consent> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }

    this.setAttribute("role", "dialog");
    this.setAttribute("aria-label", "쿠키 동의");

    const inner = this.querySelector<HTMLDivElement>(":scope > .jd-cookie-consent__inner");
    if (inner) {
      this.#messageText = inner.querySelector<HTMLSpanElement>(".jd-cookie-consent__message-text")!;
      this.#policy = inner.querySelector<HTMLAnchorElement>(".jd-cookie-consent__policy")!;
      this.#panel = inner.querySelector<HTMLDivElement>(".jd-cookie-consent__panel")!;
      this.#btnCustomize = inner.querySelector<HTMLButtonElement>(
        ".jd-cookie-consent__btn-customize",
      )!;
      this.#btnReject = inner.querySelector<HTMLButtonElement>(".jd-cookie-consent__btn-reject")!;
      this.#btnPrimary = inner.querySelector<HTMLButtonElement>(".jd-cookie-consent__btn-primary")!;
    } else {
      this.#build();
    }
    // 결정적: 항상 닫힘으로 시작 — 개방 판정은 connected()의 스토리지 게이트
    this.update();
  }

  #build(): void {
    const inner = document.createElement("div");
    inner.className = "jd-cookie-consent__inner";

    const msg = document.createElement("p");
    msg.className = "jd-cookie-consent__message";
    this.#messageText = document.createElement("span");
    this.#messageText.className = "jd-cookie-consent__message-text";
    this.#policy = document.createElement("a");
    this.#policy.className = "jd-cookie-consent__policy";
    msg.append(this.#messageText, document.createTextNode(" "), this.#policy);

    this.#panel = document.createElement("div");
    this.#panel.className = "jd-cookie-consent__panel";

    const actions = document.createElement("div");
    actions.className = "jd-cookie-consent__actions";
    this.#btnCustomize = document.createElement("button");
    this.#btnCustomize.type = "button";
    this.#btnCustomize.className = "jd-cookie-consent__btn jd-cookie-consent__btn-customize";
    this.#btnCustomize.addEventListener("click", () => {
      this.#showCustom = true;
      this.update();
    });
    this.#btnReject = document.createElement("button");
    this.#btnReject.type = "button";
    this.#btnReject.className = "jd-cookie-consent__btn jd-cookie-consent__btn-reject";
    this.#btnReject.addEventListener("click", () => this.rejectAll());
    this.#btnPrimary = document.createElement("button");
    this.#btnPrimary.type = "button";
    this.#btnPrimary.className = "jd-cookie-consent__btn jd-cookie-consent__btn-primary";
    this.#btnPrimary.addEventListener("click", () => {
      if (this.#categories.length && this.#showCustom) this.#persist(this.#selected);
      else this.acceptAll();
    });
    actions.append(this.#btnCustomize, this.#btnReject, this.#btnPrimary);

    inner.append(msg, this.#panel, actions);
    this.append(inner);
  }

  protected override connected(): void {
    // 스토리지 게이트 — 효과 단계(§3.1-3 render 밖이므로 허용)
    this.#store = this.own(createStoredValue<StoredConsent | null>(this.storageKey, null));
    if (this.#store.get() === null) {
      this.#open = true;
      this.#reflectOpen();
    }
  }

  #reflectOpen(): void {
    this.toggleAttribute("data-open", this.#open);
  }

  protected override update(): void {
    this.#messageText.textContent = this.message;
    const hasPolicy = Boolean(this.policyHref);
    this.#policy.hidden = !hasPolicy;
    if (hasPolicy) {
      this.#policy.href = this.policyHref;
      this.#policy.textContent = this.policyLabel;
    }

    const hasCats = this.#categories.length > 0;
    // 카테고리 패널 재구축(입양·시그니처)
    const sig = JSON.stringify(this.#categories);
    if (sig !== this.#catSig) {
      this.#catSig = sig;
      this.#buildPanel();
    }
    this.#syncPanelState();
    this.#panel.hidden = !(hasCats && this.#showCustom);

    this.#btnCustomize.textContent = this.customizeLabel;
    this.#btnCustomize.hidden = !hasCats || this.#showCustom;
    this.#btnReject.textContent = this.rejectLabel;
    this.#btnPrimary.textContent = hasCats && this.#showCustom ? "선택 저장" : this.acceptLabel;
  }

  #buildPanel(): void {
    this.#panel.textContent = "";
    for (const c of this.#categories) {
      const row = document.createElement("label");
      row.className = "jd-cookie-consent__cat";
      row.dataset.id = c.id;
      row.toggleAttribute("data-required", Boolean(c.required));
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "jd-cookie-consent__cat-check";
      cb.disabled = Boolean(c.required);
      cb.addEventListener("change", () => {
        this.#selected = { ...this.#selected, [c.id]: cb.checked };
      });
      const body = document.createElement("div");
      const head = document.createElement("div");
      head.className = "jd-cookie-consent__cat-label";
      head.textContent = c.label;
      if (c.required) {
        const tag = document.createElement("span");
        tag.className = "jd-cookie-consent__cat-required";
        tag.textContent = "(필수)";
        head.append(" ", tag);
      }
      body.append(head);
      if (c.description) {
        const d = document.createElement("div");
        d.className = "jd-cookie-consent__cat-desc";
        d.textContent = c.description;
        body.append(d);
      }
      row.append(cb, body);
      this.#panel.append(row);
    }
  }

  /** 체크 상태를 현재 #selected로 동기화(재빌드 없이) */
  #syncPanelState(): void {
    for (const row of this.#panel.querySelectorAll<HTMLLabelElement>(
      ":scope > .jd-cookie-consent__cat",
    )) {
      const id = row.dataset.id!;
      const cb = row.querySelector<HTMLInputElement>("input")!;
      cb.checked = this.#selected[id] ?? false;
    }
  }

  #persist(result: Record<string, boolean>): void {
    this.#store?.set({ at: Date.now(), result });
    this.emit("jd-consent", { categories: result });
    this.#open = false;
    this.#reflectOpen();
  }

  /** 모두 수락 */
  acceptAll(): void {
    const all = this.#categories.length
      ? Object.fromEntries(this.#categories.map((c) => [c.id, true]))
      : { all: true };
    this.#persist(all);
  }

  /** 필수만 수락 */
  rejectAll(): void {
    const only = this.#categories.length
      ? Object.fromEntries(this.#categories.map((c) => [c.id, c.required ?? false]))
      : { all: false };
    this.#persist(only);
  }

  /** 저장을 지우고 배너를 다시 연다(설정 재변경 진입점) */
  reset(): void {
    this.#store?.remove();
    this.#showCustom = false;
    this.#setCategories(this.#categories);
    this.#open = true;
    this.#reflectOpen();
    this.update();
  }
}
