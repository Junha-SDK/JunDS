import type { Meta, StoryObj } from "@storybook/react";
import { QRCode } from "./QRCode";

const meta: Meta<typeof QRCode> = {
  title: "Composites/QRCode",
  component: QRCode,
};

export default meta;
type Story = StoryObj<typeof QRCode>;

export const Default: Story = {
  render: () => <QRCode value="" />,
};
