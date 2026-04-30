import type { Meta, StoryObj } from "@storybook/react";
import { Starfield } from "./Starfield";

const meta: Meta<typeof Starfield> = {
  title: "Patterns/Starfield",
  component: Starfield,
};

export default meta;
type Story = StoryObj<typeof Starfield>;

export const Default: Story = {
  render: () => <Starfield />,
};
