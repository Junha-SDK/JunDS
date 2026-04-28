"use client";
import { useState } from "react";
import { Box, Flex, VStack, HStack, Heading, Text } from "@/ds/core";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Switch } from "@/ds/primitives/Switch";
import { Divider } from "@/ds/primitives/Divider";
import { Card } from "@/ds/composites/Card";
import { Tabs } from "@/ds/composites/Tabs";
import { Select } from "@/ds/composites/Select";

export default function SettingsTemplate() {
  const [tab, setTab] = useState("general");
  const [name, setName] = useState("김준하");
  const [bio, setBio] = useState("프론트엔드 개발자");
  const [language, setLanguage] = useState("ko");
  const [timezone, setTimezone] = useState("asia-seoul");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlert, setSessionAlert] = useState(true);

  return (
    <VStack gap={6} maxW="768px">
      <Box>
        <Heading level={1}>설정</Heading>
        <Text fontSize="sm" dimmed>계정 및 앱 환경을 설정합니다.</Text>
      </Box>

      <Tabs
        tabs={[
          { value: "general", label: "일반" },
          { value: "notifications", label: "알림" },
          { value: "security", label: "보안" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "general" && (
        <Card>
          <Card.Body>
            <VStack gap={5}>
              <Heading level={3}>프로필 정보</Heading>
              <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="자기소개" value={bio} onChange={(e) => setBio(e.target.value)} />
              <Divider />
              <Heading level={3}>환경 설정</Heading>
              <Select
                options={[
                  { value: "ko", label: "한국어" },
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                ]}
                value={language}
                onChange={setLanguage}
                placeholder="언어 선택"
              />
              <Select
                options={[
                  { value: "asia-seoul", label: "Asia/Seoul (KST)" },
                  { value: "us-pacific", label: "US/Pacific (PST)" },
                  { value: "europe-london", label: "Europe/London (GMT)" },
                ]}
                value={timezone}
                onChange={setTimezone}
                placeholder="시간대 선택"
              />
            </VStack>
          </Card.Body>
          <Card.Footer>
            <HStack gap="sm" justify="end" className="w-full">
              <Button variant="secondary" size="sm">취소</Button>
              <Button variant="primary" size="sm">저장</Button>
            </HStack>
          </Card.Footer>
        </Card>
      )}

      {tab === "notifications" && (
        <Card>
          <Card.Body>
            <VStack gap={5}>
              <Heading level={3}>알림 채널</Heading>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">이메일 알림</Text>
                  <Text fontSize="xs" dimmed>새로운 소식을 이메일로 받습니다</Text>
                </Box>
                <Switch checked={emailNotif} onChange={setEmailNotif} />
              </HStack>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">푸시 알림</Text>
                  <Text fontSize="xs" dimmed>모바일 푸시 알림을 받습니다</Text>
                </Box>
                <Switch checked={pushNotif} onChange={setPushNotif} />
              </HStack>
              <Divider />
              <Heading level={3}>수신 항목</Heading>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">마케팅 및 프로모션</Text>
                  <Text fontSize="xs" dimmed>이벤트와 할인 정보를 받습니다</Text>
                </Box>
                <Switch checked={marketingNotif} onChange={setMarketingNotif} />
              </HStack>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">주간 요약 리포트</Text>
                  <Text fontSize="xs" dimmed>매주 월요일 활동 요약을 받습니다</Text>
                </Box>
                <Switch checked={weeklyDigest} onChange={setWeeklyDigest} />
              </HStack>
            </VStack>
          </Card.Body>
          <Card.Footer>
            <HStack gap="sm" justify="end" className="w-full">
              <Button variant="secondary" size="sm">취소</Button>
              <Button variant="primary" size="sm">저장</Button>
            </HStack>
          </Card.Footer>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <Card.Body>
            <VStack gap={5}>
              <Heading level={3}>비밀번호</Heading>
              <Input label="현재 비밀번호" type="password" placeholder="현재 비밀번호" value="" onChange={() => {}} />
              <Input label="새 비밀번호" type="password" placeholder="새 비밀번호" value="" onChange={() => {}} />
              <Input label="비밀번호 확인" type="password" placeholder="비밀번호 확인" value="" onChange={() => {}} />
              <Divider />
              <Heading level={3}>보안 옵션</Heading>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">2단계 인증 (2FA)</Text>
                  <Text fontSize="xs" dimmed>로그인 시 추가 인증을 요구합니다</Text>
                </Box>
                <Switch checked={twoFactor} onChange={setTwoFactor} />
              </HStack>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">새 기기 로그인 알림</Text>
                  <Text fontSize="xs" dimmed>새로운 기기에서 로그인 시 알림을 보냅니다</Text>
                </Box>
                <Switch checked={sessionAlert} onChange={setSessionAlert} />
              </HStack>
            </VStack>
          </Card.Body>
          <Card.Footer>
            <HStack gap="sm" justify="end" className="w-full">
              <Button variant="secondary" size="sm">취소</Button>
              <Button variant="primary" size="sm">저장</Button>
            </HStack>
          </Card.Footer>
        </Card>
      )}
      {/* Code */}
      <Box as="details" className="rounded-2xl border border-border bg-white overflow-hidden">
        <summary className="px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          코드 보기
        </summary>
        <pre className="p-5 text-xs font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed border-t border-border max-h-[500px] overflow-y-auto">
          <code>{`import { Button, Input, Switch } from "@junds/ui";
import { Card, Tabs, Select } from "@junds/ui";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <Tabs
        tabs={[
          { value: "general", label: "일반" },
          { value: "notifications", label: "알림" },
        ]}
        value={tab} onChange={setTab}
      />
      <Card>
        <Card.Body className="space-y-4">
          <Input label="이름" value={name} onChange={...} />
          <div className="flex justify-between">
            <span>이메일 알림</span>
            <Switch checked={emailNotif} onChange={...} />
          </div>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" size="sm">저장</Button>
        </Card.Footer>
      </Card>
    </div>
  );
}`}</code>
        </pre>
      </Box>
    </VStack>
  );
}
