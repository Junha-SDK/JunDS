import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Show } from "../../layout/Show";

describe("Show", () => {
  it("renders without throwing", () => {
    const { container } = render(<Show>{null}</Show>);
    expect(container.firstChild).toBeDefined();
  });
});
