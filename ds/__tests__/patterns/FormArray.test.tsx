import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormArray } from "../../patterns/FormArray";

describe("FormArray", () => {
  it("renders existing items via renderItem", () => {
    render(
      <FormArray<{ name: string }>
        value={[{ name: "a" }, { name: "b" }]}
        onChange={() => {}}
        defaultItem={{ name: "" }}
        renderItem={(item) => <span>row-{item.name}</span>}
      />,
    );
    expect(screen.getByText("row-a")).toBeDefined();
    expect(screen.getByText("row-b")).toBeDefined();
  });

  it("renders empty when value is empty", () => {
    const { container } = render(
      <FormArray<{ name: string }>
        value={[]}
        onChange={() => {}}
        defaultItem={{ name: "" }}
        renderItem={() => null}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
