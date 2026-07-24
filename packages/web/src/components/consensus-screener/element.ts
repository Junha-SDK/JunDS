/**
 * <jd-consensus-screener> — 투자 위원회 합의 스크리너 표 (v2 finance/ConsensusScreener).
 *
 * 다투자자 스코어링 결과(rows)를 매수 인원·정렬·투자자 필터로 좁혀 보여주는 표.
 * v2는 rows를 prop으로 받되 투자자 목록(INVESTOR_LIST)·이모지(INVESTORS)를
 * 앱 라이브러리에서 직접 import했다. v3는 그 메타도 `investors` 프로퍼티로 받는다
 * (§6.3 — 컴포넌트는 데이터를 받기만). 종목 링크(v2 next/Link)는 걷어내고 행 클릭 시
 * jd-select{name}를 발행해 소비자가 라우팅한다(href 있으면 네이티브 <a>도 겸한다).
 *
 * 숫자 포맷은 groupDigits(§3.1-3) — toLocaleString은 프리렌더/방문자 로케일이 갈려
 * 스냅샷이 어긋난다. a11y 순증: 정렬 select에 이름, 필터 버튼에 aria-pressed,
 * 표에 <th scope> 머리 — v2는 색·굵기로만 상태를 표현했다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import consensusScreenerStyles from "./consensus-screener.css.js";

export interface JdConsensusRow {
  name: string;
  sector?: string;
  price: number;
  change: number;
  per?: number | null;
  roe?: number | null;
  bullCount: number;
  bearCount: number;
  avgScore: number;
  topScore: number;
  /** 매수 의견 투자자 id 목록 */
  bulls: string[];
  /** 종목 상세 링크(선택) — 있으면 네이티브 <a> */
  href?: string;
}

export interface JdConsensusInvestor {
  id: string;
  name: string;
  emoji: string;
}

type SortKey = "avgScore" | "bullCount" | "topScore" | "change";

const SORT_LABELS: Record<SortKey, string> = {
  avgScore: "평균 점수",
  bullCount: "매수 인원",
  topScore: "최고 점수",
  change: "오늘 등락률",
};

/** v2 최소 매수 인원 버튼 */
const BULL_STEPS = [0, 3, 5, 6, 7, 8] as const;

const SPARK_SVG =
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
  ` stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>`;

const SEARCH_SVG =
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
  ` stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`;

export class JdConsensusScreener extends JdElement {
  static override tag = "jd-consensus-screener";
  static override props = {
    title: { type: String, default: "위원회 합의 스크리너" },
  };

  declare title: string;

  #rows: JdConsensusRow[] = [];
  #investors: JdConsensusInvestor[] = [];
  #bullishness: Record<string, number> = {};

  #minBulls = 0;
  #sort: SortKey = "avgScore";
  #filterInvestor: string | "all" = "all";

  #sortSelect: HTMLSelectElement | null = null;
  #bullRow: HTMLElement | null = null;
  #countEl: HTMLElement | null = null;
  #chipRow: HTMLElement | null = null;
  #tableWrap: HTMLElement | null = null;
  #investorsDirty = true;

  get rows(): JdConsensusRow[] {
    return this.#rows;
  }
  set rows(v: JdConsensusRow[]) {
    this.#rows = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get investors(): JdConsensusInvestor[] {
    return this.#investors;
  }
  set investors(v: JdConsensusInvestor[]) {
    this.#investors = Array.isArray(v) ? v : [];
    this.#investorsDirty = true;
    this.requestUpdate();
  }

