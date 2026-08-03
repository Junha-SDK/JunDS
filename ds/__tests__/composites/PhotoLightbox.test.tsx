import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoLightbox } from "../../composites/PhotoLightbox";

describe("PhotoLightbox", () => {
  it("renders when closed without crashing", () => {
    const { container } = render(
      <PhotoLightbox
        photos={[]}
        index={0}
        open={false}
        onIndexChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container).toBeTruthy();
  });
});
