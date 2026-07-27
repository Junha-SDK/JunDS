/**
 * JdElement — @junds/web 단일 베이스 클래스 (03-web-arch §1, WEB-01/02).
 *
 * - 선언적 `static props` → attribute↔property 반영 접근자를 클래스 단위 1회 설치
 * - 마이크로태스크 배칭 requestUpdate() → update() 1회
 * - own()으로 Behavior 수명 관리(disconnected 시 자동 destroy)
 * - render()는 골격 1회(멱등·입양 §3.3), update()는 상태 반영 N회. VDOM 없음.
 * - SSR 규칙(§3.1): constructor에서 DOM/attribute 접근 금지 — 접근자 설치만.
 */

export type PropType = typeof String | typeof Number | typeof Boolean;

interface PropOptions {
  /** 프로퍼티 변경을 attribute로 되쓰기. 기본 false */
  reflect?: boolean;
  /** attribute 이름 재정의. false면 attribute 미노출(property 전용) */
  attribute?: string | false;
}

export type PropDef =
  | (PropOptions & { type: typeof String; default?: string })
  | (PropOptions & { type: typeof Number; default?: number })
  | (PropOptions & { type: typeof Boolean; default?: boolean });

export type PropDefs = Readonly<Record<string, PropDef>>;

/**
 * 컴포넌트의 prop 선언을 타입 검사하면서 리터럴 키·옵션을 그대로 보존한다.
 *
 * @example
 * static props = defineProps({
 *   disabled: { type: Boolean, reflect: true },
 *   size: { type: String, default: "md", reflect: true },
 * });
 */
export function defineProps<const T extends PropDefs>(defs: T): T {
  return defs;
}

interface PropMeta {
  name: string;
  attr: string | null;
  def: PropDef;
}

const camelToKebab = (s: string): string =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** 클래스 단위 접근자 설치 캐시 + attribute → prop 역인덱스 */
const finalized = new WeakSet<object>();
const attrIndex = new WeakMap<object, Map<string, PropMeta>>();

function typeDefault(def: PropDef): unknown {
  if (def.default !== undefined) return def.default;
  if (def.type === Boolean) return false;
  if (def.type === Number) return 0;
  return "";
}

/** attribute 문자열 → 타입값 강제 (03-web-arch §1.3) */
function coerce(def: PropDef, raw: string | null): unknown {
  if (def.type === Boolean) return raw !== null; // 존재 여부가 값 — `loading=""`도 true
  if (raw === null) return typeDefault(def);
  if (def.type === Number) {
    const n = Number(raw);
    return Number.isNaN(n) ? typeDefault(def) : n; // NaN → default 폴백
  }
  return raw;
}

/**
 * SSR 안전 베이스 (§3.1-1): Node에는 HTMLElement가 없어 `extends HTMLElement`가
 * 모듈 평가 시점에 throw한다 — typeof 탐지(허용 규칙)로 스텁 대체.
 * 스텁 경로에서는 인스턴스화가 일어나지 않는다(defineElement가 SSR no-op).
 */
const BaseElement: typeof HTMLElement =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : (class {} as unknown as typeof HTMLElement);

export abstract class JdElement extends BaseElement {
  /** 서브클래스가 선언. 키는 camelCase 프로퍼티명 */
  static props: PropDefs = {};
  /** "jd-button" — defineElement가 사용 */
  static tag: string;

  static get observedAttributes(): string[] {
    return Object.entries(this.props)
      .filter(([, d]) => d.attribute !== false)
      .map(([name, d]) => d.attribute || camelToKebab(name));
  }

  /** props 선언 → prototype 접근자 설치. 클래스당 1회 (§1.2) */
  static finalize(this: typeof JdElement): void {
    if (finalized.has(this)) return;
    finalized.add(this);
    const index = new Map<string, PropMeta>();
    attrIndex.set(this, index);
    for (const [name, def] of Object.entries(this.props)) {
      const attr =
        def.attribute === false ? null : def.attribute || camelToKebab(name);
      const meta: PropMeta = { name, attr, def };
      if (attr !== null) index.set(attr, meta);
      Object.defineProperty(this.prototype, name, {
        configurable: true,
        enumerable: true,
        get(this: JdElement) {
          return this.#values.has(name)
            ? this.#values.get(name)
            : typeDefault(def);
        },
        set(this: JdElement, v: unknown) {
          const previous = this.#values.has(name)
            ? this.#values.get(name)
            : typeDefault(def);
          this.#values.set(name, v);
          if (def.reflect && attr !== null) this.#reflect(meta, v);
          if (Object.is(previous, v)) return;
          this.requestUpdate();
        },
      });
    }
  }

  #values = new Map<string, unknown>();
  #reflecting = false;
  #ready = false; // render() 1회 완료 여부
  #renderScheduled = false;
  #updateQueued = false;
  #updateComplete: Promise<void> = Promise.resolve();
  #resolveUpdate: (() => void) | undefined;
  #behaviors = new Set<{ destroy(): void }>();

