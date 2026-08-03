import type { Node, PageDoc } from "@/ds/runtime";
import type { LabState, NodeId, PropValue, TreeNode } from "./types";

const DEFAULT_PAGE_ID = "lab";
const DEFAULT_ROUTE = "/";

function nodeToPageNode(state: LabState, id: NodeId): Node | null {
  const tn = state.nodes[id];
  if (!tn) return null;
  const props = sanitizeProps(tn.props);
  const childNodes = tn.childNodes
    .map((childId) => nodeToPageNode(state, childId))
    .filter((n): n is Node => n !== null);
  const node: Node = {
    id: tn.id,
    componentId: tn.componentId,
  };
  if (props && Object.keys(props).length > 0) node.props = props;
  if (tn.children !== undefined && tn.children !== "") node.children = tn.children;
  if (childNodes.length > 0) node.slots = { default: childNodes };
  return node;
}

function sanitizeProps(
  raw: Record<string, PropValue>,
): Record<string, string | number | boolean> | undefined {
  if (!raw) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export function serialize(state: LabState, options?: { id?: string; route?: string }): PageDoc {
  const tree = state.rootIds
    .map((id) => nodeToPageNode(state, id))
    .filter((n): n is Node => n !== null);
  return {
    schemaVersion: 1,
    id: options?.id ?? DEFAULT_PAGE_ID,
    route: options?.route ?? DEFAULT_ROUTE,
    tree,
  };
}

let _idCounter = 0;
function nextId(): string {
  return `lab_${++_idCounter}_${Date.now()}`;
}

function pageNodeToTree(
  node: Node,
  parentId: NodeId | null,
  out: Record<NodeId, TreeNode>,
): NodeId {
  const id = node.id || nextId();
  const childIds: NodeId[] = [];
  const slotChildren = node.slots?.default ?? [];
  for (const child of slotChildren) {
    childIds.push(pageNodeToTree(child, id, out));
  }
  const props: Record<string, PropValue> = {};
  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        props[key] = value;
      }
    }
  }
  out[id] = {
    id,
    componentId: node.componentId,
    props,
    children: node.children,
    childNodes: childIds,
    parentId,
  };
  return id;
}

export function deserialize(doc: PageDoc): LabState {
  const nodes: Record<NodeId, TreeNode> = {};
  const rootIds: NodeId[] = doc.tree.map((node) => pageNodeToTree(node, null, nodes));
  return {
    nodes,
    rootIds,
    selectedId: null,
    hoveredId: null,
  };
}
