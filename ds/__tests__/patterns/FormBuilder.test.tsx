import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormBuilder } from "../../patterns/FormBuilder";

describe("FormBuilder", () => {
  it("renders without throwing", () => {
    const { container } = render(<FormBuilder fields={[]} onSubmit={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
