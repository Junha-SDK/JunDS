import type { Meta, StoryObj } from "@storybook/react";
import { DetailPanel } from "./DetailPanel";

const meta: Meta<typeof DetailPanel> = {
  title: "Composites/DetailPanel",
  component: DetailPanel,
};

export default meta;
type Story = StoryObj<typeof DetailPanel>;

export const Default: Story = {
  render: () => <DetailPanel open={false} onClose={() => {}} title="" />,
};
