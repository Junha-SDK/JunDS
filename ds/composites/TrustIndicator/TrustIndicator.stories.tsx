import type { Meta, StoryObj } from "@storybook/react";
import { TrustIndicator } from "./TrustIndicator";

const meta: Meta<typeof TrustIndicator> = {
  title: "Composites/TrustIndicator",
  component: TrustIndicator,
};

export default meta;
type Story = StoryObj<typeof TrustIndicator>;

export const Default: Story = {
  render: () => <TrustIndicator items={[]} />,
};
