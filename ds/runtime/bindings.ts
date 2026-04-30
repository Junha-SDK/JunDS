import type {
  BindingValue,
  LiteralValue,
  PropValue,
  ResponsiveValue,
} from "./schema";

export type BindingScope = Record<string, unknown>;

type Token =
  | { kind: "ident"; value: string }
  | { kind: "dot" }
  | { kind: "lbracket" }
  | { kind: "rbracket" }
  | { kind: "number"; value: number }
  | { kind: "string"; value: string };

export class BindingError extends Error {
  constructor(message: string, readonly expr: string) {
    super(`binding "${expr}": ${message}`);
    this.name = "BindingError";
  }
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }
    if (ch === ".") {
      tokens.push({ kind: "dot" });
      i++;
      continue;
    }
    if (ch === "[") {
      tokens.push({ kind: "lbracket" });
      i++;
      continue;
    }
    if (ch === "]") {
      tokens.push({ kind: "rbracket" });
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = "";
      i++;
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === "\\" && i + 1 < expr.length) {
          value += expr[i + 1];
          i += 2;
        } else {
          value += expr[i];
          i++;
        }
      }
      if (expr[i] !== quote) {
        throw new BindingError("unterminated string literal", expr);
      }
      i++;
      tokens.push({ kind: "string", value });
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      let raw = "";
      while (i < expr.length && expr[i] >= "0" && expr[i] <= "9") {
        raw += expr[i];
        i++;
      }
      tokens.push({ kind: "number", value: Number.parseInt(raw, 10) });
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let raw = "";
      while (i < expr.length && /[A-Za-z0-9_$]/.test(expr[i])) {
        raw += expr[i];
        i++;
      }
      tokens.push({ kind: "ident", value: raw });
      continue;
    }
    throw new BindingError(`unexpected character "${ch}" at position ${i}`, expr);
  }
  return tokens;
}

type AccessStep = { kind: "member"; key: string } | { kind: "index"; key: string | number };

function parse(tokens: Token[], expr: string): { root: string; steps: AccessStep[] } {
  if (tokens.length === 0) throw new BindingError("empty expression", expr);
  const first = tokens[0];
  if (first.kind !== "ident") {
    throw new BindingError("expression must start with an identifier", expr);
  }
  const root = first.value;
  const steps: AccessStep[] = [];
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind === "dot") {
      const next = tokens[i + 1];
      if (!next || next.kind !== "ident") {
        throw new BindingError("expected identifier after '.'", expr);
      }
      steps.push({ kind: "member", key: next.value });
      i += 2;
      continue;
    }
    if (t.kind === "lbracket") {
      const next = tokens[i + 1];
      if (!next) throw new BindingError("unterminated '['", expr);
      let key: string | number;
      if (next.kind === "number") key = next.value;
      else if (next.kind === "string") key = next.value;
      else throw new BindingError("bracket access expects number or string", expr);
      const close = tokens[i + 2];
      if (!close || close.kind !== "rbracket") {
        throw new BindingError("expected ']'", expr);
      }
      steps.push({ kind: "index", key });
      i += 3;
      continue;
    }
    throw new BindingError("unexpected token", expr);
  }
  return { root, steps };
}

const BLOCKED_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

function readKey(target: unknown, key: string | number): unknown {
  if (target == null) return undefined;
  if (typeof key === "string" && BLOCKED_KEYS.has(key)) return undefined;
  if (Array.isArray(target)) {
    if (typeof key === "number") return target[key];
    if (typeof key === "string" && /^\d+$/.test(key)) {
      return target[Number.parseInt(key, 10)];
    }
    if (key === "length") return target.length;
    return undefined;
  }
  if (typeof target === "object") {
    return (target as Record<string | number, unknown>)[key];
  }
  return undefined;
}

export function evaluateExpression(
  expr: string,
  scope: BindingScope,
): unknown {
  const tokens = tokenize(expr);
  const { root, steps } = parse(tokens, expr);
  if (BLOCKED_KEYS.has(root)) return undefined;
  let current: unknown = scope[root];
  for (const step of steps) {
    if (current == null) return undefined;
    current = readKey(current, step.key);
  }
  return current;
}

export function isBindingValue(value: unknown): value is BindingValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { $kind?: unknown }).$kind === "binding"
  );
}

export function isResponsiveValue(value: unknown): value is ResponsiveValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { $kind?: unknown }).$kind === "responsive"
  );
}

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

export function resolvePropValue(
  value: PropValue | undefined,
  scope: BindingScope,
  breakpoint: Breakpoint = "base",
): LiteralValue | undefined {
  if (value === undefined) return undefined;
  if (isBindingValue(value)) {
    try {
      const resolved = evaluateExpression(value.expr, scope);
      if (resolved === undefined || resolved === null) {
        return value.fallback ?? null;
      }
      if (
        typeof resolved === "string" ||
        typeof resolved === "number" ||
        typeof resolved === "boolean"
      ) {
        return resolved;
      }
      return value.fallback ?? null;
    } catch {
      return value.fallback ?? null;
    }
  }
  if (isResponsiveValue(value)) {
    const order: Breakpoint[] = ["xl", "lg", "md", "sm", "base"];
    const startIndex = order.indexOf(breakpoint);
    for (let i = startIndex; i < order.length; i++) {
      const candidate = value[order[i]];
      if (candidate !== undefined) {
        return resolvePropValue(candidate, scope, breakpoint);
      }
    }
    return undefined;
  }
  return value;
}
