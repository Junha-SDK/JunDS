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
import { EmptyState } from "../composites/EmptyState";
import { ProgressBar } from "../composites/Progress";
import { Result } from "../composites/Result";
import { SegmentedControl } from "../composites/SegmentedControl";
import { Skeleton } from "../composites/Skeleton";
import { StatCard } from "../composites/StatCard";
import { Stepper } from "../composites/Stepper";

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
  /**
   * Design-mode preview defaults. Merged into resolved props **only** when
   * `Renderer` runs in `mode: "design"`. Lets a builder show meaningful
   * preview content (icons, options arrays, hardcoded steps) without putting
   * those defaults into runtime output.
   */
  previewProps?: () => Record<string, unknown>;
};

const cast = <T>(c: T) => c as unknown as ComponentType<Record<string, unknown>>;

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
  { id: "Button", Component: cast(Button), isContainer: false, defaultSlot: "default" },
  { id: "Input", Component: cast(Input), isContainer: false, defaultSlot: "default" },
  { id: "Textarea", Component: cast(Textarea), isContainer: false, defaultSlot: "default" },
  { id: "Badge", Component: cast(Badge), isContainer: false, defaultSlot: "default" },
  { id: "Avatar", Component: cast(Avatar), isContainer: false, defaultSlot: "default" },
  { id: "Spinner", Component: cast(Spinner), isContainer: false, defaultSlot: "default" },
  { id: "Divider", Component: cast(Divider), isContainer: false, defaultSlot: "default" },
  { id: "Toggle", Component: cast(Toggle), isContainer: false, defaultSlot: "default" },
  { id: "Checkbox", Component: cast(Checkbox), isContainer: false, defaultSlot: "default" },
  { id: "Switch", Component: cast(Switch), isContainer: false, defaultSlot: "default" },
  { id: "Slider", Component: cast(Slider), isContainer: false, defaultSlot: "default" },
  { id: "StarRating", Component: cast(StarRating), isContainer: false, defaultSlot: "default" },
  { id: "Tag", Component: cast(Tag), isContainer: false, defaultSlot: "default" },
  { id: "Label", Component: cast(Label), isContainer: false, defaultSlot: "default" },
  { id: "IconButton", Component: cast(IconButton), isContainer: false, defaultSlot: "default" },
  { id: "Kbd", Component: cast(Kbd), isContainer: false, defaultSlot: "default" },
  { id: "StatusDot", Component: cast(StatusDot), isContainer: false, defaultSlot: "default" },
  { id: "Card", Component: cast(Card), isContainer: true, defaultSlot: "default" },
  { id: "Alert", Component: cast(Alert), isContainer: true, defaultSlot: "default" },
  { id: "Skeleton", Component: cast(Skeleton), isContainer: false, defaultSlot: "default" },
  { id: "ProgressBar", Component: cast(ProgressBar), isContainer: false, defaultSlot: "default" },
  { id: "EmptyState", Component: cast(EmptyState), isContainer: false, defaultSlot: "default" },
  { id: "StatCard", Component: cast(StatCard), isContainer: false, defaultSlot: "default" },
  {
    id: "SegmentedControl",
    Component: cast(SegmentedControl),
    isContainer: false,
    defaultSlot: "default",
  },
  { id: "Stepper", Component: cast(Stepper), isContainer: false, defaultSlot: "default" },
  { id: "Result", Component: cast(Result), isContainer: false, defaultSlot: "default" },
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
