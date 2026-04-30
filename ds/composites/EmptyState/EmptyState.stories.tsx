import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import { Button } from "../../primitives/Button";

const meta: Meta<typeof EmptyState> = {
  title: "Composites/EmptyState",
  component: EmptyState,
  args: {
    title: "업무가 없습니다",
    description: "새 업무를 추가해보세요",
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const InboxIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: InboxIcon,
    title: "받은편지함이 비어 있습니다",
    description: "새로운 메시지가 도착하면 여기에 표시됩니다.",
  },
};

export const WithAction: Story = {
  args: {
    icon: InboxIcon,
    title: "프로젝트가 없습니다",
    description: "첫 번째 프로젝트를 만들어 시작해보세요.",
    action: <Button variant="primary">프로젝트 만들기</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    title: "검색 결과가 없습니다",
    description: undefined,
  },
};