  get bullishness(): Record<string, number> {
    return this.#bullishness;
  }
  set bullishness(v: Record<string, number>) {
    this.#bullishness = v && typeof v === "object" ? v : {};
    this.#investorsDirty = true;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(consensusScreenerStyles);
    this.#readJson();
    this.classList.add("jd-consensus-screener");
    this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as {
        rows?: JdConsensusRow[];
        investors?: JdConsensusInvestor[];
        bullishness?: Record<string, number>;
      };
      if (Array.isArray(parsed.rows)) this.#rows = parsed.rows;
      if (Array.isArray(parsed.investors)) this.#investors = parsed.investors;
      if (parsed.bullishness && typeof parsed.bullishness === "object") {
        this.#bullishness = parsed.bullishness;
      }
    } catch {
      /* 잘못된 JSON은 무시 */
    }
    script.remove();
  }

  #build(): void {
    if (this.querySelector(":scope > .jd-consensus-screener__head")) return; // 입양

    const head = document.createElement("div");
    head.className = "jd-consensus-screener__head";
    const title = document.createElement("div");
    title.className = "jd-consensus-screener__title";
    const spark = document.createElement("span");
    spark.className = "jd-consensus-screener__title-icon";
    spark.setAttribute("aria-hidden", "true");
    spark.innerHTML = SPARK_SVG;
    const titleText = document.createElement("span");
    titleText.className = "jd-consensus-screener__title-text";
    title.append(spark, titleText);
    this.#sortSelect = document.createElement("select");
    this.#sortSelect.className = "jd-consensus-screener__sort";
    this.#sortSelect.setAttribute("aria-label", "정렬 기준");
    for (const key of Object.keys(SORT_LABELS) as SortKey[]) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = SORT_LABELS[key];
      this.#sortSelect.append(opt);
    }
    head.append(title, this.#sortSelect);

    // 최소 매수 인원 행
    this.#bullRow = document.createElement("div");
    this.#bullRow.className = "jd-consensus-screener__bulls";
    const bullLabel = document.createElement("span");
    bullLabel.className = "jd-consensus-screener__bulls-label";
    bullLabel.textContent = "최소 ▲ 인원";
    const bullBtns = document.createElement("div");
    bullBtns.className = "jd-consensus-screener__bull-btns";
    bullBtns.setAttribute("role", "group");
    bullBtns.setAttribute("aria-label", "최소 매수 인원");
    for (const n of BULL_STEPS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-consensus-screener__bull-btn";
      b.dataset.bulls = String(n);
      b.textContent = n === 0 ? "전체" : `${n}+`;
      bullBtns.append(b);
    }
    this.#countEl = document.createElement("span");
    this.#countEl.className = "jd-consensus-screener__count";
    this.#bullRow.append(bullLabel, bullBtns, this.#countEl);

    // 투자자 칩 행
    this.#chipRow = document.createElement("div");
    this.#chipRow.className = "jd-consensus-screener__chips";
    this.#chipRow.setAttribute("role", "group");
    this.#chipRow.setAttribute("aria-label", "투자자 필터");

    // 표 래퍼
    this.#tableWrap = document.createElement("div");
    this.#tableWrap.className = "jd-consensus-screener__table-wrap";

    this.append(head, this.#bullRow, this.#chipRow, this.#tableWrap);
  }

  protected override connected(): void {
    this.#sortSelect?.addEventListener("change", this.#onSort);
    this.#bullRow?.addEventListener("click", this.#onBullClick);
    this.#chipRow?.addEventListener("click", this.#onChipClick);
    this.#tableWrap?.addEventListener("click", this.#onRowClick);
  }

  protected override disconnected(): void {
    this.#sortSelect?.removeEventListener("change", this.#onSort);
    this.#bullRow?.removeEventListener("click", this.#onBullClick);
    this.#chipRow?.removeEventListener("click", this.#onChipClick);
    this.#tableWrap?.removeEventListener("click", this.#onRowClick);
  }

  #onSort = (): void => {
    this.#sort = (this.#sortSelect?.value as SortKey) || "avgScore";
    this.requestUpdate();
  };

  #onBullClick = (e: Event): void => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      ".jd-consensus-screener__bull-btn",
    );
    if (!btn) return;
    this.#minBulls = Number(btn.dataset.bulls) || 0;
    this.requestUpdate();
  };

  #onChipClick = (e: Event): void => {
    const chip = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      ".jd-consensus-screener__chip",
    );
    if (!chip) return;
    this.#filterInvestor = chip.dataset.investor || "all";
    this.requestUpdate();
  };

  #onRowClick = (e: Event): void => {
    const cell = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      ".jd-consensus-screener__name",
    );
    if (!cell) return;
    const name = cell.dataset.name;
    if (name) this.emit("jd-select", { name });
  };

  #filtered(): JdConsensusRow[] {
    let r = this.#rows.filter((row) => row.bullCount >= this.#minBulls);
    if (this.#filterInvestor !== "all") {
      r = r.filter((row) => row.bulls.includes(this.#filterInvestor));
    }
    const sort = this.#sort;
    return [...r].sort((a, b) => {
      if (sort === "bullCount") return b.bullCount - a.bullCount || b.avgScore - a.avgScore;
      if (sort === "topScore") return b.topScore - a.topScore;
      if (sort === "change") return b.change - a.change;
      return b.avgScore - a.avgScore;
    });
  }

  protected override update(): void {
    const titleText = this.querySelector(".jd-consensus-screener__title-text");
    if (titleText) titleText.textContent = this.title;
    if (this.#sortSelect) this.#sortSelect.value = this.#sort;

    // 매수 버튼 활성
    this.#bullRow?.querySelectorAll<HTMLButtonElement>(".jd-consensus-screener__bull-btn").forEach(
      (b) => {
        const on = Number(b.dataset.bulls) === this.#minBulls;
        b.toggleAttribute("data-active", on);
        b.setAttribute("aria-pressed", String(on));
      },
    );

    if (this.#investorsDirty) {
      this.#rebuildChips();
      this.#investorsDirty = false;
    }
    // 칩 활성
    this.#chipRow?.querySelectorAll<HTMLButtonElement>(".jd-consensus-screener__chip").forEach(
      (c) => {
        const on = (c.dataset.investor || "all") === this.#filterInvestor;
        c.toggleAttribute("data-active", on);
        c.setAttribute("aria-pressed", String(on));
      },
    );

    const filtered = this.#filtered();
    if (this.#countEl) this.#countEl.textContent = `${filtered.length}개 종목`;
    this.#rebuildTable(filtered);
  }

  #rebuildChips(): void {
    const row = this.#chipRow;
    if (!row) return;
    row.textContent = "";
    row.append(this.#makeChip("all", "전체 위원", undefined));
    for (const inv of this.#investors) {
      const short = inv.name.trim().split(/\s+/).slice(-1)[0] || inv.name;
      row.append(this.#makeChip(inv.id, short, this.#bullishness[inv.id], inv.emoji));
    }
  }

  #makeChip(id: string, label: string, count: number | undefined, emoji?: string): HTMLButtonElement {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "jd-consensus-screener__chip";
    chip.dataset.investor = id;
    if (emoji) {
      const em = document.createElement("span");
      em.setAttribute("aria-hidden", "true");
      em.textContent = emoji;
      chip.append(em);
    }
    const text = document.createElement("span");
    text.textContent = label;
    chip.append(text);
    if (count != null) {
      const c = document.createElement("span");
      c.className = "jd-consensus-screener__chip-count";
      c.textContent = String(count);
      chip.append(c);
    }
    return chip;
  }

  #rebuildTable(rows: JdConsensusRow[]): void {
    const wrap = this.#tableWrap;
    if (!wrap) return;
    wrap.textContent = "";

    if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "jd-consensus-screener__empty";
      const icon = document.createElement("div");
      icon.className = "jd-consensus-screener__empty-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = SEARCH_SVG;
      const t = document.createElement("div");
      t.className = "jd-consensus-screener__empty-title";
      t.textContent = "조건에 맞는 종목이 없습니다";
      const d = document.createElement("div");
      d.className = "jd-consensus-screener__empty-desc";
      d.textContent = "필터를 완화해 보세요.";
      empty.append(icon, t, d);
      wrap.append(empty);
      return;
    }

    const emojiOf = new Map(this.#investors.map((i) => [i.id, i.emoji]));
    const nameOf = new Map(this.#investors.map((i) => [i.id, i.name]));

    const table = document.createElement("table");
    table.className = "jd-consensus-screener__table";
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    for (const h of ["종목", "현재가", "등락률", "PER", "ROE", "▲ 매수", "▼ 매도", "평균 점수", "지지자"]) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = h;
      hr.append(th);
    }
    thead.append(hr);
    const tbody = document.createElement("tbody");

    for (const row of rows) {
      const tr = document.createElement("tr");

      // 종목 (행 머리)
      const nameTh = document.createElement("th");
      nameTh.scope = "row";
      const nameEl = row.href ? document.createElement("a") : document.createElement("button");
      if (row.href) (nameEl as HTMLAnchorElement).href = row.href;
      else (nameEl as HTMLButtonElement).type = "button";
      nameEl.className = "jd-consensus-screener__name";
      nameEl.dataset.name = row.name;
      nameEl.textContent = row.name;
      nameTh.append(nameEl);
      if (row.sector) {
        const sec = document.createElement("span");
        sec.className = "jd-consensus-screener__sector";
        sec.textContent = row.sector;
        nameTh.append(sec);
      }
      tr.append(nameTh);

      tr.append(this.#numCell(groupDigits(row.price)));

      const changeCell = this.#numCell(
        `${row.change >= 0 ? "+" : ""}${row.change.toFixed(2)}%`,
        row.change >= 0 ? "up" : "down",
      );
      changeCell.classList.add("jd-consensus-screener__strong");
      tr.append(changeCell);

      tr.append(this.#numCell(row.per != null ? row.per.toFixed(1) : "—", "muted"));
      tr.append(this.#numCell(row.roe != null ? `${row.roe.toFixed(1)}%` : "—", "muted"));

      const bull = this.#numCell(String(row.bullCount), "up");
      bull.classList.add("jd-consensus-screener__strong");
      tr.append(bull);
      tr.append(this.#numCell(String(row.bearCount), row.bearCount > 0 ? "down" : "muted"));

      const avg = this.#numCell(row.avgScore.toFixed(2));
      avg.classList.add("jd-consensus-screener__strong");
      tr.append(avg);

      const supporters = document.createElement("td");
      supporters.className = "jd-consensus-screener__supporters";
      for (const id of row.bulls.slice(0, 8)) {
        const em = document.createElement("span");
        em.className = "jd-consensus-screener__emoji";
        em.title = nameOf.get(id) ?? id;
        em.textContent = emojiOf.get(id) ?? "•";
        supporters.append(em);
      }
      tr.append(supporters);

      tbody.append(tr);
    }
    table.append(thead, tbody);
    wrap.append(table);
  }

  #numCell(text: string, tone?: "up" | "down" | "muted"): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = "jd-consensus-screener__num";
    if (tone) td.dataset.tone = tone;
    td.textContent = text;
    return td;
  }
}
