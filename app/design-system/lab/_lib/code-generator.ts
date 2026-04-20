import type { LabState, CanvasNode } from "./types";
import { labComponentMap } from "./component-registry";

export interface GeneratedCode {
  imports: string;
  jsx: string;
  full: string;
}

function formatPropValue(
  name: string,
  value: string | number | boolean | undefined,
): string | null {
  if (value === undefined) return null;
  if (typeof value === "boolean") {
    return value ? name : null; // true => just name, false => omit
  }
  if (typeof value === "number") {
    return `${name}={${value}}`;
  }
  // string
  return `${name}="${value}"`;
}

function generateNodeJsx(node: CanvasNode, freeform: boolean): string {
  const def = labComponentMap.get(node.componentId);
  const tag = node.componentId;

  // Build props string
  const propParts: string[] = [];

  if (def) {
    for (const propDef of def.props) {
      const value = node.props[propDef.name];
      // Skip props that equal their default value
      if (value === propDef.defaultValue) continue;
      const formatted = formatPropValue(propDef.name, value);
      if (formatted) propParts.push(formatted);
    }
  } else {
    // No def found, emit all non-undefined props
    for (const [key, value] of Object.entries(node.props)) {
      if (value === undefined) continue;
      const formatted = formatPropValue(key, value);
      if (formatted) propParts.push(formatted);
    }
  }

  // Add positioning style for freeform mode
  if (freeform) {
    const style = `{{ position: "absolute", left: ${node.rect.x}, top: ${node.rect.y}, width: ${node.rect.width}, height: ${node.rect.height} }}`;
    propParts.push(`style={${style}}`);
  }

  const propsStr = propParts.length > 0 ? " " + propParts.join(" ") : "";

  const hasChildren =
    node.children !== undefined &&
    node.children !== "" &&
    def?.acceptsChildren !== false;

  if (hasChildren) {
    return `<${tag}${propsStr}>${node.children}</${tag}>`;
  }
  return `<${tag}${propsStr} />`;
}

export function generateCode(state: LabState): GeneratedCode {
  const nodes = Object.values(state.nodes);

  if (nodes.length === 0) {
    return {
      imports: "",
      jsx: "{/* Empty canvas */}",
      full: "// No components on canvas",
    };
  }

  // 1. Collect unique component IDs and group by import path
  const componentIds = new Set<string>();
  for (const node of nodes) {
    componentIds.add(node.componentId);
  }

  // Group by importPath
  const importGroups = new Map<string, string[]>();
  for (const cid of componentIds) {
    const def = labComponentMap.get(cid);
    const path = def?.importPath ?? "@/ds";
    if (!importGroups.has(path)) {
      importGroups.set(path, []);
    }
    importGroups.get(path)!.push(cid);
  }

  // 2. Generate import lines
  const importLines: string[] = [];
  for (const [path, names] of importGroups) {
    const sorted = [...names].sort();
    importLines.push(`import { ${sorted.join(", ")} } from "${path}";`);
  }
  const imports = importLines.join("\n");

  // 3. Sort nodes by zIndex for rendering order
  const sortedNodes = [...nodes].sort((a, b) => a.zIndex - b.zIndex);

  // 4. Generate JSX
  const isFreeform = state.mode === "freeform";

  const nodeJsxLines = sortedNodes.map((node) =>
    generateNodeJsx(node, isFreeform),
  );

  let jsx: string;
  if (isFreeform) {
    const inner = nodeJsxLines.map((line) => "      " + line).join("\n");
    jsx = `    <div style={{ position: "relative", width: "100%", minHeight: 400 }}>\n${inner}\n    </div>`;
  } else {
    const inner = nodeJsxLines.map((line) => "      " + line).join("\n");
    jsx = `    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>\n${inner}\n    </div>`;
  }

  // 5. Full component
  const full = `${imports}

export default function LabPreview() {
  return (
${jsx}
  );
}`;

  return { imports, jsx, full };
}
