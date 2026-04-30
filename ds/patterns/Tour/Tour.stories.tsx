import type { Meta, StoryObj } from "@storybook/react";
import { Tour } from "./Tour";

const meta: Meta<typeof Tour> = {
  title: "Patterns/Tour",
  component: Tour,
};

export default meta;
type Story = StoryObj<typeof Tour>;

export const Default: Story = {
  render: () => <Tour steps={[]} open={false} onClose={() => {}} />,
};
