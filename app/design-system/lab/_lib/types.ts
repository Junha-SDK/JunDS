export type NodeId = string;
export type PropValue = string | number | boolean | undefined;
export type LayoutMode = "freeform" | "flow";
export type ViewportPreset = "desktop" | "tablet" | "mobile";

export interface PropDefinition {
  name: string;
  type: "select" | "boolean" | "text" | "number" | "color";
  options?: string[];
  defaultValue: PropValue;
  label?: string;
}

export interface LabComponentDef {
  id: string;
  label: string;
  category: string;
  importPath: string;
  props: PropDefinition[];
  defaultChildren?: string;
  acceptsChildren?: boolean;
  minWidth?: number;
  minHeight?: number;
}

export interface NodeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasNode {
  id: NodeId;
  componentId: string;
  props: Record<string, PropValue>;
  children?: string;
  rect: NodeRect;
  zIndex: number;
}

export interface LabState {
  nodes: Record<NodeId, CanvasNode>;
  selectedIds: NodeId[];
  mode: LayoutMode;
  gridEnabled: boolean;
  gridSize: number;
  viewport: ViewportPreset;
  zoom: number;
  nextZIndex: number;
}

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
