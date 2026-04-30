import type { Meta, StoryObj } from "@storybook/react";
import { TreeView } from "./TreeView";

const meta: Meta<typeof TreeView> = {
  title: "Composites/TreeView",
  component: TreeView,
};

export default meta;
type Story = StoryObj<typeof TreeView>;

export const Default: Story = {
  render: () => <TreeView nodes={[]} />,
};
