import type { Meta, StoryObj } from "@storybook/react";
import { Typewriter } from "./Typewriter";

const meta: Meta<typeof Typewriter> = {
  title: "Composites/Typewriter",
  component: Typewriter,
};

export default meta;
type Story = StoryObj<typeof Typewriter>;

export const Default: Story = {
  render: () => <Typewriter texts={[]} />,
};
