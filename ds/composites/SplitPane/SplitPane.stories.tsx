import type { Meta, StoryObj } from "@storybook/react";
import { SplitPane } from "./SplitPane";

const meta: Meta<typeof SplitPane> = {
  title: "Composites/SplitPane",
  component: SplitPane,
};

export default meta;
type Story = StoryObj<typeof SplitPane>;

export const Default: Story = {
  render: () => <SplitPane left={null} right={null} />,
};
