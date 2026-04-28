"use client";
import { useState } from "react";
import { Box, Flex, VStack, HStack, Heading, Text } from "@/ds/core";
import { SimpleGrid } from "@/ds/layout";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Card } from "@/ds/composites/Card";
import { MetricCard } from "@/ds/composites/MetricCard";
import { ProgressRing } from "@/ds/composites/ProgressRing";
import { ProgressBar } from "@/ds/composites/Progress";
import { Tabs } from "@/ds/composites/Tabs";

const users = [
  { name: "김준하", role: "Admin", status: "active", revenue: "₩2.4M" },
  { name: "이서연", role: "Manager", status: "active", revenue: "₩1.8M" },
  { name: "박민수", role: "Member", status: "inactive", revenue: "₩950K" },
  { name: "최유진", role: "Lead", status: "active", revenue: "₩3.1M" },
];

export default function DashboardTemplate() {
  const [tab, setTab] = useState("overview");

  return (
    <VStack gap={6} maxW="1024px">
      <Flex align="center" justify="between">
        <Box>
          <Heading level={1}>대시보드</Heading>
          <Text fontSize="sm" dimmed>2026년 4월 실적 요약</Text>
        </Box>
        <HStack gap="sm">
          <Button variant="secondary" size="sm">내보내기</Button>
          <Button variant="primary" size="sm">새 리포트</Button>
        </HStack>
      </Flex>

      {/* Metrics */}
      <SimpleGrid cols={{ base: 1, md: 4 }} gap={4}>
        <MetricCard label="총 매출" value="₩12.4M" change={12.5} changeLabel="전월 대비" sparkline={[30,45,38,52,48,61,55,70,65,78]} />
        <MetricCard label="신규 가입" value="1,234" change={-3.2} changeLabel="전주 대비" sparkline={[50,45,48,42,38,40,35,32,30,28]} />
        <MetricCard label="전환율" value="4.8%" change={0.5} changeLabel="전월 대비" sparkline={[3,3.5,3.8,4,3.9,4.2,4.5,4.3,4.6,4.8]} />
        <MetricCard label="활성 사용자" value="8,921" change={8.1} changeLabel="전주 대비" sparkline={[7200,7500,7800,8000,8200,8400,8500,8700,8800,8921]} />
      </SimpleGrid>

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: "overview", label: "개요" },
          { value: "analytics", label: "분석" },
          { value: "reports", label: "리포트", badge: 3 },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Content */}
      <SimpleGrid cols={{ base: 1, md: 3 }} gap={4}>
        <Box className="md:col-span-2">
          <Card>
            <Card.Header>
              <Flex align="center" justify="between" className="w-full">
                <Heading level={3}>최근 활동</Heading>
                <Button variant="ghost" size="xs">모두 보기</Button>
              </Flex>
            </Card.Header>
            <Card.Body>
              <VStack gap="sm">
                {users.map((u) => (
                  <HStack key={u.name} gap="sm" className="py-2">
                    <Avatar name={u.name} size="sm" />
                    <Box className="flex-1 min-w-0">
                      <Text fontSize="sm" fontWeight="medium" className="truncate">{u.name}</Text>
                      <Text fontSize="xs" dimmed>{u.role}</Text>
                    </Box>
                    <Badge variant={u.status === "active" ? "success" : "default"} size="sm" dot>{u.status === "active" ? "활성" : "비활성"}</Badge>
                    <Text fontSize="sm" fontWeight="semibold" className="tabular-nums">{u.revenue}</Text>
                  </HStack>
                ))}
              </VStack>
            </Card.Body>
          </Card>
        </Box>

        <VStack gap={4}>
          <Card>
            <Card.Body>
              <VStack align="center" className="py-2">
                <ProgressRing value={78} size={100} strokeWidth={6}>
                  <Text fontSize="lg" fontWeight="bold">78%</Text>
                </ProgressRing>
                <Text fontSize="sm" fontWeight="semibold" className="mt-3">목표 달성률</Text>
                <Text fontSize="xs" dimmed>이번 분기 매출 목표</Text>
              </VStack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Heading level={4} className="mb-3">카테고리별 매출</Heading>
              {[
                { label: "전자제품", pct: 45 },
                { label: "의류", pct: 30 },
                { label: "식품", pct: 18 },
                { label: "기타", pct: 7 },
              ].map((c) => (
                <HStack key={c.label} gap="sm" className="mb-2 last:mb-0">
                  <Text fontSize="xs" dimmed className="w-16 shrink-0">{c.label}</Text>
                  <ProgressBar value={c.pct} className="flex-1 h-1.5" />
                  <Text fontSize="xs" fontWeight="semibold" className="tabular-nums w-8 text-right">{c.pct}%</Text>
                </HStack>
              ))}
            </Card.Body>
          </Card>
        </VStack>
      </SimpleGrid>
      {/* Code */}
      <Box as="details" className="rounded-2xl border border-border bg-white overflow-hidden">
        <summary className="px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          코드 보기
        </summary>
        <pre className="p-5 text-xs font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed border-t border-border max-h-[500px] overflow-y-auto">
          <code>{`import { useState } from "react";
import { Button } from "@junds/ui";
import { Badge, Avatar } from "@junds/ui";
import { Card, MetricCard, ProgressRing, ProgressBar, Tabs } from "@junds/ui";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted">2026년 4월 실적 요약</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">내보내기</Button>
          <Button variant="primary" size="sm">새 리포트</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="총 매출" value="₩12.4M"
          change={12.5} changeLabel="전월 대비"
          sparkline={[30,45,38,52,48,61,55,70,65,78]}
        />
        <MetricCard label="신규 가입" value="1,234" change={-3.2} />
        <MetricCard label="전환율" value="4.8%" change={0.5} />
        <MetricCard label="활성 사용자" value="8,921" change={8.1} />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: "overview", label: "개요" },
          { value: "analytics", label: "분석" },
          { value: "reports", label: "리포트", badge: 3 },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <Card.Header>최근 활동</Card.Header>
            <Card.Body>
              {users.map((u) => (
                <div className="flex items-center gap-3 py-2">
                  <Avatar name={u.name} size="sm" />
                  <span className="font-medium">{u.name}</span>
                  <Badge variant="success" dot>{u.status}</Badge>
                  <span className="ml-auto font-semibold">{u.revenue}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
        <Card>
          <Card.Body>
            <ProgressRing value={78} size={100}>78%</ProgressRing>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}`}</code>
        </pre>
      </Box>
    </VStack>
  );
}
