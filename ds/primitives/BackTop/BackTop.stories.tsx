import type { Meta, StoryObj } from "@storybook/react";
import { BackTop } from "./BackTop";

const meta: Meta<typeof BackTop> = {
  title: "Primitives/BackTop",
  component: BackTop,
};

export default meta;
type Story = StoryObj<typeof BackTop>;

export const Default: Story = {
  render: () => <BackTop />,
};
