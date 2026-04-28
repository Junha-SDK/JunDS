import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FileUpload } from "../../primitives/FileUpload";

describe("FileUpload a11y", () => {
  it("drop zone has role=button", () => {
    render(<FileUpload onFiles={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("drop zone has aria-label", () => {
    render(<FileUpload onFiles={vi.fn()} description="파일 업로드" />);
    expect(screen.getByLabelText("파일 업로드")).toBeDefined();
  });

  it("drop zone is keyboard accessible", async () => {
    const onFiles = vi.fn();
    render(<FileUpload onFiles={onFiles} />);
    const dropzone = screen.getByRole("button");
    expect(dropzone.getAttribute("tabindex")).toBe("0");
  });

  it("disabled drop zone is not focusable", () => {
    render(<FileUpload onFiles={vi.fn()} disabled />);
    const dropzone = screen.getByRole("button");
    expect(dropzone.getAttribute("tabindex")).toBe("-1");
  });
});
