import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OfflineIndicator } from "../../composites/OfflineIndicator";

describe("OfflineIndicator", () => {
  let originalDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalDescriptor = Object.getOwnPropertyDescriptor(navigator, "onLine");
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
  });

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(navigator, "onLine", originalDescriptor);
    }
  });

  it("renders when offline", () => {
    const { container } = render(<OfflineIndicator data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders nothing when online (no flash)", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => true });
    const { container } = render(<OfflineIndicator data-testid="root" />);
    expect(container.firstChild).toBeNull();
  });
});
