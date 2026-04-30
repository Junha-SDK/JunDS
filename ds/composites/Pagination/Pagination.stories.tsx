import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Composites/Pagination",
  component: Pagination,
  argTypes: {
    siblings: { control: { type: "number", min: 0, max: 3 } },
  },
  args: { totalPages: 10, siblings: 1 },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const Demo = (props: Omit<Parameters<typeof Pagination>[0], "page" | "onChange">) => {
  const [page, setPage] = useState(1);
  return <Pagination {...props} page={page} onChange={setPage} />;
};

export const Default: Story = {
  args: { totalPages: 10 },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const FewPages: Story = {
  args: { totalPages: 3 },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

function ManyPagesDemo() {
  const [page, setPage] = useState(12);
  return <Pagination page={page} totalPages={50} onChange={setPage} />;
}

export const ManyPages: Story = {
  args: { totalPages: 50 },
  render: () => <ManyPagesDemo />,
};

function MoreSiblingsDemo() {
  const [page, setPage] = useState(10);
  return <Pagination page={page} totalPages={25} siblings={2} onChange={setPage} />;
}

export const MoreSiblings: Story = {
  args: { totalPages: 25, siblings: 2 },
  render: () => <MoreSiblingsDemo />,
};
