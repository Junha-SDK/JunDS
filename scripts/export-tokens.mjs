#!/usr/bin/env node

/**
 * JunDS Token Export — Figma-compatible JSON
 * Usage: node scripts/export-tokens.mjs > tokens.json
 */

const tokens = {
  color: {
    primary: { value: "#5b4cc7", type: "color" },
    "primary-hover": { value: "#4a3db5", type: "color" },
    "primary-light": { value: "#ede9fc", type: "color" },
    accent: { value: "#7c6cd9", type: "color" },
    danger: { value: "#dc3f3f", type: "color" },
    success: { value: "#2da44e", type: "color" },
    warning: { value: "#d4a72c", type: "color" },
    info: { value: "#3b82f6", type: "color" },
    background: { value: "#ffffff", type: "color" },
    foreground: { value: "#1a1a2e", type: "color" },
    border: { value: "#e5e5eb", type: "color" },
    muted: { value: "#6b7280", type: "color" },
  },
  spacing: {
    0: { value: "0px", type: "spacing" },
    1: { value: "4px", type: "spacing" },
    2: { value: "8px", type: "spacing" },
    3: { value: "12px", type: "spacing" },
    4: { value: "16px", type: "spacing" },
    5: { value: "20px", type: "spacing" },
    6: { value: "24px", type: "spacing" },
    8: { value: "32px", type: "spacing" },
    10: { value: "40px", type: "spacing" },
    12: { value: "48px", type: "spacing" },
    16: { value: "64px", type: "spacing" },
    20: { value: "80px", type: "spacing" },
    24: { value: "96px", type: "spacing" },
  },
  borderRadius: {
    none: { value: "0px", type: "borderRadius" },
    xs: { value: "4px", type: "borderRadius" },
    sm: { value: "6px", type: "borderRadius" },
    md: { value: "8px", type: "borderRadius" },
    lg: { value: "12px", type: "borderRadius" },
    xl: { value: "16px", type: "borderRadius" },
    "2xl": { value: "20px", type: "borderRadius" },
    full: { value: "9999px", type: "borderRadius" },
  },
  fontSize: {
    xs: { value: "12px", type: "fontSizes" },
    sm: { value: "14px", type: "fontSizes" },
    md: { value: "16px", type: "fontSizes" },
    lg: { value: "18px", type: "fontSizes" },
    xl: { value: "20px", type: "fontSizes" },
    "2xl": { value: "24px", type: "fontSizes" },
    "3xl": { value: "30px", type: "fontSizes" },
    "4xl": { value: "36px", type: "fontSizes" },
    "5xl": { value: "48px", type: "fontSizes" },
  },
  fontWeight: {
    normal: { value: "400", type: "fontWeights" },
    medium: { value: "500", type: "fontWeights" },
    semibold: { value: "600", type: "fontWeights" },
    bold: { value: "700", type: "fontWeights" },
    extrabold: { value: "800", type: "fontWeights" },
  },
  lineHeight: {
    none: { value: "1", type: "lineHeights" },
    tight: { value: "1.25", type: "lineHeights" },
    snug: { value: "1.375", type: "lineHeights" },
    normal: { value: "1.5", type: "lineHeights" },
    relaxed: { value: "1.625", type: "lineHeights" },
    loose: { value: "2", type: "lineHeights" },
  },
  shadow: {
    xs: { value: "0 1px 2px rgba(0,0,0,0.05)", type: "boxShadow" },
    sm: { value: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", type: "boxShadow" },
    md: { value: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)", type: "boxShadow" },
    lg: { value: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)", type: "boxShadow" },
    xl: { value: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)", type: "boxShadow" },
  },
  zIndex: {
    base: { value: "0", type: "other" },
    dropdown: { value: "1000", type: "other" },
    sticky: { value: "1100", type: "other" },
    overlay: { value: "1300", type: "other" },
    modal: { value: "1400", type: "other" },
    popover: { value: "1500", type: "other" },
    toast: { value: "1600", type: "other" },
    tooltip: { value: "1700", type: "other" },
  },
};

console.log(JSON.stringify(tokens, null, 2));
