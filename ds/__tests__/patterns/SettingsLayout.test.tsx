import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsLayout } from "../../patterns/SettingsLayout";

describe("SettingsLayout", () => {
  it("renders", () => {
    const { container } = render(
      <SettingsLayout
        sections={[{ id: "a", label: "A", content: <div>x</div> }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
