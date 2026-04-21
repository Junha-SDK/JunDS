"use client";

import { useState, useEffect, useCallback } from "react";

export interface FocusModeState {
  /** 포커스 모드 활성 여부 */
  enabled: boolean;
  /** 포커스 모드 토글 */
  toggle: () => void;
  /** 포커스 모드 활성화 */
  enable: () => void;
  /** 포커스 모드 비활성화 */
  disable: () => void;
}

const STORAGE_KEY = "ds-focus-mode";

/**
 * 포커스 모드 상태 관리 훅
 *
 * 사이드바/네비게이션을 숨기고 콘텐츠에 집중할 수 있는
 * 토글 상태를 관리합니다.
 *
 * - localStorage에 상태를 영속 저장
 * - Cmd+. (Mac) / Ctrl+. (Windows) 키보드 단축키 지원
 *
 * @example
 * ```tsx
 * const { enabled, toggle } = useFocusMode();
 *
 * return (
 *   <div className={enabled ? "focus-mode" : ""}>
 *     <button onClick={toggle}>
 *       {enabled ? "포커스 모드 해제" : "포커스 모드"}
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useFocusMode(): FocusModeState {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  // 키보드 단축키: Cmd+. (Mac) / Ctrl+. (Windows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return { enabled, toggle, enable, disable };
}
