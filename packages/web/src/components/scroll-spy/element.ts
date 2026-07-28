/**
 * <jd-scroll-spy> — 현재 보고 있는 섹션을 표시하는 목록 내비게이션
 * (v2 composites/ScrollSpy). TableOfContents가 이 구현을 파생한다(§6 R12).
 *
 * 섹션 데이터는 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3).
 *
 * v2 대비 교정 4건:
 *  1. **항목이 링크가 아니었다.** v2는 `<button onClick=scrollTo>`를 나열했다 — 새 탭
 *     열기·가운데 클릭·주소 복사가 전부 죽고, JS 이전에는 아무 데도 갈 수 없다.
 *     v3는 `<a href="#id">`다. 수식(modifier) 클릭은 가로채지 않고 브라우저에 넘긴다.
 *  2. **목록이 목록이 아니었다.** flex 나열이라 AT가 "3개 중 2번째"를 못 읽었다 →
 *     `<ul>/<li>` + 랜드마크(role=navigation) + 활성 항목 `aria-current="location"`
 *     (v2의 단서는 굵은 글씨와 색뿐이었다).
 *  3. **활성 판정을 IntersectionObserver로 했다.** 화면에 여러 섹션이 걸치면 정렬
 *     결과가 요동치고, 아무것도 교차하지 않는 구간(긴 섹션 한복판·문서 끝)에서는
 *     직전 값에 얼어붙는다. v3는 behaviors/createScrollSpy(문서 순서대로 "offset을
 *     지난 마지막 섹션")로 간다 — 단조롭고 빈 구간이 없다.
 *  4. **프로그래매틱 스크롤 중 하이라이트 요동**: 클릭 스크롤 동안 스파이가 지나가는
 *     섹션마다 활성이 바뀌었다. createScrollSpy.suspend(700)이 그 구간을 덮는다
 *     (Behavior가 이 표면을 갖고 있는 이유가 정확히 이것 — behaviors/scroll.ts 주석).
 *
 * 프리렌더 결정성(§3.1-3): render()는 스크롤을 읽지 않는다. 최초 활성은 첫 항목이고
 * 실측은 connected() 이후 — back-top·junds.page.tsx와 같은 규율.
 */
import { JdElement } from "../../core/element.js";
import { syncOwnedAttribute } from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { createScrollSpy } from "../../behaviors/scroll.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import scrollSpyStyles from "./scroll-spy.css.js";

export interface JdScrollSpySection {
  /** 식별자. 생략하면 targetId — active 프로퍼티·jd-select detail이 쓰는 값 */
  key?: string;
  /** 표시 문자열 */
  label: string;
  /** 스크롤 대상 요소의 id (`#` 없이) */
  targetId: string;
  /** 들여쓰기 단계. 0이 최상위 — TableOfContents 파생이 헤딩 레벨에서 채운다 */
  depth?: number;
}

type SpyWatcher = Watcher<string | null> & { suspend(ms: number): void };

/** 클릭 스크롤이 끝날 때까지 스파이를 멈추는 시간(ms) — v2 ToC의 700ms 승계 */
const SUSPEND_MS = 700;

export class JdScrollSpy extends JdElement {
  static override tag = "jd-scroll-spy";
  static override props = {
    /** 활성 판정 상단 여백(px). v2 기본 80 */
    offset: { type: Number, default: 80 },
    /** 현재 활성 항목의 key — 스타일 훅이라 reflect */
    active: { type: String, reflect: true },
    /** 랜드마크 접근 이름 */
    label: { type: String, default: "섹션 내비게이션" },
    /** 클릭 시 즉시 점프(부드러운 스크롤 끄기). default-true boolean 반전 계보(DEC-018-5) */
    noSmooth: { type: Boolean, reflect: true },
    /** 스크롤 추적 끄기 (v2 ToC activeTracking={false} 대응) */
    noTracking: { type: Boolean, reflect: true },
  };

  declare offset: number;
  declare active: string;
  declare label: string;
  declare noSmooth: boolean;
  declare noTracking: boolean;

  /** 파생이 골격 클래스를 공유한다(Result=EmptyState 선례) */
  protected baseClass = "jd-scroll-spy";

  #sections: JdScrollSpySection[] = [];
  /** 마지막으로 DOM에 반영한 배열 — 참조 비교로 재동기화 여부를 판단 */
  #built: readonly JdScrollSpySection[] | null = null;
  /** 소비자가 명시 지정했는가 — 참이면 파생의 자동 수집을 하지 않는다 */
  #explicit = false;
  #list: HTMLUListElement | null = null;
  #spy: SpyWatcher | null = null;
  #trackSig: string | null = null;
  /** connected() 이후에만 참 — 레이아웃 측정을 render()/최초 update()에서 떼어낸다 */
  #live = false;

  get sections(): JdScrollSpySection[] {
    return this.#sections;
  }
  set sections(v: JdScrollSpySection[]) {
    this.#setSections(v, true);
  }

  /** 파생의 자동 수집 결과 반영 — `explicit` 플래그를 세우지 않는다 */
  protected setCollected(v: JdScrollSpySection[]): void {
    this.#setSections(v, false);
  }

  protected get hasExplicitSections(): boolean {
    return this.#explicit;
  }

  #setSections(v: JdScrollSpySection[], explicit: boolean): void {
    if (explicit) this.#explicit = true;
    this.#sections = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  /** 파생 훅 — TableOfContents가 헤딩 수집으로 재정의한다. 기본은 no-op */
  protected collect(): void {}

