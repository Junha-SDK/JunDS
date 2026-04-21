import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartCard } from "../../patterns/ChartCard";

const data = [
  { label: "월", value: 12 },
  { label: "화", value: 18 },
  { label: "수", value: 9 },
];

describe("ChartCard", () => {
  it("renders the title and KPI value", () => {
    render(<ChartCard title="월간 매출" type="bar" data={data} value="120만" />);

    expect(screen.getByText("월간 매출")).toBeInTheDocument();
    expect(screen.getByText("120만")).toBeInTheDocument();
  });

  it("supports trend badges", () => {
    render(
      <ChartCard
        title="활성 사용자"
        type="sparkline"
        data={data}
        trend={{ value: "+12%", direction: "up", label: "전주 대비" }}
      />,
    );

    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("전주 대비")).toBeInTheDocument();
  });

  it("renders the new line chart type", () => {
    render(<ChartCard title="전환 추이" type="line" data={data} />);

    expect(screen.getByRole("img", { name: "전환 추이 라인 차트" })).toBeInTheDocument();
  });

  it("renders stacked bar legends", () => {
    render(
      <ChartCard
        title="릴리즈 현황"
        type="stacked-bar"
        data={[
          {
            label: "Core",
            value: 0,
            segments: [
              { label: "완료", value: 20 },
              { label: "진행", value: 10 },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("완료")).toBeInTheDocument();
    expect(screen.getByText("진행")).toBeInTheDocument();
  });

  it("uses a custom value formatter", () => {
    render(
      <ChartCard
        title="진행률"
        type="progress"
        data={[{ label: "온보딩", value: 78 }]}
        max={100}
        formatValue={(value) => `${value}%`}
      />,
    );

    expect(screen.getByText("78%")).toBeInTheDocument();
  });

  it("shows loading and empty states", () => {
    const { container, rerender } = render(<ChartCard title="로딩" type="bar" data={[]} loading />);
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();

    rerender(<ChartCard title="빈 차트" type="area" data={[]} emptyMessage="데이터 없음" />);
    expect(screen.getByText("데이터 없음")).toBeInTheDocument();
  });
});
