/**
 * <jd-clock> — 라이브 시계 (디지털·아날로그, v2 composites/Clock).
 *
 * - **결정적 render(§3.1-3)**: render()는 자리표시자(`--:--:--` · 12시 방향 바늘)만
 *   그리고 실제 시각은 connected() 이후 첫 tick부터 채운다. 03-web-arch가 Clock을
 *   이 규칙의 예시로 명시한다("시간이 필요한 표현은 connected() 이후 타이머에서 시작").
 * - 타이머는 behaviors/createInterval을 own()으로 소유 — disconnect 시 자동 회수(§5.1).
 *   v2는 mode와 무관하게 1초 간격이었고 여기서도 같다(아날로그 초침 때문).
 * - v2의 boolean 기본값 true 2개는 attribute로 표현할 수 없어(존재=값, §1.3)
 *   **반전 플래그**로 낸다: `hour24` → `hour12`, `showSeconds` → `hide-seconds`
 *   (DEC-029-3 PinInput numeric→alphanumeric 선례). 무지정 기본 동작은 v2와 동일하다.
 * - a11y 상위집합: 디지털은 `<time datetime>` 시맨틱, 아날로그 `<svg role="img">`의
 *   aria-label은 v2의 고정 문자열 "시계"가 아니라 **현재 시각**을 담는다.
 *   초 단위로 바뀌는 값이라 live region은 쓰지 않는다(과다 낭독 방지).
 * - SVG 노드는 createElementNS로 만든다 — innerHTML은 HTML 네임스페이스로 파싱된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import clockStyles from "./clock.css.js";

const NS = "http://www.w3.org/2000/svg";
/** 바늘 길이 비율 — v2: 시 0.5r · 분 0.7r · 초 0.8r */
const HANDS = [
  { hand: "hour", ratio: 0.5 },
  { hand: "minute", ratio: 0.7 },
  { hand: "second", ratio: 0.8 },
] as const;

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));
/** 좌표 문자열 — 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화 */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

let warnedZone = false;

export class JdClock extends JdElement {
  static override tag = "jd-clock";
  static override props = {
    /** digital | analog */
    mode: { type: String, default: "digital", reflect: true },
    /** v2 hour24=true의 반전 플래그. 켜면 12시간제(AM/PM) */
    hour12: { type: Boolean, reflect: true },
    /** v2 showSeconds=true의 반전 플래그. 켜면 초를 숨긴다 */
    hideSeconds: { type: Boolean, reflect: true },
    /** IANA 시간대(예: "Asia/Seoul"). 빈 값이면 브라우저 로컬 */
    timeZone: { type: String },
    /** 표기 로케일. v2는 "en-US" 고정이었고 그것이 기본값 */
    locale: { type: String, default: "en-US" },
    /** 아날로그 지름(px) */
    size: { type: Number, default: 120 },
    /** 아날로그 접근 이름의 접두 (v2 aria-label) */
    label: { type: String, default: "시계" },
    /** 틱 정지 — 문서·스냅샷용 */
    paused: { type: Boolean, reflect: true },
  };

  declare mode: string;
  declare hour12: boolean;
  declare hideSeconds: boolean;
  declare timeZone: string;
  declare locale: string;
  declare size: number;
  declare label: string;
  declare paused: boolean;

  /** null = 아직 tick 전(=render 시점). 결정적 자리표시자를 그린다 */
  #now: Date | null = null;
  #started = false;
  #timer: Timer | undefined;

  #time: HTMLTimeElement | undefined;
  #face: SVGSVGElement | undefined;
  #ticks: SVGLineElement[] = [];
  #hands: SVGLineElement[] = [];
  #dial: SVGCircleElement | undefined;
  #pin: SVGCircleElement | undefined;
  #geomSize = -1;

  #fmt: Intl.DateTimeFormat | undefined;
  #fmtKey = "";
  #partsFmt: Intl.DateTimeFormat | undefined;
  #partsKey = "";

  /** 마지막 tick 시각. tick 전이면 null */
  get now(): Date | null {
    return this.#now;
  }

  protected render(): void {
    adoptStyles(clockStyles);
    this.#sync();
    this.update();
  }

  protected override connected(): void {
    this.#started = true;
    this.#tick();
    this.#ensureTimer();
  }

  protected override disconnected(): void {
    // 베이스가 own() 등록 Behavior를 이미 destroy했다 — 참조만 비운다
    this.#timer = undefined;
    this.#started = false;
  }

