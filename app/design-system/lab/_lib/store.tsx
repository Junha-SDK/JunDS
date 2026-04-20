"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { LabState, NodeId, PropValue, TreeNode } from "./types";
import { componentDefMap } from "./registry";

// ─── ID generator ────────────────────────────────────────────────────

let _counter = 0;
function genId(): string {
  return `n${++_counter}_${Date.now()}`;
}

// ─── Actions ─────────────────────────────────────────────────────────

export type Action =
  | { type: "ADD_NODE"; componentId: string; parentId: NodeId | null; index?: number }
  | { type: "MOVE_NODE"; nodeId: NodeId; newParentId: NodeId | null; index: number }
  | { type: "DELETE_NODE"; nodeId: NodeId }
  | { type: "UPDATE_PROP"; nodeId: NodeId; key: string; value: PropValue }
  | { type: "UPDATE_CHILDREN"; nodeId: NodeId; children: string }
  | { type: "SELECT"; nodeId: NodeId | null }
  | { type: "HOVER"; nodeId: NodeId | null }
  | { type: "DUPLICATE_NODE"; nodeId: NodeId }
  | { type: "CLEAR_ALL" };

// ─── Helpers ─────────────────────────────────────────────────────────

function createNode(componentId: string, parentId: NodeId | null): TreeNode {
  const def = componentDefMap.get(componentId);
  const props: Record<string, PropValue> = {};

  if (def) {
    for (const p of def.props) {
      if (p.defaultValue !== undefined) {
        props[p.name] = p.defaultValue;
      }
    }
    if (def.defaultProps) {
      Object.assign(props, def.defaultProps);
    }
  }

  return {
    id: genId(),
    componentId,
    props,
    children: def?.defaultChildren,
    childNodes: [],
    parentId,
  };
}

function deepCloneNode(
  nodeId: NodeId,
  nodes: Record<NodeId, TreeNode>,
  newParentId: NodeId | null,
): { cloned: Record<NodeId, TreeNode>; rootCloneId: NodeId } {
  const original = nodes[nodeId];
  if (!original) return { cloned: {}, rootCloneId: "" };

  const newId = genId();
  const cloned: Record<NodeId, TreeNode> = {};

  const newChildIds: NodeId[] = [];
  for (const childId of original.childNodes) {
    const result = deepCloneNode(childId, nodes, newId);
    Object.assign(cloned, result.cloned);
    newChildIds.push(result.rootCloneId);
  }

  cloned[newId] = {
    id: newId,
    componentId: original.componentId,
    props: { ...original.props },
    children: original.children,
    childNodes: newChildIds,
    parentId: newParentId,
  };

  return { cloned, rootCloneId: newId };
}

function collectDescendants(nodeId: NodeId, nodes: Record<NodeId, TreeNode>): NodeId[] {
  const ids: NodeId[] = [nodeId];
  const node = nodes[nodeId];
  if (node) {
    for (const childId of node.childNodes) {
      ids.push(...collectDescendants(childId, nodes));
    }
  }
  return ids;
}

function insertAtIndex<T>(arr: T[], item: T, index?: number): T[] {
  const result = [...arr];
  if (index !== undefined && index >= 0 && index <= result.length) {
    result.splice(index, 0, item);
  } else {
    result.push(item);
  }
  return result;
}

function removeFromArray<T>(arr: T[], item: T): T[] {
  return arr.filter((v) => v !== item);
}

// ─── Reducer ─────────────────────────────────────────────────────────

const initialState: LabState = {
  nodes: {},
  rootIds: [],
  selectedId: null,
  hoveredId: null,
};

