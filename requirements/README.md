# Requirements Index

This directory is the **single source of truth** for product / feature requirements.
AI agents (Claude, etc.) must read this index **before** starting any task that
touches a feature listed below — code may have drifted, this file has not.

## How this directory works

- One file per feature: `requirements/<slug>.md` (kebab-case, e.g. `dark-mode.md`).
- Use `_template.md` as the starting point for new entries.
- The table below is the lookup index. Keep it sorted by slug.
- Mark status as `draft`, `active`, `shipped`, or `archived`.

## Active & shipped

| Slug | Status | One-line summary |
| ---- | ------ | ---------------- |
| [`agent-onboarding`](./agent-onboarding.md) | shipped | `AGENTS.md` + `.ai/MAP.md` + `requirements/` + `npm run locate` + `./start` 로 구성된 에이전트 온보딩 인프라. |
| [`compound-api`](./compound-api.md) | active | Compound members + `asChild` Slot 위임 규약 — composite 조립 일관성. |
| [`design-system-library`](./design-system-library.md) | shipped | `@junds/ui` 라이브러리 본체 — 카테고리 구조, barrel export, polymorphic 유틸, dist 빌드. |
| [`i18n`](./i18n.md) | shipped | `I18nProvider` + `defaultLocale` 사전으로 컴포넌트 내장 문자열을 부분 override. |
| [`license-and-auth`](./license-and-auth.md) | shipped | `JunDSProvider` 라이선스 검증 + 도메인 잠금 + 무결성 모니터 + `withLicense` HOC. |
| [`no-code-framework-phase-0`](./no-code-framework-phase-0.md) | draft | `PageDoc` / `ProjectDoc` JSON 스키마 정식화 + `ds/runtime/` 단일 렌더러 분리 — 노코드 프레임워크의 토대. |
| [`no-code-personas`](./no-code-personas.md) | draft | 비개발자 5페르소나 (랜딩·블로그·쇼핑·대시보드·예약) end-to-end 시나리오 + Phase 매핑. |
| [`showcase-site`](./showcase-site.md) | shipped | `app/design-system/*` Next.js 쇼케이스 — 사이드바, 검색 팔레트, 테마 스위처, 컴포넌트 페이지. |
| [`theming`](./theming.md) | shipped | `ThemeProvider` + 다크모드 + 디자인 토큰 + `app/globals.css` CSS 변수 브리지. |

## Quick lookup for agents

```bash
# Find a requirement file by keyword:
npm run locate -- <keyword> --type requirement

# List every requirement file:
ls requirements/*.md
```

## Workflow

1. **Before coding**, open the matching requirement file and read it end-to-end.
2. If the requirement is missing or unclear, **ask the user** before guessing.
3. When a feature ships or scope changes, **update the requirement file in the
   same PR** as the code change — do not let it rot.