  protected override update(): void {
    this.#sync();
    if (this.#face) this.#updateAnalog();
    else this.#updateDigital();
    this.#ensureTimer();
  }

  /* ── 골격 ────────────────────────────────────────────── */

  /** mode에 맞는 골격을 보장한다. 이미 있으면 입양(§3.3), 모드가 바뀌면 교체 */
  #sync(): void {
    const analog = this.mode === "analog";
    if (analog) {
      this.#time?.remove();
      this.#time = undefined;
      if (this.#face?.isConnected) return;
      const existing = this.querySelector<SVGSVGElement>(":scope > svg.jd-clock__face");
      if (existing && this.#adoptFace(existing)) return;
      existing?.remove();
      this.#buildFace();
    } else {
      this.#face?.remove();
      this.#face = undefined;
      this.#ticks = [];
      this.#hands = [];
      this.#geomSize = -1;
      if (this.#time?.isConnected) return;
      const existing = this.querySelector<HTMLTimeElement>(":scope > time.jd-clock__time");
      if (existing) {
        this.#time = existing;
        return;
      }
      const time = document.createElement("time");
      time.className = "jd-clock__time";
      this.append(time);
      this.#time = time;
    }
  }

  /** 서버/어댑터가 그린 face를 재사용. 구조가 어긋나면 false로 알려 재구축시킨다 */
  #adoptFace(svg: SVGSVGElement): boolean {
    const ticks = Array.from(svg.querySelectorAll<SVGLineElement>("line.jd-clock__tick"));
    const hands = HANDS.map((h) =>
      svg.querySelector<SVGLineElement>(`line.jd-clock__hand[data-hand="${h.hand}"]`),
    );
    const dial = svg.querySelector<SVGCircleElement>("circle.jd-clock__dial");
    const pin = svg.querySelector<SVGCircleElement>("circle.jd-clock__pin");
    if (ticks.length !== 12 || !dial || !pin || hands.some((h) => h === null)) return false;
    this.#face = svg;
    this.#ticks = ticks;
    this.#hands = hands as SVGLineElement[];
    this.#dial = dial;
    this.#pin = pin;
    this.#geomSize = -1; // 좌표는 update()가 다시 확정
    return true;
  }

  #buildFace(): void {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "jd-clock__face");
    svg.setAttribute("role", "img");
    const dial = document.createElementNS(NS, "circle");
    dial.setAttribute("class", "jd-clock__dial");
    svg.append(dial);
    this.#ticks = [];
    for (let i = 0; i < 12; i++) {
      const tick = document.createElementNS(NS, "line");
      tick.setAttribute("class", "jd-clock__tick");
      svg.append(tick);
      this.#ticks.push(tick);
    }
    this.#hands = HANDS.map(({ hand }) => {
      const line = document.createElementNS(NS, "line");
      line.setAttribute("class", "jd-clock__hand");
      line.setAttribute("data-hand", hand);
      svg.append(line);
      return line;
    });
    const pin = document.createElementNS(NS, "circle");
    pin.setAttribute("class", "jd-clock__pin");
    svg.append(pin);
    this.append(svg);
    this.#face = svg;
    this.#dial = dial;
    this.#pin = pin;
    this.#geomSize = -1;
  }

  /* ── 반영 ────────────────────────────────────────────── */

  #updateDigital(): void {
    const time = this.#time;
    if (!time) return;
    const now = this.#now;
    if (!now) {
      time.textContent = this.hideSeconds ? "--:--" : "--:--:--";
      time.removeAttribute("datetime");
      return;
    }
    const text = this.#displayFormat().format(now);
    if (time.textContent !== text) time.textContent = text;
    const { h, m, s } = this.#timeParts(now);
    // <time datetime>은 24시간제 기계 표기 — 화면 표기(12시간제·로케일)와 별개
    time.dateTime = this.hideSeconds
      ? `${pad2(h)}:${pad2(m)}`
      : `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  #updateAnalog(): void {
    const face = this.#face;
    if (!face) return;
    this.#applyGeometry();
    const now = this.#now;
    const { h, m, s } = now ? this.#timeParts(now) : { h: 0, m: 0, s: 0 };
    const r = this.#radius();
    const angles = [((h % 12) + m / 60) * 30, (m + s / 60) * 6, s * 6];
    this.#hands.forEach((line, i) => {
      line.setAttribute("transform", `rotate(${num(angles[i] ?? 0)} ${num(r)} ${num(r)})`);
    });
    face.setAttribute(
      "aria-label",
      now ? `${this.label} ${pad2(h)}:${pad2(m)}` : this.label,
    );
  }

  #radius(): number {
    return (this.size > 0 ? this.size : 120) / 2;
  }

  /** size 의존 좌표 — v2와 동일하게 viewBox 단위 = px라 획 두께도 v2처럼 size 불변 */
  #applyGeometry(): void {
    const size = this.size > 0 ? this.size : 120;
    if (this.#geomSize === size) return;
    this.#geomSize = size;
    const r = size / 2;
    const face = this.#face!;
    face.setAttribute("width", num(size));
    face.setAttribute("height", num(size));
    face.setAttribute("viewBox", `0 0 ${num(size)} ${num(size)}`);

    const dial = this.#dial!;
    dial.setAttribute("cx", num(r));
    dial.setAttribute("cy", num(r));
    dial.setAttribute("r", num(r - 2));

    this.#ticks.forEach((tick, i) => {
      const a = ((i * 30 - 90) * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      tick.setAttribute("x1", num(r + (r - 6) * cos));
      tick.setAttribute("y1", num(r + (r - 6) * sin));
      tick.setAttribute("x2", num(r + (r - 12) * cos));
      tick.setAttribute("y2", num(r + (r - 12) * sin));
    });

    this.#hands.forEach((line, i) => {
      const ratio = HANDS[i]?.ratio ?? 0.5;
      line.setAttribute("x1", num(r));
      line.setAttribute("y1", num(r));
      line.setAttribute("x2", num(r));
      line.setAttribute("y2", num(r - r * ratio));
    });

    const pin = this.#pin!;
    pin.setAttribute("cx", num(r));
    pin.setAttribute("cy", num(r));
    pin.setAttribute("r", "3");
  }

  /* ── 시간 ────────────────────────────────────────────── */

  #ensureTimer(): void {
    if (!this.#started) return; // 타이머는 connected() 이후에만 (§3.1-3)
    if (this.paused || !this.isConnected) {
      this.#timer?.destroy();
      this.#timer = undefined;
      return;
    }
    if (this.#timer) return;
    this.#timer = this.own(createInterval(() => this.#tick(), 1000));
  }

  #tick(): void {
    this.#now = new Date();
    this.requestUpdate();
  }

  /** locale/timeZone이 부정하면 예외 없이 폴백한다(1회 경고) */
  #make(opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const locale = this.locale || "en-US";
    const timeZone = this.timeZone || undefined;
    try {
      return new Intl.DateTimeFormat(locale, { ...opts, timeZone });
    } catch {
      if (!warnedZone) {
        warnedZone = true;
        console.warn(
          `[junds] <jd-clock> locale/time-zone을 해석하지 못해 기본값으로 폴백합니다: ` +
            `locale="${locale}" time-zone="${this.timeZone}"`,
        );
      }
      try {
        return new Intl.DateTimeFormat(locale, opts);
      } catch {
        return new Intl.DateTimeFormat("en-US", opts);
      }
    }
  }

  #displayFormat(): Intl.DateTimeFormat {
    const key = `${this.locale}|${this.timeZone}|${this.hour12 ? 1 : 0}|${this.hideSeconds ? 1 : 0}`;
    if (!this.#fmt || this.#fmtKey !== key) {
      this.#fmtKey = key;
      this.#fmt = this.#make({
        hour: "2-digit",
        minute: "2-digit",
        second: this.hideSeconds ? undefined : "2-digit",
        hour12: this.hour12,
      });
    }
    return this.#fmt;
  }

  /**
   * 24시간제 수치 파트. 시간대가 없으면 Date 게터로 충분하고,
   * 있으면 숫자체계가 아라비아 숫자로 고정된 "en-US"로만 파싱한다(v2 동형).
   */
  #timeParts(now: Date): { h: number; m: number; s: number } {
    if (!this.timeZone) {
      return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
    }
    const key = this.timeZone;
    if (!this.#partsFmt || this.#partsKey !== key) {
      this.#partsKey = key;
      const timeZone = this.timeZone;
      try {
        this.#partsFmt = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
          timeZone,
        });
      } catch {
        this.#partsFmt = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
      }
    }
    const parts = this.#partsFmt.formatToParts(now);
    const get = (type: string): number => {
      const found = parts.find((p) => p.type === type);
      const n = Number(found?.value ?? 0);
      return Number.isNaN(n) ? 0 : n;
    };
    return { h: get("hour") % 24, m: get("minute"), s: get("second") }; // h23 폴백: "24:00"→0
  }
}
