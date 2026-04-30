import type { Meta, StoryObj } from "@storybook/react";
import { AvatarStack } from "./AvatarStack";

const meta: Meta<typeof AvatarStack> = {
  title: "Composites/AvatarStack",
  component: AvatarStack,
};

export default meta;
type Story = StoryObj<typeof AvatarStack>;

export const Default: Story = {
  render: () => <AvatarStack names={[]} />,
};
