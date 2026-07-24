/**
 * <jd-live-market-stats> — 시장 분위기 / 시장 폭 / 거래대금 3패널 (v2 finance/LiveMarketStats).
 *
 * v2는 HEATMAP_FLAT 전 종목의 KIS 라이브 등락률을 순회하며 sentiment·breadth·거래대금을
 * 직접 계산했다. 그 집계(도메인)는 앱에 남기고, DS 컴포넌트는 **계산된 스칼라 지표**를
 * 개별 Number 프로퍼티(attribute-안전 §1.3)로 받아 게이지·폭 막대·거래대금을 그린다.
 *
 * sentiment 라벨/색, 거래대금 조·억 포맷은 순수 표시 로직이라 그대로 이식한다. 등락 방향과
 * sentiment 구간은 host `data-*`로 반영 → 색 분기는 전부 CSS(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import liveMarketStatsStyles from "./live-market-stats.css.js";

const INT = new Intl.NumberFormat("ko-KR");

function fmtAmount(억: number): string {
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  if (억 >= 1) return `${INT.format(억)}억`;
  return "—";
}

function sentimentLabel(s: number): string {
  if (s >= 75) return "강세";
  if (s >= 60) return "약강세";
  if (s >= 40) return "중립";
  if (s >= 25) return "약약세";
  return "약세";
}

function sentimentZone(s: number): "up" | "neutral" | "down" {
  if (s >= 60) return "up";
  if (s >= 40) return "neutral";
  return "down";
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export class JdLiveMarketStats extends JdElement {
  static override tag = "jd-live-market-stats";
  static override props = {
    /** 시장 분위기 0~100 */
    sentiment: { type: Number, default: 50 },
    /** 시총 가중 등락률(%) */
    weightedAvg: { type: Number, default: 0 },
    upCount: { type: Number, default: 0 },
    downCount: { type: Number, default: 0 },
    flatCount: { type: Number, default: 0 },
    /** 종목 수 — 미지정 시 up+down+flat 합 */
    total: { type: Number, default: 0 },
    /** 거래대금 합(억) */
    totalAmount: { type: Number, default: 0 },
    kospiAmount: { type: Number, default: 0 },
    kosdaqAmount: { type: Number, default: 0 },
    /** 거래대금 패널의 NXT 링크 (없으면 링크 생략) */
    nxtHref: { type: String, default: "" },
  };

  declare sentiment: number;
  declare weightedAvg: number;
  declare upCount: number;
  declare downCount: number;
  declare flatCount: number;
  declare total: number;
  declare totalAmount: number;
  declare kospiAmount: number;
  declare kosdaqAmount: number;
  declare nxtHref: string;

  #sentScore!: HTMLElement;
  #sentPill!: HTMLElement;
  #gaugeFill!: HTMLElement;
  #wavgA!: HTMLElement;

  #up!: HTMLElement;
  #down!: HTMLElement;
  #flat!: HTMLElement;
  #wavgB!: HTMLElement;
  #count!: HTMLElement;
  #brUp!: HTMLElement;
  #brFlat!: HTMLElement;
  #brDown!: HTMLElement;

  #turnover!: HTMLElement;
  #kospi!: HTMLElement;
  #kosdaq!: HTMLElement;
  #nxt!: HTMLAnchorElement;

  protected render(): void {
    adoptStyles(liveMarketStatsStyles);

    // ── 패널 A: 시장 분위기 ───────────────────────────
    const pa = this.#panel("시장 분위기");
    this.#sentPill = document.createElement("span");
    this.#sentPill.className = "jd-live-market-stats__pill";
    pa.head.append(this.#sentPill);
    const scoreRow = document.createElement("div");
    scoreRow.className = "jd-live-market-stats__score-row";
    this.#sentScore = document.createElement("span");
    this.#sentScore.className = "jd-live-market-stats__score";
    const outOf = document.createElement("span");
    outOf.className = "jd-live-market-stats__out-of";
    outOf.textContent = "/100";
    scoreRow.append(this.#sentScore, outOf);
    const gauge = document.createElement("div");
    gauge.className = "jd-live-market-stats__gauge";
    this.#gaugeFill = document.createElement("div");
    this.#gaugeFill.className = "jd-live-market-stats__gauge-fill";
    gauge.append(this.#gaugeFill);
    const scale = document.createElement("div");
    scale.className = "jd-live-market-stats__scale";
    for (const t of ["약세 0", "중립 50", "강세 100"]) {
      const s = document.createElement("span");
      s.textContent = t;
      scale.append(s);
    }
    this.#wavgA = document.createElement("div");
    this.#wavgA.className = "jd-live-market-stats__wavg-a";
    pa.body.append(scoreRow, gauge, scale, this.#wavgA);

    // ── 패널 B: 시장 폭 (그리드 가운데 2fr 컬럼) ──────
    const pb = this.#panel("시장 폭 (Breadth)");
    this.#count = document.createElement("span");
    this.#count.className = "jd-live-market-stats__meta";
    pb.head.append(this.#count);
    const counts = document.createElement("div");
    counts.className = "jd-live-market-stats__counts";
    this.#up = document.createElement("span");
    this.#up.className = "jd-live-market-stats__count-up";
    this.#down = document.createElement("span");
    this.#down.className = "jd-live-market-stats__count-down";
    this.#flat = document.createElement("span");
    this.#flat.className = "jd-live-market-stats__count-flat";
    this.#wavgB = document.createElement("span");
    this.#wavgB.className = "jd-live-market-stats__wavg-b";
    counts.append(this.#up, this.#down, this.#flat, this.#wavgB);
    const breadth = document.createElement("div");
    breadth.className = "jd-live-market-stats__breadth";
    this.#brUp = document.createElement("div");
    this.#brUp.className = "jd-live-market-stats__breadth-up";
    this.#brFlat = document.createElement("div");
    this.#brFlat.className = "jd-live-market-stats__breadth-flat";
    this.#brDown = document.createElement("div");
    this.#brDown.className = "jd-live-market-stats__breadth-down";
    breadth.append(this.#brUp, this.#brFlat, this.#brDown);
    pb.body.append(counts, breadth);

    // ── 패널 C: 거래대금 ──────────────────────────────
    const pc = this.#panel("거래대금");
    this.#nxt = document.createElement("a");
    this.#nxt.className = "jd-live-market-stats__nxt";
    this.#nxt.textContent = "NXT ›";
    pc.head.append(this.#nxt);
    this.#turnover = document.createElement("div");
    this.#turnover.className = "jd-live-market-stats__turnover";
    const split = document.createElement("div");
    split.className = "jd-live-market-stats__split";
    this.#kospi = document.createElement("span");
    this.#kosdaq = document.createElement("span");
    split.append(this.#kospi, this.#kosdaq);
    pc.body.append(this.#turnover, split);

    this.append(pa.article, pb.article, pc.article);
    this.update();
  }

  #panel(title: string): {
    article: HTMLElement;
    head: HTMLElement;
    body: HTMLElement;
  } {
    const article = document.createElement("article");
    article.className = "jd-live-market-stats__panel";
    article.setAttribute("aria-label", title);
    const head = document.createElement("header");
    head.className = "jd-live-market-stats__head";
    const t = document.createElement("span");
    t.className = "jd-live-market-stats__title";
    t.textContent = title;
    head.append(t);
    const body = document.createElement("div");
    body.className = "jd-live-market-stats__body";
    article.append(head, body);
    return { article, head, body };
  }

  protected override update(): void {
    // 분위기
    const s = this.sentiment;
    this.setAttribute("data-sentiment", sentimentZone(s));
    this.#sentScore.textContent = s.toFixed(0);
    this.#sentPill.textContent = sentimentLabel(s);
    this.#gaugeFill.style.width = `${Math.max(0, Math.min(100, s))}%`;
    this.#wavgA.textContent = `가중 등락률 ${pct(this.weightedAvg)}`;

    // 폭
    const total = this.total || this.upCount + this.downCount + this.flatCount;
    const denom = Math.max(1, total);
    this.setAttribute("data-wavg", this.weightedAvg >= 0 ? "up" : "down");
    this.#up.textContent = `↑ ${this.upCount}`;
    this.#down.textContent = `↓ ${this.downCount}`;
    this.#flat.textContent = `= ${this.flatCount}`;
    this.#wavgB.textContent = `가중 ${pct(this.weightedAvg)}`;
    this.#count.textContent = `${total}개 종목`;
    this.#brUp.style.width = `${(this.upCount / denom) * 100}%`;
    this.#brFlat.style.width = `${(this.flatCount / denom) * 100}%`;
    this.#brDown.style.width = `${(this.downCount / denom) * 100}%`;

    // 거래대금
    this.#turnover.textContent = fmtAmount(this.totalAmount);
    this.#kospi.textContent = `코스피 ${fmtAmount(this.kospiAmount)}`;
    this.#kosdaq.textContent = `코스닥 ${fmtAmount(this.kosdaqAmount)}`;
    if (this.nxtHref) {
      this.#nxt.href = this.nxtHref;
      this.#nxt.hidden = false;
    } else {
      this.#nxt.removeAttribute("href");
      this.#nxt.hidden = true;
    }
  }
}
