import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "./Banner";

const meta: Meta<typeof Banner> = {
  title: "Composites/Banner",
  component: Banner,
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  render: () => <Banner>{null}</Banner>,
};
