import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "./Callout";

const meta: Meta<typeof Callout> = {
  title: "Composites/Callout",
  component: Callout,
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  render: () => <Callout>{null}</Callout>,
};
