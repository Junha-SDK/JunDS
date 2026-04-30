import type { Meta, StoryObj } from "@storybook/react";
import { AudioPlayer } from "./AudioPlayer";

const meta: Meta<typeof AudioPlayer> = {
  title: "Composites/AudioPlayer",
  component: AudioPlayer,
};

export default meta;
type Story = StoryObj<typeof AudioPlayer>;

export const Default: Story = {
  render: () => <AudioPlayer src="" />,
};
