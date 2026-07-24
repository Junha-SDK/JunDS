/**
 * <jd-global-kis-seeder> — 앱 부팅 시 마운트되는 헤드리스 시세 시더 (v2 finance/GlobalKisSeeder).
 *
 * v2는 `return null`인 무-UI 컴포넌트로, 마운트되어 있는 동안 30초 간격으로 종목 시세를
 * 폴링해 전역 시뮬레이터에 시드했다. 실제 데이터 소스(KIS/livePrices 틱 스토어)는
 * **@junds/finance-data 슬라이스의 몫**이다(07-rollout §6 R4 · DEC-019) — 이 CE는
 * 데이터 백엔드를 재구현하지 않고, v2가 가졌던 **폴링 수명주기만** 옮긴다:
 *  - 연결되어 있는 동안 interval 폴링(기본 30초), 분리되면 정지(createInterval 소유).
 *  - 매 라운드 `jd-tick`을 발행 — 소비자(finance-data 어댑터)가 이를 듣고 실제
 *    시세 요청·시드를 수행한다. 소스를 주입 가능한 `fetcher` 프로퍼티로도 받는다.
 *  - 렌더 0(display:none). §3.1-3 결정성: render에서 폴링을 시작하지 않고 connected에서.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import globalKisSeederStyles from "./global-kis-seeder.css.js";

export class JdGlobalKisSeeder extends JdElement {
  static override tag = "jd-global-kis-seeder";
  static override props = {
    /** 폴링 간격(ms). v2 기본 30초 */
    interval: { type: Number, default: 30_000 },
    /** 폴링 보류 — 켜면 라운드를 돌지 않는다 */
    paused: { type: Boolean, reflect: true },
  };

  declare interval: number;
  declare paused: boolean;

  /** 실제 시드 작업 주입점 — finance-data 어댑터가 대입한다(복합값이라 property 전용) */
  fetcher: ((names?: string[]) => void | Promise<void>) | null = null;

  #timer: Timer | null = null;
  #round = 0;

  protected render(): void {
    adoptStyles(globalKisSeederStyles);
    this.setAttribute("aria-hidden", "true"); // 화면에 없는 요소 — AT 트리에서도 뺀다
  }

  protected override connected(): void {
    this.#arm();
  }

  protected override disconnected(): void {
    this.#timer?.destroy();
    this.#timer = null;
  }

  protected override update(): void {
    // interval·paused 변경을 즉시 반영 — 재무장
    this.#arm();
  }

  #arm(): void {
    this.#timer?.destroy();
    this.#timer = null;
    if (this.paused || !this.isConnected) return;
    // 첫 라운드는 즉시, 이후 interval마다 (v2는 마운트 즉시 폴링을 시작했다)
    this.#tick();
    this.#timer = this.own(createInterval(() => this.#tick(), Math.max(1000, this.interval)));
  }

  #tick(): void {
    this.#round += 1;
    this.emit("jd-tick", { round: this.#round });
    void this.fetcher?.();
  }
}
