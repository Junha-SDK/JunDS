"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  /** 포털로 렌더링할 자식 요소 */
  children: ReactNode;
  /** 마운트 대상 (기본: document.body) */
  container?: Element;
}

/**
 * React Portal 래퍼
 * @example
 * <Portal><ModalContent /></Portal>
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, container || document.body);
}
