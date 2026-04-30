import type { Meta, StoryObj } from "@storybook/react";
import { CodeEditor } from "./CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Composites/CodeEditor",
  component: CodeEditor,
};

export default meta;
type Story = StoryObj<typeof CodeEditor>;

export const Default: Story = {
  render: () => <CodeEditor value="" />,
};
