import type { ActionNode } from "./schema";

export type ActionContext = {
  navigate?: (to: string) => void;
  openModal?: (modalId: string) => void;
  closeModal?: (modalId?: string) => void;
  setState?: (path: string, value: unknown) => void;
  submitForm?: (formId: string) => Promise<unknown>;
  callApi?: (
    sourceId: string,
    operation: "read" | "create" | "update" | "delete",
    body?: Record<string, unknown>,
  ) => Promise<unknown>;
  onUnsupported?: (action: ActionNode) => void;
};

export async function runAction(action: ActionNode, ctx: ActionContext): Promise<void> {
  switch (action.kind) {
    case "noop":
      return;
    case "navigate":
      ctx.navigate?.(action.to);
      return;
    case "openModal":
      ctx.openModal?.(action.modalId);
      return;
    case "closeModal":
      ctx.closeModal?.(action.modalId);
      return;
    case "setState":
      ctx.setState?.(action.path, action.value);
      return;
    case "submitForm": {
      try {
        await ctx.submitForm?.(action.formId);
        if (action.onSuccess) await runActions(action.onSuccess, ctx);
      } catch {
        if (action.onError) await runActions(action.onError, ctx);
      }
      return;
    }
    case "callApi":
      await ctx.callApi?.(
        action.sourceId,
        action.operation,
        action.body as Record<string, unknown> | undefined,
      );
      return;
    default: {
      ctx.onUnsupported?.(action);
      return;
    }
  }
}

export async function runActions(actions: ActionNode[], ctx: ActionContext): Promise<void> {
  for (const action of actions) {
    await runAction(action, ctx);
  }
}
