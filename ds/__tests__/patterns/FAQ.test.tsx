import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FAQ } from "../../patterns/FAQ";

describe("FAQ", () => {
  it("renders", () => {
    const { container } = render(<FAQ items={[{question:"q",answer:"a"}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
