import type { Meta, StoryObj } from "@storybook/react";
import { TagInput } from "./TagInput";

const meta: Meta<typeof TagInput> = {
  title: "Composites/TagInput",
  component: TagInput,
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  render: () => <TagInput value={[]} onChange={() => {}} />,
};
