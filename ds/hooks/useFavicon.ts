"use client";
import { useEffect } from "react";

/**
 * favicon 동적 변경 (status badge / unread count 표시 용도).
 * @example
 * useFavicon(unread > 0 ? "/favicon-alert.png" : "/favicon.png");
 */
export function useFavicon(href: string | null) {
  useEffect(() => {
    if (!href || typeof document === "undefined") return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const created = !link;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    const previous = link.href;
    link.href = href;
    return () => {
      if (link) {
        if (created) link.parentNode?.removeChild(link);
        else link.href = previous;
      }
    };
  }, [href]);
}
