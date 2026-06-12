"use client";

import type { ComponentEntry } from "@/ds/runtime";
import { defaultRegistry, createRegistry } from "@/ds/runtime";

const PlusIcon = (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const overrides: Record<string, () => Record<string, unknown>> = {
  IconButton: () => ({
    icon: PlusIcon,
    label: "아이콘 버튼",
  }),
  SegmentedControl: () => ({
    options: [
      { key: "1", label: "옵션 1" },
      { key: "2", label: "옵션 2" },
      { key: "3", label: "옵션 3" },
    ],
    value: "1",
    onChange: () => {},
  }),
  Stepper: () => ({
    steps: [
      { key: "1", title: "정보 입력" },
      { key: "2", title: "확인" },
      { key: "3", title: "완료" },
    ],
  }),
  Slider: () => ({
    value: 50,
    onChange: () => {},
  }),
  Toggle: () => ({
    checked: false,
    onChange: () => {},
  }),
  Switch: () => ({
    checked: false,
    onChange: () => {},
  }),
  StarRating: () => ({
    onChange: () => {},
  }),
  Input: () => ({
    readOnly: true,
    placeholder: "입력...",
  }),
  Textarea: () => ({
    readOnly: true,
    placeholder: "입력...",
  }),
  Button: () => ({
    type: "button",
  }),
  Checkbox: () => ({
    label: "체크박스",
  }),
  Skeleton: () => ({
    width: "100%",
    height: "40px",
  }),
  ProgressBar: () => ({
    value: 60,
    max: 100,
  }),
  StatCard: () => ({
    label: "통계",
    value: "1,234",
  }),
  EmptyState: () => ({
    title: "데이터 없음",
  }),
  Result: () => ({
    status: "success",
    title: "완료",
  }),
  Kbd: () => ({
    children: "\u2318K",
  }),
};

const enriched: ComponentEntry[] = defaultRegistry.list().map((entry) => {
  const previewProps = overrides[entry.id];
  if (!previewProps) return entry;
  return { ...entry, previewProps };
});

export const labRegistry = createRegistry(enriched);
