import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Renderer } from "../../runtime/Renderer";
import { createRegistry, defaultRegistry } from "../../runtime/registry";
import type { PageDoc } from "../../runtime/schema";

function makeDoc(componentId: string): PageDoc {
  return {
    schemaVersion: 1,
    id: "p",
    route: "/",
    tree: [{ id: "n1", componentId }],
  };
}

describe("previewProps merging", () => {
  it("design mode merges previewProps into resolved props", () => {
    const onChange = vi.fn();
    const registry = createRegistry(defaultRegistry.list());
    registry.register({
      ...defaultRegistry.get("Slider")!,
      previewProps: () => ({ value: 42, onChange }),
    });
    const { container } = render(
      <Renderer doc={makeDoc("Slider")} registry={registry} mode="design" />,
    );
    expect(container.querySelector("[role='slider']")).not.toBeNull();
  });

  it("runtime mode does NOT merge previewProps", () => {
    const onChange = vi.fn();
    const registry = createRegistry(defaultRegistry.list());
    registry.register({
      ...defaultRegistry.get("Button")!,
      previewProps: () => ({ "data-preview": "yes" }),
    });
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "p",
      route: "/",
      tree: [{ id: "n1", componentId: "Button", children: "ok" }],
    };
    const { container } = render(
      <Renderer doc={doc} registry={registry} mode="runtime" />,
    );
    expect(container.querySelector("[data-preview]")).toBeNull();
  });

  it("explicit node props override previewProps", () => {
    const registry = createRegistry(defaultRegistry.list());
    registry.register({
      ...defaultRegistry.get("Button")!,
      previewProps: () => ({ disabled: true }),
    });
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "p",
      route: "/",
      tree: [
        {
          id: "n1",
          componentId: "Button",
          children: "click",
          props: { disabled: false },
        },
      ],
    };
    render(<Renderer doc={doc} registry={registry} mode="design" />);
    expect(screen.getByRole("button", { name: "click" })).not.toBeDisabled();
  });

  it("design mode emits select on click instead of running event actions", () => {
    const onDesignEvent = vi.fn();
    const registry = createRegistry(defaultRegistry.list());
    registry.register({
      ...defaultRegistry.get("Button")!,
      previewProps: () => ({}),
    });
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "p",
      route: "/",
      tree: [{ id: "btn", componentId: "Button", children: "Hi" }],
    };
    render(
      <Renderer
        doc={doc}
        registry={registry}
        mode="design"
        onDesignEvent={onDesignEvent}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hi" }));
    expect(onDesignEvent).toHaveBeenCalledWith({
      kind: "select",
      nodeId: "btn",
    });
  });
});
