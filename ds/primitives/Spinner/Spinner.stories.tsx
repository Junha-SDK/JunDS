import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Primitives/Spinner",
  component: Spinner,
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "white", "muted"] },
  },
  args: { size: "md", color: "primary" },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};
export const ExtraSmall: Story = { args: { size: "xs" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const Muted: Story = { args: { color: "muted" } };
export const OnDark: Story = {
  args: { color: "white" },
  render: (args: React.ComponentProps<typeof Spinner>) => (
    <div className="bg-gray-900 p-6 rounded-lg inline-block">
      <Spinner {...args} />
    </div>
  ),
};
