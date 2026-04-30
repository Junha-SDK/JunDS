import type { Meta, StoryObj } from "@storybook/react";
import { DataGrid } from "./DataGrid";

const meta: Meta<typeof DataGrid> = {
  title: "Composites/DataGrid",
  component: DataGrid,
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {
  render: () => <DataGrid data={[]} columns={[]} />,
};
