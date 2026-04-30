import type { Meta, StoryObj } from "@storybook/react";
import { ScrollSpy } from "./ScrollSpy";

const meta: Meta<typeof ScrollSpy> = {
  title: "Composites/ScrollSpy",
  component: ScrollSpy,
};

export default meta;
type Story = StoryObj<typeof ScrollSpy>;

export const Default: Story = {
  render: () => <ScrollSpy sections={[]} />,
};
