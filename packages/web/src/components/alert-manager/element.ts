/**
 * <jd-alert-manager> — 가격 알림 교차 감지기 (v2 finance/AlertManager).
 *
 * v2 AlertManager는 `return null`인 **헤드리스** 컴포넌트였다: KIS WebSocket 구독
 * (useRealPrices)·localStorage 알림 저장소(getAlerts/markTriggered)·DS 토스트를 한데
 * 엮어, 활성 알림이 목표가를 교차하면 토스트를 띄웠다. 이 중 **DS로 이식 가능한 유일한
 * 알맹이는 교차 판정 로직**이다 — WebSocket·localStorage·토스트는 전부 앱/데이터 계층
 * (DEC-019: @junds/finance-data + 소비자 토스트)이라 코어에 넣지 않는다.
 *
 * 그래서 v3는 데이터 무관 헤드리스 CE로 좁힌다:
 *   - `alerts` 프로퍼티(또는 JSON 슬롯)로 감시 대상을 받는다.
 *   - `tick(name, price)`로 시세를 주입하면, 교차한 활성 알림마다 `jd-alert-trigger`를
 *     발행하고 재발화하지 않도록 내부에서 소거(v2 markTriggered 대응)한다.
 *   - 구독·저장·토스트 배선은 소비자가 이 이벤트를 받아 수행한다.
 *
 * DOM/스타일 없음(v2 null 렌더 동형) — display:none.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import alertManagerStyles from "./alert-manager.css.js";

export type AlertDirection = "above" | "below";

export interface JdAlert {
  id: string;
  name: string;
  target: number;
  direction: AlertDirection;
  basePrice: number;
  active?: boolean;
}

/** v2 교차 조건 동형 — 진입 방향에서 목표가를 넘을 때만 참(기준가 반대편에서 출발). */
function crossed(a: JdAlert, price: number): boolean {
  return a.direction === "above"
    ? a.basePrice < a.target && price >= a.target
    : a.basePrice > a.target && price <= a.target;
}

export class JdAlertManager extends JdElement {
  static override tag = "jd-alert-manager";
  static override props = {};

  #alerts: JdAlert[] = [];
  #fired = new Set<string>();

  get alerts(): JdAlert[] {
    return this.#alerts;
  }
  set alerts(v: JdAlert[]) {
    this.#alerts = Array.isArray(v) ? v.map((a) => ({ ...a })) : [];
    // 존재하지 않는 id의 발화 이력은 버리고, 다시 active로 들어온 알림은 재무장한다.
    const next = new Set<string>();
    for (const a of this.#alerts) {
      if (this.#fired.has(a.id) && a.active !== true) next.add(a.id);
    }
    this.#fired = next;
  }

  protected render(): void {
    adoptStyles(alertManagerStyles);
    // 선언적 초기화 슬롯(§1.3 예외) — radio-group 선례 동형
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdAlert[];
        if (Array.isArray(parsed)) this.alerts = parsed;
      } catch {
        console.warn("[junds] <jd-alert-manager> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
  }

  /**
   * 한 종목의 시세를 주입한다. 교차한 활성·미발화 알림마다 jd-alert-trigger 발행 +
   * 내부 소거(재발화 방지). 교차한 알림 배열을 반환한다.
   */
  tick(name: string, price: number): JdAlert[] {
    if (!Number.isFinite(price)) return [];
    const hits: JdAlert[] = [];
    for (const a of this.#alerts) {
      if (a.active === false) continue;
      if (a.name !== name) continue;
      if (this.#fired.has(a.id)) continue;
      if (!crossed(a, price)) continue;
      this.#fired.add(a.id);
      a.active = false; // v2 markTriggered 대응 — 내부 사본만 갱신
      hits.push(a);
      this.emit("jd-alert-trigger", { alert: { ...a }, price });
    }
    return hits;
  }

  /** 활성 알림이 걸린 종목 이름들 — 소비자가 구독 시드에 쓴다(v2 liveNames). */
  activeNames(): string[] {
    return Array.from(
      new Set(this.#alerts.filter((a) => a.active !== false && !this.#fired.has(a.id)).map((a) => a.name)),
    );
  }

  /** 발화 이력 초기화(전체 재무장) */
  reset(): void {
    this.#fired.clear();
  }
}
