# Agent Onboarding (`AGENTS.md` workflow)

- **Slug:** `agent-onboarding`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-04-29

## Goal

LLM 에이전트 (Claude Code, 그 외) 가 처음 본 저장소에서 헤매지 않고 곧장 올바른
파일을 수정하도록, "필수로 읽어야 하는 세 파일 + 빠른 조회 명령" 을 표준화한다.
이 인프라가 없으면 에이전트가 `glob`/`grep` 을 수십 회 반복해 토큰을 낭비하고,
잘못된 폴더에 컴포넌트를 만들거나 컨벤션을 깨는 PR 을 낸다. 본 문서는 그
온보딩 흐름과 보조 도구의 동작을 정의한다.

## Scope

- In scope:
  - 진입점 문서 `AGENTS.md` (와 그것을 포함하는 `CLAUDE.md`).
  - 기능 인덴트 (이 디렉터리) `requirements/` 와 `requirements/README.md`
    인덱스.
  - 자동 생성 인벤토리 `.ai/MAP.md` 와 그 빌더 `scripts/build-map.mjs`
    (`npm run map`).
  - 컴포넌트 API 레퍼런스 `COMPONENTS.md`.
  - 빠른 검색 CLI `npm run locate -- <query> [--type ...]`
    (`scripts/locate.mjs`).
  - 개발 서버 런처 `./start` (포트 자동 시프트).
- Out of scope:
  - 컴포넌트 자체의 스펙 (각 컴포넌트의 requirement).
  - CI / 배포 파이프라인.
  - LLM 모델 선택 / 프롬프트 튜닝.

## User stories / acceptance criteria

- [x] As a 신규 에이전트, I can `AGENTS.md` 한 파일로 (1) `requirements/README.md`
      (2) `.ai/MAP.md` (3) `COMPONENTS.md` 순서를 알게 되고, 그 세 파일만으로
      사실상 모든 위치를 파악한다.
- [x] As a 에이전트, I can `npm run locate -- modal --type composite` 로
      관련 파일 후보 목록을 즉시 받는다.
- [x] As a 에이전트, I can `npm run locate -- <keyword> --type requirement`
      로 사양 파일을 검색한다.
- [x] As a 에이전트, I can `npm run map` 으로 `.ai/MAP.md` 를 갱신해 새 파일이
      바로 반영된다.
- [x] As a 메인테이너, `ds/`, `app/`, `requirements/` 아래 파일을 추가/이동/삭제
      한 PR 은 `.ai/MAP.md` 변경을 함께 포함한다 (커밋 가이드).
- [x] As a 사용자, I can `./start` 로 개발 서버, `./start prod` 로 프로덕션
      서버를 띄울 수 있고, 6100 포트가 점유되면 자동으로 다음 포트로 시프트
      된다.
- [x] As a 에이전트, "이 작업이 어느 파일을 건드려야 하는가" 를 `AGENTS.md`
      의 Task recipes 표에서 즉시 찾을 수 있다.

## Design / behavior notes

- **3단계 읽기 순서.** AGENTS.md 가 강제하는 순서는 (1) 요구사항 인덱스 →
  (2) 파일 인벤토리 → (3) 공개 API 레퍼런스. 이 순서를 어기면 컨텍스트가
  비어 있는 상태에서 코드를 만지게 된다.
- **`requirements/` 모델.** 한 기능 = 한 파일. `_template.md` 복제 + slug 부여
  - status 표기 + Touched files 명시. 인덱스 (`README.md`) 는 slug 정렬 표.
- **`.ai/MAP.md`.** `scripts/build-map.mjs` 가 `requirements/`, `ds/primitives`,
  `ds/composites`, `ds/patterns`, `ds/layout`, `ds/core`, `ds/hooks`,
  `ds/tokens`, `ds/providers`, `ds/utils`, `app/` 등을 스캔해 한 페이지
  체크리스트를 생성. 약 500개 경로가 한 번의 `Read` 로 들어오도록 의도됨.
- **`npm run locate`.** `scripts/locate.mjs` 가 키워드를 받아 파일명/경로를
  랭킹. `--type` 으로 `requirement | primitive | composite | hook | token |
test | page | data | config | asset | file` 중 한 카테고리로 좁힌다.
- **`./start`.** bash 런처. `mode = dev | prod`, `--port N` 옵션. 의존성이
  설치돼 있지 않으면 자동으로 `npm install` 후 `node scripts/run-server.mjs`
  를 호출. 6100 이 점유되어도 다음 가용 포트로 자동 시프트.
- **컨벤션.** 컴포넌트 PascalCase 폴더, 훅 `useX`, 카테고리 barrel + 루트
  barrel, 토큰 사용 의무. 이 규칙을 어긴 PR 은 리뷰 단계에서 막힌다.

## Touched files (for agents)

- `AGENTS.md` — 에이전트 온보딩 본문 (읽기 순서, 명령, 디렉터리 맵, Task
  recipes, 컨벤션, 유지보수 규칙).
- `CLAUDE.md` — `@AGENTS.md` 만 import 하는 진입점.
- `requirements/README.md` — 인덱스 + 사용법.
- `requirements/_template.md` — 새 요구사항 시작점.
- `requirements/<slug>.md` — 기능별 사양.
- `.ai/MAP.md` — 자동 생성 파일 인벤토리 (커밋됨).
- `scripts/build-map.mjs` — `npm run map` 빌더.
- `scripts/locate.mjs` — `npm run locate` / `npm run where`.
- `scripts/run-server.mjs` — `./start` 가 호출하는 dev/prod 런처.
- `start` — bash 런처 (실행 권한).
- `package.json` — `locate`, `where`, `map`, `dev`, `start` 스크립트.
- `COMPONENTS.md` — 공개 컴포넌트 API 레퍼런스.

## Open questions

- `.ai/MAP.md` 가 비대해질 경우 카테고리별 파편화 vs 단일 파일 유지의
  트레이드오프.
- pre-commit 훅으로 `.ai/MAP.md` 자동 재생성을 강제할지 (현재는 수동
  `npm run map`).

## Changelog

- 2026-04-29 — created.
