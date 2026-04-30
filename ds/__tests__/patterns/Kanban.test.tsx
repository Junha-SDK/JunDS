import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Kanban } from "../../patterns/Kanban";
import type { KanbanColumn } from "../../patterns/Kanban/Kanban";

interface Card extends Record<string, unknown> {
  id: string;
  title: string;
}

describe("Kanban", () => {
  it("renders columns and cards", () => {
    const columns: KanbanColumn<Card>[] = [
      { id: "todo", title: "할 일", items: [{ id: "1", title: "task A" }] },
      { id: "doing", title: "진행 중", items: [{ id: "2", title: "task B" }] },
    ];
    render(<Kanban columns={columns} renderCard={(item) => <div>{item.title}</div>} />);
    expect(screen.getByText("할 일")).toBeDefined();
    expect(screen.getByText("진행 중")).toBeDefined();
    expect(screen.getByText("task A")).toBeDefined();
    expect(screen.getByText("task B")).toBeDefined();
  });

  it("renders with empty columns", () => {
    const { container } = render(
      <Kanban<Card> columns={[]} renderCard={() => null} />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
