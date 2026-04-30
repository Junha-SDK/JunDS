import type { Meta, StoryObj } from "@storybook/react";
import { Descriptions } from "./Descriptions";

const meta: Meta<typeof Descriptions> = {
  title: "Composites/Descriptions",
  component: Descriptions,
};

export default meta;
type Story = StoryObj<typeof Descriptions>;

export const Default: Story = {
  render: () => <Descriptions items={[]} />,
};
