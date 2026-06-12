import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoGrid } from "../../composites/PhotoGrid";

describe("PhotoGrid", () => {
  it("renders", () => {
    const { container } = render(
      <PhotoGrid>
        <div>1</div>
        <div>2</div>
      </PhotoGrid>,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
