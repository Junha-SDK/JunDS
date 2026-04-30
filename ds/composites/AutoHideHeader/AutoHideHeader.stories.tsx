import type { Meta, StoryObj } from "@storybook/react";
import { AutoHideHeader } from "./AutoHideHeader";

const meta: Meta<typeof AutoHideHeader> = {
  title: "Composites/AutoHideHeader",
  component: AutoHideHeader,
};

export default meta;
type Story = StoryObj<typeof AutoHideHeader>;

export const Default: Story = {
  render: () => <AutoHideHeader>{null}</AutoHideHeader>,
};
