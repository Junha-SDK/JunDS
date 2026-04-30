# Composition Recipes

이 디렉터리는 JunDS 컴포넌트를 어떻게 **조합**해서 흔한 앱 패턴을 만드는지
보여 주는 레시피 모음이다. 각 파일은 복붙 가능한 TSX 블록을 담은 단일
마크다운이며 다음 구조를 따른다.

- **Goal** — 한 문단의 문제 정의
- **Used components** — `@/ds/...` import 경로가 포함된 사용 컴포넌트 목록
- **Recipe** — 한 페이지에 그대로 넣을 수 있는 완성 컴포넌트 TSX 블록
- **Variations** — 흔한 변주
- **See also** — 관련 쇼케이스 / 레시피 / 요구사항 / 소스

이 레시피는 `.ai/props.json` (각 컴포넌트가 받는 props 의 명세)을 짝꿍으로
한다. props.json 이 "무엇이 있는가" 를 알려준다면, 레시피는
"어떻게 합치는가" 를 알려준다.

## When to use which

- 컴포넌트 한 개의 prop 이 궁금하면 → `.ai/props.json`
- 컴포넌트들을 어떻게 합치는지 궁금하면 → 이 디렉터리
- 화면 전체 템플릿이 궁금하면 → `app/design-system/showcase/templates/*`

## Recipes

| Slug | Goal | Components used |
| ---- | ---- | --------------- |
| [modal-with-form](./modal-with-form.md) | 모달 안에서 검증된 폼을 입력하고 Submit/Cancel | Modal, Form, FormField, Input, Button |
| [data-table-page](./data-table-page.md) | 검색·필터·페이지네이션이 결합된 표 페이지 | FilterBar, DataTable, Select, Button, Tag |
| [settings-page](./settings-page.md) | 탭 + 토글 + Select + 비밀번호 변경 | Tabs, Card, Switch, Select, Input, Label, Divider, Button |
| [login-screen](./login-screen.md) | 카드 + 입력 + 체크박스 + Divider + OAuth 버튼 | Card, Input, Label, Button, Checkbox, Divider |
| [dashboard-overview](./dashboard-overview.md) | 통계 그리드 + 차트 + 타임라인 + 빈 상태 | StatsGrid, ChartCard, Timeline, EmptyState, Card, Button |
| [command-palette](./command-palette.md) | ⌘K 명령 검색 + Kbd 힌트 + Spotlight 강조 | CommandPalette, Kbd, Spotlight, Button |
| [form-wizard](./form-wizard.md) | 3단계 폼 마법사 + 단계별 검증 | FormWizard, Stepper, FormField, Input, Select, Checkbox |
| [notification-stack](./notification-stack.md) | DsToastProvider + useDsToast + NotificationCenter 통합 | DsToastProvider, useDsToast, NotificationCenter, Button |

## Conventions

- TSX 블록은 그대로 `app/some-page.tsx` 에 붙여 넣으면 동작하도록 작성한다.
- props 이름·시그니처는 절대 추측하지 않는다. 의심되면 `.ai/props.json` 의
  해당 컴포넌트 항목을 다시 확인한다.
- 한국어 산문 + 영어 코드. 코드 안의 사용자 노출 문자열은 한국어를 유지한다.
- 새 레시피를 추가하면 위 표에 줄을 추가한다(알파벳 순 또는 의미 순 무방).
