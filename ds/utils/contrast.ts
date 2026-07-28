/** Parse hex color to RGB tuple */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Calculate relative luminance per WCAG 2.1 */
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate contrast ratio between two hex colors */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(...hexToRgb(hex1));
  const l2 = luminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = "AA" | "AAA";
export type TextSize = "normal" | "large";

/** Check if contrast ratio meets WCAG level */
export function meetsWcag(
  hex1: string,
  hex2: string,
  level: WcagLevel = "AA",
  textSize: TextSize = "normal",
): boolean {
  const ratio = contrastRatio(hex1, hex2);
  if (level === "AAA") return textSize === "large" ? ratio >= 4.5 : ratio >= 7;
  return textSize === "large" ? ratio >= 3 : ratio >= 4.5;
}

/** Get a human-readable contrast check result */
export function checkContrast(foreground: string, background: string) {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: { normal: ratio >= 4.5, large: ratio >= 3 },
    aaa: { normal: ratio >= 7, large: ratio >= 4.5 },
  };
}
