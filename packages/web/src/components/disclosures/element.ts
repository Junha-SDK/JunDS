/**
 * <jd-disclosures> — 종목 공시 목록 (v2 finance/DisclosuresClient).
 *
 * 요약 카드 + 검색 + 분류 칩 + 타임라인의 조합 컴포넌트. 타임라인은 새로 만들지 않고
 * **jd-timeline을 합성**하고, 분류 배지는 jd-tag를 합성한다(§6 R12 — 목록 골격 재사용).
 * 필터·검색은 내부 상태이고, DOM 문맥이 있는 상태 변화라 jd-change 이벤트로 알린다(§1.5).
 *
 * 데이터는 복합 배열이라 property 전용(§1.3) + JSON 슬롯. `symbol`만 스칼라 attribute.
 *
 * v2 대비 교정:
 *  1. **"최근 30일"은 Date.now() 의존이라 render를 비결정으로 만든다**(§3.1-3) →
 *     초기 render는 0, connected()에서 실제 값을 계산해 채운다(딥링크 분기를 layout
 *     effect로 미루는 junds.page 패턴과 동형).
 *  2. 검색/필터 결과가 시각적으로만 갱신됐다 → 결과 수를 aria-live로 알린다.
 *
 * 의존 미충족: v2의 DisclosureToneBadge(제목 감성 분류)는 별도 배치 컴포넌트라 여기서는
 * 생략한다 — 분류 Tag·심볼·공시 ID는 그대로 노출한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import disclosuresStyles from "./disclosures.css.js";
import type { JdTimeline, JdTimelineItem, JdTimelineColor } from "../timeline/element.js";

export type JdDisclosureCategory = "정기" | "수시" | "주요사항" | "지분" | "기타";

export interface JdDisclosure {
  id: string;
  title: string;
  /** ISO 날짜 문자열 */
  date: string;
  category: JdDisclosureCategory;
}

const CATEGORIES: JdDisclosureCategory[] = ["정기", "수시", "주요사항", "지분", "기타"];

/** jd-tag 색 (v2 TAG_COLORS) */
const TAG_COLOR: Record<JdDisclosureCategory, string> = {
  정기: "blue",
  수시: "orange",
  주요사항: "red",
  지분: "green",
  기타: "gray",
};

/** jd-timeline 항목 색 (v2 TONES) */
const TIMELINE_COLOR: Record<JdDisclosureCategory, JdTimelineColor> = {
  정기: "primary",
  수시: "warning",
  주요사항: "danger",
  지분: "success",
  기타: "neutral",
};

/** 칩 강조색 (v2 PALETTE — info/warning/danger는 토큰, 나머지 리터럴 승계) */
const CHIP_ACCENT: Record<JdDisclosureCategory, string> = {
  정기: "var(--jd-color-info)",
  수시: "var(--jd-color-warning)",
  주요사항: "var(--jd-color-danger)",
  지분: "#16a34a",
  기타: "#94a3b8",
};

const ICONS: Record<JdDisclosureCategory, string> = {
  정기: "📋",
  수시: "📰",
  주요사항: "⚠️",
  지분: "👥",
  기타: "📎",
};

const MS_30D = 30 * 86_400_000;