  /** 대상 문서가 바뀐 뒤 목록·추적을 다시 만든다 (v2에는 없던 표면) */
  refresh(): void {
    this.collect();
    this.#built = null;
    this.#trackSig = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(scrollSpyStyles);
    this.#readJson();
    this.collect();
    syncOwnedAttribute(this, "role", "navigation", { preserveExisting: true });
    const cls = this.baseClass;
    // 입양(§3.3): SSR/어댑터가 그린 목록이 있으면 재사용
    this.#list = this.querySelector<HTMLUListElement>(`:scope > ul.${cls}__list`);
    if (!this.#list) {
      this.#list = document.createElement("ul");
      this.#list.className = `${cls}__list`;
      this.append(this.#list);
    }
    this.#sync();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdScrollSpySection[];
      if (Array.isArray(parsed)) this.#setSections(parsed, true);
    } catch {
      console.warn("[junds] <jd-scroll-spy> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.#live = true;
    this.#retrack(); // 첫 실측은 여기 — render()가 아니다(§3.1-3)
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    // own()이 이미 destroy했다 — 재연결 시 새로 만들도록 서명만 비운다
    this.#live = false;
    this.#spy = null;
    this.#trackSig = null;
  }

  /** 섹션 목록 → 행 골격. 상태(활성)는 update()가 따로 칠한다 */
  #sync(): void {
    this.#built = this.#sections;
    const list = this.#list;
    if (!list) return;
    const cls = this.baseClass;
    if (list.children.length !== this.#sections.length) {
      list.textContent = "";
      for (let i = 0; i < this.#sections.length; i++) {
        const row = document.createElement("li");
        row.className = `${cls}__row`;
        const link = document.createElement("a");
        link.className = `${cls}__item`;
        link.dataset["index"] = String(i);
        row.append(link);
        list.append(row);
      }
    }
    Array.from(list.children).forEach((node, i) => {
      const section = this.#sections[i];
      if (!section) return;
      const row = node as HTMLElement;
      const link = row.firstElementChild as HTMLAnchorElement | null;
      if (!link) return;
      link.dataset["index"] = String(i);
      link.href = `#${section.targetId}`;
      link.textContent = section.label;
      // 들여쓰기는 인라인 longhand가 아니라 커스텀 프로퍼티로 (§4.4 오버라이드 서열 유지).
      // 상속되는 값이라 0도 항상 명시한다(jd-affix 선례).
      row.style.setProperty(`--${cls}-depth`, String(section.depth ?? 0));
    });
  }

  /** 스파이 재생성 — 대상 id 집합·offset·추적 여부가 바뀔 때만 */
  #retrack(): void {
    if (!this.#live || !this.isConnected) return;
    const ids = this.#sections.map((s) => s.targetId).filter(Boolean);
    const sig = this.noTracking ? "off" : `${this.offset}|${ids.join(",")}`;
    if (sig === this.#trackSig) return;
    this.#trackSig = sig;
    this.#spy?.destroy(); // 멱등 — own() 재호출이 남긴 항목도 무해
    this.#spy = null;
    if (this.noTracking || ids.length === 0) return;
    const spy: SpyWatcher = this.own(createScrollSpy(ids, { offset: this.offset }));
    this.#spy = spy;
    this.#applyActive(spy.get());
    spy.subscribe((id) => this.#applyActive(id));
  }

  /** createScrollSpy는 대상 **id**를 준다 — 섹션 key로 되돌린다 */
  #applyActive(targetId: string | null): void {
    if (!targetId) return;
    const section = this.#sections.find((s) => s.targetId === targetId);
    if (section) this.active = section.key ?? section.targetId;
  }

  #onClick = (e: MouseEvent): void => {
    // 수식 클릭·가운데 클릭은 브라우저 몫(새 탭/새 창) — 가로채지 않는다
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const from = e.target;
    if (!(from instanceof Element)) return;
    const link = from.closest<HTMLAnchorElement>(`a.${this.baseClass}__item`);
    if (!link || !this.contains(link)) return;
    const section = this.#sections[Number(link.dataset["index"])];
    if (!section) return;
    const target = this.ownerDocument.getElementById(section.targetId);
    if (!target) return; // 대상이 없으면 기본 앵커 동작에 맡긴다
    e.preventDefault();

    const key = section.key ?? section.targetId;
    this.active = key;
    this.#spy?.suspend(SUSPEND_MS);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - this.offset,
      behavior: this.noSmooth || reduce ? "auto" : "smooth",
    });
    // pushState가 아니라 replaceState — 목차 클릭이 뒤로가기 스택을 채우면 안 된다(v2 동형).
    // 샌드박스 iframe·file:// 에서는 SecurityError가 날 수 있어 스크롤을 막지 않게 감싼다.
    try {
      history.replaceState(null, "", `#${section.targetId}`);
    } catch {
      /* 주소만 못 바꿀 뿐 — 이동은 이미 끝났다 */
    }
    this.emit("jd-select", { key, targetId: section.targetId, label: section.label });
  };

  protected override update(): void {
    syncOwnedAttribute(this, "aria-label", this.label || null);
    if (this.#built !== this.#sections) this.#sync();
    // v2는 항목이 없으면 null을 반환했다 — CE는 노드를 유지하고 표시만 끈다
    this.toggleAttribute("data-empty", this.#sections.length === 0);
    const list = this.#list;
    if (list) {
      Array.from(list.children).forEach((node, i) => {
        const section = this.#sections[i];
        if (!section) return;
        const row = node as HTMLElement;
        const link = row.firstElementChild as HTMLAnchorElement | null;
        if (!link) return;
        const isActive = (section.key ?? section.targetId) === this.active;
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        row.toggleAttribute("data-active", isActive);
      });
    }
    this.#retrack();
  }
}
