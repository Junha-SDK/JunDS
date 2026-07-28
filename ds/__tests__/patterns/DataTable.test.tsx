import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "../../patterns/DataTable";
import type { DataTableColumn } from "../../patterns/DataTable";

interface Item {
  id: string;
  name: string;
  age: number;
}

const data: Item[] = [
  { id: "1", name: "김준하", age: 28 },
  { id: "2", name: "이서연", age: 25 },
  { id: "3", name: "박민수", age: 30 },
];

const columns: DataTableColumn<Item>[] = [
  {
    key: "name",
    header: "이름",
    render: (r) => r.name,
    sortable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name),
  },
  { key: "age", header: "나이", render: (r) => String(r.age) },
];

describe("DataTable", () => {
  it("renders rows", () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("김준하")).toBeInTheDocument();
    expect(screen.getByText("이서연")).toBeInTheDocument();
    expect(screen.getByText("박민수")).toBeInTheDocument();
  });

  it("renders headers", () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("나이")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<DataTable columns={columns} data={[]} rowKey={(r) => r.id} emptyMessage="비어있음" />);
    expect(screen.getByText("비어있음")).toBeInTheDocument();
  });

  it("handles row click", () => {
    const onClick = vi.fn();
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} onRowClick={onClick} />);
    fireEvent.click(screen.getByText("김준하"));
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  it("handles selection", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // first data row
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("does not mark the page checkbox mixed for selections outside the current page", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={new Set(["outside-page"])}
      />,
    );

    const headerCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(headerCheckbox.indeterminate).toBe(false);
  });

  it("announces sortable header state", () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);

    const nameHeader = screen.getByRole("columnheader", { name: /이름/ });
    const sortButton = screen.getByRole("button", { name: /이름/ });

    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    fireEvent.click(sortButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    fireEvent.click(sortButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("paginates data", () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      age: 20 + i,
    }));
    render(<DataTable columns={columns} data={manyItems} rowKey={(r) => r.id} pageSize={10} />);
    expect(screen.getByText("User 0")).toBeInTheDocument();
    expect(screen.queryByText("User 15")).not.toBeInTheDocument();
  });

  it("renders a table footer summary", () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      age: 20 + i,
    }));

    render(<DataTable columns={columns} data={manyItems} rowKey={(r) => r.id} pageSize={10} />);
    expect(screen.getByText("1–10")).toBeInTheDocument();
    expect(screen.getByText(/총 25개/)).toBeInTheDocument();
  });
});
