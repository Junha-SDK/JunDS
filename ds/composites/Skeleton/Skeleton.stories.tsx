import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Composites/Skeleton",
  component: Skeleton,
  argTypes: {
    variant: { control: "radio", options: ["text", "circle", "rect"] },
  },
  args: { variant: "text", lines: 3 },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: { variant: "text", lines: 3 },
  render: (args: React.ComponentProps<typeof Skeleton>) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

export const SingleLine: Story = {
  args: { variant: "text", lines: 1 },
  render: (args: React.ComponentProps<typeof Skeleton>) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

export const Circle: Story = {
  args: { variant: "circle", width: 48, height: 48 },
};

export const Rect: Story = {
  args: { variant: "rect", width: "100%", height: 160 },
  render: (args: React.ComponentProps<typeof Skeleton>) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

export const CardLayout: Story = {
  render: () => (
    <div className="w-80 p-4 border border-border rounded-xl flex gap-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  ),
};
