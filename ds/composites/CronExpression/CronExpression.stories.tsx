import type { Meta, StoryObj } from "@storybook/react";
import { CronExpression } from "./CronExpression";

const meta: Meta<typeof CronExpression> = {
  title: "Composites/CronExpression",
  component: CronExpression,
};

export default meta;
type Story = StoryObj<typeof CronExpression>;

export const Default: Story = {
  render: () => <CronExpression value="" onChange={() => {}} />,
};
