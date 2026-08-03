import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Composites/Card",
  component: Card,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <Card.Header>카드 제목</Card.Header>
      <Card.Body>카드 내용이 여기에 들어갑니다.</Card.Body>
      <Card.Footer>
        {/* 스토리도 기준선을 보여 주는 자리다 — 누를 수 있는 것에는 세 상태가 전부 있어야 한다. */}
        <button
          type="button"
          className="text-sm text-primary-ink rounded-lg px-2 py-1 -mx-2 cursor-pointer transition-colors hover:bg-primary-light hover:text-primary-hover active:bg-primary-light/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          더보기
        </button>
      </Card.Footer>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80 p-5">
      <p className="text-sm">심플한 카드</p>
    </Card>
  ),
};
