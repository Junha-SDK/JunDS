import type { Meta, StoryObj } from "@storybook/react";
import { NavigationMenu } from "./NavigationMenu";

const meta: Meta<typeof NavigationMenu> = {
  title: "Composites/NavigationMenu",
  component: NavigationMenu,
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => <NavigationMenu items={[]} />,
};
