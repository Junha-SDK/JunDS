import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Sparkline } from "@/ds/finance/Sparkline";
import { MiniCandle } from "@/ds/finance/MiniCandle";
import { DonutChart } from "@/ds/finance/DonutChart";
import { AreaChart } from "@/ds/finance/AreaChart";
import { MultiLineChart } from "@/ds/finance/MultiLineChart";
import { QuarterBarChart } from "@/ds/finance/QuarterBarChart";
import { PriceBadge, HotPctChip } from "@/ds/finance/PriceBadge";
import { PositionBar } from "@/ds/finance/PositionBar";
import { SegmentedPill } from "@/ds/finance/SegmentedPill";
import { DisclosureToneBadge } from "@/ds/finance/DisclosureToneBadge";
import { classifyDisclosure } from "@/ds/finance/lib/disclosureTone";

describe("Sparkline", () => {
  it("renders an svg polyline for the data", () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 2, 5]} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const poly = container.querySelector("polyline");
    expect(poly).not.toBeNull();
    expect(poly!.getAttribute("points")!.split(" ")).toHaveLength(5);
  });

  it("renders nothing for empty data", () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("draws a gradient fill and baseline when requested", () => {
    const { container } = render(
      <Sparkline data={[1, 2, 3]} fill="var(--bm-up)" showBaseline />,
    );
    expect(container.querySelector("linearGradient")).not.toBeNull();
    expect(container.querySelector("line")).not.toBeNull();
  });

  it("omits the end dot when showEndDot is false", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} showEndDot={false} />);
    expect(container.querySelectorAll("circle")).toHaveLength(0);
  });
});

describe("MiniCandle", () => {
  it("renders 8 candles (wick + body each)", () => {
    const { container } = render(<MiniCandle seed={42} />);
    expect(container.querySelectorAll("line")).toHaveLength(8);
    expect(container.querySelectorAll("rect")).toHaveLength(8);
  });

  it("is deterministic for the same seed", () => {
    const a = render(<MiniCandle seed={7} />).container.innerHTML;
    const b = render(<MiniCandle seed={7} />).container.innerHTML;
    expect(a).toBe(b);
  });
});

describe("DonutChart", () => {
  const data = [
    { label: "국내주식", value: 60, color: "#111" },
    { label: "해외주식", value: 30, color: "#222" },
    { label: "현금", value: 10, color: "#333" },
  ];

  it("renders one arc path per slice", () => {
    const { container } = render(<DonutChart data={data} />);
    expect(container.querySelectorAll("path")).toHaveLength(3);
  });

  it("shows center label and value when provided", () => {
    const { getByText } = render(
      <DonutChart data={data} centerLabel="총 자산" centerValue="1.2억" />,
    );
    expect(getByText("총 자산")).toBeTruthy();
    expect(getByText("1.2억")).toBeTruthy();
  });
});

describe("AreaChart", () => {
  it("renders an svg with axis labels for the data", () => {
    const { container } = render(<AreaChart data={[10, 12, 11, 15, 14]} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("renders nothing for empty data", () => {
    const { container } = render(<AreaChart data={[]} />);
    expect(container.firstElementChild).toBeNull();
  });
});

describe("MultiLineChart", () => {
  const series = [
    { name: "KOSPI", color: "#e11", data: [100, 102, 104, 103] },
    { name: "KOSDAQ", color: "#12b", data: [100, 98, 101, 105] },
  ];

  it("renders a line per series plus a legend", () => {
    const { container, getByText } = render(<MultiLineChart series={series} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(getByText("KOSPI")).toBeTruthy();
    expect(getByText("KOSDAQ")).toBeTruthy();
  });

  it("hides the legend when showLegend is false", () => {
    const { queryByText } = render(<MultiLineChart series={series} showLegend={false} />);
    expect(queryByText("KOSPI")).toBeNull();
  });
});

describe("QuarterBarChart", () => {
  const rows = [
    { label: "24.1Q", revenue: 100, operatingIncome: 12, netIncome: 9, eps: 120 },
    { label: "24.2Q", revenue: 110, operatingIncome: 14, netIncome: 11, eps: 140 },
    { label: "24.3Q", revenue: 120, operatingIncome: 15, netIncome: 12, eps: 150 },
  ];

  it("renders paired bars per quarter", () => {
    const { container, getByText } = render(<QuarterBarChart data={rows} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBeGreaterThanOrEqual(6);
    expect(getByText("24.1Q")).toBeTruthy();
  });

  it("switches the second metric with the metric prop", () => {
    const { getByText } = render(<QuarterBarChart data={rows} metric="revenue-net" />);
    expect(getByText("순이익")).toBeTruthy();
  });
});

describe("PriceBadge / HotPctChip", () => {
  it("shows a signed percentage with up color", () => {
    const { getByText } = render(<PriceBadge pct={2.34} />);
    const el = getByText("+2.34%").closest("span") as HTMLElement;
    expect(el.style.color).toBe("var(--bm-up)");
  });

  it("uses down color and no arrow icon for zero", () => {
    const { getByText, container } = render(<PriceBadge pct={0} />);
    expect(getByText("0.00%")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull(); // flat → no arrow
  });

  it("shows down color for losses", () => {
    const { getByText } = render(<PriceBadge pct={-1.2} />);
    const el = getByText("-1.20%").closest("span") as HTMLElement;
    expect(el.style.color).toBe("var(--bm-down)");
  });

  it("HotPctChip renders the formatted percentage", () => {
    const { getByText } = render(<HotPctChip pct={5.678} />);
    expect(getByText(/5\.68%/)).toBeTruthy();
  });
});

describe("PositionBar", () => {
  it("renders range and marker layers clamped to 0-100%", () => {
    const { container } = render(<PositionBar low={0.2} high={0.8} cur={0.5} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.children.length).toBeGreaterThanOrEqual(2);
    const range = root.children[0] as HTMLElement;
    expect(range.style.left).toBe("20%");
    expect(range.style.width).toBe("60%");
  });

  it("clamps out-of-range inputs", () => {
    const { container } = render(<PositionBar low={-1} high={2} cur={3} />);
    const range = (container.firstElementChild as HTMLElement).children[0] as HTMLElement;
    expect(range.style.left).toBe("0%");
    expect(range.style.width).toBe("100%");
  });
});

describe("SegmentedPill", () => {
  const options = [
    { key: "d", label: "일봉" },
    { key: "w", label: "주봉" },
    { key: "m", label: "월봉", disabled: true },
  ];

  it("renders a tablist with one tab per option", () => {
    const { getAllByRole } = render(
      <SegmentedPill options={options} value="d" onChange={() => {}} />,
    );
    expect(getAllByRole("tab")).toHaveLength(3);
  });

  it("fires onChange with the clicked option key", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <SegmentedPill options={options} value="d" onChange={onChange} />,
    );
    fireEvent.click(getByText("주봉"));
    expect(onChange).toHaveBeenCalledWith("w");
  });
});

describe("DisclosureToneBadge", () => {
  it("renders the tone label for a classified disclosure", () => {
    const cls = classifyDisclosure("유상증자 결정");
    const { getByText } = render(<DisclosureToneBadge classification={cls} compact />);
    expect(getByText("악재")).toBeTruthy();
  });

  it("renders positive tone as 호재", () => {
    const cls = classifyDisclosure("자사주 소각");
    const { getByText } = render(<DisclosureToneBadge classification={cls} compact />);
    expect(getByText("호재")).toBeTruthy();
  });
});
