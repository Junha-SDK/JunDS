import type { Meta, StoryObj } from "@storybook/react";
import { SecurityChecklist } from "./SecurityChecklist";

const meta: Meta<typeof SecurityChecklist> = {
  title: "Patterns/SecurityChecklist",
  component: SecurityChecklist,
};

export default meta;
type Story = StoryObj<typeof SecurityChecklist>;

export const Default: Story = {
  render: () => <SecurityChecklist items={[]} />,
};
