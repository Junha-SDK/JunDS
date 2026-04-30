import type { Meta, StoryObj } from "@storybook/react";
import { AlertDialog } from "./AlertDialog";

const meta: Meta<typeof AlertDialog> = {
  title: "Composites/AlertDialog",
  component: AlertDialog,
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => <AlertDialog open={false} onConfirm={() => {}} onCancel={() => {}} title="" description="" />,
};
