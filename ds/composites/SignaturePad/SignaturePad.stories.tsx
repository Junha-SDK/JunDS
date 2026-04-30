import type { Meta, StoryObj } from "@storybook/react";
import { SignaturePad } from "./SignaturePad";

const meta: Meta<typeof SignaturePad> = {
  title: "Composites/SignaturePad",
  component: SignaturePad,
};

export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Default: Story = {
  render: () => <SignaturePad />,
};
