"use client";
import { useEffect, useRef, useState } from "react";

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {},
) {
  const { threshold = 0, root = null, rootMargin = "0px", once = false } = options;
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([e]) => {
        setEntry(e);
        setIsIntersecting(e.isIntersecting);
        if (once && e.isIntersecting) observer.unobserve(node);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, once]);

  return { ref, entry, isIntersecting };
}
