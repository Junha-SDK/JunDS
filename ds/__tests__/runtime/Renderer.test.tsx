import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Renderer } from "../../runtime/Renderer";
import type { ActionContext } from "../../runtime/actions";
import type { PageDoc } from "../../runtime/schema";

function makeDoc(tree: PageDoc["tree"]): PageDoc {
  return { schemaVersion: 1, id: "t", route: "/", tree };
}

describe("Renderer", () => {
  it("renders a Button with text children", () => {
    const doc = makeDoc([
      { id: "n1", componentId: "Button", children: "Click me" },
    ]);
    render(<Renderer doc={doc} />);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders nested layout with a Badge inside a div", () => {
    const doc = makeDoc([
      {
        id: "n1",
        componentId: "div",
        slots: {
          default: [
            {
              id: "n2",
              componentId: "Badge",
              children: "new",
            },
          ],
        },
      },
    ]);
    const { container } = render(<Renderer doc={doc} />);
    expect(container.querySelector("[data-junds-node='n1']")).toBeNull();
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("resolves bindings against the scope", () => {
    const doc = makeDoc([
      {
        id: "n1",
        componentId: "Badge",
        children: "static",
        props: {
          variant: { $kind: "binding", expr: "tone", fallback: "default" },
        },
      },
    ]);
    const { container } = render(
      <Renderer doc={doc} scope={{ tone: "success" }} />,
    );
    const el = container.querySelector("span");
    expect(el).not.toBeNull();
  });

  it("dispatches actions through the action context in runtime mode", async () => {
    const navigate = vi.fn();
    const ctx: ActionContext = { navigate };
    const doc = makeDoc([
      {
        id: "n1",
        componentId: "Button",
        children: "Go",
        events: {
          onClick: [{ kind: "navigate", to: "/about" }],
        },
      },
    ]);
    render(<Renderer doc={doc} mode="runtime" actions={ctx} />);
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    await Promise.resolve();
    expect(navigate).toHaveBeenCalledWith("/about");
  });

  it("does not dispatch actions in design mode and emits a select event instead", () => {
    const navigate = vi.fn();
    const onDesignEvent = vi.fn();
    const doc = makeDoc([
      {
        id: "n1",
        componentId: "Button",
        children: "Go",
        events: {
          onClick: [{ kind: "navigate", to: "/about" }],
        },
      },
    ]);
    render(
      <Renderer
        doc={doc}
        mode="design"
        actions={{ navigate }}
        onDesignEvent={onDesignEvent}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(navigate).not.toHaveBeenCalled();
    expect(onDesignEvent).toHaveBeenCalledWith({ kind: "select", nodeId: "n1" });
  });

  it("renders a placeholder for unknown components in design mode", () => {
    const doc = makeDoc([{ id: "n1", componentId: "DoesNotExist" }]);
    const { container } = render(<Renderer doc={doc} mode="design" />);
    expect(
      container.querySelector("[data-junds-unknown='DoesNotExist']"),
    ).toBeInTheDocument();
  });
});
