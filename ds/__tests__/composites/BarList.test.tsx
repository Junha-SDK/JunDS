import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BarList } from "../../composites/BarList";

const ITEMS = [
  { label: "영화", value: 42 },
  { label: "책", value: 31 },
  { label: "애니", value: 18 },
];

/** 막대 채움 요소는 인라인 width 를 가진 유일한 노드다 */
const widths = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("li span[style*='width']")).map(
    (el) => el.style.width,
  );

describe("BarList", () => {
  it("renders without throwing", () => {
    const { container } = render(<BarList items={[]} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<BarList items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("scales bars against the largest value by default", () => {
    const { container } = render(<BarList items={ITEMS} />);
    const w = widths(container);
    expect(w[0]).toBe("100%");
    expect(w[1]).toBe(`${(31 / 42) * 100}%`);
  });

  it("scales against an explicit max when given", () => {
    const { container } = render(<BarList items={ITEMS} max={100} />);
    expect(widths(container)[0]).toBe("42%");
  });

  it("does not divide by zero when every value is 0", () => {
    const { container } = render(
      <BarList
        items={[
          { label: "a", value: 0 },
          { label: "b", value: 0 },
        ]}
      />,
    );
    expect(widths(container)).toEqual(["0%", "0%"]);
  });

  it("sorts descending when asked", () => {
    const unsorted = [
      { label: "작다", value: 1 },
      { label: "크다", value: 9 },
    ];
    const { container } = render(<BarList items={unsorted} sorted />);
    expect(container.querySelectorAll("li")[0].textContent).toContain("크다");
  });

  it("keeps the given order by default", () => {
    const unsorted = [
      { label: "작다", value: 1 },
      { label: "크다", value: 9 },
    ];
    const { container } = render(<BarList items={unsorted} />);
    expect(container.querySelectorAll("li")[0].textContent).toContain("작다");
  });

  it("applies limit after sorting", () => {
    const { container } = render(<BarList items={ITEMS} sorted limit={2} />);
    const lis = container.querySelectorAll("li");
    expect(lis).toHaveLength(2);
    expect(lis[0].textContent).toContain("영화");
  });

  it("formats values when a formatter is given", () => {
    render(<BarList items={[ITEMS[0]]} formatValue={(v) => `${v}편`} />);
    expect(screen.getByText("42편")).toBeInTheDocument();
  });

  it("renders rows as links when href is present", () => {
    const { container } = render(
      <BarList items={[{ label: "영화", value: 1, href: "/movies" }]} />,
    );
    expect(container.querySelector("a")).toHaveAttribute("href", "/movies");
  });
});
