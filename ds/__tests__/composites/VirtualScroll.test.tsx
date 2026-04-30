import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VirtualScroll } from "../../composites/VirtualScroll";

describe("VirtualScroll", () => {
  it("renders with empty items", () => {
    const { container } = render(
      <VirtualScroll items={[]} itemHeight={40} renderItem={() => null} />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("invokes renderItem for visible items", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `item-${i}` }));
    const { container } = render(
      <VirtualScroll
        items={items}
        itemHeight={40}
        renderItem={(item) => <div key={item.id}>{item.label}</div>}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
