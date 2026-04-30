import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Composites/Accordion",
  component: Accordion,
  argTypes: {
    single: { control: "boolean" },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const items = [
  {
    key: "shipping",
    title: "배송 정책",
    content: <p>주문 후 영업일 기준 1~3일 이내에 발송됩니다.</p>,
  },
  {
    key: "return",
    title: "반품/교환",
    content: <p>수령 후 7일 이내에 반품/교환 신청이 가능합니다.</p>,
  },
  {
    key: "payment",
    title: "결제 방법",
    content: <p>카드, 계좌이체, 간편결제를 지원합니다.</p>,
  },
];

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <Accordion items={items} />
    </div>
  ),
};

export const SingleOpen: Story = {
  render: () => (
    <div className="w-96">
      <Accordion items={items} single />
    </div>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <div className="w-96">
      <Accordion
        items={items.map((item, i) => ({ ...item, defaultOpen: i === 0 }))}
      />
    </div>
  ),
};
