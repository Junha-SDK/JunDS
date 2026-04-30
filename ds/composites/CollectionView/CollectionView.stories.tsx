import type { Meta, StoryObj } from "@storybook/react";
import { CollectionView } from "./CollectionView";

const meta: Meta<typeof CollectionView> = {
  title: "Composites/CollectionView",
  component: CollectionView,
};

export default meta;
type Story = StoryObj<typeof CollectionView>;

export const Default: Story = {
  render: () => <CollectionView items={[]} />,
};
