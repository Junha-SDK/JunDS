import type { Meta, StoryObj } from "@storybook/react";
import { FlowDiagram } from "./FlowDiagram";

const meta: Meta<typeof FlowDiagram> = {
  title: "Patterns/FlowDiagram",
  component: FlowDiagram,
};

export default meta;
type Story = StoryObj<typeof FlowDiagram>;

export const Default: Story = {
  render: () => <FlowDiagram nodes={[]} connections={[]} />,
};
