import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CheckboxCardGroup } from "../../composites/CheckboxCardGroup";

describe("CheckboxCardGroup", () => {
  it("renders", () => {
    const { container } = render(
      <CheckboxCardGroup options={[{ value: "a", title: "A" }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
