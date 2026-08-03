"use client";
import { useEffect, useRef } from "react";

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventTarget | null,
  options?: boolean | AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  });

  useEffect(() => {
    const target = element ?? window;
    const listener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    target.addEventListener(eventName, listener, options);
    return () => target.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}
