import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TocProvider, useToc, TocReady } from "../../providers/TocProvider";
import { TocHeading } from "../../composites/TableOfContents";

function Outline() {
  const toc = useToc();
  return (
    <ul data-testid="outline" data-ready={String(toc?.ready)}>
      {toc?.items.map((i) => (
        <li key={i.id}>{`${i.level}:${i.id}:${i.label}`}</li>
      ))}
    </ul>
  );
}

describe("TocProvider + TocHeading", () => {
  it("collects headings in render order", () => {
    render(
      <TocProvider>
        <Outline />
        <TocHeading level={2}>들어가며</TocHeading>
        <TocHeading level={3}>배경</TocHeading>
      </TocProvider>,
    );
    const items = Array.from(screen.getByTestId("outline").children).map(
      (li) => li.textContent,
    );
    expect(items).toEqual(["2:들어가며:들어가며", "3:배경:배경"]);
  });

  it("skips headings marked hidden", () => {
    render(
      <TocProvider>
        <Outline />
        <TocHeading level={2}>보임</TocHeading>
        <TocHeading level={2} hidden>
          숨김
        </TocHeading>
      </TocProvider>,
    );
    expect(screen.getByTestId("outline").children).toHaveLength(1);
  });

  it("uses the explicit label when children are not plain text", () => {
    render(
      <TocProvider>
        <Outline />
        <TocHeading level={2} id="mixed" label="제목">
          <span>제</span>
          <em>목</em>
        </TocHeading>
      </TocProvider>,
    );
    expect(screen.getByTestId("outline").textContent).toContain("2:mixed:제목");
  });

  it("stays not-ready until TocReady is rendered", () => {
    const { rerender } = render(
      <TocProvider>
        <Outline />
      </TocProvider>,
    );
    expect(screen.getByTestId("outline")).toHaveAttribute("data-ready", "false");

    rerender(
      <TocProvider>
        <Outline />
        <TocReady />
      </TocProvider>,
    );
    expect(screen.getByTestId("outline")).toHaveAttribute("data-ready", "true");
  });

  it("renders TocHeading as a plain heading outside a provider", () => {
    const { container } = render(<TocHeading level={3}>단독</TocHeading>);
    const h = container.querySelector("h3")!;
    expect(h).toBeTruthy();
    expect(h.id).toBe("단독");
  });
});
