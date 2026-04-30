import type { Meta, StoryObj } from "@storybook/react";
import { Mention } from "./Mention";

const meta: Meta<typeof Mention> = {
  title: "Composites/Mention",
  component: Mention,
};

export default meta;
type Story = StoryObj<typeof Mention>;

export const Default: Story = {
  render: () => <Mention value="" onChange={() => {}} users={[]} />,
};
