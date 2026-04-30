import type { Meta, StoryObj } from "@storybook/react";
import { Globe } from "./Globe";

const meta: Meta<typeof Globe> = {
  title: "Composites/Globe",
  component: Globe,
};

export default meta;
type Story = StoryObj<typeof Globe>;

export const Default: Story = {
  render: () => <Globe />,
};
