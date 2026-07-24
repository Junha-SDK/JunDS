/**
 * <jd-live-ticker> — 흐르는 실시간 시세 띠 (v2 finance/LiveTicker).
 *
 * v2는 HEATMAP_FLAT 시드를 컴포넌트가 직접 쥐고 3초마다 LCG 지터로 흔들며, 손수 만든
 * 2벌 marquee를 굴렸다. DS는 두 축으로 분리한다:
 *  1. **데이터는 앱이 준다**(DEC-003 런타임 데이터 의존 0) — `stocks` 프로퍼티 또는
 *     선언적 JSON 슬롯. 시드 생성·지터는 표시 컴포넌트의 몫이 아니다.
 *  2. **스크롤은 jd-marquee에 위임**한다(§6 재사용) — 이음매·감속·키보드 정지가 이미 풀려 있다.
 *
 * jd-marquee는 시각용 복제본을 정지 스냅샷으로 만든다(라이브 텍스트를 복제본까지
 * 갱신하지 않는다). 그래서 이 컴포넌트는 지터 엔진을 얹지 않는다 — `stocks`가 바뀌면
 * marquee를 통째로 재구축해 복제본이 언제나 최신을 반영하게 한다(스크롤 위치는 리셋되지만
 * 워치리스트 띠의 일반 사용은 스냅샷 교체가 드물다). LIVE 여부는 `live`가 배지와 재생/정지를
 * 가른다(v2 animation-play-state 게이트 이식).
 *
 * 방향 착색: v2는 직전 tick 대비로 ▲/▼를 칠했다. 스냅샷 표시에는 그 기준선이 없어 **당일
 * 등락(pct 부호)**으로 화살표·색을 정한다 — 오른 종목은 ▲ 상승색, 내린 종목은 ▼ 하락색.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import tickerStyles from "./live-ticker.css.js";

export interface JdTickerStock {
  name: string;
  price: number;
  /** 등락률(%) */
  pct: number;
  /** 거래대금(억원) */
  volume: number;
}

/** v2 fmtVol — 로케일 의존 toLocaleString 대신 groupDigits(§3.1-3 결정성) */
function fmtVolume(eok: number): string {
  if (!Number.isFinite(eok)) return "—";
  if (eok >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  return `${groupDigits(Math.round(eok))}억`;
}

export class JdLiveTicker extends JdElement {
  static override tag = "jd-live-ticker";
  static override props = {
    /** 라이브 세션 여부 — 배지 상태 + 흐름 재생/정지 (v2 isOpen) */
    live: { type: Boolean, reflect: true },
    /** 배지 상태 텍스트 override. 비우면 live→"LIVE" / 그 외→"장마감" */
    label: { type: String },
    /** 출처 표기(예: "실시간 시세"). 종목 수와 함께 캡션을 이룬다 */
    source: { type: String, default: "실시간 시세" },
    /** 한 바퀴 초. 0이면 종목 수로 자동(v2 max(60, n*2.5)) */
    speed: { type: Number, default: 0 },
  };

  declare live: boolean;
  declare label: string;
  declare source: string;
  declare speed: number;

  #stocks: JdTickerStock[] = [];
  #dot!: HTMLElement;
  #caption!: HTMLElement;
  #stage!: HTMLElement;
  #marquee: HTMLElement | null = null;

  get stocks(): JdTickerStock[] {
    return this.#stocks;
  }
  set stocks(v: JdTickerStock[]) {
    this.#stocks = this.#normalize(v);
    if (this.#stage) this.#buildMarquee();
    this.requestUpdate();
  }

  #normalize(v: unknown): JdTickerStock[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({
        name: typeof s.name === "string" ? s.name : "",
        price: num(s.price),
        pct: num(s.pct),
        volume: num(s.volume),
      }));
  }

  /** 급등·급락 우선 정렬(|pct| 내림차순) — v2 관용 */
  #sorted(): JdTickerStock[] {
    return [...this.#stocks].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  }

  protected render(): void {
    adoptStyles(tickerStyles);
    this.#readJsonSlot();

    const badge = document.createElement("div");
    badge.className = "jd-lt__badge";
    this.#dot = document.createElement("jd-live-status-dot");
    this.#dot.className = "jd-lt__dot";
    this.#caption = document.createElement("span");
    this.#caption.className = "jd-lt__caption";
    badge.append(this.#dot, this.#caption);

    this.#stage = document.createElement("div");
    this.#stage.className = "jd-lt__stage";

    this.replaceChildren(badge, this.#stage);
    this.#buildMarquee();
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      // 슬롯은 초기값 — 이미 대입된 stocks 프로퍼티를 덮지 않는다(§1.3 마지막 쓰기 승리)
      if (Array.isArray(parsed) && this.#stocks.length === 0) this.#stocks = this.#normalize(parsed);
    } catch {
      console.warn("[junds] <jd-live-ticker> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** stocks 스냅샷마다 marquee를 새로 세운다 — 복제본까지 최신 반영 */
  #buildMarquee(): void {
    const marquee = document.createElement("jd-marquee");
    marquee.className = "jd-lt__marquee";
    marquee.setAttribute("gap", "24");
    for (const s of this.#sorted()) marquee.append(this.#quote(s));
    if (this.#marquee) this.#marquee.replaceWith(marquee);
    else this.#stage.append(marquee);
    this.#marquee = marquee;
    this.#applyMarqueeState();
  }

  #quote(s: JdTickerStock): HTMLElement {
    const up = s.pct >= 0;
    const dir = up ? "up" : "down";
    const item = document.createElement("span");
    item.className = "jd-lt__item";

    const name = document.createElement("span");
    name.className = "jd-lt__name";
    name.textContent = s.name;

    const price = document.createElement("span");
    price.className = "jd-lt__price";
    price.setAttribute("data-dir", dir);
    price.textContent = `${up ? "▲" : "▼"}${groupDigits(Math.round(s.price))}`;

    const pct = document.createElement("span");
    pct.className = "jd-lt__pct";
    pct.setAttribute("data-dir", dir);
    pct.textContent = `${up ? "+" : ""}${s.pct.toFixed(2)}%`;

    const vol = document.createElement("span");
    vol.className = "jd-lt__vol";
    vol.textContent = fmtVolume(s.volume);

    item.append(name, price, pct, vol);
    return item;
  }

  #applyMarqueeState(): void {
    if (!this.#marquee) return;
    const n = this.#stocks.length;
    const sec = this.speed > 0 ? this.speed : Math.max(60, n * 2.5);
    this.#marquee.setAttribute("speed", String(sec));
    this.#marquee.toggleAttribute("paused", !this.live);
  }

  protected override update(): void {
    (this.#dot as unknown as { live: boolean }).live = this.live;
    (this.#dot as unknown as { label: string }).label = this.label || (this.live ? "LIVE" : "장마감");
    const n = this.#stocks.length;
    this.#caption.textContent = this.live
      ? `${this.source} · ${n}종목`
      : `${n}종목 · 정규장 09:00–15:30 KST`;
    this.#applyMarqueeState();
  }
}
