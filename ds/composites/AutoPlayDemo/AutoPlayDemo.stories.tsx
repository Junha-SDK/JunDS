import type { Meta, StoryObj } from "@storybook/react";
import { AutoPlayDemo } from "./AutoPlayDemo";

const meta: Meta<typeof AutoPlayDemo> = {
  title: "Composites/AutoPlayDemo",
  component: AutoPlayDemo,
};

export default meta;
type Story = StoryObj<typeof AutoPlayDemo>;

export const Default: Story = {
  render: () => <AutoPlayDemo frames={[]} />,
};
