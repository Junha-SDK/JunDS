/**
 * <jd-globe> — 위경도 점으로 짠 회전하는 지구본 (v2 composites/Globe).
 *
 * 결정적 렌더(§3.1-3): 점 좌표는 위도·경도의 순수 삼각함수다 — 난수·시계·측정이
 * 없으므로 render()에서 그려도 프리렌더 스냅샷이 흔들리지 않는다. 좌표 문자열은
 * 소수 3자리로 잘라 스냅샷 diff를 안정화한다(jd-clock의 num() 선례).
 *
 * v2 대비 실질 개선 4건:
 *  1. **화면 밖이면 멈춘다.** 점 200여 개에 3D 변환이 걸린 회전은 스크롤로 사라진 뒤에도
 *     계속 합성 비용을 냈다 — IntersectionObserver로 재생을 끊는다(behaviors 재사용).
 *  2. **감속 선호를 존중한다**(§8). v2는 무조건 돌았다.
 *  3. **점 스타일이 인라인 6줄 → CSS 변수 3개.** 좌표만 인스턴스별로 다르고 크기·색·
 *     위치 규칙은 시트 한 장이 갖는다(v2는 점마다 style 객체를 새로 만들었다).
 *  4. **밀도를 열었다.** v2는 적도 링당 18개 고정이라 큰 지구본에서 점이 성겼다.
 *
 * 알려진 v2 계승 한계: 점의 불투명도는 **초기 z**로 한 번만 계산된다(회전해도 따라오지
 * 않아, 뒤로 돌아간 점이 앞면만큼 밝게 보인다). 프레임마다 JS로 z를 다시 재면 점 수만큼
 * 비용이 붙어 개선의 값이 비용을 넘지 못한다 — 외관 파리티를 택했다(G2 재심의 목록).
 *
 * 전체가 장식이므로 호스트는 aria-hidden이다(v2 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInViewObserver } from "../../behaviors/viewport.js";
import type { Behavior } from "../../behaviors/types.js";
import globeStyles from "./globe.css.js";

const CLS = "jd-globe";
/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화 */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

export class JdGlobe extends JdElement {
  static override tag = "jd-globe";
  static override props = {
    /** 지름(px). v2 기본 300 */
    size: { type: Number, default: 300 },
    /** 글로우·윤곽·적도 링 색. 비우면 --jd-color-primary */
    color: { type: String },
    /** 점 색. 비우면 --jd-color-primary-light */
    dotColor: { type: String }, // attr: dot-color
    /** 한 바퀴 도는 시간(초). v2 기본 20 */
    speed: { type: Number, default: 20 },
    /** 적도 링의 점 개수. v2는 18 고정 */
    density: { type: Number, default: 18 },
    /** 명시적 정지 — 문서·스냅샷용 */
    paused: { type: Boolean, reflect: true },
  };

  declare size: number;
  declare color: string;
  declare dotColor: string;
  declare speed: number;
  declare density: number;
  declare paused: boolean;

  #sphere!: HTMLDivElement;
  /** 마지막으로 점을 배치한 (지름, 밀도) — 같으면 다시 만들지 않는다 */
  #key = "";
  #inView: Behavior | null = null;

  protected render(): void {
    adoptStyles(globeStyles);
    this.setAttribute("aria-hidden", "true"); // 순수 장식(v2 동형)

    const existing = this.querySelector<HTMLDivElement>(`:scope > .${CLS}__sphere`);
    if (existing) {
      this.#sphere = existing;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.replaceChildren();
    const glow = doc.createElement("div");
    glow.className = `${CLS}__glow`;
    const outline = doc.createElement("div");
    outline.className = `${CLS}__outline`;
    this.#sphere = doc.createElement("div");
    this.#sphere.className = `${CLS}__sphere`;
    const equator = doc.createElement("div");
    equator.className = `${CLS}__equator`;
    this.append(glow, outline, this.#sphere, equator);
  }

  protected override connected(): void {
    // 화면 밖에서는 합성 비용을 내지 않는다(§개선 1)
    this.#inView ??= this.own(
      createInViewObserver(this, (inView) => {
        this.toggleAttribute("data-offscreen", !inView);
      }),
    );
  }

  protected override disconnected(): void {
    this.#inView = null; // own()이 이미 destroy했다
  }

  protected override update(): void {
    const size = Math.max(1, this.size);
    this.style.setProperty("--jd-globe-size", `${size}px`);
    this.style.setProperty("--jd-globe-duration", `${Math.max(0.1, this.speed)}s`);
    if (this.color) this.style.setProperty("--jd-globe-color", this.color);
    else this.style.removeProperty("--jd-globe-color");
    if (this.dotColor) this.style.setProperty("--jd-globe-dot-color", this.dotColor);
    else this.style.removeProperty("--jd-globe-dot-color");

    const key = `${size} ${this.#density}`;
    if (key !== this.#key) {
      this.#key = key;
      this.#paintDots(size);
    }
  }

  /** 1~72 정수 — 0이나 음수가 들어와도 링이 사라지지 않게 */
  get #density(): number {
    const n = Math.trunc(this.density);
    return Number.isFinite(n) ? Math.min(72, Math.max(1, n)) : 18;
  }

  /**
   * v2 알고리즘 그대로: 위도 -80~80을 20도 간격으로 훑고 각 링에
   * `round(density · cos(lat))` 개의 점을 균등 배치한다.
   */
  #paintDots(size: number): void {
    const doc = this.ownerDocument;
    const r = size / 2;
    const density = this.#density;
    const kids = this.#sphere.children;
    let i = 0;

    for (let lat = -80; lat <= 80; lat += 20) {
      const latRad = (lat * Math.PI) / 180;
      const count = Math.round(density * Math.cos(latRad));
      for (let k = 0; k < count; k++) {
        const lngRad = ((360 / count) * k * Math.PI) / 180;
        const x = r * Math.cos(latRad) * Math.sin(lngRad);
        const y = r * Math.sin(latRad);
        const z = r * Math.cos(latRad) * Math.cos(lngRad);
        let dot = kids.item(i) as HTMLElement | null;
        if (!dot) {
          dot = doc.createElement("span");
          dot.className = `${CLS}__dot`;
          this.#sphere.append(dot);
        }
        dot.style.setProperty("--jd-globe-x", `${num(x)}px`);
        dot.style.setProperty("--jd-globe-y", `${num(y)}px`);
        dot.style.setProperty("--jd-globe-z", `${num(z)}px`);
        // v2: 0.3 + (z + r) / size * 0.7 — 뒷면일수록 흐리다
        dot.style.setProperty("--jd-globe-dim", num(0.3 + ((z + r) / size) * 0.7));
        i += 1;
      }
    }
    while (kids.length > i) {
      const last = kids.item(kids.length - 1);
      if (!last) break;
      last.remove();
    }
  }
}
