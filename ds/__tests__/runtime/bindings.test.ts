import { describe, expect, it } from "vitest";

import { BindingError, evaluateExpression, resolvePropValue } from "../../runtime/bindings";

describe("evaluateExpression", () => {
  it("reads a top-level identifier", () => {
    expect(evaluateExpression("name", { name: "junha" })).toBe("junha");
  });

  it("walks dotted member access", () => {
    expect(
      evaluateExpression("user.profile.email", {
        user: { profile: { email: "a@b.com" } },
      }),
    ).toBe("a@b.com");
  });

  it("supports numeric bracket index", () => {
    expect(evaluateExpression("items[1]", { items: ["a", "b", "c"] })).toBe("b");
  });

  it("supports quoted string keys", () => {
    expect(
      evaluateExpression('headers["x-token"]', {
        headers: { "x-token": "abc" },
      }),
    ).toBe("abc");
  });

  it("returns undefined when the path is missing", () => {
    expect(evaluateExpression("a.b.c", { a: {} })).toBeUndefined();
  });

  it("blocks __proto__ access", () => {
    expect(evaluateExpression("user.__proto__", { user: {} })).toBeUndefined();
  });

  it("blocks constructor escape", () => {
    expect(evaluateExpression("user.constructor", { user: {} })).toBeUndefined();
  });

  it("rejects empty expressions", () => {
    expect(() => evaluateExpression("", {})).toThrow(BindingError);
  });

  it("rejects expressions starting with non-identifier", () => {
    expect(() => evaluateExpression(".x", {})).toThrow(BindingError);
  });
});

describe("resolvePropValue", () => {
  it("passes literal values through", () => {
    expect(resolvePropValue("primary", {})).toBe("primary");
    expect(resolvePropValue(42, {})).toBe(42);
    expect(resolvePropValue(true, {})).toBe(true);
  });

  it("resolves bindings against scope", () => {
    expect(
      resolvePropValue({ $kind: "binding", expr: "user.name" }, { user: { name: "Junha" } }),
    ).toBe("Junha");
  });

  it("uses fallback when binding resolves to undefined", () => {
    expect(
      resolvePropValue({ $kind: "binding", expr: "missing.path", fallback: "default" }, {}),
    ).toBe("default");
  });

  it("returns null when binding misses and no fallback is provided", () => {
    expect(resolvePropValue({ $kind: "binding", expr: "nope" }, {})).toBe(null);
  });

  it("picks the matching breakpoint, falling back upward to base", () => {
    const value = {
      $kind: "responsive" as const,
      base: "sm" as const,
      md: "lg" as const,
    };
    expect(resolvePropValue(value, {}, "base")).toBe("sm");
    expect(resolvePropValue(value, {}, "sm")).toBe("sm");
    expect(resolvePropValue(value, {}, "md")).toBe("lg");
    expect(resolvePropValue(value, {}, "lg")).toBe("lg");
    expect(resolvePropValue(value, {}, "xl")).toBe("lg");
  });
});
