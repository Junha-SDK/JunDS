import { describe, expect, it } from "vitest";

import {
  PageDocParseError,
  parsePageDoc,
  parseProjectDoc,
  safeParsePageDoc,
  parseNodePatch,
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

describe("parseNodePatch (부분 patch 검증, A5)", () => {
  it("props 만 있는 부분 patch 를 받아들인다", () => {
    const patch = parseNodePatch({ props: { variant: "primary" } });
    expect(patch).toEqual({ props: { variant: "primary" } });
  });

  it("빈 patch 도 유효하다", () => {
    expect(parseNodePatch({})).toEqual({});
  });

  it("존재하는 필드는 노드와 같은 규칙으로 검증한다 — 빈 componentId 거부", () => {
    expect(() => parseNodePatch({ componentId: "" })).toThrow(PageDocParseError);
  });

  it("잘못된 액션 kind 를 이벤트 patch 에서 거부한다", () => {
    expect(() => parseNodePatch({ events: { onClick: [{ kind: "evil" }] } })).toThrow(
      PageDocParseError,
    );
  });

  it("slots patch 는 완전한 노드를 요구한다", () => {
    expect(() =>
      parseNodePatch({ slots: { default: [{ id: "n2" }] } }),
    ).toThrow(PageDocParseError);
  });
});
