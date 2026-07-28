import type { LabState, NodeId, TreeNode, PropValue } from "./types";
import { componentDefMap } from "./registry";

// ─── Layout HTML tags ────────────────────────────────────────────────

const LAYOUT_TAGS = new Set(["div", "section", "header", "footer", "main", "aside", "nav"]);

// ─── Tailwind mapping helpers ────────────────────────────────────────

const paddingMap: Record<string, string> = {
  "0": "",
  "4": "p-1",
  "8": "p-2",
  "16": "p-4",
  "24": "p-6",
  "32": "p-8",
  "48": "p-12",
};

const gapMap: Record<string, string> = {
  "0": "",
  "2": "gap-0.5",
  "4": "gap-1",
  "8": "gap-2",
  "12": "gap-3",
  "16": "gap-4",
  "24": "gap-6",
};

const displayMap: Record<string, string> = {
  flex: "flex",
  grid: "grid",
  block: "",
};

const flexDirectionMap: Record<string, string> = {
  row: "",
  column: "flex-col",
};

const alignItemsMap: Record<string, string> = {
  stretch: "",
  center: "items-center",
  start: "items-start",
  end: "items-end",
};

const justifyContentMap: Record<string, string> = {
  start: "",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

const gridColsMap: Record<string, string> = {
  "1": "",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
  "6": "grid-cols-6",
};

function buildLayoutClassName(props: Record<string, PropValue>): string {
  const classes: string[] = [];

  const display = String(props.display ?? "flex");
  const cls = displayMap[display];
  if (cls) classes.push(cls);

  if (display === "flex") {
    const dir = flexDirectionMap[String(props.flexDirection ?? "row")];
    if (dir) classes.push(dir);

    const align = alignItemsMap[String(props.alignItems ?? "stretch")];
    if (align) classes.push(align);

    const justify = justifyContentMap[String(props.justifyContent ?? "start")];
    if (justify) classes.push(justify);
  }

  if (display === "grid") {
    const cols = gridColsMap[String(props.gridCols ?? "1")];
    if (cols) classes.push(cols);
  }

  const pad = paddingMap[String(props.padding ?? "0")];
  if (pad) classes.push(pad);

  const gap = gapMap[String(props.gap ?? "0")];
  if (gap) classes.push(gap);

  if (props.className && typeof props.className === "string") {
    classes.push(props.className);
  }

  return classes.filter(Boolean).join(" ");
}

// ─── JSX rendering ──────────────────────────────────────────────────

function indent(level: number): string {
  return "    " + "  ".repeat(level);
}

function formatPropValue(value: PropValue): string {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number") return `{${value}}`;
  if (typeof value === "boolean") return value ? "" : `{false}`;
  return '""';
}

function renderNode(nodeId: NodeId, state: LabState, depth: number, imports: Set<string>): string {
  const node = state.nodes[nodeId];
  if (!node) return "";

  const def = componentDefMap.get(node.componentId);
  const isLayout = LAYOUT_TAGS.has(node.componentId);
  const tag = isLayout ? node.componentId : node.componentId;
  const pad = indent(depth);

  // Collect non-default props
  const propEntries: string[] = [];

  if (isLayout) {
    const className = buildLayoutClassName(node.props);
    if (className) {
      propEntries.push(`className="${className}"`);
    }
    // Background color as inline style
    if (node.props.backgroundColor) {
      propEntries.push(`style={{ backgroundColor: "${node.props.backgroundColor}" }}`);
    }
  } else {
    // Track import for DS components
    if (!isLayout) {
      imports.add(node.componentId);
    }

    // Emit non-default props
    if (def) {
      for (const propDef of def.props) {
        const val = node.props[propDef.name];
        if (val === undefined || val === propDef.defaultValue) continue;

        if (typeof val === "boolean") {
          if (val) {
            propEntries.push(propDef.name);
          } else {
            propEntries.push(`${propDef.name}={false}`);
          }
        } else {
          propEntries.push(`${propDef.name}=${formatPropValue(val)}`);
        }
      }
    } else {
      // No def, emit all truthy props
      for (const [key, val] of Object.entries(node.props)) {
        if (val === undefined) continue;
        if (typeof val === "boolean") {
          if (val) propEntries.push(key);
        } else {
          propEntries.push(`${key}=${formatPropValue(val)}`);
        }
      }
    }
  }

  const propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";

  // Determine children
  const hasChildNodes = node.childNodes.length > 0;
  const hasTextChildren = node.children !== undefined && node.children !== "";

  if (!hasChildNodes && !hasTextChildren) {
    return `${pad}<${tag}${propsStr} />`;
  }

  if (hasChildNodes) {
    const childLines = node.childNodes
      .map((cid) => renderNode(cid, state, depth + 1, imports))
      .filter(Boolean)
      .join("\n");
    return `${pad}<${tag}${propsStr}>\n${childLines}\n${pad}</${tag}>`;
  }

  // Text children
  return `${pad}<${tag}${propsStr}>${node.children}</${tag}>`;
}

// ─── Public API ─────────────────────────────────────────────────────

export function generateCode(state: LabState): string {
  if (state.rootIds.length === 0) {
    return `export function Page() {\n  return null;\n}`;
  }

  const imports = new Set<string>();
  const bodyLines = state.rootIds
    .map((id) => renderNode(id, state, 0, imports))
    .filter(Boolean)
    .join("\n");

  const lines: string[] = [];

  // Import statement
  if (imports.size > 0) {
    const sorted = Array.from(imports).sort();
    lines.push(`import { ${sorted.join(", ")} } from "@/ds";`);
    lines.push("");
  }

  lines.push("export function Page() {");
  lines.push("  return (");

  // Wrap in fragment if multiple root nodes
  if (state.rootIds.length > 1) {
    lines.push("    <>");
    lines.push(bodyLines);
    lines.push("    </>");
  } else {
    lines.push(bodyLines);
  }

  lines.push("  );");
  lines.push("}");

  return lines.join("\n");
}
