/**
 * <jd-countdown> — 만료까지 남은 시간을 1초 간격으로 갱신 (v2 composites/Countdown).
 *
 * 결정적 렌더(§3.1-3): render()·update()는 **시계를 읽지 않는다**. 골격은 0으로 그려지고
 * 실제 잔량은 connected() 이후 1회 계산 + createInterval(Behavior)로 갱신된다.
 * v2는 useState 초기화 함수에서 Date.now()를 읽어 서버·클라이언트 첫 렌더가 달랐다 —
 * 프리렌더 스냅샷이 캡처 시각에 물드는 구조였다.
 *
 * 타이머는 this.own(createInterval(...))이 소유한다 — disconnected 시 자동 정리(§1.2).
 * v2는 effect cleanup에 의존해 `parts.done`이 deps에 들어가는 바람에 매 초 effect가
 * 재실행되며 interval을 재생성했다(1초마다 clear+set). 여기서는 1개만 산다.
 *
 * v2 대비 보정 3건:
 *  1. 시맨틱이 없었다(div 4개) → role="timer" + 완료 알림 role="status".
 *  2. minimal 형식이 라벨을 통째로 버려서 "01:02:03"이 무엇의 숫자인지 알 수 없었다 →
 *     라벨을 display:none이 아니라 시각적으로만 숨겨 접근성 트리에 남긴다.
 *  3. 완료 내용이 React 노드 전용이었다 → children 슬롯 + completed-text 두 경로.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import { pad2, splitDuration, toEpochMs, type DurationParts } from "../../core/date.js";
import countdownStyles from "./countdown.css.js";

const UNITS = ["d", "h", "m", "s"] as const;
type Unit = (typeof UNITS)[number];

const ZERO: DurationParts = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

export class JdCountdown extends JdElement {
  static override tag = "jd-countdown";
  static override props = {
    /** 만료 시각. "2026-12-31T23:59:59Z" 등. 프로퍼티로는 Date·epoch 숫자도 받는다 */
    to: { type: String },
    /** full | compact | minimal */
    format: { type: String, default: "full", reflect: true },
    dayLabel: { type: String, default: "일" },
    hourLabel: { type: String, default: "시" },
    minuteLabel: { type: String, default: "분" },
    secondLabel: { type: String, default: "초" },
    /** 만료 시 표시할 문구. children을 넣으면 그쪽이 이긴다 */
    completedText: { type: String },
  };

  declare to: string;
  declare format: string;
  declare dayLabel: string;
  declare hourLabel: string;
  declare minuteLabel: string;
  declare secondLabel: string;
  declare completedText: string;

  #parts: DurationParts = ZERO;
  #target = Number.NaN;
  /** connected() 이후에만 시계를 읽는다 */
  #started = false;
  #completedAt = Number.NaN; // 이 target에 대해 이미 jd-complete를 냈는지
  #timer: Timer | null = null;
  #running = false;
  /** children 슬롯으로 받은 완료 내용이 있는지 — 있으면 completed-text보다 우선 */
  #hasSlotContent = false;

  #partsEl!: HTMLElement;
  #doneEl!: HTMLElement;
  #units = new Map<Unit, HTMLElement>();
  #values = new Map<Unit, HTMLElement>();
  #labels = new Map<Unit, HTMLElement>();
  #seps: HTMLElement[] = [];

  protected render(): void {
    adoptStyles(countdownStyles);
    // 입양 규칙(§3.3)
    const existing = this.querySelector<HTMLElement>(":scope > .jd-countdown__parts");
    if (existing) {
      this.#partsEl = existing;
      this.#doneEl = this.querySelector<HTMLElement>(":scope > .jd-countdown__done")!;
      for (const u of UNITS) {
        const unit = existing.querySelector<HTMLElement>(`[data-unit="${u}"]`);
        if (!unit) continue;
        this.#units.set(u, unit);
        this.#values.set(u, unit.querySelector<HTMLElement>(".jd-countdown__value")!);
        this.#labels.set(u, unit.querySelector<HTMLElement>(".jd-countdown__label")!);
      }
      this.#seps = [...existing.querySelectorAll<HTMLElement>(".jd-countdown__sep")];
    } else {
      this.#build();
    }
    this.#hasSlotContent = this.#doneEl.hasChildNodes();
    this.setAttribute("role", "timer");
    this.setAttribute("aria-live", "off"); // 매초 읽어주면 화면 낭독이 마비된다
    this.update();
  }

  #build(): void {
    // children은 "만료 시 내용" 슬롯 — 먼저 걷어내야 골격과 섞이지 않는다
    const done = document.createElement("div");
    done.className = "jd-countdown__done";
    done.setAttribute("role", "status");
    done.append(...this.childNodes);
    done.hidden = true;

    this.#partsEl = document.createElement("span");
    this.#partsEl.className = "jd-countdown__parts";
    UNITS.forEach((u, i) => {
      const unit = document.createElement("span");
      unit.className = "jd-countdown__unit";
      unit.dataset.unit = u;
      const value = document.createElement("span");
      value.className = "jd-countdown__value";
      value.textContent = "00";
      const label = document.createElement("span");
      label.className = "jd-countdown__label";
      unit.append(value, label);
      this.#units.set(u, unit);
      this.#values.set(u, value);
      this.#labels.set(u, label);
      this.#partsEl.append(unit);
      if (i < UNITS.length - 1) {
        // minimal 형식의 콜론 — 실제 노드로 두고 CSS가 형식별로 보인다/숨긴다
        const sep = document.createElement("span");
        sep.className = "jd-countdown__sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = ":";
        this.#seps.push(sep);
        this.#partsEl.append(sep);
      }
    });

    this.#doneEl = done;
    this.append(this.#partsEl, done);
  }

  protected override connected(): void {
    this.#started = true;
    this.#target = toEpochMs(this.to);
    this.#recompute();
    this.#paint();
    this.#ensureTimer();
  }

  protected override disconnected(): void {
    // own()이 destroy까지 마친 뒤 호출된다 — 참조만 끊고 재연결 시 새로 만든다
    this.#timer = null;
    this.#running = false;
  }

  protected override update(): void {
    const nextTarget = toEpochMs(this.to);
    if (nextTarget !== this.#target) {
      this.#target = nextTarget;
      this.#completedAt = Number.NaN; // 목표가 바뀌면 완료 통지도 다시 살아난다
    }
    // 시계 읽기는 connected 이후에만 — render 경로는 0으로 결정적이다
    if (this.#started) {
      this.#recompute();
      this.#ensureTimer();
    }
    this.#paint();
  }

  #recompute(): void {
    this.#parts = Number.isNaN(this.#target) ? ZERO : splitDuration(this.#target - Date.now());
  }

  /**
   * 남아 있을 때만 1초 타이머 **1개**. 상태가 바뀔 때만 손대므로 프로퍼티가 바뀌어도
   * 초 박자가 리셋되지 않는다(v2는 매 초 interval을 재생성했다).
   */
  #ensureTimer(): void {
    const shouldRun = !this.#parts.done && !Number.isNaN(this.#target);
    if (shouldRun === this.#running) return;
    this.#running = shouldRun;
    if (!this.#timer) {
      if (shouldRun) this.#timer = this.own(createInterval(this.#tick, 1000));
      return;
    }
    if (shouldRun) this.#timer.restart();
    else this.#timer.stop();
  }

  #tick = (): void => {
    this.#recompute();
    this.#paint();
    if (!this.#parts.done) return;
    this.#timer?.stop();
    this.#running = false;
    if (this.#completedAt === this.#target) return;
    this.#completedAt = this.#target;
    this.emit("jd-complete");
  };

  #paint(): void {
    const p = this.#parts;
    const minimal = this.format === "minimal";
    const compact = this.format === "compact";
    // v2: minimal·compact는 남은 일수가 0이면 일 칸을 아예 그리지 않는다
    const hideDays = (minimal || compact) && p.days === 0;

    const raw: Record<Unit, number> = {
      d: p.days,
      h: p.hours,
      m: p.minutes,
      s: p.seconds,
    };
    const labels: Record<Unit, string> = {
      d: this.dayLabel,
      h: this.hourLabel,
      m: this.minuteLabel,
      s: this.secondLabel,
    };

    for (const u of UNITS) {
      const value = this.#values.get(u);
      const label = this.#labels.get(u);
      const unit = this.#units.get(u);
      if (!value || !label || !unit) continue;
      // v2: 일 칸만 minimal/compact에서 패딩 없이(1일 = "1"), 나머지는 항상 2자리
      value.textContent = u === "d" && (minimal || compact) ? String(raw[u]) : pad2(raw[u]);
      label.textContent = labels[u];
      unit.hidden = u === "d" && hideDays;
    }
    // 일 칸이 사라지면 그 뒤 콜론도 함께 (minimal 형식의 "01:02:03")
    const firstSep = this.#seps[0];
    if (firstSep) firstSep.hidden = hideDays;

    // children 슬롯이 있으면 그대로 두고, 없을 때만 completed-text를 반영한다
    if (!this.#hasSlotContent && this.#doneEl.textContent !== this.completedText) {
      this.#doneEl.textContent = this.completedText;
    }
    const showDone =
      p.done && Boolean(this.#doneEl.textContent?.trim() || this.#doneEl.childElementCount);
    this.#doneEl.hidden = !showDone;
    this.#partsEl.hidden = showDone;
    this.toggleAttribute("data-done", p.done);
  }
}
