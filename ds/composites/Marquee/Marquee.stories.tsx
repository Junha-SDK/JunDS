import type { Meta, StoryObj } from "@storybook/react";
import { Marquee } from "./Marquee";

const meta: Meta<typeof Marquee> = {
  title: "Composites/Marquee",
  component: Marquee,
};

export default meta;
type Story = StoryObj<typeof Marquee>;

export const Default: Story = {
  render: () => <Marquee>{null}</Marquee>,
};