  constructor() {
    super();
    (this.constructor as typeof JdElement).finalize();
  }

  /**
   * 최초 render는 지연 실행한다 (G1 구현 중 발견 — DECISIONS 참조).
   * 스트리밍 파서 업그레이드(번들 선로드 + 파서 생성 요소)에서는 connectedCallback
   * 시점에 children이 아직 파싱되지 않아, children을 골격으로 이동하는 컴포넌트가
   * 빈 골격을 이중 구축한다. 문서 파싱 중(+후행 형제 없음)이면 DOMContentLoaded,
   * 그 외(innerHTML·동적 생성)는 microtask로 지연 — 두 경로 모두 children 도착 후 render.
   * connected()는 항상 render 이후에 호출된다(순서 계약 유지).
   */
  connectedCallback(): void {
    if (this.#ready) {
      this.connected?.();
      return;
    }
    if (this.#renderScheduled) return;
    this.#beginUpdateCycle();
    this.#renderScheduled = true;
    const run = (): void => {
      this.#renderScheduled = false;
      if (this.#ready || !this.isConnected) return; // 그 사이 disconnect — 재연결 시 재스케줄
      this.#upgradeProps(); // 업그레이드 전 대입된 프로퍼티 회수
      this.render(); // 최초 1회, 멱등·입양 규칙(§3.3) 준수
      this.#ready = true;
      this.connected?.();
      this.#finishUpdateCycle();
    };
    const doc = this.ownerDocument;
    if (doc.readyState === "loading" && !this.nextSibling) {
      doc.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      queueMicrotask(run);
    }
  }

  disconnectedCallback(): void {
    for (const b of this.#behaviors) b.destroy();
    this.#behaviors.clear();
    this.disconnected?.();
  }

  attributeChangedCallback(
    name: string,
    oldV: string | null,
    newV: string | null,
  ): void {
    if (oldV === newV || this.#reflecting) return;
    const meta = attrIndex.get(this.constructor as object)?.get(name);
    if (!meta) return;
    this.#values.set(meta.name, coerce(meta.def, newV)); // 마지막 쓰기 승리 (§1.3)
    if (this.#ready) this.requestUpdate();
  }

  /**
   * 현재 예약된 최초 render 또는 배칭 update가 끝날 때 resolve된다.
   * 같은 태스크에서 여러 prop을 바꿔도 하나의 Promise로 합쳐진다.
   */
  get updateComplete(): Promise<void> {
    return this.#updateComplete;
  }

  /** 마이크로태스크 배칭 — 같은 태스크의 다중 변경은 update() 1회 */
  requestUpdate(): void {
    this.#beginUpdateCycle();
    if (this.#updateQueued) return;
    this.#updateQueued = true;
    queueMicrotask(() => {
      this.#updateQueued = false;
      if (this.#ready) this.update();
      this.#finishUpdateCycle();
    });
  }

  /** CustomEvent 발행 규약(§1.5)의 단일 진입점 */
  emit<T>(
    name: `jd-${string}`,
    detail?: T,
    opts?: { cancelable?: boolean },
  ): boolean {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: false, // shadow 없음 — 명시적 false 고정
        cancelable: opts?.cancelable ?? false,
      }),
    );
  }

  /** Behavior 소유 등록 — disconnected 시 자동 destroy */
  protected own<B extends { destroy(): void }>(b: B): B {
    this.#behaviors.add(b);
    return b;
  }

  /** 표준 CE 함정 대응: 업그레이드 전 인스턴스 own property를 setter로 재대입 */
  #upgradeProps(): void {
    for (const name of Object.keys(
      (this.constructor as typeof JdElement).props,
    )) {
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        const v = (this as Record<string, unknown>)[name];
        delete (this as Record<string, unknown>)[name];
        (this as Record<string, unknown>)[name] = v;
      }
    }
  }

  #reflect(meta: PropMeta, v: unknown): void {
    this.#reflecting = true;
    try {
      if (meta.def.type === Boolean)
        this.toggleAttribute(meta.attr!, Boolean(v));
      else if (v === null || v === undefined) this.removeAttribute(meta.attr!);
      else this.setAttribute(meta.attr!, String(v));
    } finally {
      this.#reflecting = false;
    }
  }

  #beginUpdateCycle(): void {
    if (this.#resolveUpdate) return;
    this.#updateComplete = new Promise<void>((resolve) => {
      this.#resolveUpdate = resolve;
    });
  }

  #finishUpdateCycle(): void {
    // render()/update() 안에서 다시 requestUpdate()가 호출되면 그 후속 배치까지 기다린다.
    if (!this.#ready || this.#updateQueued) return;
    const resolve = this.#resolveUpdate;
    this.#resolveUpdate = undefined;
    resolve?.();
  }

  /** 최초 연결 시 1회. DOM 골격 구성(멱등·입양) + 스타일 채택 */
  protected abstract render(): void;
  /** 프로퍼티/attribute 변경 반영. render() 이후 임의 횟수 */
  protected update(): void {}
  protected connected?(): void;
  protected disconnected?(): void;
}
