import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Primitives/Tag",
  component: Tag,
  argTypes: {
    color: {
      control: "select",
      options: ["gray", "primary", "blue", "green", "red", "orange", "purple", "teal"],
    },
    closable: { control: "boolean" },
  },
  args: { children: "태그", color: "gray" },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Gray: Story = { args: { color: "gray" } };
export const Primary: Story = { args: { color: "primary" } };
export const Blue: Story = { args: { color: "blue" } };
export const Green: Story = { args: { color: "green" } };
export const Red: Story = { args: { color: "red" } };
export const Orange: Story = { args: { color: "orange" } };
export const Closable: Story = {
  args: { color: "blue", closable: true, children: "프론트엔드" },
};
