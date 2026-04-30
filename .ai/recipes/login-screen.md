# Recipe — Login Screen

## Goal

이메일 + 비밀번호 입력 + "로그인 유지" 체크박스 + 1차 액션 버튼 + OAuth 소셜
로그인 버튼들로 구성된 가장 보편적인 로그인 카드를 만든다.
`Divider`의 `label` 슬롯이 "또는" 구분선을 그려 주고, `Card` 가 폼 전체를
포장한다. 이 레시피는
`app/design-system/showcase/templates/login/page.tsx` 의 화면을 그대로
응축한 형태다.

## Used components

- `Card`, `Card.Body` — `@/ds/composites/Card`
- `Input` — `@/ds/primitives/Input`
- `Label` — `@/ds/primitives/Label`
- `Button` — `@/ds/primitives/Button`
- `Checkbox` — `@/ds/primitives/Checkbox`
- `Divider` — `@/ds/primitives/Divider`
- `Box`, `Flex`, `VStack`, `Heading`, `Text` — `@/ds/core`

Props 검증: `.ai/props.json` → primitives → Input / Label / Button / Checkbox
/ Divider, composites → Card. `Divider` 는 `label` prop 으로 가운데 텍스트를
넣는다. `Button` 의 `fullWidth` 가 카드 폭에 맞춘다.

## Recipe

```tsx
"use client";
import { useState } from "react";
import { Box, Flex, VStack, Heading, Text } from "@/ds/core";
import { Card } from "@/ds/composites/Card";
import { Input } from "@/ds/primitives/Input";
import { Label } from "@/ds/primitives/Label";
import { Button } from "@/ds/primitives/Button";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Divider } from "@/ds/primitives/Divider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인 호출
  };

  return (
    <Flex align="center" justify="center" className="min-h-[80vh]">
      <Box className="w-full" maxW="384px">
        <VStack align="center" className="mb-8">
          <Heading level={1} className="text-xl">로그인</Heading>
          <Text fontSize="sm" dimmed className="mt-1">계정에 로그인하세요</Text>
        </VStack>

        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Box>
                  <Label className="mb-1.5 block text-xs" htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="md"
                  />
                </Box>

                <Box>
                  <Label className="mb-1.5 block text-xs" htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="md"
                  />
                </Box>

                <Flex align="center" justify="between">
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    label="로그인 유지"
                  />
                  <button type="button" className="text-xs text-primary hover:underline">
                    비밀번호 찾기
                  </button>
                </Flex>

                <Button type="submit" variant="primary" size="md" fullWidth>
                  로그인
                </Button>

                <Divider label="또는" />

                <VStack gap={2}>
                  <Button variant="secondary" size="md" fullWidth>Google로 계속하기</Button>
                  <Button variant="secondary" size="md" fullWidth>GitHub로 계속하기</Button>
                </VStack>
              </VStack>
            </form>
          </Card.Body>
        </Card>

        <Box className="mt-6 text-center">
          <Text fontSize="xs" dimmed>
            계정이 없으신가요?{" "}
            <button className="text-primary font-semibold hover:underline">회원가입</button>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
```

## Variations

- **강력한 비밀번호 + 강도 게이지** — `Input` 대신
  `PasswordInput`(`@/ds/primitives/PasswordInput`)을 쓰면 `showStrength`/
  `showRules` 가 회원가입 화면에서 즉시 검증을 보여준다.
- **OTP 단계** — 1차 인증 후 `OTPInput`(`@/ds/primitives/OTPInput`) 화면으로
  넘기면 2단계 인증 흐름이 된다.
- **마그네틱 링크** — Submit 버튼만 두고 비밀번호 필드를 제거한 뒤
  "이메일로 로그인 링크 보내기" 라벨로 바꾼다.
- **에러 표시** — 잘못된 자격 증명에는 카드 위에 `Alert`(`@/ds/composites/Alert`)
  를 띄워 큰 영역으로 알린다.
- **레디메이드 패턴** — 빠르게 끝내고 싶다면
  `LoginForm`(`@/ds/patterns/LoginForm`) 을 그대로 가져다 쓰면 된다.

## See also

- 쇼케이스: `/design-system/showcase/templates/login`,
  `/design-system/composites/card`, `/design-system/primitives/divider`,
  `/design-system/security/login-form`,
  `/design-system/security/password-input`
- 관련 레시피: `./modal-with-form.md` (회원가입 모달),
  `./notification-stack.md` (로그인 결과 토스트)
- 요구사항: `requirements/license-and-auth.md`,
  `requirements/design-system-library.md`
- 소스 참고: `/Users/junha/develop/jjunhaa/JunDS/app/design-system/showcase/templates/login/page.tsx`
