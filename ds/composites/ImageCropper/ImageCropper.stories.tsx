import type { Meta, StoryObj } from "@storybook/react";
import { ImageCropper } from "./ImageCropper";

const meta: Meta<typeof ImageCropper> = {
  title: "Composites/ImageCropper",
  component: ImageCropper,
};

export default meta;
type Story = StoryObj<typeof ImageCropper>;

export const Default: Story = {
  render: () => <ImageCropper src="" />,
};
