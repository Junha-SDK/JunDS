/** 개발 전용 경고(키당 1회) + dangerouslySetInnerHTML용 이스케이프. */

const warned = new Set<string>();

function isProd(): boolean {
  try {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  } catch {
    return false;
  }
}

export function warnOnce(key: string, message: string): void {
  if (isProd() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[junds/react] ${message}`);
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPES[c]!);
}
