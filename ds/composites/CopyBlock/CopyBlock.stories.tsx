import type { Meta, StoryObj } from "@storybook/react";
import { CopyBlock } from "./CopyBlock";

const meta: Meta<typeof CopyBlock> = {
  title: "Composites/CopyBlock",
  component: CopyBlock,
};

export default meta;
type Story = StoryObj<typeof CopyBlock>;

export const Default: Story = {
  render: () => <CopyBlock code="" />,
};
