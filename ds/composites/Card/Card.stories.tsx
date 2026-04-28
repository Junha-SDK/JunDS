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
        <button className="text-sm text-primary">더보기</button>
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
