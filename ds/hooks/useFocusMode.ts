"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface FocusModeOptions {
  /** localStorage 에 상태를 남길지 (기본 true). 키는 `storageKey`. */
  persist?: boolean;
  /** 영속 저장 키 (기본 `"ds-focus-mode"`) */
  storageKey?: string;
  /**
   * 엣지 peek 사용 여부 (기본 false).
   *
   * 켜면 포커스 모드에서 마우스를 화면 좌/우 끝으로 밀 때 `peekLeft` /
   * `peekRight` 가 켜져, 숨겨 둔 사이드바·목차를 잠깐 꺼내 볼 수 있다.
   * 자체 전폭 UI 를 가진 화면에서는 꺼 두는 편이 낫다 — 패널이 콘텐츠를 덮을
   * 뿐 아니라 mousemove 마다 레이아웃 전체가 리렌더된다.
   */
  peek?: boolean;
  /** 왼쪽 peek 를 켜는 엣지 임계값 (px, 기본 16) */
  leftEdge?: number;
  /** 왼쪽 peek 를 유지하는 영역 폭 (px, 기본 280) */
  leftZone?: number;
  /** 오른쪽 peek 를 켜는 엣지 임계값 (px, 기본 16) */
  rightEdge?: number;
  /** 오른쪽 peek 를 유지하는 영역 폭 (px, 기본 240) */
  rightZone?: number;
  /**
   * 이 폭 이하에서는 포커스 모드를 강제로 끈다 (px, 기본 0 = 끄지 않음).
   *
   * 사이드바/목차를 접는 읽기 레이아웃이라면 `900` 을 권장한다 — 모바일에는
   * 애초에 접을 사이드바가 없어서 켜 봐야 레이아웃만 깨진다. 반대로 포커스
   * 모드를 다른 용도(예: 몰입형 캔버스)로 쓰는 화면이라면 기본값 그대로 둔다.
   */
  disableBelow?: number;
  /** 토글 단축키를 등록할지 (기본 true — Cmd/Ctrl + `.`) */
  shortcut?: boolean;
}

export interface FocusModeState {
  /** 포커스 모드 활성 여부 (좁은 화면에서는 항상 false) */
  enabled: boolean;
  /** `enabled` 의 별칭 — 읽기 화면 코드에서 이름이 더 자연스러운 경우가 있다 */
  focusMode: boolean;
  /** 왼쪽 엣지 peek 중인지 (`peek` 를 켠 경우에만 true 가 될 수 있다) */
  peekLeft: boolean;
  /** 오른쪽 엣지 peek 중인지 */
  peekRight: boolean;
  /** 포커스 모드 토글 */
  toggle: () => void;
  /** `toggle` 의 별칭 */
  toggleFocusMode: () => void;
  /** 포커스 모드 활성화 */
  enable: () => void;
  /** 포커스 모드 비활성화 */
  disable: () => void;
  /** 프로그래매틱하게 상태를 지정 */
  setFocusMode: (v: boolean) => void;
}

const DEFAULT_STORAGE_KEY = "ds-focus-mode";
/** peek 를 끄기 전 유예 시간 — 커서가 잠깐 벗어나도 패널이 깜빡이지 않게 한다 */
const PEEK_HIDE_DELAY = 300;

/**
 * 포커스 모드(사이드바·목차를 숨기고 본문에만 집중) 상태 관리 훅.
 *
 * - `Cmd/Ctrl + .` 로 토글 (`shortcut: false` 로 끌 수 있다)
 * - localStorage 에 상태를 영속 저장 (`persist: false` 로 끌 수 있다)
 * - `peek: true` 면 마우스를 화면 좌/우 끝으로 밀었을 때 숨긴 패널을 잠깐 꺼낸다
 * - `disableBelow` 로 좁은 화면에서 자동 비활성화 (읽기 레이아웃은 900 권장)
 *
 * @example
 * ```tsx
 * const { enabled, toggle, peekLeft } = useFocusMode({ peek: true });
 *
 * <div className={enabled ? "focus-mode" : ""}>
 *   <Sidebar className={peekLeft ? "is-peeking" : ""} />
 *   <button onClick={toggle}>{enabled ? "포커스 모드 해제" : "포커스 모드"}</button>
 * </div>
 * ```
 */
export function useFocusMode(options: FocusModeOptions = {}): FocusModeState {
  const {
    persist = true,
    storageKey = DEFAULT_STORAGE_KEY,
    peek = false,
    leftEdge = 16,
    leftZone = 280,
    rightEdge = 16,
    rightZone = 240,
    disableBelow = 0,
    shortcut = true,
  } = options;

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined" || !persist) return false;
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });
  const [peekLeft, setPeekLeft] = useState(false);
  const [peekRight, setPeekRight] = useState(false);

  const hideLeftRef = useRef(0);
  const hideRightRef = useRef(0);

  // localStorage 동기화
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey, String(enabled));
    } catch {
      // Safari 프라이빗 모드 등 localStorage 접근 불가 — 영속만 포기하고 계속 동작
    }
  }, [enabled, persist, storageKey]);

  // 좁은 화면에서는 포커스 모드를 무력화한다
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    if (disableBelow <= 0) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${disableBelow}px)`);
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [disableBelow]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
    setPeekLeft(false);
    setPeekRight(false);
  }, []);

  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => setEnabled(false), []);

  const effective = enabled && !isNarrow;

  // 엣지 peek — 포커스 모드가 켜져 있고 peek 옵션이 켜진 동안에만 관찰한다
  useEffect(() => {
    if (!effective || !peek) {
      setPeekLeft(false);
      setPeekRight(false);
      return;
    }

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const w = window.innerWidth;

      if (x < leftEdge) {
        clearTimeout(hideLeftRef.current);
        hideLeftRef.current = 0;
        setPeekLeft(true);
      } else if (x > leftZone && !hideLeftRef.current) {
        hideLeftRef.current = window.setTimeout(() => {
          setPeekLeft(false);
          hideLeftRef.current = 0;
        }, PEEK_HIDE_DELAY);
      } else if (x <= leftZone) {
        clearTimeout(hideLeftRef.current);
        hideLeftRef.current = 0;
      }

      if (x > w - rightEdge) {
        clearTimeout(hideRightRef.current);
        hideRightRef.current = 0;
        setPeekRight(true);
      } else if (x < w - rightZone && !hideRightRef.current) {
        hideRightRef.current = window.setTimeout(() => {
          setPeekRight(false);
          hideRightRef.current = 0;
        }, PEEK_HIDE_DELAY);
      } else if (x >= w - rightZone) {
        clearTimeout(hideRightRef.current);
        hideRightRef.current = 0;
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(hideLeftRef.current);
      clearTimeout(hideRightRef.current);
    };
  }, [effective, peek, leftEdge, leftZone, rightEdge, rightZone]);

  // 키보드 단축키: Cmd+. (Mac) / Ctrl+. (Windows)
  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, shortcut]);

  return {
    enabled: effective,
    focusMode: effective,
    peekLeft: effective && peekLeft,
    peekRight: effective && peekRight,
    toggle,
    toggleFocusMode: toggle,
    enable,
    disable,
    setFocusMode: setEnabled,
  };
}
