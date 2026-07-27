import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlbumArt } from "../../composites/AlbumArt";

describe("AlbumArt", () => {
  it("renders without throwing", () => {
    const { container } = render(<AlbumArt seed="" />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders the generative cover when there is no src", () => {
    const { container } = render(<AlbumArt seed="a song" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("♪");
  });

  it("renders the image when src is given", () => {
    const { container } = render(<AlbumArt src="/cover.jpg" seed="a song" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/cover.jpg");
  });

  it("falls back to the generative cover when the image fails", () => {
    const { container } = render(<AlbumArt src="/missing.jpg" seed="a song" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("♪");
  });

  it("is deterministic — the same seed produces the same colors", () => {
    const gradientOf = (seed: string) => {
      const { container, unmount } = render(<AlbumArt seed={seed} />);
      const bg = container.querySelector<HTMLElement>("span span")!.style.background;
      unmount();
      return bg;
    };
    expect(gradientOf("같은 곡")).toBe(gradientOf("같은 곡"));
    expect(gradientOf("같은 곡")).not.toBe(gradientOf("다른 곡"));
  });
});
