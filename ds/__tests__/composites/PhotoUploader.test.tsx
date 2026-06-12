import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoUploader } from "../../composites/PhotoUploader";

describe("PhotoUploader", () => {
  it("renders", () => {
    const { container } = render(<PhotoUploader onAdd={() => {}} />);
    expect(container.firstChild).toBeTruthy();
  });
});
