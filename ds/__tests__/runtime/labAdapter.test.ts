import { describe, expect, it } from "vitest";

import { parsePageDoc } from "../../runtime/schema";
import {
  serialize,
  deserialize,
} from "../../../app/design-system/lab/_lib/adapter";
import type { LabState } from "../../../app/design-system/lab/_lib/types";

function makeLabState(): LabState {
  return {
    nodes: {
      n1: {
        id: "n1",
        componentId: "div",
        props: { padding: "16", display: "flex" },
        childNodes: ["n2"],
        parentId: null,
      },
      n2: {
        id: "n2",
        componentId: "Button",
        props: { variant: "primary", disabled: false },
        children: "Click me",
        childNodes: [],
        parentId: "n1",
      },
    },
    rootIds: ["n1"],
    selectedId: null,
    hoveredId: null,
  };
}

describe("Lab adapter", () => {
  it("serializes Lab state to a valid PageDoc", () => {
    const state = makeLabState();
    const doc = serialize(state);
    const parsed = parsePageDoc(JSON.parse(JSON.stringify(doc)));
    expect(parsed.tree).toHaveLength(1);
    expect(parsed.tree[0].componentId).toBe("div");
    expect(parsed.tree[0].slots?.default?.[0].componentId).toBe("Button");
    expect(parsed.tree[0].slots?.default?.[0].children).toBe("Click me");
  });

  it("round-trips Lab → PageDoc → Lab preserving structure", () => {
    const state = makeLabState();
    const doc = serialize(state);
    const restored = deserialize(doc);
    expect(restored.rootIds).toEqual(state.rootIds);
    expect(Object.keys(restored.nodes).sort()).toEqual(
      Object.keys(state.nodes).sort(),
    );
    expect(restored.nodes.n2.parentId).toBe("n1");
    expect(restored.nodes.n2.children).toBe("Click me");
    expect(restored.nodes.n2.props.variant).toBe("primary");
  });
});
