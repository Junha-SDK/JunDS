import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CollectionView } from "../../composites/CollectionView";

describe("CollectionView", () => {
  it("renders without throwing", () => {
    const { container } = render(<CollectionView items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