function labReducer(state: LabState, action: Action): LabState {
  switch (action.type) {
    case "ADD_NODE": {
      const node = createNode(action.componentId, action.parentId);
      const nodes = { ...state.nodes, [node.id]: node };

      if (action.parentId && state.nodes[action.parentId]) {
        const parent = { ...state.nodes[action.parentId] };
        parent.childNodes = insertAtIndex(parent.childNodes, node.id, action.index);
        nodes[parent.id] = parent;
        return { ...state, nodes, selectedId: node.id };
      }

      return {
        ...state,
        nodes,
        rootIds: insertAtIndex(state.rootIds, node.id, action.index),
        selectedId: node.id,
      };
    }

    case "MOVE_NODE": {
      const { nodeId, newParentId, index } = action;
      const node = state.nodes[nodeId];
      if (!node) return state;

      const nodes = { ...state.nodes };

      // Remove from old parent
      if (node.parentId && nodes[node.parentId]) {
        const oldParent = { ...nodes[node.parentId] };
        oldParent.childNodes = removeFromArray(oldParent.childNodes, nodeId);
        nodes[oldParent.id] = oldParent;
      }
      const rootIds = node.parentId === null
        ? removeFromArray(state.rootIds, nodeId)
        : [...state.rootIds];

      // Update node's parentId
      nodes[nodeId] = { ...node, parentId: newParentId };

      // Insert into new parent
      if (newParentId && nodes[newParentId]) {
        const newParent = { ...nodes[newParentId] };
        newParent.childNodes = insertAtIndex(newParent.childNodes, nodeId, index);
        nodes[newParent.id] = newParent;
        return { ...state, nodes, rootIds };
      }

      return {
        ...state,
        nodes,
        rootIds: insertAtIndex(rootIds, nodeId, index),
      };
    }

    case "DELETE_NODE": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;

      const toRemove = collectDescendants(action.nodeId, state.nodes);
      const nodes = { ...state.nodes };
      for (const id of toRemove) {
        delete nodes[id];
      }

      // Remove from parent
      if (node.parentId && nodes[node.parentId]) {
        const parent = { ...nodes[node.parentId] };
        parent.childNodes = removeFromArray(parent.childNodes, action.nodeId);
        nodes[parent.id] = parent;
      }

      const rootIds = node.parentId === null
        ? removeFromArray(state.rootIds, action.nodeId)
        : [...state.rootIds];

      const selectedId =
        state.selectedId && toRemove.includes(state.selectedId)
          ? null
          : state.selectedId;
      const hoveredId =
        state.hoveredId && toRemove.includes(state.hoveredId)
          ? null
          : state.hoveredId;

      return { ...state, nodes, rootIds, selectedId, hoveredId };
    }

    case "UPDATE_PROP": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            props: { ...node.props, [action.key]: action.value },
          },
        },
      };
    }

    case "UPDATE_CHILDREN": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: { ...node, children: action.children },
        },
      };
    }

    case "SELECT":
      return { ...state, selectedId: action.nodeId };

    case "HOVER":
      return { ...state, hoveredId: action.nodeId };

    case "DUPLICATE_NODE": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;

      const { cloned, rootCloneId } = deepCloneNode(
        action.nodeId,
        state.nodes,
        node.parentId,
      );
      if (!rootCloneId) return state;

      const nodes = { ...state.nodes, ...cloned };

      if (node.parentId && nodes[node.parentId]) {
        const parent = { ...nodes[node.parentId] };
        const idx = parent.childNodes.indexOf(action.nodeId);
        parent.childNodes = insertAtIndex(
          parent.childNodes,
          rootCloneId,
          idx + 1,
        );
        nodes[parent.id] = parent;
        return { ...state, nodes, selectedId: rootCloneId };
      }

      const idx = state.rootIds.indexOf(action.nodeId);
      return {
        ...state,
        nodes,
        rootIds: insertAtIndex(state.rootIds, rootCloneId, idx + 1),
        selectedId: rootCloneId,
      };
    }

    case "CLEAR_ALL":
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────

interface LabCtx {
  state: LabState;
  dispatch: (action: Action) => void;
}

const LabContext = createContext<LabCtx | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(labReducer, initialState);

  return (
    <LabContext.Provider value={{ state, dispatch }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab(): LabCtx {
  const ctx = useContext(LabContext);
  if (!ctx) {
    throw new Error("useLab must be used within a LabProvider");
  }
  return ctx;
}
