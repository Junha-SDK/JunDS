/**
 * <jd-security-checklist> — 보안 설정 현황 + 조치 (v2 patterns/SecurityChecklist).
 *
 * v2 대비:
 *  - 항목의 `action.onClick`은 `jd-action`(detail {key, label}) 이벤트로 승격(§1.5).
 *  - 구조를 목록 시맨틱으로: 헤더는 `<h3>`, 항목은 `role=list`/`listitem`,
 *    진행 막대에 `role=img` + 요약 aria-label, 카운트 배지는 텍스트로도 읽힌다
 *    (v2는 색상 막대뿐이라 AT에 상태가 가지 않았다).
 *  - 상태 아이콘(방패)은 status별 CSS 색(currentColor) — v2의 하드코딩 6색 리터럴을
 *    시맨틱 토큰으로 번역, 다크 테마에서도 동작.
 *  - 데이터는 property(items) 또는 자식 <script type="application/json">(§1.3 예외).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import securityChecklistStyles from "./security-checklist.css.js";

export type JdSecurityStatus = "secure" | "insecure" | "attention" | "unchecked";

export interface JdSecurityItem {
  key: string;
  title: string;
  description: string;
  status: JdSecurityStatus;
  action?: { label: string };
}

/** 방패 외곽 — 전 status 공통 */
const SHIELD =
  "M8 1.5c-.5.3-1.7.8-3.2 1C4.3 4 4 5.5 4 7c0 3.2 1.8 5.5 4 6.5 2.2-1 4-3.3 4-6.5 0-1.5-.3-3-.8-4.5-1.5-.2-2.7-.7-3.2-1z";

/** status별 방패 안 글리프 */
const GLYPH: Record<JdSecurityStatus, string> = {
  secure: "M6 8l1.5 1.5L10 7",
  insecure: "M6.5 6.5l3 3M9.5 6.5l-3 3",
  attention: "M8 5.5v3M8 10.5h.01",
  unchecked: "M7 8h2",
};

function iconSvg(status: JdSecurityStatus): string {
  return (
    `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
    `<path d="${SHIELD}" stroke="currentColor" stroke-width="1.2"/>` +
    `<path d="${GLYPH[status]}" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  );
}

export class JdSecurityChecklist extends JdElement {
  static override tag = "jd-security-checklist";
  static override props = {
    title: { type: String, default: "보안 체크리스트" },
  };

  declare title: string;

  #items: JdSecurityItem[] = [];
  #itemsSig = "";

  #titleEl!: HTMLHeadingElement;
  #countEl!: HTMLSpanElement;
  #progress!: HTMLElement;
  #list!: HTMLElement;

  get items(): JdSecurityItem[] {
    return this.#items;
  }
  set items(v: JdSecurityItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(securityChecklistStyles);
    this.#readJson();
    if (!this.hasAttribute("role")) this.setAttribute("role", "region");

    const header = document.createElement("div");
    header.className = "jd-security__header";
    const headRow = document.createElement("div");
    headRow.className = "jd-security__head-row";
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-security__title";
    this.#countEl = document.createElement("span");
    this.#countEl.className = "jd-security__count";
    headRow.append(this.#titleEl, this.#countEl);
    this.#progress = document.createElement("div");
    this.#progress.className = "jd-security__progress";
    this.#progress.setAttribute("role", "img");
    header.append(headRow, this.#progress);

    this.#list = document.createElement("div");
    this.#list.className = "jd-security__list";
    this.#list.setAttribute("role", "list");

    this.append(header, this.#list);
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdSecurityItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-security-checklist> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    const items = this.#items;
    const total = items.length;
    const secure = items.filter((i) => i.status === "secure").length;

    this.#titleEl.textContent = this.title;
    this.setAttribute("aria-label", this.title);

    this.#countEl.textContent = `${secure}/${total} 안전`;
    this.#countEl.setAttribute(
      "data-level",
      total > 0 && secure === total ? "ok" : secure >= total * 0.5 ? "warn" : "bad",
    );

    this.#progress.setAttribute("aria-label", `${total}개 중 ${secure}개 안전`);

    const sig = JSON.stringify(items);
    if (sig === this.#itemsSig) return;
    this.#itemsSig = sig;

    // 진행 막대 — 항목당 세그먼트 1개
    this.#progress.textContent = "";
    for (const item of items) {
      const seg = document.createElement("span");
      seg.className = "jd-security__seg";
      seg.setAttribute("data-status", item.status);
      this.#progress.append(seg);
    }

    // 항목 목록
    this.#list.textContent = "";
    for (const item of items) this.#list.append(this.#buildItem(item));
  }

  #buildItem(item: JdSecurityItem): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-security__item";
    row.setAttribute("role", "listitem");

    const icon = document.createElement("span");
    icon.className = "jd-security__icon";
    icon.setAttribute("data-status", item.status);
    icon.innerHTML = iconSvg(item.status);

    const body = document.createElement("div");
    body.className = "jd-security__body";
    const title = document.createElement("div");
    title.className = "jd-security__item-title";
    title.textContent = item.title;
    const desc = document.createElement("div");
    desc.className = "jd-security__item-desc";
    desc.textContent = item.description;
    body.append(title, desc);

    row.append(icon, body);

    if (item.action) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-security__action";
      btn.setAttribute("data-variant", item.status === "insecure" ? "primary" : "secondary");
      btn.textContent = item.action.label;
      btn.addEventListener("click", () =>
        this.emit("jd-action", { key: item.key, label: item.action!.label }),
      );
      row.append(btn);
    }
    return row;
  }
}
