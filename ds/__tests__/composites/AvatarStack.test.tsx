import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AvatarStack } from "../../composites/AvatarStack";

describe("AvatarStack", () => {
  const names = ["김준하", "이서연", "박민수", "최유진", "정다은"];

  it("renders max avatars", () => {
    render(<AvatarStack names={names} max={3} />);
    expect(screen.getByText("김준")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("shows all when under max", () => {
    render(<AvatarStack names={["김준하", "이서연"]} max={5} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("renders overflow count", () => {
    render(<AvatarStack names={names} max={2} />);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
