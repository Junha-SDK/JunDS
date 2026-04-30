import type { Meta, StoryObj } from "@storybook/react";
import { BatteryIndicator } from "./BatteryIndicator";

const meta: Meta<typeof BatteryIndicator> = {
  title: "Primitives/BatteryIndicator",
  component: BatteryIndicator,
};

export default meta;
type Story = StoryObj<typeof BatteryIndicator>;

export const Default: Story = {
  render: () => <BatteryIndicator value={0} />,
};
