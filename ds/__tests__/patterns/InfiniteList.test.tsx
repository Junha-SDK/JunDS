import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InfiniteList } from "../../patterns/InfiniteList";

describe("InfiniteList", () => {
  it("renders provided items", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    render(
      <InfiniteList
        items={items}
        renderItem={(item) => <li>row-{item.id}</li>}
        keyExtractor={(item) => item.id}
        onLoadMore={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText("row-a")).toBeDefined();
    expect(screen.getByText("row-c")).toBeDefined();
  });

  it("renders an empty list without throwing", () => {
    const { container } = render(
      <InfiniteList
        items={[]}
        renderItem={() => null}
        keyExtractor={() => "x"}
        onLoadMore={() => {}}
        hasMore={false}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
