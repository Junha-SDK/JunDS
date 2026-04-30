import type { ComponentType, ReactNode } from "react";

import { Avatar } from "../primitives/Avatar";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import { Divider } from "../primitives/Divider";
import { IconButton } from "../primitives/IconButton";
import { Input } from "../primitives/Input";
import { Kbd } from "../primitives/Kbd";
import { Label } from "../primitives/Label";
import { Slider } from "../primitives/Slider";
import { Spinner } from "../primitives/Spinner";
import { StarRating } from "../primitives/StarRating";
import { StatusDot } from "../primitives/StatusDot";
import { Switch } from "../primitives/Switch";
import { Tag } from "../primitives/Tag";
import { Textarea } from "../primitives/Textarea";
import { Toggle } from "../primitives/Toggle";
import { Alert } from "../composites/Alert";
import { Card } from "../composites/Card";

export type SlotName = string;

export type ComponentEntry = {
  /** Stable id used in `Node.componentId`. PascalCase for DS components, lowercase HTML tag for layout. */
  id: string;
  /** The actual React component, or `null` for native HTML tags. */
  Component: ComponentType<Record<string, unknown>> | null;
  /** Native HTML tag name when `Component` is null (`div`, `section`, etc.). */
  htmlTag?: string;
  /** Whether children/slot rendering is supported. Layout tags + Card + Alert are containers. */
  isContainer: boolean;
  /**
   * Default slot name when child nodes are placed without an explicit slot.
   * Most components use the conventional `"default"` slot.
   */
  defaultSlot: SlotName;
};

const layoutTags = ["div", "section", "header", "footer", "main", "aside", "nav"] as const;

const layoutEntries: ComponentEntry[] = layoutTags.map((tag) => ({
  id: tag,
  Component: null,
  htmlTag: tag,
  isContainer: true,
  defaultSlot: "default",
}));

const componentEntries: ComponentEntry[] = [
  ...layoutEntries,
  { id: "Button", Component: Button as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Input", Component: Input as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Textarea", Component: Textarea as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Badge", Component: Badge as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Avatar", Component: Avatar as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Spinner", Component: Spinner as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Divider", Component: Divider as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Toggle", Component: Toggle as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Checkbox", Component: Checkbox as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Switch", Component: Switch as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Slider", Component: Slider as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "StarRating", Component: StarRating as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Tag", Component: Tag as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Label", Component: Label as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "IconButton", Component: IconButton as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Kbd", Component: Kbd as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "StatusDot", Component: StatusDot as ComponentType<Record<string, unknown>>, isContainer: false, defaultSlot: "default" },
  { id: "Card", Component: Card as ComponentType<Record<string, unknown>>, isContainer: true, defaultSlot: "default" },
  { id: "Alert", Component: Alert as ComponentType<Record<string, unknown>>, isContainer: true, defaultSlot: "default" },
];

const entryMap = new Map<string, ComponentEntry>(
  componentEntries.map((entry) => [entry.id, entry]),
);

export type ComponentRegistry = {
  get(id: string): ComponentEntry | undefined;
  has(id: string): boolean;
  list(): ComponentEntry[];
  register(entry: ComponentEntry): void;
};

export const defaultRegistry: ComponentRegistry = {
  get(id) {
    return entryMap.get(id);
  },
  has(id) {
    return entryMap.has(id);
  },
  list() {
    return Array.from(entryMap.values());
  },
  register(entry) {
    entryMap.set(entry.id, entry);
  },
};

export function createRegistry(entries: ComponentEntry[] = []): ComponentRegistry {
  const map = new Map<string, ComponentEntry>(entries.map((e) => [e.id, e]));
  return {
    get: (id) => map.get(id),
    has: (id) => map.has(id),
    list: () => Array.from(map.values()),
    register: (entry) => {
      map.set(entry.id, entry);
    },
  };
}

export type FallbackRenderer = (id: string, children?: ReactNode) => ReactNode;
