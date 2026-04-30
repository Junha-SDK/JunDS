import type { Meta, StoryObj } from "@storybook/react";
import { Notification } from "./Notification";

const meta: Meta<typeof Notification> = {
  title: "Composites/Notification",
  component: Notification,
};

export default meta;
type Story = StoryObj<typeof Notification>;

export const Default: Story = {
  render: () => <Notification title="" />,
};
