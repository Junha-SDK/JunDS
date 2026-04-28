/** Border width scale */
export const borderWidth = {
  none: "0px",
  thin: "1px",
  medium: "2px",
  thick: "3px",
  heavy: "4px",
} as const;

export type BorderWidthScale = keyof typeof borderWidth;
