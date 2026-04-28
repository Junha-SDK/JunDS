"use client";
import { useState } from "react";
import { Box, Flex, VStack, HStack, Heading, Text } from "@/ds/core";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Divider } from "@/ds/primitives/Divider";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Card } from "@/ds/composites/Card";

export default function LoginTemplate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <Flex align="center" justify="center" className="min-h-[80vh]">
      <Box className="w-full" maxW="384px">
        {/* Logo */}
        <VStack align="center" className="mb-8">
          <Flex align="center" justify="center" className="w-12 h-12 bg-primary rounded-2xl mb-4">
            <Text className="text-white" fontWeight="bold" fontSize="lg">J</Text>
          </Flex>
          <Heading level={1} className="text-xl">다시 오신 것을 환영합니다</Heading>
          <Text fontSize="sm" dimmed className="mt-1">계정에 로그인하세요</Text>
        </VStack>

        <Card>
          <Card.Body>
            <VStack gap={4}>
              <Input
                label="이메일"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="md"
              />
              <Input
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="md"
              />

              <Flex align="center" justify="between">
                <Checkbox
                  checked={remember}
                  onChange={setRemember}
                  label="로그인 유지"
                />
                <button className="text-xs text-primary hover:underline">
                  비밀번호 찾기
                </button>
              </Flex>

              <Button variant="primary" size="md" fullWidth>
                로그인
              </Button>

              <Divider label="또는" />

              <VStack gap={2}>
                <Button variant="secondary" size="md" fullWidth>
                  Google로 계속하기
                </Button>
                <Button variant="secondary" size="md" fullWidth>
                  GitHub로 계속하기
                </Button>
              </VStack>
            </VStack>
          </Card.Body>
        </Card>

        <Text className="text-center" fontSize="xs" dimmed>
          <Box className="mt-6">
            계정이 없으신가요?{" "}
            <button className="text-primary font-semibold hover:underline">
              회원가입
            </button>
          </Box>
        </Text>
      </Box>

      {/* Code */}
      <Box as="details" className="rounded-2xl border border-border bg-white overflow-hidden">
        <summary className="px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          코드 보기
        </summary>
        <pre className="p-5 text-xs font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed border-t border-border max-h-[500px] overflow-y-auto">
          <code>{`import { Button, Input, Divider } from "@junds/ui";
import { Card } from "@junds/ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <Card.Body className="space-y-4">
          <h1 className="text-xl font-bold text-center">로그인</h1>
          <Input placeholder="이메일" type="email" />
          <Input placeholder="비밀번호" type="password" />
          <Button variant="primary" fullWidth>로그인</Button>
          <Divider label="또는" />
          <Button variant="secondary" fullWidth>Google로 계속</Button>
        </Card.Body>
      </Card>
    </div>
  );
}`}</code>
        </pre>
      </Box>
    </Flex>
  );
}
