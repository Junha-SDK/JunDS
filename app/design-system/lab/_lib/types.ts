export type NodeId = string;
export type PropValue = string | number | boolean | undefined;

/** A node in the component tree */
export interface TreeNode {
  id: NodeId;
  componentId: string;
  props: Record<string, PropValue>;
  children?: string;
  childNodes: NodeId[];
  parentId: NodeId | null;
}

export interface LabState {
  nodes: Record<NodeId, TreeNode>;
  rootIds: NodeId[];
  selectedId: NodeId | null;
  hoveredId: NodeId | null;
}

export interface PropDef {
  name: string;
  type: "select" | "boolean" | "text" | "number" | "color";
  options?: string[];
  defaultValue: PropValue;
  label?: string;
}

export interface ComponentDef {
  id: string;
  label: string;
  category:
    | "\uB808\uC774\uC544\uC6C3"
    | "\uAE30\uBCF8"
    | "\uC785\uB825"
    | "\uB370\uC774\uD130"
    | "\uD53C\uB4DC\uBC31"
    | "\uC624\uBC84\uB808\uC774"
    | "\uB124\uBE44\uAC8C\uC774\uC158";
  isContainer: boolean;
  props: PropDef[];
  defaultChildren?: string;
  defaultProps?: Record<string, PropValue>;
  icon?: string;
}
