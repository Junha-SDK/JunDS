import type { Meta, StoryObj } from "@storybook/react";
import { NotificationCenter } from "./NotificationCenter";

const meta: Meta<typeof NotificationCenter> = {
  title: "Patterns/NotificationCenter",
  component: NotificationCenter,
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {
  render: () => <NotificationCenter notifications={[]} />,
};
