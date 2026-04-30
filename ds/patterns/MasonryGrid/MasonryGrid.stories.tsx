import type { Meta, StoryObj } from "@storybook/react";
import { MasonryGrid } from "./MasonryGrid";

const meta: Meta<typeof MasonryGrid> = {
  title: "Patterns/MasonryGrid",
  component: MasonryGrid,
};

export default meta;
type Story = StoryObj<typeof MasonryGrid>;

export const Default: Story = {
  render: () => <MasonryGrid>{null}</MasonryGrid>,
};
