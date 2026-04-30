import type { Meta, StoryObj } from "@storybook/react";
import { CopyButton } from "./CopyButton";

const meta: Meta<typeof CopyButton> = {
  title: "Primitives/CopyButton",
  component: CopyButton,
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {
  render: () => <CopyButton text="" />,
};
