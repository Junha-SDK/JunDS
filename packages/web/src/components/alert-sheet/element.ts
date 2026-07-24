/**
 * <jd-alert-sheet> — 가격 알림 등록 시트 (v2 finance/AlertSheet) = **jd-bottom-sheet 파생**.
 *
 * v2는 BottomSheet 안에 종목·현재가·조건(SegmentedPill)·목표가(Input)·빠른 배수 pill·
 * 등록 버튼을 담고, 제출 시 addAlert + 토스트 + onClose 했다. v3는 오버레이·포커스
 * 감금·스크롤 락·요청형 닫기를 전부 jd-bottom-sheet에서 물려받고(§6 R12) 폼 골격과
 * 검증만 얹는다. 데이터 기록(addAlert)·토스트는 소비자 몫(DEC-019) — 제출은
 * `jd-submit`{name,target,direction,basePrice} 이벤트로 넘긴다.
 *
 * 결정적 렌더(§3.1): 기본 목표가(현재가×1.05)·delta·현재가 표기는 전부 프로퍼티에서
 * 유도 — Date.now/random/로케일 ICU 미사용(천단위 구분은 순수 함수). 사용자가 값을
 * 만지기 전까지는 price 변화에 목표가 기본값이 따라 갱신된다(v2의 stock별 remount 대체:
 * name이 바뀌면 편집 플래그를 리셋).
 *
 * v2 대비 개선: 조건 세그먼트를 role=radiogroup/radio + aria-checked + 좌우 화살표
 * 순회로 만들고, 열릴 때 목표가 입력에 초기 포커스([data-autofocus])를 준다.
 */
import { JdBottomSheet } from "../bottom-sheet/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import alertSheetStyles from "./alert-sheet.css.js";

type AlertDirection = "above" | "below";
const DIRS: AlertDirection[] = ["above", "below"];
/** v2 빠른 배수 pill */
const QUICK = [0.95, 1.0, 1.05, 1.1, 1.2];

/** 천단위 구분 — toLocaleString ICU 비결정성 회피(§3.1). 정수 반올림 값 대상. */
function groupThousands(n: number): string {
  const neg = n < 0;
  const digits = String(Math.abs(Math.round(n)));
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return neg ? `-${out}` : out;
}

export class JdAlertSheet extends JdBottomSheet {
  static override tag = "jd-alert-sheet";
  static override props = {
    ...JdBottomSheet.props,
    /** 종목명 */
    name: { type: String },
    /** 현재가(기준가) */
    price: { type: Number, default: 0 },
    /** 초기 조건 */
    direction: { type: String, default: "above", reflect: true },
    title: { type: String, default: "가격 알림 등록" },
  };

  declare name: string;
  declare price: number;
  declare direction: string;

  #body: HTMLElement | null = null;
  #nameEl!: HTMLElement;
  #priceValue!: HTMLElement;
  #seg!: HTMLElement;
  #segBtns: HTMLButtonElement[] = [];
  #input!: HTMLInputElement;
  #delta!: HTMLElement;
  #quickWrap!: HTMLElement;
  #submitBtn!: HTMLButtonElement;

  #userEdited = false;
  #lastName: string | null = null;
  #inputId = jdUid("jd-alert-target");

