"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, Flex, VStack, HStack, Heading, Text } from "@/ds/core";
import { SimpleGrid } from "@/ds/layout";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Input } from "@/ds/primitives/Input";
import { Toggle } from "@/ds/primitives/Toggle";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { Spinner } from "@/ds/primitives/Spinner";
import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";
import { ProgressBar } from "@/ds/composites/Progress";
import { Tabs } from "@/ds/composites/Tabs";
import { AnimatedCounter } from "@/ds/composites/AnimatedCounter";
import { MiniChart } from "@/ds/composites/MiniChart";
import { ProgressRing } from "@/ds/composites/ProgressRing";

export default function DesignSystemPage() {
  const [mounted, setMounted] = useState(false);
  const [demoTab, setDemoTab] = useState("overview");
  const [demoRating, setDemoRating] = useState(4);
  const [demoSwitch, setDemoSwitch] = useState(true);

  useEffect(() => setMounted(true), []);

  return (
    <Box maxW="1152px" mx="auto">
      {/* ═══ Hero ═══ */}
      <Box as="section" position="relative" overflow="hidden" radius="3xl" mb={16} px={8} py={{ base: 24, md: 32 }}>
        {/* Animated gradient mesh */}
        <Box position="absolute" className="inset-0 -z-10">
          <Box position="absolute" className="top-[-30%] left-[-15%] rounded-full opacity-25 animate-float-slow" style={{ width: "70%", height: "70%", background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
          <Box position="absolute" className="bottom-[-25%] right-[-10%] rounded-full opacity-20 animate-float-slow" style={{ width: "55%", height: "55%", background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", animationDelay: "-4s" }} />
          <Box position="absolute" className="top-[30%] left-[55%] rounded-full opacity-15 animate-float-slow" style={{ width: "45%", height: "45%", background: "radial-gradient(circle, var(--info) 0%, transparent 70%)", animationDelay: "-8s" }} />
          {/* Grid pattern overlay */}
          <Box position="absolute" className="inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </Box>

        <Box position="relative" textAlign="center" className="stagger-children">
          <Box display="inline-flex" className="items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Box as="span" className="relative flex h-2 w-2"><Box as="span" className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><Box as="span" className="relative inline-flex rounded-full h-2 w-2 bg-primary" /></Box>
            <Text as="span" fontSize="xs" fontWeight="semibold" color="primary" mb={0}>v2.2.0 — Framework Mode</Text>
          </Box>

          <Heading level={1} mb={5} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter">
            <Box as="span" className="gradient-text">junDS</Box>
          </Heading>

          <Text fontSize={{ base: "lg", md: "xl" }} color="muted" mb={4} className="max-w-2xl mx-auto leading-relaxed">
            레고처럼 조합하는 프로덕션 레디 디자인 프레임워크.<br className="hidden md:block" />
            <Text as="span" color="foreground" fontWeight="semibold" mb={0}>219개 컴포넌트</Text>로 무엇이든 만드세요.
          </Text>

          <Text fontSize="sm" color="muted-light" mb={10}>
            TypeScript · Tailwind CSS · 반응형 Props · 접근성 · 다크 모드 · 트리쉐이킹
          </Text>

          <HStack gap={4} justify="center" className="flex-wrap">
            <Link href="/design-system/showcase/lego">
              <Button variant="primary" size="lg" className="px-8 py-3.5 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                레고 조합 보기
              </Button>
            </Link>
            <Link href="/design-system/showcase">
              <Button variant="secondary" size="lg" className="px-8 py-3.5 text-base">
                컬렉션 탐색
              </Button>
            </Link>
          </HStack>
        </Box>
      </Box>

      {/* ═══ Stats ═══ */}
      <Box as="section" mb={16}>
        <SimpleGrid cols={{ base: 3, md: 5 }} gap={{ base: 3, md: 4 }}>
          {[
            { label: "Primitives", count: 38, color: "text-primary", bg: "bg-primary/10" },
            { label: "Composites", count: 117, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Patterns", count: 24, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Hooks", count: 29, color: "text-sky-600", bg: "bg-sky-50" },
            { label: "Layout", count: 11, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((s) => (
            <Box key={s.label} radius="2xl" border className="bg-white p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
              <Box className="text-3xl md:text-4xl font-extrabold text-foreground mb-1.5 tabular-nums">
                {mounted ? <AnimatedCounter value={s.count} duration={1500} /> : s.count}
              </Box>
              <Box as="span" className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.color} ${s.bg}`}>
                {s.label}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* ═══ Live Demos ═══ */}
      <Box as="section" mb={16}>
        <Heading level={2} textAlign="center" mb={2} className="text-2xl md:text-3xl tracking-tight">
          <Box as="span" className="gradient-text">실시간 데모</Box>
        </Heading>
        <Text fontSize="sm" dimmed textAlign="center" mb={8}>컴포넌트가 실제로 어떻게 동작하는지 직접 확인하세요</Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} gap={4}>
          {/* Demo 1: Interactive Card */}
          <Box radius="2xl" border className="bg-white p-6 hover:shadow-lg transition-shadow">
            <Text as="p" fontSize="xs" fontWeight="bold" dimmed mb={4} className="uppercase tracking-widest" style={{ fontSize: "10px" }}>Dashboard Card</Text>
            <VStack gap="sm" align="stretch">
              <Flex align="center" justify="between">
                <Box>
                  <Text as="p" fontSize="2xl" fontWeight="bold" mb={0} className="tabular-nums">₩12.4M</Text>
                  <Text as="p" fontSize="xs" dimmed mb={0}>이번 달 매출</Text>
                </Box>
                <ProgressRing value={78} size={56} strokeWidth={4}>
                  <Text as="span" fontSize="xs" fontWeight="bold" mb={0}>78%</Text>
                </ProgressRing>
              </Flex>
              <MiniChart data={[30,45,38,52,48,61,55,70,65,78]} type="area" width={250} height={40} />
              <HStack gap={2}>
                <Badge variant="success" size="sm" dot>+12.5%</Badge>
                <Text as="span" fontSize="xs" dimmed mb={0}>전월 대비</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Demo 2: Form */}
          <Box radius="2xl" border className="bg-white p-6 hover:shadow-lg transition-shadow">
            <Text as="p" fontSize="xs" fontWeight="bold" dimmed mb={4} className="uppercase tracking-widest" style={{ fontSize: "10px" }}>Settings Form</Text>
            <VStack gap="sm" align="stretch">
              <Input placeholder="사용자 이름" size="sm" />
              <Input placeholder="이메일 주소" size="sm" />
              <Flex align="center" justify="between" py={1}>
                <Text as="span" fontSize="xs" color="foreground" mb={0}>알림 받기</Text>
                <Switch size="sm" checked={demoSwitch} onChange={() => setDemoSwitch(!demoSwitch)} />
              </Flex>
              <Flex align="center" justify="between" py={1}>
                <Text as="span" fontSize="xs" color="foreground" mb={0}>별점</Text>
                <StarRating value={demoRating} onChange={setDemoRating} size="sm" />
              </Flex>
              <Button variant="primary" size="sm" fullWidth>저장</Button>
            </VStack>
          </Box>

          {/* Demo 3: Components Mix */}
          <Box radius="2xl" border className="bg-white p-6 hover:shadow-lg transition-shadow">
            <Text as="p" fontSize="xs" fontWeight="bold" dimmed mb={4} className="uppercase tracking-widest" style={{ fontSize: "10px" }}>Component Mix</Text>
            <VStack gap="sm" align="stretch">
              <HStack gap={3}>
                <Avatar name="김준하" size="md" />
                <Box>
                  <Text as="p" fontSize="sm" fontWeight="semibold" mb={0}>김준하</Text>
                  <Text as="p" fontSize="xs" dimmed mb={0}>Frontend Engineer</Text>
                </Box>
                <Badge variant="primary" size="sm" className="ml-auto">Pro</Badge>
              </HStack>
              <Alert variant="success" title="배포 완료" className="text-xs py-2">{""}</Alert>
              <ProgressBar value={85} className="h-1.5" />
              <HStack gap={2}>
                <Button variant="secondary" size="xs">프로필</Button>
                <Button variant="ghost" size="xs">설정</Button>
                <Button variant="link" size="xs">더보기</Button>
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>

      {/* ═══ Why JunDS ═══ */}
      <Box as="section" mb={16}>
        <Heading level={2} textAlign="center" mb={2} className="text-2xl md:text-3xl tracking-tight">
          <Box as="span" className="gradient-text">왜 junDS인가?</Box>
        </Heading>
        <Text fontSize="sm" dimmed textAlign="center" mb={8}>프레임워크급 디자인 시스템의 모든 것</Text>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {[
            { icon: "🧱", title: "219개 컴포넌트", desc: "Primitives → Composites → Patterns 3계층 아키텍처" },
            { icon: "📐", title: "프레임워크 코어", desc: "Box, Flex, Page, Heading — 토큰 기반 레이아웃 시스템" },
            { icon: "📱", title: "반응형 Props", desc: "p={{ base: 2, md: 4 }} — 브레이크포인트별 제어" },
            { icon: "🎨", title: "18개 테마", desc: "커스텀 색상 + 다크 모드 + 밀도/반경/간격 전역 제어" },
            { icon: "♿", title: "접근성 내장", desc: "ARIA, 키보드 네비게이션, Focus Trap, Reduced Motion" },
            { icon: "📦", title: "트리쉐이킹", desc: "ESM/CJS 듀얼 빌드, sideEffects: false, 개별 import" },
            { icon: "🧪", title: "230개 테스트", desc: "Vitest + Testing Library + 접근성 테스트" },
            { icon: "🔧", title: "29개 커스텀 훅", desc: "useForm, useBreakpoint, useIdle, useCountUp 등" },
            { icon: "📊", title: "25기능 DataTable", desc: "검색, 필터, 정렬, 가상스크롤, 내보내기, 인라인 편집" },
          ].map((f) => (
            <Box key={f.title} radius="2xl" border className="group bg-white p-5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <Text as="span" fontSize="2xl" mb={3} className="block">{f.icon}</Text>
              <Heading level={3} mb={1} className="text-sm font-bold group-hover:text-primary transition-colors">{f.title}</Heading>
              <Text fontSize="xs" dimmed mb={0} lineHeight="relaxed">{f.desc}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* ═══ Quick Start ═══ */}
      <Box as="section" mb={16} id="quick-start" className="scroll-mt-8">
        <Heading level={2} textAlign="center" mb={2} className="text-2xl md:text-3xl tracking-tight">
          <Box as="span" className="gradient-text">30초 만에 시작하기</Box>
        </Heading>
        <Text fontSize="sm" dimmed textAlign="center" mb={8}>복사 → 붙여넣기 → 완료</Text>

        <SimpleGrid cols={{ base: 1, md: 2 }} gap={4}>
          <Box radius="2xl" border overflow="hidden" className="bg-white">
            <HStack gap={2} className="px-4 py-2.5 bg-gray-50 border-b border-border">
              <Box as="span" className="w-3 h-3 rounded-full bg-danger/60" />
              <Box as="span" className="w-3 h-3 rounded-full bg-warning/60" />
              <Box as="span" className="w-3 h-3 rounded-full bg-success/60" />
              <Text as="span" fontSize="xs" dimmed mb={0} className="font-mono ml-2" style={{ fontSize: "10px" }}>터미널</Text>
            </HStack>
            <pre className="p-5 text-sm font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed">
<span className="text-gray-500">$</span> <span className="text-emerald-400">npm install</span> @junds/ui{"\n"}
<span className="text-gray-500">$</span> <span className="text-emerald-400">npm install</span> tailwindcss
            </pre>
          </Box>

          <Box radius="2xl" border overflow="hidden" className="bg-white">
            <HStack gap={2} className="px-4 py-2.5 bg-gray-50 border-b border-border">
              <Box as="span" className="w-3 h-3 rounded-full bg-danger/60" />
              <Box as="span" className="w-3 h-3 rounded-full bg-warning/60" />
              <Box as="span" className="w-3 h-3 rounded-full bg-success/60" />
              <Text as="span" fontSize="xs" dimmed mb={0} className="font-mono ml-2" style={{ fontSize: "10px" }}>App.tsx</Text>
            </HStack>
            <pre className="p-5 text-sm font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed">
<span className="text-sky-400">import</span> {"{"} <span className="text-amber-300">Button</span> {"}"} <span className="text-sky-400">from</span> <span className="text-emerald-400">"@junds/ui"</span>{"\n"}
<span className="text-sky-400">import</span> {"{"} <span className="text-amber-300">Page</span>, <span className="text-amber-300">Heading</span> {"}"} <span className="text-sky-400">from</span> <span className="text-emerald-400">"@junds/ui/core"</span>{"\n\n"}
<span className="text-sky-400">export default function</span> <span className="text-amber-300">App</span>() {"{"}{"\n"}
{"  "}<span className="text-sky-400">return</span> ({"\n"}
{"    "}<span className="text-gray-500">{"<"}</span><span className="text-rose-400">Page</span> maxWidth=<span className="text-emerald-400">"lg"</span><span className="text-gray-500">{">"}</span>{"\n"}
{"      "}<span className="text-gray-500">{"<"}</span><span className="text-rose-400">Heading</span> level={"{"}1{"}"}<span className="text-gray-500">{">"}</span>Hello JunDS<span className="text-gray-500">{"</"}</span><span className="text-rose-400">Heading</span><span className="text-gray-500">{">"}</span>{"\n"}
{"      "}<span className="text-gray-500">{"<"}</span><span className="text-rose-400">Button</span> variant=<span className="text-emerald-400">"primary"</span><span className="text-gray-500">{">"}</span>{"\n"}
{"        "}시작하기{"\n"}
{"      "}<span className="text-gray-500">{"</"}</span><span className="text-rose-400">Button</span><span className="text-gray-500">{">"}</span>{"\n"}
{"    "}<span className="text-gray-500">{"</"}</span><span className="text-rose-400">Page</span><span className="text-gray-500">{">"}</span>{"\n"}
{"  "}){"\n"}
{"}"}
            </pre>
          </Box>
        </SimpleGrid>
      </Box>

      {/* ═══ Architecture ═══ */}
      <Box as="section" mb={16}>
        <Heading level={2} textAlign="center" mb={2} className="text-2xl md:text-3xl tracking-tight">
          <Box as="span" className="gradient-text">3계층 아키텍처</Box>
        </Heading>
        <Text fontSize="sm" dimmed textAlign="center" mb={8}>Atoms → Molecules → Organisms</Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} gap={4}>
          {[
            { layer: "Primitives", count: 38, color: "primary", items: ["Button","Input","Badge","Avatar","Toggle","Switch","Slider","Checkbox","Tag","Spinner"] },
            { layer: "Composites", count: 117, color: "success", items: ["Modal","Tabs","Select","DataGrid","Card","Drawer","Toast","Timeline","Carousel","Rating"] },
            { layer: "Patterns", count: 24, color: "warning", items: ["DataTable","FormWizard","Calendar","Kanban","CommandPalette","FlowDiagram","Sidebar"] },
          ].map((l) => (
            <Box key={l.layer} radius="2xl" border overflow="hidden" className="group bg-white p-6 hover:shadow-lg transition-all relative">
              <Box position="absolute" top={0} left={0} className={`right-0 h-1 bg-${l.color}`} />
              <Box className={`text-xs font-bold text-${l.color} uppercase tracking-widest mb-1`}>{l.layer}</Box>
              <Box className="text-3xl font-extrabold text-foreground mb-1 tabular-nums">{l.count}개</Box>
              <Text fontSize="xs" dimmed mb={4}>
                {l.layer === "Primitives" ? "의존성 없는 원자 컴포넌트" : l.layer === "Composites" ? "조합된 분자 컴포넌트" : "비즈니스 로직 포함 패턴"}
              </Text>
              <Flex wrap="wrap" gap={1.5}>
                {l.items.map((c) => (
                  <Box as="span" key={c} className={`text-[10px] px-2 py-0.5 rounded-full bg-${l.color}/10 text-${l.color} font-medium`}>{c}</Box>
                ))}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* ═══ Bottom CTA ═══ */}
      <Box as="section" mb={8}>
        <Box position="relative" overflow="hidden" radius="3xl" border p={{ base: 12, md: 16 }} textAlign="center">
          <Box position="absolute" className="inset-0 -z-10 opacity-10 animate-aurora" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent), var(--info), var(--success))" }} />
          <Heading level={2} mb={3} className="text-2xl md:text-3xl tracking-tight">
            지금 바로 시작하세요
          </Heading>
          <Text fontSize="sm" dimmed mb={8} className="max-w-lg mx-auto">
            219개 컴포넌트, 29개 훅, 11개 레이아웃을 갤러리에서 탐색하고 바로 사용하세요.
          </Text>
          <HStack gap={4} justify="center" className="flex-wrap">
            <Link href="/design-system/showcase">
              <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg shadow-primary/25">
                갤러리 탐색
              </Button>
            </Link>
            <Link href="/design-system/framework/provider">
              <Button variant="outline" size="lg" className="px-10 py-3.5 text-base">
                프레임워크 가이드
              </Button>
            </Link>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
