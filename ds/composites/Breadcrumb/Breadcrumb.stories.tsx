import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Composites/Breadcrumb",
  component: Breadcrumb,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "프로젝트", href: "/projects" },
      { label: "설정" },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: "대시보드", href: "/" }, { label: "사용자 관리" }],
  },
};

export const Deep: Story = {
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "조직", href: "/org" },
      { label: "팀", href: "/org/team" },
      { label: "멤버", href: "/org/team/members" },
      { label: "상세" },
    ],
  },
};

export const SlashSeparator: Story = {
  args: {
    items: [{ label: "홈", href: "/" }, { label: "문서", href: "/docs" }, { label: "API" }],
    separator: <span className="text-muted-light">/</span>,
  },
};
