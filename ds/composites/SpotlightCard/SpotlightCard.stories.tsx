import type { Meta, StoryObj } from "@storybook/react";
import { SpotlightCard } from "./SpotlightCard";

const meta: Meta<typeof SpotlightCard> = {
  title: "Composites/SpotlightCard",
  component: SpotlightCard,
};

export default meta;
type Story = StoryObj<typeof SpotlightCard>;

export const Default: Story = {
  render: () => <SpotlightCard>{null}</SpotlightCard>,
};
