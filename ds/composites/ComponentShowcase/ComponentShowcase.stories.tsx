import type { Meta, StoryObj } from "@storybook/react";
import { ComponentShowcase } from "./ComponentShowcase";

const meta: Meta<typeof ComponentShowcase> = {
  title: "Composites/ComponentShowcase",
  component: ComponentShowcase,
};

export default meta;
type Story = StoryObj<typeof ComponentShowcase>;

export const Default: Story = {
  render: () => <ComponentShowcase items={[]} />,
};
