import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VirtualList } from "../../patterns/VirtualList";

describe("VirtualList", () => {
  it("renders with empty items", () => {
    const { container } = render(
      <VirtualList
        items={[]}
        itemHeight={32}
        renderItem={() => null}
        keyExtractor={() => "x"}
        height={300}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("renders large item collections without throwing", () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={32}
        renderItem={(item) => <div>{item.id}</div>}
        keyExtractor={(item) => String(item.id)}
        height={300}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
