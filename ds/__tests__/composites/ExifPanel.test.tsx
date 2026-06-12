import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExifPanel } from "../../composites/ExifPanel";

describe("ExifPanel", () => {
  it("renders", () => {
    const { container } = render(<ExifPanel data={{ camera: "Sony α7" }} />);
    expect(container.firstChild).toBeTruthy();
  });
});
