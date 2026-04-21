import { describe, it, expect } from "vitest";
import { cn } from "../../utils/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    // twMerge should keep the last conflicting class
    expect(cn("px-4", "px-2")).toBe("px-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles objects", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });
});
