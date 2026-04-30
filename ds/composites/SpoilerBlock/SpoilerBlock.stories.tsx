import type { Meta, StoryObj } from "@storybook/react";
import { SpoilerBlock } from "./SpoilerBlock";

const meta: Meta<typeof SpoilerBlock> = {
  title: "Composites/SpoilerBlock",
  component: SpoilerBlock,
};

export default meta;
type Story = StoryObj<typeof SpoilerBlock>;

export const Default: Story = {
  render: () => <SpoilerBlock>{null}</SpoilerBlock>,
};
