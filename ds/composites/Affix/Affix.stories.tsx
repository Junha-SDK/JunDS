import type { Meta, StoryObj } from "@storybook/react";
import { Affix } from "./Affix";

const meta: Meta<typeof Affix> = {
  title: "Composites/Affix",
  component: Affix,
};

export default meta;
type Story = StoryObj<typeof Affix>;

export const Default: Story = {
  render: () => <Affix>{null}</Affix>,
};
