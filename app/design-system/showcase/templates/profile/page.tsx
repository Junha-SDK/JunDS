"use client";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Divider } from "@/ds/primitives/Divider";
import { Card } from "@/ds/composites/Card";
import { Timeline } from "@/ds/composites/Timeline";

const stats = [
  { label: "프로젝트", value: "42" },
  { label: "팔로워", value: "1.2K" },
  { label: "기여", value: "386" },
];

const timelineItems = [
  { key: "1", title: "v2.0 릴리즈 완료", description: "디자인 시스템 메이저 업데이트를 배포했습니다.", time: "2시간 전", color: "success" as const },
  { key: "2", title: "코드 리뷰 요청", description: "DateRangePicker 컴포넌트 PR 리뷰를 요청했습니다.", time: "어제", color: "primary" as const },
  { key: "3", title: "이슈 해결", description: "Modal 포커스 트랩 버그를 수정했습니다.", time: "3일 전", color: "warning" as const },
  { key: "4", title: "팀 합류", description: "JunDS 코어 팀에 합류했습니다.", time: "2주 전", color: "neutral" as const },
];

export default function ProfileTemplate() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-40 rounded-2xl bg-gradient-to-r from-primary/80 to-info/60" />
        <div className="absolute -bottom-10 left-6 ring-4 ring-white rounded-full">
          <Avatar name="김준하" size="xl" />
        </div>
      </div>

      {/* Header */}
      <div className="pt-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">김준하</h1>
            <Badge variant="primary" size="sm">Pro</Badge>
          </div>
          <p className="text-sm text-muted mt-0.5">@junha · 프론트엔드 개발자</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">메시지</Button>
          <Button variant="primary" size="sm">팔로우</Button>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-foreground leading-relaxed">
        사용자 중심의 디자인 시스템을 만듭니다. 접근성과 개발자 경험(DX)을
        최우선으로 생각하며, 재사용 가능한 컴포넌트 설계에 열정을 가지고 있습니다.
      </p>

      {/* Stats */}
      <div className="flex gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <Divider />

      {/* Skills */}
      <Card>
        <Card.Body>
          <h3 className="text-sm font-semibold mb-3">기술 스택</h3>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Next.js", "Tailwind CSS", "Figma", "Storybook", "Node.js", "GraphQL"].map((skill) => (
              <Badge key={skill} variant="default" size="sm">{skill}</Badge>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <Card.Header>
          <h3 className="text-sm font-semibold">최근 활동</h3>
        </Card.Header>
        <Card.Body>
          <Timeline items={timelineItems} />
        </Card.Body>
      </Card>
      {/* Code */}
      <details className="rounded-2xl border border-border bg-white overflow-hidden">
        <summary className="px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          코드 보기
        </summary>
        <pre className="p-5 text-xs font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed border-t border-border max-h-[500px] overflow-y-auto">
          <code>{`import { Button, Badge, Avatar, Divider } from "@junds/ui";
import { Card, Timeline } from "@junds/ui";

const stats = [
  { label: "프로젝트", value: "42" },
  { label: "팔로워", value: "1.2K" },
];

export default function ProfilePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="relative">
        <div className="h-40 rounded-2xl bg-gradient-to-r from-primary to-info" />
        <Avatar name="김준하" size="xl" className="absolute -bottom-10 left-6" />
      </div>

      <div className="pt-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">김준하</h1>
          <Badge variant="primary" size="sm">Pro</Badge>
        </div>
        <Button variant="primary" size="sm">팔로우</Button>
      </div>

      <div className="flex gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <Divider />

      <Card>
        <Card.Body>
          <h3 className="text-sm font-semibold mb-3">기술 스택</h3>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Next.js"].map((skill) => (
              <Badge key={skill} size="sm">{skill}</Badge>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-sm font-semibold">최근 활동</h3>
        </Card.Header>
        <Card.Body>
          <Timeline items={timelineItems} />
        </Card.Body>
      </Card>
    </div>
  );
}`}</code>
        </pre>
      </details>
    </div>
  );
}
