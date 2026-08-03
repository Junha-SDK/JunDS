import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertDialog } from "../../composites/AlertDialog";

describe("AlertDialog", () => {
  it("renders without throwing", () => {
    const { container } = render(
      <AlertDialog open={false} onConfirm={() => {}} onCancel={() => {}} title="" description="" />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
