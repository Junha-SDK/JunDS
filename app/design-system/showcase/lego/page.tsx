"use client";
import { useState } from "react";
// Framework
import { Box, Flex, VStack, HStack, Heading, Text, GridLayout, Page, Section } from "@/ds/core";
// Layout
import { SimpleGrid, Container, Show } from "@/ds/layout";
// Primitives
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Switch } from "@/ds/primitives/Switch";
// Composites
import { Card } from "@/ds/composites/Card";
import { Modal } from "@/ds/composites/Modal";
import { Tabs } from "@/ds/composites/Tabs";
import { StatCard } from "@/ds/composites/StatCard";
import { MetricCard } from "@/ds/composites/MetricCard";
import { ProgressRing } from "@/ds/composites/ProgressRing";
import { MiniChart } from "@/ds/composites/MiniChart";
import { Timeline } from "@/ds/composites/Timeline";
import { SearchInput } from "@/ds/composites/SearchInput";
import { TagInput } from "@/ds/composites/TagInput";

export default function LegoShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tags, setTags] = useState(["React", "TypeScript"]);
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);

  return (
    <Box maxW="1024px">
      <Box className="mb-8">
        <Heading level={1} className="text-3xl mb-2">레고 조합</Heading>
        <Text fontSize="sm" dimmed className="leading-relaxed">
          JunDS 컴포넌트는 레고 블록처럼 자유롭게 조합할 수 있습니다.
          <br />아래는 실제 프로젝트에서 사용할 수 있는 조합 패턴입니다.
        </Text>
      </Box>

      <VStack gap={12}>
        {/* -- 1. Dashboard Header -- */}
        <Box as="section">
          <Heading level={2} className="text-lg mb-1">1. 대시보드 헤더</Heading>
          <Text fontSize="xs" dimmed className="mb-4">Page.Header + MetricCard + MiniChart 조합</Text>
          <Box className="border border-border rounded-2xl overflow-hidden bg-white">
            <Box p={{ base: 4, md: 6 }}>
              <Flex justify="between" align="center" mb={6}>
                <Box>
                  <Heading level={2} mb={0.5}>대시보드</Heading>
                  <Text fontSize="sm" dimmed>오늘의 핵심 지표를 확인하세요</Text>
                </Box>
                <HStack gap="sm">
                  <Button variant="secondary" size="sm">내보내기</Button>
                  <Button variant="primary" size="sm">새 리포트</Button>
                </HStack>
              </Flex>

              <SimpleGrid cols={{ base: 1, md: 3 }} gap="md">
                <MetricCard
                  label="총 매출"
                  value="₩12,450,000"
                  change={12.5}
                  changeLabel="전월 대비"
                  sparkline={[30, 45, 38, 52, 48, 61, 55, 70, 65, 78]}
                />
                <MetricCard
                  label="신규 가입"
                  value="1,234"
                  change={-3.2}
                  changeLabel="전주 대비"
                  sparkline={[50, 45, 48, 42, 38, 40, 35, 32, 30, 28]}
                />
                <MetricCard
                  label="전환율"
                  value="4.8%"
                  change={0.5}
                  changeLabel="전월 대비"
                  sparkline={[3.2, 3.5, 3.8, 4.0, 3.9, 4.2, 4.5, 4.3, 4.6, 4.8]}
                />
              </SimpleGrid>
            </Box>
          </Box>
        </Box>

        {/* -- 2. User Profile Card -- */}
        <Box as="section">
          <Heading level={2} className="text-lg mb-1">2. 유저 프로필 카드</Heading>
          <Text fontSize="xs" dimmed className="mb-4">Card + Avatar + Badge + HStack + VStack 조합</Text>
          <Box className="border border-border rounded-2xl overflow-hidden bg-white" maxW="448px">
            <Card>
              <Card.Body>
                <VStack gap="lg">
                  <HStack gap="md">
                    <Avatar src="" name="김준하" size="lg" />
                    <VStack gap={0.5}>
                      <HStack gap="xs">
                        <Text fontSize="lg" fontWeight="bold">김준하</Text>
                        <Badge variant="primary" size="sm">Pro</Badge>
                      </HStack>
                      <Text fontSize="sm" dimmed>Frontend Engineer</Text>
                    </VStack>
                  </HStack>

                  <SimpleGrid cols={3} gap="sm">
                    <Box textAlign="center">
                      <Text fontSize="xl" fontWeight="bold">142</Text>
                      <Text fontSize="xs" dimmed>프로젝트</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="xl" fontWeight="bold">1.2k</Text>
                      <Text fontSize="xs" dimmed>커밋</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="xl" fontWeight="bold">98%</Text>
                      <Text fontSize="xs" dimmed>완료율</Text>
                    </Box>
                  </SimpleGrid>

                  <HStack gap="sm" justify="center">
                    <Button variant="primary" size="sm" fullWidth>프로필 편집</Button>
                    <Button variant="secondary" size="sm" fullWidth>설정</Button>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card>
          </Box>
        </Box>

        {/* -- 3. Settings Form -- */}
        <Box as="section">
          <Heading level={2} className="text-lg mb-1">3. 설정 폼</Heading>
          <Text fontSize="xs" dimmed className="mb-4">VStack + Input + Switch + TagInput + Button 조합</Text>
          <Box className="border border-border rounded-2xl overflow-hidden bg-white" maxW="512px">
            <Box p={6}>
              <Heading level={3}>알림 설정</Heading>
              <VStack gap="lg">
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">이메일</Text>
                  <Input placeholder="notification@example.com" />
                  <Text fontSize="xs" dimmed>알림을 받을 이메일 주소입니다.</Text>
                </VStack>

                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">관심 태그</Text>
                  <TagInput value={tags} onChange={setTags} placeholder="태그 입력" />
                </VStack>

                <HStack justify="between">
                  <VStack gap={0}>
                    <Text fontSize="sm" fontWeight="medium">이메일 알림</Text>
                    <Text fontSize="xs" dimmed>새 소식을 이메일로 받습니다</Text>
                  </VStack>
                  <Switch size="md" checked={emailNotif} onChange={setEmailNotif} />
                </HStack>

                <HStack justify="between">
                  <VStack gap={0}>
                    <Text fontSize="sm" fontWeight="medium">마케팅 수신</Text>
                    <Text fontSize="xs" dimmed>프로모션 정보를 받습니다</Text>
                  </VStack>
                  <Switch size="md" checked={marketingNotif} onChange={setMarketingNotif} />
                </HStack>

                <Box pt={2}>
                  <Button variant="primary" fullWidth>저장</Button>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Box>

        {/* -- 4. Progress Overview -- */}
        <Box as="section">
          <Heading level={2} className="text-lg mb-1">4. 진행률 개요</Heading>
          <Text fontSize="xs" dimmed className="mb-4">ProgressRing + MiniChart + Box + Text 조합</Text>
          <Box className="border border-border rounded-2xl overflow-hidden bg-white">
            <Box p={6}>
              <SimpleGrid cols={{ base: 2, md: 4 }} gap="lg">
                {[
                  { label: "디자인", value: 85, color: "var(--primary)" },
                  { label: "개발", value: 62, color: "var(--info)" },
                  { label: "테스트", value: 45, color: "var(--warning)" },
                  { label: "배포", value: 20, color: "var(--success)" },
                ].map((item) => (
                  <VStack key={item.label} align="center" gap="sm">
                    <ProgressRing value={item.value} size={72} color={item.color}>
                      <Text fontSize="sm" fontWeight="bold">{item.value}%</Text>
                    </ProgressRing>
                    <Text fontSize="sm" fontWeight="medium">{item.label}</Text>
                    <MiniChart
                      data={Array.from({ length: 10 }, () => Math.random() * item.value)}
                      type="area"
                      color={item.color}
                      width={80}
                      height={24}
                    />
                  </VStack>
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        </Box>

        {/* -- 5. Modal Composition -- */}
        <Box as="section">
          <Heading level={2} className="text-lg mb-1">5. 모달 조합</Heading>
          <Text fontSize="xs" dimmed className="mb-4">Modal + VStack + Input + SearchInput + Button 조합</Text>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            새 프로젝트 만들기
          </Button>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md">
            <Modal.Header onClose={() => setModalOpen(false)}>새 프로젝트</Modal.Header>
            <Box p={5}>
              <VStack gap="md">
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">프로젝트 이름</Text>
                  <Input placeholder="멋진 프로젝트" />
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">팀원 검색</Text>
                  <SearchInput placeholder="이름으로 검색..." />
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">기술 스택</Text>
                  <TagInput value={tags} onChange={setTags} />
                </VStack>
              </VStack>
            </Box>
            <Modal.Footer>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>취소</Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>생성</Button>
            </Modal.Footer>
          </Modal>
        </Box>
      </VStack>
    </Box>
  );
}
