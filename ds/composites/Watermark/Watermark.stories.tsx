import type { Meta, StoryObj } from "@storybook/react";
import { Watermark } from "./Watermark";

const meta: Meta<typeof Watermark> = {
  title: "Composites/Watermark",
  component: Watermark,
};

export default meta;
type Story = StoryObj<typeof Watermark>;

export const Default: Story = {
  render: () => <Watermark text="">{null}</Watermark>,
};
