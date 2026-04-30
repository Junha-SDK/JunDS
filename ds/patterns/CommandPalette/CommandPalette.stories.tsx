import type { Meta, StoryObj } from "@storybook/react";
import { CommandPalette } from "./CommandPalette";

const meta: Meta<typeof CommandPalette> = {
  title: "Patterns/CommandPalette",
  component: CommandPalette,
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const Default: Story = {
  render: () => <CommandPalette items={[]} />,
};
