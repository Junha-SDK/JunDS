import type { Meta, StoryObj } from "@storybook/react";
import { ImageLightbox } from "./ImageLightbox";

const meta: Meta<typeof ImageLightbox> = {
  title: "Composites/ImageLightbox",
  component: ImageLightbox,
};

export default meta;
type Story = StoryObj<typeof ImageLightbox>;

export const Default: Story = {
  render: () => <ImageLightbox src="" />,
};
