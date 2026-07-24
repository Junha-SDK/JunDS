/**
 * <jd-auto-hide-header> — 아래로 스크롤하면 숨고 위로 스크롤하면 돌아오는 헤더
 * (v2 composites/AutoHideHeader).
 *
 * v2 대비 교정 4건:
 *  1. **`hidden` 상태명 개명(→ `collapsed`)**: v2 내부 state 이름을 그대로 프로퍼티로
 *     내면 `HTMLElement.hidden`(문서에서 완전히 감추는 네이티브 프로퍼티)을 덮어쓴다.
 *     Overlay가 `blur`(HTMLElement.blur())를 피해 프로퍼티명을 분리한 선례(DEC-018-5)와 동형.
 *  2. **골격이 헤더 랜드마크를 잃지 않게**: 호스트에 `role="banner"`를 박으면 article/
 *     section 안에 놓였을 때도 배너가 된다(네이티브 `<header>`는 그 문맥에서 자동으로
 *     배너를 포기한다). 그래서 role을 쓰지 않고 **진짜 `<header>`를 안에 두고** children을
 *     옮긴다 — 랜드마크 범위 판정을 브라우저에 그대로 맡긴다.
 *  3. **초기 스크롤 위치 무시**: v2는 lastScrollY를 0으로 시작해, 스크롤이 복원된 채
 *     열린 페이지(뒤로가기·앵커 진입)의 첫 이벤트에서 y-0 > threshold가 되어 헤더가
 *     한 번 튀어 사라졌다. v3는 connected()에서 현재 y로 시작점을 맞춘다.
 *  4. **스크롤 리스너 중복 부착**: v2는 threshold/height가 바뀔 때마다 effect를 재실행해
 *     리스너를 떼었다 붙였다. v3는 behaviors/createScrollWatcher 하나를 own()으로 들고
 *     값만 다시 판정한다(passive 고정 · 값 변화 없으면 콜백도 없음).
 *
 * 프리렌더 결정성(§3.1-3): render()는 scrollY를 읽지 않는다 — 최초 골격은 항상 펼침,
 * 첫 측정은 connected()(back-top과 같은 규율).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createScrollWatcher } from "../../behaviors/viewport.js";
import autoHideHeaderStyles from "./auto-hide-header.css.js";

export class JdAutoHideHeader extends JdElement {
  static override tag = "jd-auto-hide-header";
  static override props = {
    /** 방향 전환으로 인정할 최소 이동량(px). v2 기본 8 */
    threshold: { type: Number, default: 8 },
    /** 헤더 높이(px). 이 높이 안(문서 최상단 근처)에서는 항상 보인다. v2 기본 64 */
    height: { type: Number, default: 64 },
    /** 숨김 상태 — 스타일 훅이라 reflect (v2 내부 state `hidden`의 개명) */
    collapsed: { type: Boolean, reflect: true },
  };

  declare threshold: number;
  declare height: number;
  declare collapsed: boolean;

  #bar!: HTMLElement;
  #lastY = 0;
  #wasCollapsed = false;

  protected render(): void {
    adoptStyles(autoHideHeaderStyles);
    // 입양(§3.3): SSR/어댑터가 그린 헤더가 있으면 재사용
    const existing = this.querySelector<HTMLElement>(":scope > header.jd-auto-hide-header__bar");
    if (existing) {
      this.#bar = existing;
    } else {
      this.#bar = document.createElement("header");
      this.#bar.className = "jd-auto-hide-header__bar";
      this.#bar.append(...this.childNodes); // children을 헤더 안으로 이동
      this.append(this.#bar);
    }
    this.#wasCollapsed = this.collapsed; // 최초 상태는 통지 대상이 아니다
    this.update();
  }

  protected override connected(): void {
    const watcher = this.own(createScrollWatcher());
    this.#lastY = watcher.get().y; // 복원된 스크롤 위치에서 튀지 않게 시작점을 맞춘다
    this.#evaluate(this.#lastY);
    watcher.subscribe(({ y }) => this.#evaluate(y));
  }

  /** v2 판정 그대로: 상단 근처면 표시 · 임계 이상 아래로면 숨김 · 임계 이상 위로면 표시 */
  #evaluate(y: number): void {
    if (y < this.height) this.collapsed = false;
    else if (y - this.#lastY > this.threshold) this.collapsed = true;
    else if (this.#lastY - y > this.threshold) this.collapsed = false;
    this.#lastY = y;
  }

  protected override update(): void {
    // 인라인 longhand가 아니라 커스텀 프로퍼티 — 소비자 오버라이드 서열 유지(§4.4)
    this.style.setProperty("--jd-auto-hide-header-height", `${this.height}px`);
    if (this.collapsed !== this.#wasCollapsed) {
      this.#wasCollapsed = this.collapsed;
      this.emit("jd-change", { collapsed: this.collapsed });
    }
  }
}
