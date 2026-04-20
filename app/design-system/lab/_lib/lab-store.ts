"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import React from "react";
import type {
  LabState,
  RegionState,
  RegionStyle,
  TokenOverrides,
  ViewportPreset,
  PropValue,
} from "./types";
import { layoutTemplateMap } from "./layout-templates";
import { createHistory, pushState, undo, redo, type HistoryState } from "./history";

// ── Default tokens ──

export const defaultTokens: TokenOverrides = {
  primary: "#5b4cc7",
  accent: "#7c5ce7",
  danger: "#dc3f3f",
  success: "#2f8f57",
  warning: "#b7791f",
  radius: "md",
  shadow: "sm",
  spacingBase: 4,
  fontFamily: "system-ui",
};

// ── Initial state ──

const initialLabState: LabState = {
  templateId: "",
  regions: {},
  tokens: { ...defaultTokens },
  viewport: "desktop",
  selectedRegionId: null,
  selectedSlotId: null,
};

// ── Actions ──

type LabAction =
  | { type: "LOAD_TEMPLATE"; templateId: string }
  | { type: "SET_VIEWPORT"; viewport: ViewportPreset }
  | { type: "SELECT_REGION"; regionId: string | null }
  | { type: "SELECT_SLOT"; slotId: string | null }
  | { type: "UPDATE_REGION_STYLE"; regionId: string; key: keyof RegionStyle; value: string }
  | { type: "ADD_SLOT"; regionId: string; componentId: string }
  | { type: "REMOVE_SLOT"; regionId: string; slotId: string }
  | { type: "UPDATE_SLOT_PROP"; regionId: string; slotId: string; propName: string; value: PropValue }
  | { type: "UPDATE_SLOT_CHILDREN"; regionId: string; slotId: string; children: string | undefined }
  | { type: "MOVE_SLOT"; regionId: string; slotId: string; direction: "up" | "down" }
  | { type: "UPDATE_TOKEN"; key: keyof TokenOverrides; value: string | number }
  | { type: "CLEAR_SELECTION" }
  | { type: "UNDO" }
  | { type: "REDO" };

// ── Slot ID generator ──

let _nextSlotId = 1000;
function generateSlotId(): string {
  return `slot_${++_nextSlotId}`;
}

// ── Reducer (operates on LabState) ──

function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "LOAD_TEMPLATE": {
      const template = layoutTemplateMap.get(action.templateId);
      if (!template) return state;

      const regions: Record<string, RegionState> = {};
      for (const region of template.regions) {
        regions[region.id] = {
          style: { ...region.defaultStyle },
          slots: region.defaultSlots.map((s) => ({
            ...s,
            props: { ...s.props },
          })),
        };
      }

      return {
        templateId: action.templateId,
        regions,
        tokens: { ...defaultTokens },
        viewport: state.viewport,
        selectedRegionId: null,
        selectedSlotId: null,
      };
    }

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    case "SELECT_REGION":
      return { ...state, selectedRegionId: action.regionId, selectedSlotId: null };

    case "SELECT_SLOT":
      return { ...state, selectedSlotId: action.slotId };

    case "CLEAR_SELECTION":
      return { ...state, selectedRegionId: null, selectedSlotId: null };

    case "UPDATE_REGION_STYLE": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: {
            ...region,
            style: { ...region.style, [action.key]: action.value },
          },
        },
      };
    }

    case "ADD_SLOT": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      const newSlot = {
        id: generateSlotId(),
        componentId: action.componentId,
        props: {},
        children: undefined,
      };
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: {
            ...region,
            slots: [...region.slots, newSlot],
          },
        },
      };
    }

    case "REMOVE_SLOT": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: {
            ...region,
            slots: region.slots.filter((s) => s.id !== action.slotId),
          },
        },
        selectedSlotId:
          state.selectedSlotId === action.slotId ? null : state.selectedSlotId,
      };
    }

    case "UPDATE_SLOT_PROP": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: {
            ...region,
            slots: region.slots.map((s) =>
              s.id === action.slotId
                ? { ...s, props: { ...s.props, [action.propName]: action.value } }
                : s,
            ),
          },
        },
      };
    }

    case "UPDATE_SLOT_CHILDREN": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: {
            ...region,
            slots: region.slots.map((s) =>
              s.id === action.slotId ? { ...s, children: action.children } : s,
            ),
          },
        },
      };
    }

    case "MOVE_SLOT": {
      const region = state.regions[action.regionId];
      if (!region) return state;
      const idx = region.slots.findIndex((s) => s.id === action.slotId);
      if (idx === -1) return state;
      const newIdx = action.direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= region.slots.length) return state;
      const newSlots = [...region.slots];
      [newSlots[idx], newSlots[newIdx]] = [newSlots[newIdx], newSlots[idx]];
      return {
        ...state,
        regions: {
          ...state.regions,
          [action.regionId]: { ...region, slots: newSlots },
        },
      };
    }

    case "UPDATE_TOKEN":
      return {
        ...state,
        tokens: { ...state.tokens, [action.key]: action.value },
      };

    default:
      return state;
  }
}

// ── History-aware wrapper reducer ──

interface HistoryWrappedState {
  history: HistoryState<LabState>;
}

function historyReducer(
  state: HistoryWrappedState,
  action: LabAction,
): HistoryWrappedState {
  if (action.type === "UNDO") {
    return { history: undo(state.history) };
  }
  if (action.type === "REDO") {
    return { history: redo(state.history) };
  }

  const newLabState = labReducer(state.history.present, action);
  if (newLabState === state.history.present) return state;

  // Non-history actions (viewport, selection) don't push to undo stack
  const noHistory =
    action.type === "SET_VIEWPORT" ||
    action.type === "SELECT_REGION" ||
    action.type === "SELECT_SLOT" ||
    action.type === "CLEAR_SELECTION";

  if (noHistory) {
    return { history: { ...state.history, present: newLabState } };
  }

  return { history: pushState(state.history, newLabState) };
}

// ── Context ──

interface LabContextValue {
  state: LabState;
  dispatch: React.Dispatch<LabAction>;
  canUndo: boolean;
  canRedo: boolean;
}

const LabContext = createContext<LabContextValue | null>(null);

// ── Provider ──

export function LabProvider({ children }: { children: ReactNode }) {
  const [wrapped, dispatch] = useReducer(historyReducer, {
    history: createHistory(initialLabState),
  });

  const value = useMemo<LabContextValue>(
    () => ({
      state: wrapped.history.present,
      dispatch,
      canUndo: wrapped.history.past.length > 0,
      canRedo: wrapped.history.future.length > 0,
    }),
    [wrapped, dispatch],
  );

  return React.createElement(LabContext.Provider, { value }, children);
}

// ── Hook ──

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) {
    throw new Error("useLab must be used within a <LabProvider>");
  }
  return ctx;
}
