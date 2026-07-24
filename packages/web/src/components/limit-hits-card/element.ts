/**
 * <jd-limit-hits-card> — 오늘 상한가 잠금 목록 (v2 finance/MarketSignals `LimitHitsCard`)
 * = <jd-close-picks-card> 파생.
 *
 * 카드 크롬(이모지 헤더·요약 배지·목록·구분선)은 부모가 전부 갖고 있다(§6 R12). 이 클래스는
 * **행 모양·요약·정렬·각주만** 갈아끼운다: 강도 배지 대신 잠긴 시각 핀, 사유 대신 모멘텀,
 * 예상률 대신 등락률 + 거래대금. 각주 기본값을 비워 부모가 각주를 숨기게 둔다.
 */
import { adoptStyles } from "../../core/styles.js";
import { JdClosePicksCard, type JdMarketSignal } from "../close-picks-card/element.js";
import limitHitsStyles from "./limit-hits-card.css.js";

/** 상한가 잠금 한 줄 */
export interface JdLimitHit {
  name: string;
  /** 등락률(%) — 보통 29.7~29.99 */
  pct: number;
  /** 상한가 잠긴 시각 HH:MM */
  lockedAt: string;
  /** 한 번에 잠겼는지(false = 풀렸다 재잠금) */
  lockedFirstAttempt: boolean;
  /** 거래대금(억) */
  amount: number;
  /** 한 줄 모멘텀 요약 */
  catalyst: string;
  /** 링크 목적지(비우면 /stock/{name}) */
  href?: string;
}

const LOCK =
  `<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" ` +
  `stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

/** 로케일 비의존 3자리 그룹핑(정수, §3.1-3) */
function groupInt(v: number): string {
  if (!Number.isFinite(v)) return "0";
  const neg = v < 0;
  const int = String(Math.round(Math.abs(v)));
  return `${neg ? "-" : ""}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

const stockHref = (item: JdMarketSignal): string =>
  item.href || `/stock/${encodeURIComponent(item.name)}`;

export class JdLimitHitsCard extends JdClosePicksCard {
  static override tag = "jd-limit-hits-card";
  static override props = {
    ...JdClosePicksCard.props,
    emoji: { type: String, default: "🔥" },
    heading: { type: String, default: "상한가 잠금 (오늘)" },
    /** 기본 각주 없음 — 부모가 빈 문자열이면 각주를 숨긴다 */
    footerNote: { type: String, default: "", attribute: "footer-note" },
  };

  protected override render(): void {
    super.render(); // 부모: 크롬 구축 + close-picks 스타일 채택 + update()(이미 아래 오버라이드 사용)
    adoptStyles(limitHitsStyles); // limit-hit 행 색만 추가 채택(문서 단위, 순서 무관)
  }

  /** 잠긴 시각 빠른 순 (v2 limitHitsByTime) */
  protected override sortItems(items: readonly JdMarketSignal[]): JdMarketSignal[] {
    return [...items].sort((a, b) => (a.lockedAt ?? "").localeCompare(b.lockedAt ?? ""));
  }

  protected override summaryText(items: readonly JdMarketSignal[]): string {
    const clean = items.filter((h) => h.lockedFirstAttempt).length;
    return `${items.length}종목 · 한 번에 잠금 ${clean}`;
  }

  protected override buildRow(raw: JdMarketSignal): HTMLLIElement {
    const hit = raw as JdLimitHit;
    const li = document.createElement("li");
    li.className = "jd-lhc__row";

    const main = document.createElement("div");
    main.className = "jd-lhc__main";

    const nameline = document.createElement("div");
    nameline.className = "jd-lhc__nameline";
    const name = document.createElement("a");
    name.className = "jd-lhc__name";
    name.href = stockHref(raw);
    name.textContent = hit.name;
    nameline.append(name, this.#lockPill(hit.lockedAt, hit.lockedFirstAttempt));

    const catalyst = document.createElement("div");
    catalyst.className = "jd-lhc__catalyst";
    catalyst.textContent = hit.catalyst ?? "";
    main.append(nameline, catalyst);

    const figures = document.createElement("div");
    figures.className = "jd-lhc__figures";
    const pct = document.createElement("div");
    pct.className = "jd-lhc__pct";
    pct.dataset.dir = "up";
    pct.textContent = `+${(hit.pct ?? 0).toFixed(2)}%`;
    const amount = document.createElement("div");
    amount.className = "jd-lhc__amount";
    amount.textContent = `${groupInt(hit.amount ?? 0)}억`;
    figures.append(pct, amount);

    li.append(main, figures);
    return li;
  }

  #lockPill(at: string, clean: boolean): HTMLElement {
    const pill = document.createElement("span");
    pill.className = "jd-lhc__pill";
    pill.dataset.clean = String(Boolean(clean));
    pill.title = clean ? "한 번에 잠김" : "잠겼다 풀린 뒤 재진입";
    const icon = document.createElement("span");
    icon.className = "jd-lhc__pill-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = LOCK;
    const time = document.createElement("span");
    time.className = "jd-lhc__pill-time";
    time.textContent = at ?? "";
    pill.append(icon, time);
    return pill;
  }
}
