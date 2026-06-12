"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

interface SkeletonProps {
  height?: number;
  className?: string;
}

function ChartSkeleton({ height = 240, className }: SkeletonProps) {
  return (
    <div
      className={`bm-skeleton w-full ${className ?? ""}`}
      style={{ height }}
      aria-busy="true"
      aria-label="차트 로딩 중"
    />
  );
}

export const LazyCandleChart: ComponentType<any> = dynamic(
  () => import("../CandleChart").then((m) => ({ default: m.CandleChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

export const LazyRealCandleChart: ComponentType<any> = dynamic(
  () => import("../RealCandleChart").then((m) => ({ default: m.RealCandleChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={420} />,
  },
);

export const LazyMarketHeatmap: ComponentType<any> = dynamic(
  () => import("../MarketHeatmap").then((m) => ({ default: m.MarketHeatmap })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

export const LazyMultiLineChart: ComponentType<any> = dynamic(
  () => import("../MultiLineChart").then((m) => ({ default: m.MultiLineChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

export const LazyInvestorFlowChart: ComponentType<any> = dynamic(
  () => import("../InvestorFlowChart").then((m) => ({ default: m.InvestorFlowChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={220} />,
  },
);

export const LazyQuarterBarChart: ComponentType<any> = dynamic(
  () => import("../QuarterBarChart").then((m) => ({ default: m.QuarterBarChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={260} />,
  },
);
