import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoCarousel } from "../../composites/PhotoCarousel";

describe("PhotoCarousel", () => {
  it("renders", () => {
    const { container } = render(
      <PhotoCarousel photos={[{ src: "/a.jpg", alt: "1" }, { src: "/b.jpg", alt: "2" }]} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
