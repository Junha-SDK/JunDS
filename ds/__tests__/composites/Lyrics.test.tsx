import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Lyrics } from "../../composites/Lyrics";

const TEXT = "첫 연 첫 줄\n첫 연 둘째 줄\n\n둘째 연\n\n셋째 연\n\n넷째 연";

describe("Lyrics", () => {
  it("renders without throwing", () => {
    const { container } = render(<Lyrics />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing when there is no text", () => {
    const { container } = render(<Lyrics text="" />);
    expect(container.firstChild).toBeNull();
  });

  it("splits verses on blank lines and keeps single newlines as line breaks", () => {
    const { container } = render(<Lyrics text={TEXT} />);
    const verses = container.querySelectorAll("p");
    expect(verses).toHaveLength(4);
    // 첫 연은 두 줄 → <br> 하나
    expect(verses[0].querySelectorAll("br")).toHaveLength(1);
    expect(verses[1].querySelectorAll("br")).toHaveLength(0);
  });

  it("highlights nothing before playback starts", () => {
    const { container } = render(<Lyrics text={TEXT} progress={0} />);
    expect(container.querySelector('[aria-current="true"]')).toBeNull();
  });

  it("marks the verse matching the progress as current", () => {
    // 4연 · progress 0.6 → floor(0.6 * 4) = 2 → 셋째 연
    render(<Lyrics text={TEXT} progress={0.6} />);
    // 라인은 <span>, aria-current 는 그 연의 <p> 가 진다
    expect(screen.getByText("셋째 연").closest("p")).toHaveAttribute("aria-current", "true");
  });

  it("never runs past the last verse at progress 1", () => {
    render(<Lyrics text={TEXT} progress={1} />);
    expect(screen.getByText("넷째 연").closest("p")).toHaveAttribute("aria-current", "true");
  });

  it("lets activeIndex override progress", () => {
    const { container } = render(<Lyrics text={TEXT} progress={0.9} activeIndex={0} />);
    const current = container.querySelector('[aria-current="true"]');
    expect(current?.textContent).toContain("첫 연 첫 줄");
  });

  it("accepts pre-split verses", () => {
    const { container } = render(<Lyrics verses={[["a"], ["b"]]} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });
});
