"use client";
import { useState, useCallback, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";

interface AnnouncerContextType {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer() {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) throw new Error("useAnnouncer must be used within AnnouncerProvider");
  return ctx;
}

export interface AnnouncerProviderProps {
  children: ReactNode;
}

/**
 * Announcer 컴포넌트
 * @status stable
 * @since 2.2.0
 * @tags accessibility, feedback
 */
export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");

  const announce = useCallback((message: string, politeness: "polite" | "assertive" = "polite") => {
    if (politeness === "assertive") {
      setAssertiveMsg("");
      requestAnimationFrame(() => setAssertiveMsg(message));
    } else {
      setPoliteMsg("");
      requestAnimationFrame(() => setPoliteMsg(message));
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {politeMsg}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {assertiveMsg}
      </div>
    </AnnouncerContext.Provider>
  );
}
