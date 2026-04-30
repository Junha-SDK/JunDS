import type { Meta, StoryObj } from "@storybook/react";
import { Onboarding } from "./Onboarding";

const meta: Meta<typeof Onboarding> = {
  title: "Composites/Onboarding",
  component: Onboarding,
};

export default meta;
type Story = StoryObj<typeof Onboarding>;

export const Default: Story = {
  render: () => <Onboarding steps={[]} />,
};
