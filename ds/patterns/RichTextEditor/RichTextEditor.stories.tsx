import type { Meta, StoryObj } from "@storybook/react";
import { RichTextEditor } from "./RichTextEditor";

const meta: Meta<typeof RichTextEditor> = {
  title: "Patterns/RichTextEditor",
  component: RichTextEditor,
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  render: () => <RichTextEditor />,
};
