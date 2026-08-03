import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogPost } from "../../patterns/BlogPost";

describe("BlogPost", () => {
  it("renders", () => {
    const { container } = render(
      <BlogPost title="t" data-testid="root">
        x
      </BlogPost>,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
