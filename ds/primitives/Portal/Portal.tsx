"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: ReactNode;
  /** 마운트 대상 (기본: document.body) */
  container?: Element;
}

/**
 * React Portal 래퍼
 * @example
 * <Portal><ModalContent /></Portal>
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, container || document.body);
}
