/**
 * createFocusTrap — a11y 공용 Behavior 5종의 첫 실구현 (03-web-arch §8, WEB-10).
 *
 * 시그니처(§8 표): createFocusTrap(container, opts) → { activate, deactivate, destroy }
 * 담당: Tab 순환 감금 · initialFocus · 복귀 포커스. Modal/Drawer/CommandPalette/Tour.
 *
 * Behavior 규약(§5.1) 중 "지연 시작이 필요한 것만 activate/deactivate를 Extra로 노출
 * (focus trap 등)"에 해당한다 — create 시점에는 리스너를 붙이지 않고, activate()가
 * 시작점이다(모달이 닫힌 채 connect되는 것이 정상 상태이므로 즉시 활성은 오동작).
 * destroy()는 멱등(2회 호출 무해)이며 활성 상태면 deactivate까지 수행한다.
 */
import type { Behavior } from "./types.js";

export interface FocusTrapOptions {
  /** 활성화 시 최초 포커스를 줄 셀렉터. 미지정/미발견 시 첫 focusable → container 순 */
  initialFocus?: string;
  /** 비활성화 시 이전 포커스 복귀 여부. 기본 true */
  returnFocus?: boolean;
}

export interface FocusTrap extends Behavior<FocusTrapOptions> {
  activate(): void;
  deactivate(): void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

export function createFocusTrap(
  container: HTMLElement,
  opts: FocusTrapOptions = {},
): FocusTrap {
  let options = { returnFocus: true, ...opts };
  let active = false;
  let destroyed = false;
  let previous: HTMLElement | null = null;

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Tab") return;
    const list = focusables(container);
    if (list.length === 0) {
      e.preventDefault(); // 감금 유지 — 나갈 곳 없음
      return;
    }
    const first = list[0]!;
    const last = list[list.length - 1]!;
    const current = container.ownerDocument.activeElement;
    // 포커스가 트랩 밖으로 샜다면 첫 요소로 회수
    if (!container.contains(current)) {
      e.preventDefault();
      first.focus();
      return;
    }
    if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return {
    activate(): void {
      if (active || destroyed) return;
      active = true;
      const doc = container.ownerDocument;
      previous = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
      doc.addEventListener("keydown", onKeydown, true);
      const target =
        (options.initialFocus
          ? container.querySelector<HTMLElement>(options.initialFocus)
          : null) ?? focusables(container)[0];
      if (target) target.focus();
      else {
        // focusable 부재 — 컨테이너 자체를 포커스 가능하게 만들어 감금 기점 확보
        if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
        container.focus();
      }
    },
    deactivate(): void {
      if (!active) return;
      active = false;
      container.ownerDocument.removeEventListener("keydown", onKeydown, true);
      if (options.returnFocus && previous && previous.isConnected) previous.focus();
      previous = null;
    },
    update(next: Partial<FocusTrapOptions>): void {
      options = { ...options, ...next };
    },
    destroy(): void {
      if (destroyed) return; // 멱등
      this.deactivate();
      destroyed = true;
    },
  };
}
