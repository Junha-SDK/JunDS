import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnnouncementBar } from "../../composites/AnnouncementBar";

describe("AnnouncementBar", () => {
  it("renders", () => {
    const { container } = render(<AnnouncementBar message="x" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
