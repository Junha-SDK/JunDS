import type { Meta, StoryObj } from "@storybook/react";
import { BottomSheet } from "./BottomSheet";

const meta: Meta<typeof BottomSheet> = {
  title: "Composites/BottomSheet",
  component: BottomSheet,
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: () => (
    <BottomSheet open={false} onClose={() => {}}>
      {null}
    </BottomSheet>
  ),
};
