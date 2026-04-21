import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Timeline } from "../../composites/Timeline";

describe("Timeline", () => {
  const items = [
    { key: "1", title: "생성", time: "10:00", color: "primary" as const },
    { key: "2", title: "진행", time: "11:30", color: "success" as const },
    { key: "3", title: "완료", time: "14:00", color: "success" as const },
  ];

  it("renders all items", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("생성")).toBeInTheDocument();
    expect(screen.getByText("진행")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  it("shows times", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<Timeline items={[{ key: "1", title: "이벤트", description: "상세 설명" }]} />);
    expect(screen.getByText("상세 설명")).toBeInTheDocument();
  });
});
