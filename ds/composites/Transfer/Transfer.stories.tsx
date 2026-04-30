import type { Meta, StoryObj } from "@storybook/react";
import { Transfer } from "./Transfer";

const meta: Meta<typeof Transfer> = {
  title: "Composites/Transfer",
  component: Transfer,
};

export default meta;
type Story = StoryObj<typeof Transfer>;

export const Default: Story = {
  render: () => <Transfer source={[]} target={[]} onChange={() => {}} />,
};
