import type { Meta, StoryObj } from "@storybook/react";
import { ActionBar } from "./ActionBar";

const meta: Meta<typeof ActionBar> = {
  title: "Patterns/ActionBar",
  component: ActionBar,
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {
  render: () => <ActionBar count={0} open={false} actions={null} />,
};
