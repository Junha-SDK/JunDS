import type { Meta, StoryObj } from "@storybook/react";
import { Menubar } from "./Menubar";

const meta: Meta<typeof Menubar> = {
  title: "Composites/Menubar",
  component: Menubar,
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => <Menubar items={[]} />,
};
