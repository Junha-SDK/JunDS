import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FileUpload } from "../../primitives/FileUpload";

describe("FileUpload", () => {
  it("renders without throwing", () => {
    const { container } = render(<FileUpload onFiles={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
