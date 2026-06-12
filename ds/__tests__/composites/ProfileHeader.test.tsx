import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfileHeader } from "../../composites/ProfileHeader";

describe("ProfileHeader", () => {
  it("renders", () => {
    const { container } = render(<ProfileHeader name="준하" />);
    expect(container.firstChild).toBeTruthy();
  });
});
