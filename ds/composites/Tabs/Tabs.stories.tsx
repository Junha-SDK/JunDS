import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Composites/Tabs",
  component: Tabs,
  argTypes: {
    variant: { control: "radio", options: ["underline", "pills", "segment"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
  args: { variant: "underline", size: "md" },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const tabs = [
  { value: "all", label: "전체" },
  { value: "mine", label: "내 항목" },
  { value: "archive", label: "보관함" },
];

const tabsWithBadge = [
  { value: "inbox", label: "받은편지함", badge: 8 },
  { value: "sent", label: "보낸편지함" },
  { value: "draft", label: "임시저장", badge: 2 },
];

const Demo = (props: Parameters<typeof Tabs>[0]) => {
  const [value, setValue] = useState(props.value ?? "all");
  return <Tabs {...props} value={value} onChange={setValue} />;
};

export const Underline: Story = {
  args: { variant: "underline", tabs, value: "all" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
export const Pills: Story = {
  args: { variant: "pills", tabs, value: "all" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
export const Segment: Story = {
  args: { variant: "segment", tabs, value: "all" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
export const WithBadges: Story = {
  args: { variant: "underline", tabs: tabsWithBadge, value: "inbox" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
export const Small: Story = {
  args: { variant: "pills", tabs, value: "all", size: "sm" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
