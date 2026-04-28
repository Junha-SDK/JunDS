import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useToggle } from "../../hooks/useToggle";

describe("useToggle", () => {
  it("defaults to false", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it("accepts initial value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it("toggles value", () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it("setTrue sets value to true", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
    // calling setTrue again keeps it true
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });

  it("setFalse sets value to false", () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
    // calling setFalse again keeps it false
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });

  it("setValue sets arbitrary value", () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.setValue(true));
    expect(result.current.value).toBe(true);
    act(() => result.current.setValue(false));
    expect(result.current.value).toBe(false);
  });
});
