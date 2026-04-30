import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SortableList } from "../../patterns/SortableList";

describe("SortableList", () => {
  it("renders all items via renderItem", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    render(
      <SortableList
        items={items}
        renderItem={(item) => <span>row-{item.id}</span>}
        onReorder={() => {}}
      />,
    );
    expect(screen.getByText("row-a")).toBeDefined();
    expect(screen.getByText("row-b")).toBeDefined();
    expect(screen.getByText("row-c")).toBeDefined();
  });
});
