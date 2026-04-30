import type { Meta, StoryObj } from "@storybook/react";
import { DiffViewer } from "./DiffViewer";

const meta: Meta<typeof DiffViewer> = {
  title: "Composites/DiffViewer",
  component: DiffViewer,
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

export const Default: Story = {
  render: () => <DiffViewer oldText="" newText="" />,
};
