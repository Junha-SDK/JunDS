import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoFilters, defaultPhotoFilters } from "../../composites/PhotoFilters/PhotoFilters";

describe("PhotoFilters", () => {
  it("renders", () => {
    const { container } = render(
      <PhotoFilters previewSrc="/p.jpg" filters={defaultPhotoFilters} onChange={() => {}} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
