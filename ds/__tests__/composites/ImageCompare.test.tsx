import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageCompare } from "../../composites/ImageCompare";

describe("ImageCompare", () => {
  it("renders", () => {
    const { container } = render(
      <ImageCompare beforeSrc="/a.jpg" afterSrc="/b.jpg" beforeAlt="이전" afterAlt="이후" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