  protected override render(): void {
    super.render(); // 패널·백드롭·grabber·title 구축 + children 이동
    adoptStyles(alertSheetStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    this.#body = panel.querySelector(":scope > .jd-alert-sheet__body");
    if (this.#body) this.#adopt(this.#body);
    else this.#build(panel);
    this.update();
  }

  #adopt(body: HTMLElement): void {
    this.#nameEl = body.querySelector(".jd-alert-sheet__name")!;
    this.#priceValue = body.querySelector(".jd-alert-sheet__price-value")!;
    this.#seg = body.querySelector(".jd-alert-sheet__segmented")!;
    this.#segBtns = Array.from(body.querySelectorAll<HTMLButtonElement>(".jd-alert-sheet__seg"));
    this.#input = body.querySelector(".jd-alert-sheet__field")!;
    this.#delta = body.querySelector(".jd-alert-sheet__delta")!;
    this.#quickWrap = body.querySelector(".jd-alert-sheet__quick")!;
    this.#submitBtn = body.querySelector(".jd-alert-sheet__submit")!;
  }

  #build(panel: HTMLElement): void {
    const body = document.createElement("div");
    body.className = "jd-alert-sheet__body";

    const fieldLabel = document.createElement("p");
    fieldLabel.className = "jd-alert-sheet__field-label";
    fieldLabel.textContent = "종목";
    this.#nameEl = document.createElement("p");
    this.#nameEl.className = "jd-alert-sheet__name";

    const priceRow = document.createElement("div");
    priceRow.className = "jd-alert-sheet__price";
    const priceLabel = document.createElement("span");
    priceLabel.className = "jd-alert-sheet__price-label";
    priceLabel.textContent = "현재가";
    this.#priceValue = document.createElement("span");
    this.#priceValue.className = "jd-alert-sheet__price-value";
    priceRow.append(priceLabel, this.#priceValue);

    // ── 조건 세그먼트 ──
    const condGroup = document.createElement("div");
    condGroup.className = "jd-alert-sheet__group";
    const condLabel = document.createElement("p");
    condLabel.className = "jd-alert-sheet__group-label";
    condLabel.textContent = "조건";
    this.#seg = document.createElement("div");
    this.#seg.className = "jd-alert-sheet__segmented";
    this.#seg.setAttribute("role", "radiogroup");
    this.#seg.setAttribute("aria-label", "조건");
    const segText: Record<AlertDirection, string> = { above: "이상 ↑", below: "이하 ↓" };
    this.#segBtns = DIRS.map((dir) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-alert-sheet__seg";
      b.dataset.dir = dir;
      b.setAttribute("role", "radio");
      b.textContent = segText[dir];
      b.addEventListener("click", () => this.#selectDir(dir));
      this.#seg.append(b);
      return b;
    });
    this.#seg.addEventListener("keydown", this.#onSegKey);
    condGroup.append(condLabel, this.#seg);

    // ── 목표가 입력 ──
    const targetGroup = document.createElement("div");
    targetGroup.className = "jd-alert-sheet__group";
    const targetLabel = document.createElement("label");
    targetLabel.className = "jd-alert-sheet__group-label";
    targetLabel.htmlFor = this.#inputId;
    targetLabel.textContent = "목표가";
    const inputWrap = document.createElement("div");
    inputWrap.className = "jd-alert-sheet__input";
    const won = document.createElement("span");
    won.className = "jd-alert-sheet__won";
    won.setAttribute("aria-hidden", "true");
    won.textContent = "₩";
    this.#input = document.createElement("input");
    this.#input.className = "jd-alert-sheet__field";
    this.#input.id = this.#inputId;
    this.#input.inputMode = "numeric";
    this.#input.autocomplete = "off";
    this.#input.setAttribute("data-autofocus", "");
    this.#input.addEventListener("input", this.#onInput);
    this.#delta = document.createElement("span");
    this.#delta.className = "jd-alert-sheet__delta";
    this.#delta.setAttribute("aria-hidden", "true");
    inputWrap.append(won, this.#input, this.#delta);

    this.#quickWrap = document.createElement("div");
    this.#quickWrap.className = "jd-alert-sheet__quick";
    for (const m of QUICK) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-alert-sheet__quick-pill";
      b.textContent = m === 1 ? "현재가" : `${Math.round((m - 1) * 100)}%`;
      b.addEventListener("click", () => this.#applyQuick(m));
      this.#quickWrap.append(b);
    }
    targetGroup.append(targetLabel, inputWrap, this.#quickWrap);

    // ── 액션 ──
    const actions = document.createElement("div");
    actions.className = "jd-alert-sheet__actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "jd-alert-sheet__cancel";
    cancel.textContent = "취소";
    cancel.addEventListener("click", () => this.close());
    this.#submitBtn = document.createElement("button");
    this.#submitBtn.type = "button";
    this.#submitBtn.className = "jd-alert-sheet__submit";
    this.#submitBtn.textContent = "알림 등록";
    this.#submitBtn.addEventListener("click", () => this.#submit());
    actions.append(cancel, this.#submitBtn);

    body.append(fieldLabel, this.#nameEl, priceRow, condGroup, targetGroup, actions);
    panel.append(body);
    this.#body = body;
  }

  /** 현재가×1.05 반올림, price 없으면 빈 값 */
  #autoDefault(): string {
    return this.price > 0 ? String(Math.round(this.price * 1.05)) : "";
  }

  #selectDir(dir: AlertDirection): void {
    if (this.direction === dir) return;
    this.direction = dir; // reflect → update()
    this.emit("jd-direction-change", { direction: dir });
  }

  #onSegKey = (e: KeyboardEvent): void => {
    if (!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const idx = DIRS.indexOf(this.direction as AlertDirection);
    const cur = idx < 0 ? 0 : idx;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowUp"
        ? (cur + DIRS.length - 1) % DIRS.length
        : (cur + 1) % DIRS.length;
    this.#selectDir(DIRS[next]!);
    this.#segBtns[next]?.focus();
  };

  #onInput = (): void => {
    this.#userEdited = true;
    // v2와 동일: 숫자·콤마·소수점만 허용
    const filtered = this.#input.value.replace(/[^0-9.,]/g, "");
    if (filtered !== this.#input.value) this.#input.value = filtered;
    this.#refresh();
  };

  #applyQuick = (m: number): void => {
    this.#userEdited = true;
    this.#input.value = String(Math.round(this.price * m));
    this.#refresh();
  };

  #numeric(): number {
    return Number(this.#input.value.replace(/,/g, ""));
  }

  #valid(): boolean {
    const n = this.#numeric();
    return Number.isFinite(n) && n > 0;
  }

  /** 목표가 파생 표시(delta·제출 가능) 갱신 — DOM 재구축 없음 */
  #refresh(): void {
    const valid = this.#valid();
    const n = this.#numeric();
    const delta = valid && this.price > 0 ? ((n - this.price) / this.price) * 100 : 0;
    this.#delta.textContent = valid ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%` : "";
    this.#submitBtn.disabled = !valid;
  }

  protected override update(): void {
    super.update();
    if (!this.#body) return;

    // 새 종목이면 편집 상태 리셋(v2 stock별 remount 대체)
    if (this.name !== this.#lastName) {
      this.#lastName = this.name;
      this.#userEdited = false;
    }

    this.#nameEl.textContent = this.name ?? "";
    this.#priceValue.textContent = this.price > 0 ? groupThousands(this.price) : "-";

    // 세그먼트 선택 상태
    for (const b of this.#segBtns) {
      const on = b.dataset.dir === this.direction;
      b.toggleAttribute("data-selected", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    }

    // 사용자가 만지기 전엔 목표가 기본값을 price에서 유도
    if (!this.#userEdited) this.#input.value = this.#autoDefault();
    this.#refresh();
  }

  #submit(): void {
    if (!this.#valid()) return;
    this.emit("jd-submit", {
      name: this.name,
      target: this.#numeric(),
      direction: this.direction as AlertDirection,
      basePrice: this.price,
    });
    this.close();
  }
}
