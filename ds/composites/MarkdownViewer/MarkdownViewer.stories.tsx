import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownViewer } from "./MarkdownViewer";

const meta: Meta<typeof MarkdownViewer> = {
  title: "Composites/MarkdownViewer",
  component: MarkdownViewer,
};

export default meta;
type Story = StoryObj<typeof MarkdownViewer>;

export const Default: Story = {
  render: () => <MarkdownViewer content="" />,
};
