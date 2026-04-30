import type { Meta, StoryObj } from "@storybook/react";
import { AutoComplete } from "./AutoComplete";

const meta: Meta<typeof AutoComplete> = {
  title: "Composites/AutoComplete",
  component: AutoComplete,
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

export const Default: Story = {
  render: () => <AutoComplete value="" onChange={() => {}} options={[]} />,
};
