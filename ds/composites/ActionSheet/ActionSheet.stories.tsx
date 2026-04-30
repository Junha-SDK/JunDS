import type { Meta, StoryObj } from "@storybook/react";
import { ActionSheet } from "./ActionSheet";

const meta: Meta<typeof ActionSheet> = {
  title: "Composites/ActionSheet",
  component: ActionSheet,
};

export default meta;
type Story = StoryObj<typeof ActionSheet>;

export const Default: Story = {
  render: () => <ActionSheet open={false} onClose={() => {}} actions={[]} />,
};
