import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScreenshotGrid } from "../../composites/ScreenshotGrid";

describe("ScreenshotGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<ScreenshotGrid images={[]} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing when there are no images", () => {
    const { container } = render(<ScreenshotGrid images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("prefixes relative paths with basePath but leaves absolute ones alone", () => {
    const { container } = render(
      <ScreenshotGrid
        images={["a.png", "/root.png", "https://cdn.example.com/x.png"]}
        basePath="/img/"
      />,
    );
    const srcs = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src"));
    expect(srcs).toEqual(["/img/a.png", "/root.png", "https://cdn.example.com/x.png"]);
  });

  it("drops an image that fails to load", () => {
    const { container } = render(<ScreenshotGrid images={["a.png", "b.png"]} />);
    expect(container.querySelectorAll("img")).toHaveLength(2);

    fireEvent.error(container.querySelectorAll("img")[0]);
    const remaining = Array.from(container.querySelectorAll("img")).map((i) =>
      i.getAttribute("src"),
    );
    expect(remaining).toEqual(["b.png"]);
  });

  it("disappears entirely once every image has failed", () => {
    const { container } = render(<ScreenshotGrid images={["a.png"]} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.firstChild).toBeNull();
  });
});
