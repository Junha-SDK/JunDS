import type { Meta, StoryObj } from "@storybook/react";
import { TreeNav } from "./TreeNav";

const meta: Meta<typeof TreeNav> = {
  title: "Composites/TreeNav",
  component: TreeNav,
};

export default meta;
type Story = StoryObj<typeof TreeNav>;

export const Default: Story = {
  render: () => <TreeNav items={[]} />,
};
