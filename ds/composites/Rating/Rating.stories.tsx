import type { Meta, StoryObj } from "@storybook/react";
import { Rating } from "./Rating";

const meta: Meta<typeof Rating> = {
  title: "Composites/Rating",
  component: Rating,
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  render: () => <Rating value={0} />,
};
