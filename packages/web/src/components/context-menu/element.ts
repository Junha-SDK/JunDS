/**
 * <jd-context-menu> — 우클릭 메뉴 (v2 composites/ContextMenu) = Dropdown 파생.
 *
 * Dropdown과 다른 것은 **어디에 뜨는가** 하나뿐이다: 앵커 상대(absolute)가 아니라
 * 포인터 좌표 고정(fixed). 항목 렌더·화살표 내비·구분선·단축키·jd-select·ESC·
 * 클릭아웃은 전부 상속이다(§6 R12).
 *
 * v2는 이 컴포넌트를 Portal로 body에 옮겨 띄웠다. v3는 옮기지 않는다 — light DOM에서
 * `position: fixed` 패널은 이미 뷰포트 기준이고, 호스트 안에 남아 있어야 클릭아웃
 * 판정(host.contains)과 disconnect 정리가 단순하다. 조상의 transform/filter가 fixed의
 * 컨테이닝 블록을 바꾸는 함정이 있으나(MySelf 아트모드에서 실측), 그 경우 소비자가
 * <jd-portal>로 감싸는 탈출구가 이미 있다.
 *
 * v2 대비 개선 3가지:
 *  1. **클램프가 실측이다.** v2는 메뉴 크기를 `180 × items.length*36`으로 **추정**해
 *     구분선·단축키·긴 라벨이 있으면 화면 밖으로 나갔다. 여기서는 연 뒤 실제
 *     offsetWidth/Height로 잡는다.
 *  2. **키보드로 열린다.** Shift+F10 / 컨텍스트 메뉴 키는 브라우저가 contextmenu
 *     이벤트로 주지만 대상이 포커스 가능해야 한다 — 트리거 영역을 tabstop으로 승격하고,
 *     좌표가 없는(키보드) 호출은 영역의 좌하단에 띄운다.
 *  3. **열자마자 첫 항목에 포커스**한다(APG 메뉴 패턴). v2는 focusedIndex=-1로 시작해
 *     화살표를 두 번 눌러야 첫 항목에 닿았다.
 */
import { JdDropdown } from "../dropdown/element.js";
import { adoptStyles } from "../../core/styles.js";
import contextMenuStyles from "./context-menu.css.js";

/** v2 클램프 여백 8px */
const EDGE = 8;

export class JdContextMenu extends JdDropdown {
  static override tag = "jd-context-menu";
  static override props = {
    ...JdDropdown.props,
    trigger: { type: String, default: "contextmenu", reflect: true },
    align: { type: String, default: "left", reflect: true },
  };

  #x = 0;
  #y = 0;

  /** 우클릭 영역을 키보드로도 도달 가능하게 — 컨텍스트 메뉴 키의 전제조건 */
  protected override get promoteTrigger(): boolean {
    return true;
  }

  protected override render(): void {
    super.render();
    adoptStyles(contextMenuStyles);
  }

  protected override pointerOpen(e: MouseEvent): void {
    // 키보드 호출(Shift+F10 / 메뉴 키)은 좌표가 없다 — 브라우저별로 0,0이거나 미정의
    const keyboard = e.detail === 0 && e.clientX === 0 && e.clientY === 0;
    if (keyboard) {
      const rect = (this.triggerEl ?? this).getBoundingClientRect();
      this.#x = rect.left;
      this.#y = rect.bottom;
    } else {
      this.#x = e.clientX;
      this.#y = e.clientY;
    }
    this.requestItemFocus("first");
    if (this.open) this.#place(); // 이미 열려 있으면 새 좌표로 옮긴다
    else this.show();
  }

  protected override opened(): void {
    this.#place(); // 포커스보다 먼저 — 화면 밖에서 포커스가 잡히면 스크롤이 튄다
    super.opened();
  }

  /** 뷰포트 클램프 — 패널이 이미 보이므로 실제 크기를 잰다 */
  #place(): void {
    const panel = this.panelEl;
    const view = this.ownerDocument.defaultView;
    if (!panel || !view) return;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const maxX = Math.max(EDGE, view.innerWidth - w - EDGE);
    const maxY = Math.max(EDGE, view.innerHeight - h - EDGE);
    panel.style.left = `${Math.max(EDGE, Math.min(this.#x, maxX))}px`;
    panel.style.top = `${Math.max(EDGE, Math.min(this.#y, maxY))}px`;
  }
}
