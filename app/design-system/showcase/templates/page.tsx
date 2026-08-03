"use client";
import Link from "next/link";

const templates = [
  {
    name: "대시보드",
    href: "/design-system/showcase/templates/dashboard",
    desc: "MetricCard + DataTable + ChartCard",
    color: "bg-primary",
  },
  {
    name: "로그인",
    href: "/design-system/showcase/templates/login",
    desc: "Input + Button + Divider + Card",
    color: "bg-info",
  },
  {
    name: "설정",
    href: "/design-system/showcase/templates/settings",
    desc: "Tabs + Switch + Input + Select",
    color: "bg-success",
  },
  {
    name: "프로필",
    href: "/design-system/showcase/templates/profile",
    desc: "Card + Avatar + Badge + Timeline",
    color: "bg-warning",
  },
  {
    name: "채팅",
    href: "/design-system/showcase/templates/chat",
    desc: "ChatBubble + Input + Avatar",
    color: "bg-danger",
  },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">페이지 템플릿</h1>
      <p className="text-sm text-muted mb-8">
        복사해서 바로 사용할 수 있는 완성된 페이지 패턴입니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Link
            key={t.name}
            href={t.href}
            className="group rounded-2xl border border-border bg-white p-6 hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className={`w-10 h-10 ${t.color} rounded-xl mb-4 opacity-80`} />
            <h3 className="text-base font-bold text-foreground group-hover:text-primary-ink transition-colors">
              {t.name}
            </h3>
            <p className="text-xs text-muted mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
