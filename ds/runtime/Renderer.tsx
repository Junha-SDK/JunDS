import { createElement, Fragment, type ReactNode } from "react";

import { runActions, type ActionContext } from "./actions";
import {
  resolvePropValue,
  type Breakpoint,
  type BindingScope,
} from "./bindings";
import {
  defaultRegistry,
  type ComponentRegistry,
  type FallbackRenderer,
} from "./registry";
import type { ActionNode, Node, PageDoc, PropValue } from "./schema";

export type RendererMode = "design" | "runtime";

export type RendererProps = {
  doc: PageDoc;
  registry?: ComponentRegistry;
  /** Variables exposed to `{{ binding }}` expressions. */
  scope?: BindingScope;
  breakpoint?: Breakpoint;
  mode?: RendererMode;
  actions?: ActionContext;
  /** Called once per node in design mode (for hover/select overlays). Ignored in runtime. */
  onDesignEvent?: (event: DesignEvent) => void;
  /** Render hook for unknown componentIds. Defaults to a fragment in runtime, a placeholder in design. */
  renderFallback?: FallbackRenderer;
};

export type DesignEvent =
  | { kind: "select"; nodeId: string }
  | { kind: "hover"; nodeId: string | null };

export function Renderer({
  doc,
  registry = defaultRegistry,
  scope = {},
  breakpoint = "base",
  mode = "runtime",
  actions,
  onDesignEvent,
  renderFallback,
}: RendererProps): ReactNode {
  return createElement(
    Fragment,
    null,
    doc.tree.map((node) =>
      renderNode(node, {
        registry,
        scope,
        breakpoint,
        mode,
        actions,
        onDesignEvent,
        renderFallback,
      }),
    ),
  );
}

type RenderContext = {
  registry: ComponentRegistry;
  scope: BindingScope;
  breakpoint: Breakpoint;
  mode: RendererMode;
  actions?: ActionContext;
  onDesignEvent?: (event: DesignEvent) => void;
  renderFallback?: FallbackRenderer;
};

const HTML_EVENT_PREFIX = /^on[A-Z]/;

function resolveProps(
  rawProps: Record<string, PropValue> | undefined,
  scope: BindingScope,
  breakpoint: Breakpoint,
): Record<string, unknown> {
  if (!rawProps) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawProps)) {
    const resolved = resolvePropValue(value, scope, breakpoint);
    if (resolved !== undefined) out[key] = resolved;
  }
  return out;
}

function buildEventHandlers(
  events: Record<string, ActionNode[]> | undefined,
  ctx: RenderContext,
): Record<string, (...args: unknown[]) => void> {
  if (!events) return {};
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  for (const [eventName, actions] of Object.entries(events)) {
    if (!HTML_EVENT_PREFIX.test(eventName)) continue;
    if (ctx.mode === "design") {
      // In design mode events should not fire (clicking selects nodes instead).
      handlers[eventName] = () => {};
      continue;
    }
    if (!ctx.actions) {
      handlers[eventName] = () => {};
      continue;
    }
    handlers[eventName] = () => {
      void runActions(actions, ctx.actions!);
    };
  }
  return handlers;
}

function renderNode(node: Node, ctx: RenderContext): ReactNode {
  const entry = ctx.registry.get(node.componentId);
  const childrenNodes = renderSlot(node, "default", ctx);
  const childContent: ReactNode = node.children ?? childrenNodes;

  if (!entry) {
    if (ctx.renderFallback) return ctx.renderFallback(node.componentId, childContent);
    if (ctx.mode === "design") {
      return createElement(
        "div",
        {
          key: node.id,
          "data-junds-unknown": node.componentId,
          style: {
            border: "1px dashed #ef4444",
            padding: 8,
            color: "#ef4444",
            fontSize: 12,
          },
        },
        `unknown component: ${node.componentId}`,
      );
    }
    return createElement(Fragment, { key: node.id }, childContent);
  }

  const resolvedProps = resolveProps(node.props, ctx.scope, ctx.breakpoint);
  const handlers = buildEventHandlers(node.events, ctx);

  const previewProps =
    ctx.mode === "design" && entry.previewProps
      ? entry.previewProps()
      : undefined;

  const designProps =
    ctx.mode === "design"
      ? {
          "data-junds-node": node.id,
          onMouseEnterCapture: () =>
            ctx.onDesignEvent?.({ kind: "hover", nodeId: node.id }),
          onMouseLeaveCapture: () =>
            ctx.onDesignEvent?.({ kind: "hover", nodeId: null }),
          onClickCapture: (event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            ctx.onDesignEvent?.({ kind: "select", nodeId: node.id });
          },
        }
      : {};

  const finalProps: Record<string, unknown> = {
    ...previewProps,
    ...resolvedProps,
    ...handlers,
    ...designProps,
    key: node.id,
  };

  const renderTarget: string | typeof entry.Component =
    entry.Component ?? entry.htmlTag ?? "div";

  if (entry.Component) {
    return createElement(
      entry.Component,
      finalProps,
      childContent,
    );
  }

  return createElement(
    typeof renderTarget === "string" ? renderTarget : "div",
    finalProps,
    childContent,
  );
}

function renderSlot(
  node: Node,
  slotName: string,
  ctx: RenderContext,
): ReactNode[] {
  const slotChildren = node.slots?.[slotName];
  if (!slotChildren || slotChildren.length === 0) return [];
  return slotChildren.map((child) => renderNode(child, ctx));
}
