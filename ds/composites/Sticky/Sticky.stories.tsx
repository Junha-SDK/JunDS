import type { Meta, StoryObj } from "@storybook/react";
import { Sticky } from "./Sticky";

const meta: Meta<typeof Sticky> = {
  title: "Composites/Sticky",
  component: Sticky,
};

export default meta;
type Story = StoryObj<typeof Sticky>;

export const Default: Story = {
  render: () => <Sticky>{null}</Sticky>,
};
