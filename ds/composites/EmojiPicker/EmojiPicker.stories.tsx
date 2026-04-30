import type { Meta, StoryObj } from "@storybook/react";
import { EmojiPicker } from "./EmojiPicker";

const meta: Meta<typeof EmojiPicker> = {
  title: "Composites/EmojiPicker",
  component: EmojiPicker,
};

export default meta;
type Story = StoryObj<typeof EmojiPicker>;

export const Default: Story = {
  render: () => <EmojiPicker onSelect={() => {}} />,
};
