import type { LabState, TokenOverrides, RegionStyle, SlotDef } from "./types";
import { layoutTemplateMap } from "./layout-templates";
import { labComponentMap } from "./component-registry";
import { defaultTokens } from "./lab-store";

export interface GeneratedCode {
  imports: string;
  jsx: string;
  tokens: string;
  full: string;
}

// ── Helpers ──

function indent(text: string, level: number): string {
  const pad = "  ".repeat(level);
  return text
    .split("\n")
    .map((line) => (line.trim() ? pad + line : ""))
    .join("\n");
}

function formatPropValue(value: string | number | boolean | undefined): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return `{${value}}`;
  if (typeof value === "number") return `{${value}}`;
  return `"${value}"`;
}

function buildPropsString(
  componentId: string,
  props: Record<string, string | number | boolean | undefined>,
): string {
  const def = labComponentMap.get(componentId);
  const parts: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;

    // Skip if value equals the component's default
    if (def) {
      const propDef = def.props.find((p) => p.name === key);
      if (propDef && propDef.defaultValue === value) continue;
    }

    if (typeof value === "boolean") {
      parts.push(value ? key : `${key}={false}`);
    } else {
      parts.push(`${key}=${formatPropValue(value)}`);
    }
  }

  return parts.length > 0 ? " " + parts.join(" ") : "";
}

function renderSlot(slot: SlotDef): string {
  const propsStr = buildPropsString(slot.componentId, slot.props);
  const def = labComponentMap.get(slot.componentId);

  if (slot.children) {
    return `<${slot.componentId}${propsStr}>${slot.children}</${slot.componentId}>`;
  }
  if (def?.acceptsChildren && def.defaultChildren) {
    return `<${slot.componentId}${propsStr}>${def.defaultChildren}</${slot.componentId}>`;
  }
  return `<${slot.componentId}${propsStr} />`;
}

function styleToInline(style: RegionStyle): string {
  const parts: string[] = [];
  parts.push(`display: "flex"`);
  parts.push(`flexDirection: "${style.flexDirection}"`);
  parts.push(`alignItems: "${style.alignItems}"`);
  parts.push(`justifyContent: "${style.justifyContent}"`);
  parts.push(`padding: "${style.padding}"`);
  parts.push(`gap: "${style.gap}"`);
  if (style.backgroundColor !== "white") {
    parts.push(`backgroundColor: "${style.backgroundColor}"`);
  }
  return parts.join(", ");
}

// ── Token CSS variable generation ──

function generateTokenCSS(tokens: TokenOverrides): string {
  const vars: string[] = [];

  if (tokens.primary !== defaultTokens.primary) {
    vars.push(`  --ds-color-primary: ${tokens.primary};`);
  }
  if (tokens.accent !== defaultTokens.accent) {
    vars.push(`  --ds-color-accent: ${tokens.accent};`);
  }
  if (tokens.danger !== defaultTokens.danger) {
    vars.push(`  --ds-color-danger: ${tokens.danger};`);
  }
  if (tokens.success !== defaultTokens.success) {
    vars.push(`  --ds-color-success: ${tokens.success};`);
  }
  if (tokens.warning !== defaultTokens.warning) {
    vars.push(`  --ds-color-warning: ${tokens.warning};`);
  }

  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
  };
  if (tokens.radius !== defaultTokens.radius) {
    vars.push(`  --ds-radius: ${radiusMap[tokens.radius] ?? tokens.radius};`);
  }

  const shadowMap: Record<string, string> = {
    none: "none",
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.1)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  };
  if (tokens.shadow !== defaultTokens.shadow) {
    vars.push(`  --ds-shadow: ${shadowMap[tokens.shadow] ?? tokens.shadow};`);
  }

  if (tokens.spacingBase !== defaultTokens.spacingBase) {
    vars.push(`  --ds-spacing-base: ${tokens.spacingBase}px;`);
  }

  if (tokens.fontFamily !== defaultTokens.fontFamily) {
    vars.push(`  --ds-font-family: ${tokens.fontFamily};`);
  }

  if (vars.length === 0) return "";

  return `:root {\n${vars.join("\n")}\n}`;
}

// ── Main generator ──

export function generateCode(state: LabState): GeneratedCode {
  const template = layoutTemplateMap.get(state.templateId);
  if (!template) return { imports: "", jsx: "", tokens: "", full: "" };

  // 1. Collect unique component IDs from all regions
  const componentIds = new Set<string>();
  for (const regionId of Object.keys(state.regions)) {
    const region = state.regions[regionId];
    for (const slot of region.slots) {
      componentIds.add(slot.componentId);
    }
  }

  // Group imports by import path
  const importsByPath = new Map<string, Set<string>>();
  for (const id of componentIds) {
    const def = labComponentMap.get(id);
    if (!def) continue;
    const path = def.importPath;
    if (!importsByPath.has(path)) importsByPath.set(path, new Set());
    importsByPath.get(path)!.add(id);
  }

  const importLines: string[] = [];
  for (const [path, components] of importsByPath) {
    const sorted = [...components].sort();
    importLines.push(`import { ${sorted.join(", ")} } from "${path}";`);
  }
  const imports = importLines.join("\n");

  // 2. Generate grid container
  const gridStyle = [
    `display: "grid"`,
    `gridTemplateAreas: '${template.gridTemplate}'`,
    `gridTemplateColumns: "${template.gridColumns}"`,
    `gridTemplateRows: "${template.gridRows}"`,
    `minHeight: "100vh"`,
  ].join(", ");

  // 3. Generate region elements
  const regionJSXLines: string[] = [];
  for (const regionDef of template.regions) {
    const regionState = state.regions[regionDef.id];
    if (!regionState) continue;

    const tag = regionDef.tag;
    const regionStyle = `gridArea: "${regionDef.gridArea}", ${styleToInline(regionState.style)}`;

    const slotLines = regionState.slots.map((slot) => renderSlot(slot));

    if (slotLines.length === 0) {
      regionJSXLines.push(`      <${tag} style={{ ${regionStyle} }} />`);
    } else {
      regionJSXLines.push(`      <${tag} style={{ ${regionStyle} }}>`);
      for (const line of slotLines) {
        regionJSXLines.push(`        ${line}`);
      }
      regionJSXLines.push(`      </${tag}>`);
    }
  }

  // 4. Build JSX
  const jsx = [
    `    <div style={{ ${gridStyle} }}>`,
    ...regionJSXLines,
    `    </div>`,
  ].join("\n");

  // 5. Generate token overrides
  const tokens = generateTokenCSS(state.tokens);

  // 6. Full component
  const fullLines: string[] = [];
  fullLines.push(imports);
  fullLines.push("");

  if (tokens) {
    fullLines.push("/* Add to your global CSS:");
    fullLines.push(tokens);
    fullLines.push("*/");
    fullLines.push("");
  }

  fullLines.push(`export default function ${capitalize(state.templateId)}Layout() {`);
  fullLines.push("  return (");
  fullLines.push(jsx);
  fullLines.push("  );");
  fullLines.push("}");

  const full = fullLines.join("\n");

  return { imports, jsx, tokens, full };
}

function capitalize(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
