import type { Meta, StoryObj } from "@storybook/react";
import { Spotlight } from "./Spotlight";

const meta: Meta<typeof Spotlight> = {
  title: "Composites/Spotlight",
  component: Spotlight,
};

export default meta;
type Story = StoryObj<typeof Spotlight>;

export const Default: Story = {
  render: () => <Spotlight target="" active={false} />,
};
