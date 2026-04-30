import type { Meta, StoryObj } from "@storybook/react";
import { BentoGrid } from "./BentoGrid";

const meta: Meta<typeof BentoGrid> = {
  title: "Composites/BentoGrid",
  component: BentoGrid,
};

export default meta;
type Story = StoryObj<typeof BentoGrid>;

export const Default: Story = {
  render: () => <BentoGrid>{null}</BentoGrid>,
};
