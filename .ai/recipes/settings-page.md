# Recipe — Settings Page (Tabs + Switch + Select + Password)

## Goal

탭으로 분리된 설정 페이지를 구성한다. 각 탭은 `Card` 한 장으로 묶이고
프로필 입력, 알림 토글, 비밀번호 변경 같은 흔한 섹션을 포함한다. 이 레시피는
`app/design-system/showcase/templates/settings/page.tsx` 의 핵심을 추리고
`@/ds/core` 레이아웃 헬퍼를 사용해 정리한 형태다.

## Used components

- `Tabs` — `@/ds/composites/Tabs`
- `Card`, `Card.Body`, `Card.Footer` — `@/ds/composites/Card`
- `Switch` — `@/ds/primitives/Switch`
- `Select` — `@/ds/composites/Select`
- `Input` — `@/ds/primitives/Input`
- `Label` — `@/ds/primitives/Label`
- `Divider` — `@/ds/primitives/Divider`
- `Button` — `@/ds/primitives/Button`
- `Box`, `VStack`, `HStack`, `Heading`, `Text` — `@/ds/core`

Props 검증: `.ai/props.json` → composites → Tabs / Card / Select, primitives
→ Switch / Input / Label / Divider / Button. `Switch.onChange` 는 boolean
값을 직접 받는다(이벤트 객체가 아님).

## Recipe

```tsx
"use client";
import { useState } from "react";
import { Box, VStack, HStack, Heading, Text } from "@/ds/core";
import { Tabs } from "@/ds/composites/Tabs";
import { Card } from "@/ds/composites/Card";
import { Select } from "@/ds/composites/Select";
import { Switch } from "@/ds/primitives/Switch";
import { Input } from "@/ds/primitives/Input";
import { Label } from "@/ds/primitives/Label";
import { Divider } from "@/ds/primitives/Divider";
import { Button } from "@/ds/primitives/Button";

type TabId = "general" | "notifications" | "security";

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("general");
  const [name, setName] = useState("김준하");
  const [language, setLanguage] = useState("ko");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <VStack gap={6} maxW="768px">
      <Box>
        <Heading level={1}>설정</Heading>
        <Text fontSize="sm" dimmed>계정 및 앱 환경을 설정합니다.</Text>
      </Box>

      <Tabs<TabId>
        tabs={[
          { value: "general", label: "일반" },
          { value: "notifications", label: "알림" },
          { value: "security", label: "보안" },
        ]}
        value={tab}
        onChange={setTab}
        variant="underline"
      />

      {tab === "general" && (
        <Card>
          <Card.Body>
            <VStack gap={5}>
              <Heading level={3}>프로필</Heading>
              <Box>
                <Label className="mb-1.5 block text-xs" htmlFor="name">이름</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Box>
              <Divider />
              <Heading level={3}>환경</Heading>
              <Select
                options={[
                  { value: "ko", label: "한국어" },
                  { value: "en", label: "English" },
                ]}
                value={language}
                onChange={setLanguage}
                placeholder="언어 선택"
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
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">이메일 알림</Text>
                  <Text fontSize="xs" dimmed>새 소식을 메일로 받습니다.</Text>
                </Box>
                <Switch checked={emailNotif} onChange={setEmailNotif} />
              </HStack>
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">푸시 알림</Text>
                  <Text fontSize="xs" dimmed>모바일 푸시를 받습니다.</Text>
                </Box>
                <Switch checked={pushNotif} onChange={setPushNotif} />
              </HStack>
            </VStack>
          </Card.Body>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <Card.Body>
            <VStack gap={5}>
              <Heading level={3}>비밀번호 변경</Heading>
              <Box>
                <Label className="mb-1.5 block text-xs" htmlFor="cur">현재 비밀번호</Label>
                <Input id="cur" type="password" placeholder="현재 비밀번호" />
              </Box>
              <Box>
                <Label className="mb-1.5 block text-xs" htmlFor="new">새 비밀번호</Label>
                <Input id="new" type="password" placeholder="새 비밀번호" />
              </Box>
              <Divider />
              <HStack align="center" justify="between" className="py-2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">2단계 인증</Text>
                  <Text fontSize="xs" dimmed>로그인 시 OTP 를 요구합니다.</Text>
                </Box>
                <Switch checked={twoFactor} onChange={setTwoFactor} />
              </HStack>
            </VStack>
          </Card.Body>
          <Card.Footer>
            <HStack gap="sm" justify="end" className="w-full">
              <Button variant="primary" size="sm">변경 저장</Button>
            </HStack>
          </Card.Footer>
        </Card>
      )}
    </VStack>
  );
}
```

## Variations

- **강력한 비밀번호 정책** — 새 비밀번호 input 을 `PasswordInput`
  (`@/ds/primitives/PasswordInput`) 로 교체하면 `showStrength`/`showRules`
  내장 검사가 함께 표시된다.
- **위험 영역(Danger Zone)** — 보안 탭 하단에 `Card` 한 장을 더 두고
  `Button variant="danger"` 로 계정 삭제/세션 해제를 둔다.
- **자동 저장** — Footer 의 저장 버튼을 빼고 `Switch`/`Select` 의 onChange 가
  바로 API 를 호출하게 만든다. 이때 변경 직후 `useDsToast().success("저장됨")`
  으로 피드백을 준다(레시피 `./notification-stack.md` 참고).
- **사이드바 네비게이션** — `Tabs` 대신 좌측 `Sidebar`(`@/ds/patterns/Sidebar`)
  로 섹션을 옮기면 더 큰 설정 영역에 맞다.

## See also

- 쇼케이스: `/design-system/composites/tabs`,
  `/design-system/composites/card`, `/design-system/primitives/switch`,
  `/design-system/showcase/templates/settings`
- 관련 레시피: `./modal-with-form.md`, `./notification-stack.md`
- 요구사항: `requirements/design-system-library.md`,
  `requirements/license-and-auth.md` (보안 옵션 맥락)
- 소스 참고: `/Users/junha/develop/jjunhaa/JunDS/app/design-system/showcase/templates/settings/page.tsx`