function elc(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toItems(v: unknown): JdDisclosure[] {
  if (!Array.isArray(v)) return [];
  const out: JdDisclosure[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    const category = CATEGORIES.includes(raw.category as JdDisclosureCategory)
      ? (raw.category as JdDisclosureCategory)
      : "기타";
    out.push({
      id: String(raw.id ?? ""),
      title: String(raw.title ?? ""),
      date: String(raw.date ?? ""),
      category,
    });
  }
  return out;
}

export class JdDisclosures extends JdElement {
  static override tag = "jd-disclosures";
  static override props = {
    symbol: { type: String },
  };

  declare symbol: string;

  #items: JdDisclosure[] = [];
  #filter: JdDisclosureCategory | "all" = "all";
  #query = "";
  #recentCount = 0;

  // 골격 참조
  #summary!: HTMLElement;
  #searchInput!: HTMLInputElement;
  #clearBtn!: HTMLButtonElement;
  #chips!: HTMLElement;
  #timeline!: JdTimeline & HTMLElement;
  #empty!: HTMLElement;
  #status!: HTMLElement;

  get items(): JdDisclosure[] {
    return this.#items;
  }
  set items(v: JdDisclosure[]) {
    this.#items = toItems(v);
    if (this.isConnected) this.#computeRecent();
    this.requestUpdate();
  }

  get filter(): JdDisclosureCategory | "all" {
    return this.#filter;
  }
  set filter(v: JdDisclosureCategory | "all") {
    this.#filter = v === "all" || CATEGORIES.includes(v as JdDisclosureCategory) ? v : "all";
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(disclosuresStyles);
    if (this.#items.length === 0) {
      const script = this.querySelector<HTMLScriptElement>(
        ':scope > script[type="application/json"]',
      );
      if (script) {
        try {
          this.#items = toItems(JSON.parse(script.textContent || "[]"));
        } catch {
          /* 무시 */
        }
        script.remove();
      }
    }
    this.setAttribute("role", "region");
    this.#build();
    this.update();
  }

  #build(): void {
    // 요약
    this.#summary = elc("section", "jd-disclosures__summary");

    // 검색
    const search = elc("section", "jd-disclosures__search");
    const icon = elc("span", "jd-disclosures__search-icon", "🔍");
    icon.setAttribute("aria-hidden", "true");
    this.#searchInput = document.createElement("input");
    this.#searchInput.type = "text";
    this.#searchInput.className = "jd-disclosures__search-input";
    this.#searchInput.placeholder = "공시 제목으로 검색…";
    this.#searchInput.setAttribute("aria-label", "공시 제목 검색");
    this.#searchInput.addEventListener("input", this.#onSearch);
    this.#clearBtn = document.createElement("button");
    this.#clearBtn.type = "button";
    this.#clearBtn.className = "jd-disclosures__search-clear";
    this.#clearBtn.setAttribute("aria-label", "검색어 지우기");
    this.#clearBtn.textContent = "✕";
    this.#clearBtn.hidden = true;
    this.#clearBtn.addEventListener("click", this.#onClear);
    search.append(icon, this.#searchInput, this.#clearBtn);

    // 분류 칩
    this.#chips = elc("div", "jd-disclosures__chips");
    this.#chips.setAttribute("role", "group");
    this.#chips.setAttribute("aria-label", "공시 분류 필터");

    // 목록
    const list = elc("section", "jd-disclosures__list");
    this.#timeline = document.createElement("jd-timeline") as JdTimeline & HTMLElement;
    this.#timeline.setAttribute("label", "공시 타임라인");
    this.#empty = this.#buildEmpty();
    list.append(this.#timeline, this.#empty);

    // 결과 수 라이브 안내(시각적으로 숨김)
    this.#status = elc("p", "jd-disclosures__status jd-disclosures__sr");
    this.#status.setAttribute("role", "status");
    this.#status.setAttribute("aria-live", "polite");

    const note = elc(
      "p",
      "jd-disclosures__note",
      "실제 공시는 DART(전자공시시스템)에서 확인하실 수 있습니다. 본 페이지는 데모용 결정적 mock 데이터입니다.",
    );

    this.append(this.#summary, search, this.#chips, list, this.#status, note);
  }

  #buildEmpty(): HTMLElement {
    const empty = elc("div", "jd-disclosures__empty");
    empty.append(
      elc("div", "jd-disclosures__empty-icon", "🔍"),
      elc("p", "jd-disclosures__empty-title", "해당 조건의 공시가 없습니다."),
      elc("p", "jd-disclosures__empty-sub", "검색어를 비우거나 다른 분류를 선택해보세요."),
    );
    empty.hidden = true;
    return empty;
  }

  protected override connected(): void {
    this.#computeRecent();
    this.requestUpdate();
  }

  /** Date.now 의존 계산은 connected 이후에만 — render 결정성 보존(§3.1-3) */
  #computeRecent(): void {
    const now = Date.now();
    this.#recentCount = this.#items.slice(0, 30).filter((d) => {
      const t = Date.parse(d.date);
      return Number.isFinite(t) && now - t < MS_30D;
    }).length;
  }

  #onSearch = (e: Event): void => {
    this.#query = (e.target as HTMLInputElement).value;
    this.#clearBtn.hidden = this.#query.length === 0;
    this.requestUpdate();
  };

  #onClear = (): void => {
    this.#query = "";
    this.#searchInput.value = "";
    this.#clearBtn.hidden = true;
    this.#searchInput.focus();
    this.requestUpdate();
  };

  #filtered(): JdDisclosure[] {
    const q = this.#query.trim().toLowerCase();
    return this.#items.filter((d) => {
      if (this.#filter !== "all" && d.category !== this.#filter) return false;
      if (q && !d.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  protected override update(): void {
    if (this.symbol) this.setAttribute("aria-label", `${this.symbol} 공시`);
    const filtered = this.#filtered();
    const major = this.#items.filter((d) => d.category === "주요사항").length;

    this.#syncSummary([
      {
        icon: "📑",
        label: "전체 공시",
        value: this.#items.length,
        accent: "var(--jd-color-accent)",
      },
      { icon: "🆕", label: "최근 30일", value: this.#recentCount, accent: "#0ea5e9" },
      { icon: "⚠️", label: "주요사항", value: major, accent: "var(--jd-color-danger)" },
      {
        icon: "🔍",
        label: "현재 필터",
        value: filtered.length,
        accent: "var(--jd-color-warning)",
        hint: this.#filter === "all" ? "전체" : this.#filter,
      },
    ]);

    this.#syncChips();
    this.#syncTimeline(filtered);
    this.#status.textContent = `${filtered.length}건의 공시`;
  }

  #syncSummary(
    cards: { icon: string; label: string; value: number; accent: string; hint?: string }[],
  ): void {
    if (this.#summary.children.length !== cards.length) {
      this.#summary.textContent = "";
      for (let i = 0; i < cards.length; i++) {
        const card = elc("div", "jd-disclosures__card");
        const chip = elc("span", "jd-disclosures__card-icon");
        chip.setAttribute("aria-hidden", "true");
        const text = elc("div", "jd-disclosures__card-text");
        text.append(
          elc("div", "jd-disclosures__card-label"),
          elc("div", "jd-disclosures__card-value"),
        );
        card.append(chip, text);
        this.#summary.append(card);
      }
    }
    cards.forEach((c, i) => {
      const card = this.#summary.children[i] as HTMLElement;
      card.style.setProperty("--accent", c.accent);
      card.querySelector(".jd-disclosures__card-icon")!.textContent = c.icon;
      card.querySelector(".jd-disclosures__card-label")!.textContent = c.label;
      const value = card.querySelector<HTMLElement>(".jd-disclosures__card-value")!;
      value.textContent = String(c.value);
      let hint = value.querySelector<HTMLElement>(".jd-disclosures__card-hint");
      if (c.hint) {
        if (!hint) {
          hint = elc("span", "jd-disclosures__card-hint");
          value.append(hint);
        }
        hint.textContent = ` ${c.hint}`;
      } else if (hint) {
        hint.remove();
      }
    });
  }

  #syncChips(): void {
    const defs: {
      key: JdDisclosureCategory | "all";
      label: string;
      count: number;
      icon?: string;
      accent?: string;
    }[] = [
      { key: "all", label: "전체", count: this.#items.length },
      ...CATEGORIES.map((c) => ({
        key: c,
        label: c,
        count: this.#items.filter((d) => d.category === c).length,
        icon: ICONS[c],
        accent: CHIP_ACCENT[c],
      })),
    ];
    if (this.#chips.children.length !== defs.length) {
      this.#chips.textContent = "";
      for (const def of defs) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jd-disclosures__chip";
        btn.addEventListener("click", () => {
          this.filter = def.key;
          this.emit("jd-change", { filter: this.#filter });
        });
        const icon = elc("span", "jd-disclosures__chip-icon");
        icon.setAttribute("aria-hidden", "true");
        btn.append(
          icon,
          elc("span", "jd-disclosures__chip-label"),
          elc("span", "jd-disclosures__chip-count"),
        );
        this.#chips.append(btn);
      }
    }
    defs.forEach((def, i) => {
      const btn = this.#chips.children[i] as HTMLButtonElement;
      const active = this.#filter === def.key;
      btn.toggleAttribute("data-active", active);
      btn.setAttribute("aria-pressed", String(active));
      if (def.accent) btn.style.setProperty("--accent", def.accent);
      else btn.style.removeProperty("--accent");
      const icon = btn.querySelector<HTMLElement>(".jd-disclosures__chip-icon")!;
      icon.textContent = def.icon ?? "";
      icon.hidden = !def.icon;
      btn.querySelector(".jd-disclosures__chip-label")!.textContent = def.label;
      btn.querySelector(".jd-disclosures__chip-count")!.textContent = String(def.count);
    });
  }

  #syncTimeline(filtered: JdDisclosure[]): void {
    const empty = filtered.length === 0;
    this.#timeline.hidden = empty;
    this.#empty.hidden = !empty;
    if (empty) {
      this.#timeline.items = [];
      return;
    }
    const items: JdTimelineItem[] = filtered.map((d) => ({
      key: d.id,
      title: d.title,
      description: this.#description(d),
      time: d.date,
      dateTime: d.date,
      color: TIMELINE_COLOR[d.category],
    }));
    this.#timeline.items = items;
  }

  #description(d: JdDisclosure): HTMLElement {
    const desc = elc("div", "jd-disclosures__desc");
    const tag = document.createElement("jd-tag");
    tag.setAttribute("color", TAG_COLOR[d.category]);
    tag.textContent = d.category;
    desc.append(
      tag,
      elc("span", "jd-disclosures__desc-meta", this.symbol),
      elc("span", "jd-disclosures__desc-meta", `공시 ID: ${d.id}`),
    );
    return desc;
  }
}
