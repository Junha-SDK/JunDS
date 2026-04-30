import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Composites/Popover",
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => <Popover trigger={null} content={null} />,
};
