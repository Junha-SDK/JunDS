/**
 * <jd-stats-grid> — 통계 카드 반응형 그리드 (v2 patterns/StatsGrid).
 *
 * 데이터 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `stats` 프로퍼티 (Array<JdStatData>)
 *  2. 자식 <script type="application/json">[…]</script> (DEC-023-3 선례)
 * 항목마다 <jd-stat-card>를 만든다 — 지표 골격 정본(jd-stat)을 재사용하므로 트렌드
 * 화살표·변화량 색·라벨 규칙이 화면 어디서나 같다(jd-stat element.ts가 통일한 것).
 *
 * v2 대비 판단 3건:
 * 1. **데이터가 없으면 소비자가 쓴 <jd-stat-card> 자식을 그대로 배치한다.** v2 StatsGrid는
 *    stats 배열만 받았지만, 바닐라에서는 카드를 직접 자식으로 쓰는 편이 자연스럽다(아이콘·
 *    커스텀 값 노드 등). stats가 있으면 그것으로 카드를 생성하고, 없으면 light DOM 자식을
 *    그리드 셀로 둔다 — 두 경로 모두 같은 그리드 규칙을 받는다.
 * 2. **columns를 반응형으로.** v2 colsMap은 2·3은 고정, 4·5는 좁은 화면 2열 → lg(1024px)
 *    이상에서 4·5열이었다. 그대로 옮긴다(리터럴 1024px은 컴포넌트 고유 기하 — §4.3 허용).
 * 3. **v2 `key={i}`(배열 인덱스)**는 재정렬 시 잘못된 카드를 재사용했다. v3는 항목 수가
 *    같으면 attribute만 동기화하고 다르면 재구축한다(입양 규칙 §3.3, radio-group 선례).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import statsGridStyles from "./stats-grid.css.js";

/** v2 StatCardProps 중 문자열/숫자로 직렬화 가능한 표면 (아이콘 노드는 카드 자식으로) */
export interface JdStatData {
  label?: string;
  value?: string | number;
  /** "5.2"(숫자 경로) 또는 "+12%"(문자열 그대로) — jd-stat change 규칙 */
  change?: string | number;
  /** up | down | flat | neutral */
  trend?: string;
  /** 보조 설명 (jd-stat-card description) */
  description?: string;
  /** jd-stat hint (description 미지정 시) */
  hint?: string;
  /** 값 접미사 */
  unit?: string;
  /** left | center */
  align?: string;
}

const CARD_CLASS = "jd-stats-grid__cell";
/** stat 키 → jd-stat-card attribute. value/change는 숫자도 문자열로 실린다 */
const ATTR_KEYS: (keyof JdStatData)[] = [
  "label",
  "value",
  "change",
  "trend",
  "description",
  "hint",
  "unit",
  "align",
];

export class JdStatsGrid extends JdElement {
  static override tag = "jd-stats-grid";
  static override props = {
    /** 2 | 3 | 4 | 5 (v2 기본 4) */
    columns: { type: Number, default: 4, reflect: true },
  };

  declare columns: number;

  #stats: JdStatData[] = [];

  get stats(): JdStatData[] {
    return this.#stats;
  }
  set stats(v: JdStatData[]) {
    this.#stats = Array.isArray(v) ? v.slice() : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(statsGridStyles);
    if (Object.prototype.hasOwnProperty.call(this, "stats")) {
      const v = (this as unknown as Record<string, unknown>).stats;
      delete (this as unknown as Record<string, unknown>).stats;
      (this as unknown as Record<string, unknown>).stats = v;
    }
    this.#readJsonSlot();
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) this.#stats = parsed as JdStatData[];
    } catch {
      console.warn("[junds] <jd-stats-grid> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    const existing = this.querySelectorAll<HTMLElement>(`:scope > .${CARD_CLASS}`);
    if (this.#stats.length === 0) {
      // 데이터를 비웠으면 우리가 만든 카드를 걷어낸다. 애초에 생성분이 없으면(순수 light DOM
      // 사용) 아무것도 지우지 않아 소비자가 직접 쓴 <jd-stat-card> 자식이 그대로 산다(판단 1).
      for (const card of existing) card.remove();
      return;
    }

    if (existing.length !== this.#stats.length) {
      for (const card of existing) card.remove();
      for (const stat of this.#stats) this.append(this.#buildCard(stat));
      return;
    }
    existing.forEach((card, i) => this.#applyStat(card, this.#stats[i]!));
  }

  #buildCard(stat: JdStatData): HTMLElement {
    const card = document.createElement("jd-stat-card");
    card.className = CARD_CLASS;
    this.#applyStat(card, stat);
    return card;
  }

  /** stat 필드를 카드 attribute로 반영 — 없는 필드는 제거해 이전 값이 남지 않게 */
  #applyStat(card: HTMLElement, stat: JdStatData): void {
    for (const key of ATTR_KEYS) {
      const val = stat[key];
      if (val === undefined || val === null || val === "") card.removeAttribute(key);
      else card.setAttribute(key, String(val));
    }
  }
}
