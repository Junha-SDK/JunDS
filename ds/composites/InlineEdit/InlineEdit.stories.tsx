import type { Meta, StoryObj } from "@storybook/react";
import { InlineEdit } from "./InlineEdit";

const meta: Meta<typeof InlineEdit> = {
  title: "Composites/InlineEdit",
  component: InlineEdit,
};

export default meta;
type Story = StoryObj<typeof InlineEdit>;

export const Default: Story = {
  render: () => <InlineEdit value="" onChange={() => {}} />,
};
