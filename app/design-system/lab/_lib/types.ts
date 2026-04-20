export type PropValue = string | number | boolean | undefined;
export type ViewportPreset = "desktop" | "tablet" | "mobile";

export interface ViewportSize {
  width: number;
  height: number;
  label: string;
}

export const viewportSizes: Record<ViewportPreset, ViewportSize> = {
  desktop: { width: 1280, height: 800, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  mobile: { width: 375, height: 812, label: "Mobile" },
};

export interface SlotDef {
  id: string;
  componentId: string;
  props: Record<string, PropValue>;
  children?: string;
}

export interface RegionDef {
  id: string;
  label: string;
  gridArea: string;
  tag: string; // "header" | "aside" | "main" | "footer" | "section" | "div"
  defaultStyle: RegionStyle;
  defaultSlots: SlotDef[];
}

export interface LayoutTemplate {
  id: string;
  label: string;
  description: string;
  regions: RegionDef[];
  gridTemplate: string;
  gridColumns: string;
  gridRows: string;
}

export interface RegionStyle {
  backgroundColor: string;
  padding: string;
  gap: string;
  flexDirection: "row" | "column";
  alignItems: string;
  justifyContent: string;
}

export interface TokenOverrides {
  primary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  radius: string; // "none" | "sm" | "md" | "lg" | "xl" | "2xl"
  shadow: string; // "none" | "xs" | "sm" | "md" | "lg"
  spacingBase: number;
  fontFamily: string;
}

export interface RegionState {
  style: RegionStyle;
  slots: SlotDef[];
}

export interface LabState {
  templateId: string;
  regions: Record<string, RegionState>;
  tokens: TokenOverrides;
  viewport: ViewportPreset;
  selectedRegionId: string | null;
  selectedSlotId: string | null;
}

// ── Component registry types ──

export interface PropDef {
  name: string;
  type: "text" | "number" | "boolean" | "select" | "color";
  defaultValue?: PropValue;
  options?: string[];
  label?: string;
}

export interface LabComponentDef {
  id: string;
  label: string;
  category: string;
  importPath: string;
  props: PropDef[];
  defaultChildren?: string;
  acceptsChildren?: boolean;
  minWidth: number;
  minHeight: number;
}
