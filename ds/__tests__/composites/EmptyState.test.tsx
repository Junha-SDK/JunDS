import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "../../composites/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="데이터 없음" />);
    expect(screen.getByText("데이터 없음")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<EmptyState title="없음" description="새 항목을 추가하세요" />);
    expect(screen.getByText("새 항목을 추가하세요")).toBeInTheDocument();
  });

  it("renders action", () => {
    render(<EmptyState title="없음" action={<button>추가</button>} />);
    expect(screen.getByText("추가")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<EmptyState title="없음" icon={<span data-testid="custom-icon">🔍</span>} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
