import type { Meta, StoryObj } from "@storybook/react";
import { ReadingTime } from "./ReadingTime";

const meta: Meta<typeof ReadingTime> = {
  title: "Composites/ReadingTime",
  component: ReadingTime,
};

export default meta;
type Story = StoryObj<typeof ReadingTime>;

export const Default: Story = {
  render: () => <ReadingTime content="" />,
};
