/**
 * <jd-online-status> — 사용자 온라인 상태 (v2 composites/OnlineStatus).
 *
 * 판단 5건:
 * 1. **점도 펄스도 DOM 0.** 점은 호스트 ::before, 펄스는 그 위의 box-shadow 확산이다
 *    (jd-status-dot·jd-badge의 "점은 ::before" 관용구 연장). v2는 ping 레이어를 위해
 *    래퍼 span + 절대배치 span을 더 썼다.
 * 2. **jd-status-dot 파생이 아니다.** 골격은 비슷하지만 라벨 노드 클래스명이
 *    `jd-status-dot__label`로 하드코딩돼 있어(파생 훅 없음) 상속하면 남의 이름을 쓰는
 *    골격이 된다. status-dot에 baseClass 훅을 내는 것은 그 컴포넌트 소관이라 이번 배치
 *    범위 밖 — 라벨 조립 로직(커스텀 라벨 맵·최종 접속 시각)도 전부 다르다.
 * 3. **상대 시각은 connected() 이후에만 읽는다**(§3.1-3 결정적 render). "3분 전"은
 *    Date.now()에 의존하므로 render 단계에서 계산하면 프리렌더 스냅샷이 매 실행 달라진다.
 *    render는 상태 라벨까지만 그리고, 시각은 첫 tick부터 채운다(jd-clock·jd-countdown 선례).
 *    갱신은 1분 간격 타이머 — 필요할 때(offline + lastSeenAt)만 돈다.
 * 4. **v2에는 접근 가능한 상태 표현이 없었다** — showLabel이 꺼지면 색 점 하나가 전부라
 *    스크린리더에도 색각 이상 사용자에게도 정보가 0이다. v3는 라벨이 숨겨졌을 때
 *    호스트를 role="img" + aria-label(상태 문구)로 낸다. 라벨이 보이면 텍스트가 이미
 *    말하므로 role을 붙이지 않는다(중복 낭독 방지).
 * 5. **최종 접속 시각은 `<time datetime>`**으로 낸다 — 기계 판독 가능하고, "3분 전"이라는
 *    상대 표현의 기준점이 마크업에 남는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import onlineStatusStyles from "./online-status.css.js";

export type JdOnlineStatusValue = "online" | "away" | "busy" | "offline";

const DEFAULT_LABELS: Record<JdOnlineStatusValue, string> = {
  online: "온라인",
  away: "자리 비움",
  busy: "방해 금지",
  offline: "오프라인",
};

const isStatus = (v: string): v is JdOnlineStatusValue =>
  Object.prototype.hasOwnProperty.call(DEFAULT_LABELS, v);

/** v2 relativeTime 동형 — 분/시/일 3단 */
export function relativeTime(from: number, now: number): string {
  const m = Math.floor((now - from) / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/** 1분 — v2에는 갱신이 없어 "3분 전"이 영원히 3분 전이었다 */
const TICK_MS = 60000;

export class JdOnlineStatus extends JdElement {
  static override tag = "jd-online-status";
  static override props = {
    /** online | away | busy | offline */
    status: { type: String, default: "offline", reflect: true },
    /** xs | sm | md | lg — 점 지름 6/8/10/12px */
    size: { type: String, default: "sm", reflect: true },
    /** 라벨 텍스트 표시 */
    showLabel: { type: Boolean, reflect: true },
    /** 펄스 — v2와 같이 online에서만 보인다(CSS가 조건을 건다) */
    pulse: { type: Boolean, reflect: true },
    /** 최종 접속 시각(파싱 가능한 날짜 문자열). offline일 때만 표시 */
    lastSeenAt: { type: String },
  };

  declare status: string;
  declare size: string;
  declare showLabel: boolean;
  declare pulse: boolean;
  declare lastSeenAt: string;

  #labels: Partial<Record<JdOnlineStatusValue, string>> = {};
  /** null = 아직 tick 전(render 시점) — 상대 시각을 그리지 않는다 */
  #now: number | null = null;
  #timer: Timer | null = null;
  #running = false;

  #label!: HTMLElement;
  #state!: HTMLElement;
  #sep!: HTMLElement;
  #seen!: HTMLTimeElement;

  /** 상태별 라벨 재정의 (§1.3 복합 데이터는 property 전용) */
  get labels(): Partial<Record<JdOnlineStatusValue, string>> {
    return this.#labels;
  }
  set labels(v: Partial<Record<JdOnlineStatusValue, string>>) {
    this.#labels = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(onlineStatusStyles);
    const found = this.querySelector<HTMLElement>(":scope > .jd-online-status__label");
    if (found) {
      this.#label = found;
      this.#state = found.querySelector(".jd-online-status__state")!;
      this.#sep = found.querySelector(".jd-online-status__sep")!;
      this.#seen = found.querySelector<HTMLTimeElement>(".jd-online-status__seen")!;
    } else {
      this.#state = document.createElement("span");
      this.#state.className = "jd-online-status__state";
      this.#sep = document.createElement("span");
      this.#sep.className = "jd-online-status__sep";
      this.#sep.setAttribute("aria-hidden", "true");
      this.#sep.textContent = " · ";
      this.#seen = document.createElement("time");
      this.#seen.className = "jd-online-status__seen";
      this.#label = document.createElement("span");
      this.#label.className = "jd-online-status__label";
      this.#label.append(this.#state, this.#sep, this.#seen);
      this.append(this.#label);
    }
    this.update();
  }

  protected override connected(): void {
    this.#now = Date.now(); // 시계 읽기는 connected 이후에만(§3.1-3)
    this.update();
  }

  protected override disconnected(): void {
    // own()이 destroy를 마친 뒤 호출된다 — 참조만 끊고 재연결 시 새로 만든다
    this.#timer = null;
    this.#running = false;
  }

  protected override update(): void {
    const status = isStatus(this.status) ? this.status : "offline";
    const text = this.#labels[status] || DEFAULT_LABELS[status];
    this.#state.textContent = text;

    const at = this.#lastSeenMs();
    const showSeen = status === "offline" && at !== null;
    let seenText = "";
    if (showSeen && this.#now !== null) {
      seenText = relativeTime(at, Math.max(this.#now, at));
      this.#seen.dateTime = new Date(at).toISOString();
    }
    this.#seen.textContent = seenText;
    // 시각을 아직 못 읽었으면(프리렌더 시점) 구분점도 그리지 않는다 — 빈 " · " 방지
    this.#seen.hidden = !seenText;
    this.#sep.hidden = !seenText;

    this.#label.hidden = !this.showLabel;
    // 라벨이 안 보이면 색이 유일한 통로다 — 그때만 이름을 붙인다(판단 4)
    if (this.showLabel) {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    } else {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", seenText ? `${text} · ${seenText}` : text);
    }

    this.#ensureTimer(showSeen);
  }

  /** "3분 전"이 살아 있어야 할 때만 1분 타이머 1개 */
  #ensureTimer(needed: boolean): void {
    if (needed === this.#running) return;
    this.#running = needed;
    if (!this.#timer) {
      if (needed) this.#timer = this.own(createInterval(this.#tick, TICK_MS));
      return;
    }
    if (needed) this.#timer.restart();
    else this.#timer.stop();
  }

  #tick = (): void => {
    this.#now = Date.now();
    this.update();
  };

  #lastSeenMs(): number | null {
    const raw = this.lastSeenAt.trim();
    if (!raw) return null;
    const ms = Date.parse(raw);
    return Number.isNaN(ms) ? null : ms;
  }
}
