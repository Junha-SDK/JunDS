import * as v from "valibot";

const literalValueSchema = v.union([
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
]);

export type LiteralValue = v.InferOutput<typeof literalValueSchema>;

const bindingValueSchema = v.object({
  $kind: v.literal("binding"),
  expr: v.pipe(v.string(), v.minLength(1)),
  fallback: v.optional(literalValueSchema),
});

export type BindingValue = v.InferOutput<typeof bindingValueSchema>;

const responsiveValueSchema: v.GenericSchema<ResponsiveValue> = v.lazy(() =>
  v.object({
    $kind: v.literal("responsive"),
    base: propValueSchema,
    sm: v.optional(propValueSchema),
    md: v.optional(propValueSchema),
    lg: v.optional(propValueSchema),
    xl: v.optional(propValueSchema),
  }),
);

export type ResponsiveValue = {
  $kind: "responsive";
  base: PropValue;
  sm?: PropValue;
  md?: PropValue;
  lg?: PropValue;
  xl?: PropValue;
};

const propValueSchema: v.GenericSchema<PropValue> = v.lazy(() =>
  v.union([literalValueSchema, bindingValueSchema, responsiveValueSchema]),
);

export type PropValue = LiteralValue | BindingValue | ResponsiveValue;

const navigateAction = v.object({
  kind: v.literal("navigate"),
  to: v.pipe(v.string(), v.minLength(1)),
});

const openModalAction = v.object({
  kind: v.literal("openModal"),
  modalId: v.pipe(v.string(), v.minLength(1)),
});

const closeModalAction = v.object({
  kind: v.literal("closeModal"),
  modalId: v.optional(v.string()),
});

const setStateAction = v.object({
  kind: v.literal("setState"),
  path: v.pipe(v.string(), v.minLength(1)),
  value: propValueSchema,
});

const noopAction = v.object({ kind: v.literal("noop") });

const submitFormAction: v.GenericSchema<SubmitFormAction> = v.lazy(() =>
  v.object({
    kind: v.literal("submitForm"),
    formId: v.pipe(v.string(), v.minLength(1)),
    onSuccess: v.optional(v.array(actionNodeSchema)),
    onError: v.optional(v.array(actionNodeSchema)),
  }),
);

const callApiAction = v.object({
  kind: v.literal("callApi"),
  sourceId: v.pipe(v.string(), v.minLength(1)),
  operation: v.picklist(["read", "create", "update", "delete"]),
  body: v.optional(v.record(v.string(), propValueSchema)),
});

export const actionNodeSchema: v.GenericSchema<ActionNode> = v.lazy(() =>
  v.variant("kind", [
    noopAction,
    navigateAction,
    openModalAction,
    closeModalAction,
    setStateAction,
    submitFormAction,
    callApiAction,
  ]),
);

export type ActionNode =
  | { kind: "noop" }
  | { kind: "navigate"; to: string }
  | { kind: "openModal"; modalId: string }
  | { kind: "closeModal"; modalId?: string }
  | { kind: "setState"; path: string; value: PropValue }
  | SubmitFormAction
  | {
      kind: "callApi";
      sourceId: string;
      operation: "read" | "create" | "update" | "delete";
      body?: Record<string, PropValue>;
    };

export type SubmitFormAction = {
  kind: "submitForm";
  formId: string;
  onSuccess?: ActionNode[];
  onError?: ActionNode[];
};

const nodeSchema: v.GenericSchema<Node> = v.lazy(() =>
  v.object({
    id: v.pipe(v.string(), v.minLength(1)),
    componentId: v.pipe(v.string(), v.minLength(1)),
    props: v.optional(v.record(v.string(), propValueSchema)),
    events: v.optional(v.record(v.string(), v.array(actionNodeSchema))),
    children: v.optional(v.string()),
    slots: v.optional(v.record(v.string(), v.array(nodeSchema))),
  }),
);

export type Node = {
  id: string;
  componentId: string;
  props?: Record<string, PropValue>;
  events?: Record<string, ActionNode[]>;
  children?: string;
  slots?: Record<string, Node[]>;
};

const pageMetaSchema = v.object({
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  ogImage: v.optional(v.pipe(v.string(), v.url())),
  noIndex: v.optional(v.boolean()),
});

export type PageMeta = v.InferOutput<typeof pageMetaSchema>;

