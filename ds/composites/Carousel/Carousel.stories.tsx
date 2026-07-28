import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Composites/Carousel",
  component: Carousel,
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: () => (
    <Carousel>
      {null}
      {null}
    </Carousel>
  ),
};
