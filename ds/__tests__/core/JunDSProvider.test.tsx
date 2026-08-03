import { describe, it, expect, vi, afterEach } from "vitest";
import { render, act, renderHook } from "@testing-library/react";
import { JunDSProvider, useJunDS } from "@/ds/core/JunDSProvider";
import type { ReactNode } from "react";

const root = () => document.documentElement;

afterEach(() => {
  root().removeAttribute("data-theme");
  root().removeAttribute("data-density");
  root().removeAttribute("data-radius");
});

describe("JunDSProvider (core config)", () => {
  it("renders children", () => {
    const { getByText } = render(
      <JunDSProvider>
        <span>앱</span>
      </JunDSProvider>,
    );
    expect(getByText("앱")).toBeInTheDocument();
  });

  it("stamps data-theme/data-density/data-radius on the document root", () => {
    render(<JunDSProvider>x</JunDSProvider>);
    // matchMedia stub reports light for colorMode=system
    expect(root().getAttribute("data-theme")).toBe("light");
    expect(root().getAttribute("data-density")).toBe("normal");
    expect(root().getAttribute("data-radius")).toBe("md");
  });

  it("colorMode=dark forces data-theme=dark", () => {
    render(<JunDSProvider colorMode="dark">x</JunDSProvider>);
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  it("applies radius/density/font/spacing CSS variables", () => {
    render(
      <JunDSProvider radius="full" density="compact" fontSize="lg" spacing="relaxed">
        x
      </JunDSProvider>,
    );
    const style = root().style;
    expect(style.getPropertyValue("--jds-radius-md")).toBe("9999px");
    expect(style.getPropertyValue("--jds-density-px")).toBe("8px");
    expect(style.getPropertyValue("--jds-font-base")).toBe("16px");
    expect(style.getPropertyValue("--jds-spacing-mult")).toBe("1.25");
  });

  it("removes the CSS variables on unmount", () => {
    const { unmount } = render(<JunDSProvider>x</JunDSProvider>);
    expect(root().style.getPropertyValue("--jds-radius-md")).not.toBe("");
    unmount();
    expect(root().style.getPropertyValue("--jds-radius-md")).toBe("");
  });

  it("useJunDS exposes config and working setters", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <JunDSProvider theme="blue" locale="en">
        {children}
      </JunDSProvider>
    );
    const { result } = renderHook(() => useJunDS(), { wrapper });
    expect(result.current.theme).toBe("blue");
    expect(result.current.locale).toBe("en");

    act(() => result.current.setDensity("comfortable"));
    expect(result.current.density).toBe("comfortable");
    expect(root().getAttribute("data-density")).toBe("comfortable");

    act(() => result.current.setColorMode("dark"));
    expect(result.current.colorMode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("useJunDS outside a provider warns and returns safe defaults", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useJunDS());
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("JunDSProvider"));
    expect(result.current.theme).toBe("purple");
    expect(result.current.density).toBe("normal");
    expect(() => result.current.setTheme("blue")).not.toThrow();
    warn.mockRestore();
  });
});
