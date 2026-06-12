import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnnotationNote } from "../../composites/AnnotationNote";

describe("AnnotationNote", () => {
  it("renders", () => {
    const { container } = render(<AnnotationNote quote="인용" />);
    expect(container.firstChild).toBeTruthy();
  });
});
