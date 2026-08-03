import { describe, expect, it } from "vitest";

import {
  PageDocParseError,
  parsePageDoc,
  parseProjectDoc,
  safeParsePageDoc,
  type PageDoc,
} from "../../runtime/schema";

describe("PageDoc schema", () => {
  it("round-trips through JSON.stringify", () => {
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "home",
      route: "/",
      tree: [
        {
          id: "n1",
          componentId: "Card",
          slots: {
            default: [
              {
                id: "n2",
                componentId: "Button",
                props: { variant: "primary" },
                events: {
                  onClick: [{ kind: "navigate", to: "/about" }],
                },
                children: "About us",
              },
            ],
          },
        },
      ],
    };
    expect(parsePageDoc(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  });

  it("accepts a minimal page", () => {
    const doc = {
      schemaVersion: 1,
      id: "min",
      route: "/",
      tree: [],
    };
    expect(parsePageDoc(doc)).toEqual(doc);
  });

  it("rejects routes that do not start with '/'", () => {
    expect(() =>
      parsePageDoc({
        schemaVersion: 1,
        id: "bad",
        route: "about",
        tree: [],
      }),
    ).toThrow(PageDocParseError);
  });

  it("rejects unknown action kinds", () => {
    expect(() =>
      parsePageDoc({
        schemaVersion: 1,
        id: "x",
        route: "/x",
        tree: [
          {
            id: "n1",
            componentId: "Button",
            events: { onClick: [{ kind: "evil" }] },
          },
        ],
      }),
    ).toThrow(PageDocParseError);
  });

  it("safeParse returns issues without throwing", () => {
    const result = safeParsePageDoc({ schemaVersion: 2 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(PageDocParseError);
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("supports binding and responsive prop values", () => {
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "bind",
      route: "/",
      tree: [
        {
          id: "n1",
          componentId: "Button",
          props: {
            variant: { $kind: "binding", expr: "user.role", fallback: "primary" },
            size: {
              $kind: "responsive",
              base: "sm",
              md: "lg",
            },
          },
        },
      ],
    };
    expect(parsePageDoc(doc)).toEqual(doc);
  });
});

describe("ProjectDoc schema", () => {
  it("validates a project with one page", () => {
    const project = {
      schemaVersion: 1 as const,
      id: "proj",
      name: "demo",
      pages: [{ schemaVersion: 1 as const, id: "home", route: "/", tree: [] }],
    };
    expect(parseProjectDoc(project)).toMatchObject({ id: "proj" });
  });

  it("rejects a project with zero pages", () => {
    expect(() =>
      parseProjectDoc({
        schemaVersion: 1,
        id: "empty",
        name: "demo",
        pages: [],
      }),
    ).toThrow(PageDocParseError);
  });
});
