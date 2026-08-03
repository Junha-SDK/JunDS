import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Waveform } from "../../composites/Waveform";

describe("Waveform", () => {
  it("renders without throwing", () => {
    const { container } = render(<Waveform seed="" />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders the requested number of bars", () => {
    const { container } = render(<Waveform seed="a" bars={12} />);
    expect(container.querySelectorAll("span")).toHaveLength(12);
  });

  it("is deterministic — the same seed produces the same bar heights", () => {
    const heightsOf = (seed: string) => {
      const { container, unmount } = render(<Waveform seed={seed} bars={16} />);
      const hs = Array.from(container.querySelectorAll<HTMLElement>("span")).map(
        (el) => el.style.height,
      );
      unmount();
      return hs;
    };
    expect(heightsOf("track-1")).toEqual(heightsOf("track-1"));
    expect(heightsOf("track-1")).not.toEqual(heightsOf("track-2"));
  });

  it("uses explicit peaks when given", () => {
    const { container } = render(<Waveform seed="ignored" peaks={[0.5, 1]} />);
    const hs = Array.from(container.querySelectorAll<HTMLElement>("span")).map(
      (el) => el.style.height,
    );
    expect(hs).toEqual(["50%", "100%"]);
  });

  it("is not a slider without onSeek", () => {
    render(<Waveform seed="a" />);
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("exposes slider semantics and keyboard seeking with onSeek", () => {
    const onSeek = vi.fn();
    render(<Waveform seed="a" progress={0.5} onSeek={onSeek} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "50");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenLastCalledWith(0.55);

    fireEvent.keyDown(slider, { key: "Home" });
    expect(onSeek).toHaveBeenLastCalledWith(0);

    fireEvent.keyDown(slider, { key: "End" });
    expect(onSeek).toHaveBeenLastCalledWith(1);
  });

  it("clamps progress outside 0–1", () => {
    render(<Waveform seed="a" progress={5} onSeek={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "100");
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <Waveform asChild seed="a" className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </Waveform>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("flex");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
