import type { Meta, StoryObj } from "@storybook/react";
import { Dock } from "./Dock";

const meta: Meta<typeof Dock> = {
  title: "Composites/Dock",
  component: Dock,
};

export default meta;
type Story = StoryObj<typeof Dock>;

export const Default: Story = {
  render: () => <Dock>{null}</Dock>,
};
