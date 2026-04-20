"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";
import type {
  LabState,
  CanvasNode,
  NodeId,
  PropValue,
  LayoutMode,
  ViewportPreset,
} from "./types";
import { labComponentMap } from "./component-registry";
import {
  createHistory,
  pushState,
  undo as historyUndo,
  redo as historyRedo,
  type HistoryState,
} from "./history";

// ── ID generation ──

let nodeCounter = 0;

function generateId(): string {
  return `node_${++nodeCounter}_${Date.now()}`;
}

// ── Initial state ──

const initialLabState: LabState = {
  nodes: {},
  selectedIds: [],
  mode: "freeform",
  gridEnabled: true,
  gridSize: 8,
  viewport: "desktop",
  zoom: 1,
  nextZIndex: 1,
};

// ── Actions ──

export type LabAction =
  | { type: "ADD_NODE"; componentId: string; x: number; y: number }
  | { type: "MOVE_NODE"; nodeId: NodeId; x: number; y: number }
  | { type: "RESIZE_NODE"; nodeId: NodeId; width: number; height: number }
  | { type: "UPDATE_PROP"; nodeId: NodeId; propName: string; value: PropValue }
  | { type: "UPDATE_CHILDREN"; nodeId: NodeId; children: string }
  | { type: "DELETE_NODES"; nodeIds: NodeId[] }
  | { type: "SELECT"; nodeIds: NodeId[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_MODE"; mode: LayoutMode }
  | { type: "TOGGLE_GRID" }
  | { type: "SET_GRID_SIZE"; size: number }
  | { type: "SET_VIEWPORT"; viewport: ViewportPreset }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "DUPLICATE_NODES"; nodeIds: NodeId[] }
  | { type: "BRING_FORWARD"; nodeId: NodeId }
  | { type: "SEND_BACKWARD"; nodeId: NodeId };

// ── Snap to grid helper ──

function snap(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

// ── Reducer ──

function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "ADD_NODE": {
      const def = labComponentMap.get(action.componentId);
      if (!def) return state;

      const defaultProps: Record<string, PropValue> = {};
      for (const prop of def.props) {
        defaultProps[prop.name] = prop.defaultValue;
      }

      const id = generateId();
      const node: CanvasNode = {
        id,
        componentId: action.componentId,
        props: defaultProps,
        children: def.defaultChildren,
        rect: {
          x: snap(action.x, state.gridSize, state.gridEnabled),
          y: snap(action.y, state.gridSize, state.gridEnabled),
          width: def.minWidth ?? 120,
          height: def.minHeight ?? 40,
        },
        zIndex: state.nextZIndex,
      };

      return {
        ...state,
        nodes: { ...state.nodes, [id]: node },
        selectedIds: [id],
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case "MOVE_NODE": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            rect: {
              ...node.rect,
              x: snap(action.x, state.gridSize, state.gridEnabled),
              y: snap(action.y, state.gridSize, state.gridEnabled),
            },
          },
        },
      };
    }

    case "RESIZE_NODE": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      const def = labComponentMap.get(node.componentId);
      const minW = def?.minWidth ?? 20;
      const minH = def?.minHeight ?? 20;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            rect: {
              ...node.rect,
              width: Math.max(minW, action.width),
              height: Math.max(minH, action.height),
            },
          },
        },
      };
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
            props: { ...node.props, [action.propName]: action.value },
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

    case "DELETE_NODES": {
      const remaining = { ...state.nodes };
      for (const id of action.nodeIds) {
        delete remaining[id];
      }
      return {
        ...state,
        nodes: remaining,
        selectedIds: state.selectedIds.filter(
          (id) => !action.nodeIds.includes(id),
        ),
      };
    }

    case "SELECT":
      return { ...state, selectedIds: action.nodeIds };

    case "CLEAR_SELECTION":
      return { ...state, selectedIds: [] };

    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "TOGGLE_GRID":
      return { ...state, gridEnabled: !state.gridEnabled };

    case "SET_GRID_SIZE":
      return { ...state, gridSize: action.size };

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    case "SET_ZOOM":
      return { ...state, zoom: Math.max(0.25, Math.min(3, action.zoom)) };

    case "DUPLICATE_NODES": {
      const newNodes = { ...state.nodes };
      const newIds: NodeId[] = [];
      let zIndex = state.nextZIndex;

      for (const srcId of action.nodeIds) {
        const src = state.nodes[srcId];
        if (!src) continue;
        const newId = generateId();
        newNodes[newId] = {
          ...src,
          id: newId,
          rect: { ...src.rect, x: src.rect.x + 20, y: src.rect.y + 20 },
          props: { ...src.props },
          zIndex: zIndex++,
        };
        newIds.push(newId);
      }

      return {
        ...state,
        nodes: newNodes,
        selectedIds: newIds,
        nextZIndex: zIndex,
      };
    }

    case "BRING_FORWARD": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: { ...node, zIndex: state.nextZIndex },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case "SEND_BACKWARD": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      // Find the minimum zIndex across all nodes
      const allZ = Object.values(state.nodes).map((n) => n.zIndex);
      const minZ = Math.min(...allZ);
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            zIndex: Math.max(0, minZ - 1),
          },
        },
      };
    }

    default:
      return state;
  }
}

// ── Actions that should NOT create history entries ──

const NON_HISTORY_ACTIONS = new Set<LabAction["type"]>([
  "SELECT",
  "CLEAR_SELECTION",
  "SET_ZOOM",
  "SET_VIEWPORT",
  "TOGGLE_GRID",
  "SET_GRID_SIZE",
  "SET_MODE",
]);

// ── History-wrapped reducer ──

type HistoryAction =
  | LabAction
  | { type: "UNDO" }
  | { type: "REDO" };

function historyReducer(
  history: HistoryState<LabState>,
  action: HistoryAction,
): HistoryState<LabState> {
  if (action.type === "UNDO") {
    return historyUndo(history);
  }
  if (action.type === "REDO") {
    return historyRedo(history);
  }

  const newState = labReducer(history.present, action);

  // Don't push history for selection/view-only changes
  if (NON_HISTORY_ACTIONS.has(action.type)) {
    return { ...history, present: newState };
  }

  return pushState(history, newState);
}

// ── Context ──

interface LabContextValue {
  state: LabState;
  dispatch: (action: LabAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const LabContext = createContext<LabContextValue | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [history, rawDispatch] = useReducer(
    historyReducer,
    initialLabState,
    createHistory,
  );

  const dispatch = useCallback(
    (action: LabAction) => rawDispatch(action),
    [],
  );

  const handleUndo = useCallback(() => rawDispatch({ type: "UNDO" }), []);
  const handleRedo = useCallback(() => rawDispatch({ type: "REDO" }), []);

  const value: LabContextValue = {
    state: history.present,
    dispatch,
    undo: handleUndo,
    redo: handleRedo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };

  return React.createElement(LabContext.Provider, { value }, children);
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used within LabProvider");
  return ctx;
}
