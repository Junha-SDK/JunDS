import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

function setupHook(enabled = true) {
  const handler = vi.fn();
  const ref = { current: document.createElement("div") };
  document.body.appendChild(ref.current);

  renderHook(() => useClickOutside(ref, handler, enabled));

  return { handler, ref };
}

describe("useClickOutside", () => {
  it("calls handler when clicking outside the ref element", () => {
    const { handler } = setupHook();

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    outside.remove();
  });

  it("does not call handler when clicking inside the ref element", () => {
    const { handler, ref } = setupHook();

    ref.current.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler when enabled is false", () => {
    const { handler } = setupHook(false);

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    outside.remove();
  });

  it("responds to touchstart events", () => {
    const { handler } = setupHook();

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    outside.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    outside.remove();
  });

  it("does not call handler when ref.current is null", () => {
    const handler = vi.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, handler));

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    outside.remove();
  });
});
