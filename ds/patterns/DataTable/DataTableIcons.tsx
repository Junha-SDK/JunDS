"use client";

import { cn } from "../../utils/cn";

export function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ dir, className }: { dir: "up" | "down" | "right"; className?: string }) {
  const rotate = dir === "down" ? "rotate-180" : dir === "right" ? "rotate-90" : "";
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn(rotate, className)}>
      <path d="M3 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v7m0 0L4 6.5M7 9l3-2.5M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FullscreenIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 2v3H2M9 2v3h3M5 12V9H2M9 12V9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 5V2h3M12 5V2H9M2 9v3h3M12 9v3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ColumnsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DensityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ active }: { active?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v4M4 5h4l.5 3H3.5L4 5zM6 8v3" stroke={active ? "currentColor" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 4V2.5A1 1 0 007 1.5H2.5a1 1 0 00-1 1V7a1 1 0 001 1H4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 2.5h9L7.5 6v3.5L4.5 11V6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
