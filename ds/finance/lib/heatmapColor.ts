/**
 * Korean market convention: red = 상승, blue = 하락.
 * Bright HSL palette — even small moves stay vivid (no muddy maroon),
 * big moves deepen into rich crimson / royal blue. Reads cleanly in both
 * light and dark themes.
 *
 * Server-safe pure function — also re-exported as `heatmapColor` from
 * `components/MarketHeatmap.tsx` for client-side use.
 */
export function heatmapColor(pct: number, scale = 6): string {
  const clamped = Math.max(-scale, Math.min(scale, pct));
  const t = Math.min(1, Math.abs(clamped) / scale);
  if (Math.abs(clamped) < 0.1) return "hsl(220, 10%, 52%)";
  if (clamped > 0) {
    const hue = 358;
    const sat = 76 + 16 * t;
    const light = 58 - 14 * t;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  } else {
    const hue = 218;
    const sat = 74 + 18 * t;
    const light = 58 - 16 * t;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  }
}
