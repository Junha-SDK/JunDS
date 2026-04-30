import type { Meta, StoryObj } from "@storybook/react";
import { KeyValueGrid } from "./KeyValueGrid";

const meta: Meta<typeof KeyValueGrid> = {
  title: "Composites/KeyValueGrid",
  component: KeyValueGrid,
};

export default meta;
type Story = StoryObj<typeof KeyValueGrid>;

export const Default: Story = {
  render: () => <KeyValueGrid items={[]} />,
};