export const pageDocSchema = v.object({
  schemaVersion: v.literal(1),
  id: v.pipe(v.string(), v.minLength(1)),
  route: v.pipe(v.string(), v.regex(/^\//)),
  meta: v.optional(pageMetaSchema),
  tree: v.array(nodeSchema),
});

export type PageDoc = v.InferOutput<typeof pageDocSchema>;

const dataSourceSchema = v.variant("kind", [
  v.object({
    kind: v.literal("static"),
    id: v.pipe(v.string(), v.minLength(1)),
    rows: v.array(v.record(v.string(), literalValueSchema)),
  }),
  v.object({
    kind: v.literal("rest"),
    id: v.pipe(v.string(), v.minLength(1)),
    url: v.pipe(v.string(), v.url()),
    method: v.optional(
      v.picklist(["GET", "POST", "PUT", "DELETE"]),
      "GET",
    ),
    headers: v.optional(v.record(v.string(), v.string())),
  }),
  v.object({
    kind: v.literal("sheet"),
    id: v.pipe(v.string(), v.minLength(1)),
    spreadsheetId: v.pipe(v.string(), v.minLength(1)),
    range: v.pipe(v.string(), v.minLength(1)),
  }),
]);

export type DataSource = v.InferOutput<typeof dataSourceSchema>;

const themeOverrideSchema = v.object({
  theme: v.optional(v.string()),
  colorMode: v.optional(v.picklist(["light", "dark", "system"])),
  density: v.optional(v.picklist(["compact", "normal", "comfortable"])),
  radius: v.optional(v.picklist(["none", "sm", "md", "lg", "full"])),
  spacing: v.optional(v.picklist(["tight", "default", "relaxed"])),
});

export type ThemeOverride = v.InferOutput<typeof themeOverrideSchema>;

export const projectDocSchema = v.object({
  schemaVersion: v.literal(1),
  id: v.pipe(v.string(), v.minLength(1)),
  name: v.pipe(v.string(), v.minLength(1)),
  pages: v.pipe(v.array(pageDocSchema), v.minLength(1)),
  navigation: v.optional(
    v.array(
      v.object({
        label: v.pipe(v.string(), v.minLength(1)),
        pageId: v.pipe(v.string(), v.minLength(1)),
      }),
    ),
  ),
  dataSources: v.optional(v.array(dataSourceSchema)),
  theme: v.optional(themeOverrideSchema),
  layout: v.optional(nodeSchema),
});

export type ProjectDoc = v.InferOutput<typeof projectDocSchema>;

function formatIssuePath(issue: v.BaseIssue<unknown>): string {
  if (!issue.path || issue.path.length === 0) return "<root>";
  return issue.path
    .map((segment) => {
      const key = segment.key;
      if (typeof key === "number") return `[${key}]`;
      if (typeof key === "string") return /^[A-Za-z_$][\w$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
      return "";
    })
    .join("")
    .replace(/^\./, "");
}

export class PageDocParseError extends Error {
  readonly issues: ReadonlyArray<v.BaseIssue<unknown>>;
  constructor(issues: ReadonlyArray<v.BaseIssue<unknown>>) {
    const first = issues[0];
    const path = first ? formatIssuePath(first) : "<root>";
    const message = first
      ? `${path}: ${first.message}`
      : "PageDoc validation failed";
    super(message);
    this.name = "PageDocParseError";
    this.issues = issues;
  }
}

export function parsePageDoc(input: unknown): PageDoc {
  const result = v.safeParse(pageDocSchema, input);
  if (!result.success) throw new PageDocParseError(result.issues);
  return result.output;
}

export function parseProjectDoc(input: unknown): ProjectDoc {
  const result = v.safeParse(projectDocSchema, input);
  if (!result.success) throw new PageDocParseError(result.issues);
  return result.output;
}

export function safeParsePageDoc(
  input: unknown,
):
  | { ok: true; doc: PageDoc }
  | { ok: false; error: PageDocParseError } {
  const result = v.safeParse(pageDocSchema, input);
  if (result.success) return { ok: true, doc: result.output };
  return { ok: false, error: new PageDocParseError(result.issues) };
}

export const SCHEMA_VERSION = 1 as const;

export function migratePageDoc(doc: unknown): PageDoc {
  return parsePageDoc(doc);
}
