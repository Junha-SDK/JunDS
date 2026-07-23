# 08-mcp — JunDS v3 MCP 서버 (G0 보완, 승인 대기)

v2(@junds/ui)의 핵심 셀링 포인트 "AI 에디터가 컴포넌트를 정확히 조회하도록 MCP 서버 내장"이
G0 스펙(00~07)에서 누락됐다. 본 문서가 그 계승을 v3 체제(바닐라 웹 + iOS)에 맞게 재설계한다.
방향급 결정이므로 §9의 쟁점 3건은 사람 승인 후 구현에 착수한다.

---

## 1. v2 실측 감사 — `mcp/server.mjs`

### 1.1 구조

| 항목 | 실측 |
|---|---|
| 위치·규모 | `mcp/server.mjs` 단일 파일 957행 + `mcp/README.md` |
| 프로토콜 | MCP stdio(JSON-RPC), `@modelcontextprotocol/sdk` ^1.29.0 `McpServer.registerTool` |
| 입력 검증 | zod 스키마(PascalCase/kebab-case 정규식, 경로 이탈 가드, 쉘 메타문자 거부) |
| 실행 안전 | 외부 명령은 전부 `spawn(cmd, args, {shell:false})` — 쉘 문자열 경로 없음 |
| 발견 | 레포 루트 `.mcp.json` → `node mcp/server.mjs` (`npm run mcp` 동일) |
| 의존성 | SDK는 루트 devDep. **zod는 직접 선언 없음** — SDK 내부 의존에 업힌 전이 호이스팅(lockfile 실측) |

### 1.2 도구 14종 전수

| # | 도구 | 방식 | 데이터 소스 | 성격 |
|---|---|---|---|---|
| 1 | `locate` | shell-out `npm run locate` | scripts/locate.mjs 랭킹 | 조회(기여자) |
| 2 | `map_refresh` | shell-out `npm run map` | `.ai/MAP.md` 재생성 | **쓰기**(기여자) |
| 3 | `extract_props` | shell-out `npm run extract-props` | `.ai/props.json` 재생성 | **쓰기**(기여자) |
| 4 | `get_component_props` | 파일 읽기 | `.ai/props.json` | 조회 |
| 5 | `list_recipes` | 디렉토리 읽기 | `.ai/recipes/*.md` | 조회 |
| 6 | `read_recipe` | 파일 읽기 | `.ai/recipes/<slug>.md` | 조회 |
| 7 | `scaffold` | shell-out `npm run scaffold` | `ds/` 신규 파일 생성 | **쓰기**(기여자) |
| 8 | `list_requirements` | 디렉토리 읽기 | `requirements/*.md` | 조회(기여자) |
| 9 | `read_requirement` | 파일 읽기 | `requirements/<slug>.md` | 조회(기여자) |
| 10 | `list_hooks` | 소스 파싱 | `ds/hooks/index.ts` 배럴 + JSDoc | 조회 |
| 11 | `get_a11y` | 파일 읽기 | `.ai/a11y.json` | 조회 |
| 12 | `get_bundle_info` | 파일 읽기 | `.ai/bundle.json` | 조회 |
| 13 | `get_deps_for` | 파일 읽기 | `.ai/deps.json` | 조회 |
| 14 | `get_screenshot_info` | 파일 읽기 | `.ai/screenshots.json` | 조회 |

### 1.3 v3 관점의 한계 5건

1. **레포 체크아웃 전제** — npm 스크립트 shell-out + `.ai/` 아티팩트 직독이라
   "이 레포 안에서 작업하는 에이전트"만 쓸 수 있다. JunDS를 **소비하는** 앱 개발자의
   AI 에디터에게는 배포 경로가 없다 (셀링 포인트의 절반이 미달성).
2. **대상이 전부 v2 동결 구역** — `ds/`·`.ai/`·`requirements/`. v3 전환 상태(ledger),
   바닐라/iOS 표면, 토큰 파이프라인을 전혀 모른다.
3. **zod 전이 의존** — 직접 devDep이 아니라 SDK 의존에 업힌 우연 호이스팅.
   SDK 메이저 업이나 npm 트리 변화로 조용히 깨질 수 있는 상태.
4. **조회·쓰기 혼재** — scaffold/map_refresh/extract_props는 기여자 전용 쓰기 도구.
   소비자 표면에 노출되면 무의미하거나 위험하다.
5. **stale 무감지** — `.ai/*.json`은 수동 재생성 산출물인데 신선도 강제가 없어
   오래된 데이터를 현재 상태처럼 응답한다.

---

## 2. v3 대상 재정의 — 소비자 우선

v2 MCP의 암묵 페르소나는 "JunDS 레포 기여자"였다. v3의 1차 페르소나는
**JunDS로 앱을 만드는 개발자의 AI 에디터**다:

- `npx @junds/mcp` 한 줄로 어느 프로젝트에서든 연결 — 레포 체크아웃 불요.
- 질문 유형: "버튼 있어? iOS도 돼?" / "jd-modal 쓰는 법" / "SwiftUI에서 이 컴포넌트" /
  "primary 색 토큰 값" / "전환 어디까지 됐어".
- **진행 상태가 곧 응답의 일부**: v3는 전환 중인 시스템이므로 "있다/없다"가 아니라
  "웹 done, iOS todo — 대안은 이것" 수준으로 답해야 AI가 거짓말하지 않는다.

기여자 시나리오는 별도 표면 없이 자동 커버된다: 레포 체크아웃 안에서 실행하면
같은 도구가 라이브 파일(원장·토큰·콘텐츠)을 직독하므로 항상 최신이다(§3.3).
v2 서버(`mcp/`)는 v2 동결 구역과 함께 그대로 존치한다 — 01 §1의
"mcp/ 유지, v3 인벤토리를 읽도록 후속 확장" 항목은 본 스펙으로 대체된다
(v2 파일 수정 대신 신설 패키지, §9-Q3).

---

## 3. 데이터 소스

### 3.1 4계열 (전부 읽기 전용 — v3 MCP에 쓰기 도구는 없다)

| 소스 | 내용 | 스키마 근거 |
|---|---|---|
| `docs-spec/registry/ledger.json` | 445행 전환 원장 `{id, category, tier, web, ios, docs, tests, bench, notes}` | 실측·07 §4 (상태 정본) |
| `docs-content/<kebab>.json` (레포 루트) | 컴포넌트별 콘텐츠 정본 445건 — oneLiner·tags·controls·snippets 4탭·tokens·a11y | 콘텐츠 트랙 DEC-021 (06 §2.2+§2.3 정렬) — §3.2 |
| `tokens/*.json` (12그룹) | 토큰 단일 소스. 파생 네이밍은 생성기 규약: CSS `--jd-<prefix>-<kebab>`, Swift `JdToken.<Group>.<name>` | 02·tokens/build/generate.mjs 실측 |
| `docs-spec/registry/size-baseline.json` | 컴포넌트별 gzip bytes `{core, components: {<kebab>: bytes}}` | 실측 (05 게이트 산출물) |

### 3.2 docs-content — 콘텐츠 정본 (DEC-026 개정: 콘텐츠 트랙 정본 채택)

Q2 승인의 원칙(문서 화면과 MCP의 **단일 저작점** + ledger 정합 게이트)은 유지하되,
위치·스키마는 본 트랙 구현 중 병행 콘텐츠 트랙이 선착시킨 **레포 루트
`docs-content/<kebab>.json` 445건**(DEC-021, d88592b)을 정본으로 채택한다 — 같은
목적의 저장소 이원화 금지. 초판이 계획한 `docs-spec/registry/docs-content/`는
폐기(미커밋 상태에서 회수, DEC-026).

정본 계약(요지 — 상세는 DEC-021과 `docs-content/build-index.mjs` 헤더):

- 스키마 `{id(kebab), ledgerId, category, title, oneLiner, tags, controls, snippets, tokens, a11y}`
  — 06 §2.2(코드 탭 4종)·§2.3(ControlDef) 정렬. 조인 키는 **(ledgerId, category)**
  (원장 중복 id AreaChart 2건 때문에 id 단독 불가).
- 상태(web/ios)는 파일에 저장하지 않는다 — ledger가 유일 정본, 검증기가 조인.
- 스니펫 게이트: ledger가 done*일 때만 비-null + **실물 대조**(웹 태그·서브패스·iOS 식별자).
- web 스니펫의 `{prop}` 템플릿 토큰(06 §2.3)은 controls와 연동.

MCP 측 어댑테이션:

- CE 태그는 파일에 없으므로 **web 스니펫의 첫 `<jd-*>`에서 파생**(검증기가 실물과
  대조하는 값이라 근거 충분) — size-baseline(kebab 키) 매핑과 응답 `tag` 필드의 원천.
- `get_usage`는 web 스니펫의 `{prop}` 토큰을 controls 기본값으로 **치환해** 반환한다
  (06 §2.3 "복사도 주입값 기준") — 복사해 바로 동작하는 코드가 계약.
- 검증은 정본 검증기(build-index.mjs)에 위임 — 로직 중복 저작 금지. MCP가 보태는
  **보완 게이트 1건**: 정본 게이트는 ¬done ⇒ null 방향만 강제하므로, 역방향
  **"web done* ⇒ web 스니펫 저작"** 커버리지를 `content-gate.test.mjs`가 강제한다
  (DEC-016-2 저작 게이트의 계승) — 배치가 web 상태를 done으로 갱신하면
  스니펫 저작이 DoD다.

### 3.3 데이터 해석 우선순위 — 라이브 우선, 스냅샷 폴백

```
1. $JUNDS_REPO_ROOT              (env 명시 — 디버그·CI)
2. 서버 파일 위치 기준 상향 탐색   (import.meta.url → docs-spec/registry/ledger.json 존재 확인)
3. 패키지 동봉 data/snapshot.json (npx 소비자 — prepublishOnly가 4계열을 1파일로 스냅샷)
4. 전부 실패 → 명확한 에러 (어느 경로를 시도했는지 포함)
```

- 탐색 기점은 **서버 파일 위치**다. cwd 기준이면 소비자 앱 루트를 JunDS 레포로
  오인한다(v2도 import.meta.url 기준 — 계승).
- 스냅샷은 커밋하지 않는 생성물(`prepublishOnly`에서 생성, `files`에 포함). 레포 내
  실행은 항상 라이브 직독이므로 v2의 stale 함정(§1.3-5)이 소비자 경로로 한정되고,
  그마저 `generatedAt`을 모든 응답 메타로 노출해 AI가 신선도를 인지한다.

---

## 4. 도구 설계 — 5종 (전부 조회)

도구 이름에 접두는 없다 — 클라이언트가 서버 이름으로 네임스페이스한다
(`mcp__junds-v3__search_components`). id 매칭은 전 도구 공통으로
대소문자 무시 + kebab↔Pascal 접기(`otp-input` → `OTPInput`).

### 4.1 `search_components`

```
입력: { query?: string, category?: "core"|"layout"|"primitives"|"hooks"|"composites"|"patterns"|"finance",
        platform?: "web"|"ios", status?: "done"|"wip"|"todo" }
```

- query 매칭: ledger id·notes + docs-content desc·tags. 랭킹: id 정확일치 > id 접두 >
  tags > desc/notes 부분일치. query 없으면 필터만으로 목록(카테고리 브라우징).
- `platform`+`status` 조합: 해당 플랫폼 상태로 필터("iOS에서 지금 쓸 수 있는 것").
- 응답: `{ ok, total, truncated, results: [{id, category, tier, web, ios, desc?, tags?}] }`
  — 상한 50, 절단 시 `truncated: true` 명시(조용한 절단 금지).
- v2 `locate`(개념 검색)·`list_hooks`(category=hooks)의 소비자 관점 후계.

### 4.2 `get_component`

```
입력: { id: string }
응답: { ok, id, category, tier,
        status: { web, ios, docs, tests, bench },   // ledger 행 그대로 — 진행 상태가 1급 응답
        notes,                                       // ledger notes (구현 결정 요약)
        tag?, title?, desc?, tags?,                  // docs-content (desc = oneLiner)
        controls?, tokensUsed?, a11y?,               // 06 §2.3 ControlDef·토큰 표·접근성 표
        snippetPlatforms: ["web", ...],              // 비-null 스니펫 플랫폼 목록
        gzipBytes?,                                  // size-baseline (스니펫 파생 tag 키)
        generatedAt }
```

- 미발견 시 부분일치 상위 5건을 `suggestions`로 제안(v2 `available` 힌트 계승).
- v2 `get_component_props` + `get_bundle_info`의 통합 후계. (`get_deps_for`류
  의존 그래프는 v3 아티팩트가 없으므로 미계승 — §5.)

### 4.3 `get_usage`

```
입력: { id: string, platform: "web"|"swiftui"|"uikit"|"react" }
```

- 스니펫 있음: `{ ok, id, platform, tag, imp, code, controls?, note? }` — web은
  `{prop}` 템플릿 토큰을 controls 기본값으로 치환한 코드(§3.2).
- 스니펫 없음(null)·플랫폼 미전환: **에러가 아니라 구조화 응답** —
  `{ ok: true, id, platform, available: false, status: "todo", alternatives: ["web"], note }`.
  "아직 없음"은 질문에 대한 정답이지 실패가 아니다 — AI가 이 응답으로
  "iOS는 예정, 웹은 지금 가능"을 정확히 말할 수 있어야 한다.
- `platform: "react"`: 정본의 react 스니펫(v2 COMPONENTS.md Example 이관분)이 있으면
  "v2 참고" note와 함께 반환, 없으면 v2 `@junds/ui` 사용 안내(전환기 정책 01 §8).

### 4.4 `get_tokens`

```
입력: { group?: "color"|"space"|"radius"|"type"|"motion"|"shadow"|"border"|"breakpoint"|"opacity"|"zindex"|"gradient"|"theme-presets",
        name?: string }
```

- 무인자: 그룹 목록 + 그룹별 개수만(전체 덤프 방지). `group`: 그 그룹 전 토큰.
  `name`: CSS 변수명(`--jd-color-primary`)·토큰 경로(`color.primary`)·부분 문자열 매칭.
- 토큰 항목: `{ path, cssVar, value, swift }` — 예:
  `{ path: "color.primary", cssVar: "--jd-color-primary", value: "#5b4cc7", swift: "JdToken.Color.primary" }`.
  light/dark 쌍 토큰은 `value: { light, dark }` 그대로(02 파리티 원칙 — 값 가공 금지).
- 파생 이름은 `tokens/build/generate.mjs`의 네이밍 함수와 **동일 규칙을 재사용**해
  계산한다(규칙 중복 저작 금지 — 생성기에서 함수 export 추출, 생성물 수정 아님).

### 4.5 `get_status`

```
입력: { category?: ... }   // §4.1과 동일 enum
응답: { ok, generatedAt, total: 445,
        byCategory: { core: { total: 13, web: {done, wip, todo, na}, ios: {...} }, ... },
        overall: { web: {...}, ios: {...} } }
```

- ledger 집계 대시보드 — "어디까지 됐어" 한 방 응답. 06 §2.1의 지원 배지와 같은
  원장이므로 문서 화면과 수치가 항상 일치한다.

---

## 5. v2 → v3 호환성 표 (14종 전수 처분)

| v2 도구 | v3 처분 | 근거 |
|---|---|---|
| `locate` | → `search_components` | 개념 검색 계승. 파일 랭킹(레포 전제)은 소비자에 무의미 |
| `get_component_props` | → `get_component` + `get_usage`의 `attributes` | 정본이 .ai/props.json(v2)에서 docs-content(v3)로 이동 |
| `list_hooks` | → `search_components {category:"hooks"}` | hooks도 원장 445행에 포함(→Behavior 전환 상태 노출) |
| `get_bundle_info` | → `get_component.gzipBytes` | 정본이 size-baseline.json(05 게이트 산출물)으로 이동 |
| `list_recipes` / `read_recipe` | 미계승 (후속 재심의) | .ai/recipes는 v2 자산. v3 대응물 생기면 `get_usage` 확장으로 수용 |
| `scaffold` | **미계승** | 기여자 쓰기 도구. v3 스캐폴딩은 배치 워크플로(07)가 담당, 소비자 표면에 부적합 |
| `map_refresh` / `extract_props` | **미계승** | v2 아티팩트 재생성 — 동결 구역 쓰기 |
| `list_requirements` / `read_requirement` | **미계승** | v2 기여 문서. v3 스펙은 docs-spec/이며 사람·에이전트가 직독 |
| `get_a11y` | 부분 계승 — docs-content `a11y` 표 | axe 런 아티팩트는 v2 전용. v3 a11y는 DoD(07 §3-1)로 강제되고 요약만 콘텐츠화 |
| `get_deps_for` | 미계승 | v3는 의존성 0 철학 — CE 간 import 그래프 자체가 거의 없음(Box 파생 정도) |
| `get_screenshot_info` | 미계승 | v2 스크린샷 파이프라인 전용. v3 시각 정본은 문서 화면(06) |

v2 서버는 `.mcp.json`의 `junds` 항목으로 그대로 남는다(동결) — v2 레인에서 작업하는
에이전트의 도구를 뺏지 않는다. v3는 `junds-v3` 항목으로 병기한다(§6).

---

## 6. 패키지·배포

### 6.1 `packages/mcp` = `@junds/mcp`

```
packages/mcp/
├─ package.json          # name @junds/mcp, version 3.0.0-alpha.0, bin.junds-mcp → src/server.mjs
├─ src/
│  ├─ server.mjs         # MCP 와이어링 (엔트리, shebang)
│  ├─ data.mjs           # §3.3 해석 우선순위 + 로더 (라이브/스냅샷 공통 인터페이스)
│  └─ tools/*.mjs        # 도구 5종 — 순수 함수(데이터 인자 주입)로 분리 → 단위 테스트 직결
├─ scripts/
│  └─ build-data.mjs     # 4계열 → data/snapshot.json (prepublishOnly, 커밋 안 함)
│                        # (콘텐츠 검증은 정본 docs-content/build-index.mjs에 위임 — §3.2)
├─ __tests__/            # vitest node 환경 (§7)
└─ README.md             # 도구 표 + Claude Code 연결·실검증 절차
```

- **무빌드 ESM `.mjs` + JSDoc** — bin이 소스를 직접 가리킨다. 근거: Node CLI는 브라우저
  번들(01 §6은 web/react 배포물 얘기)과 요구가 다르고, v2 mcp/server.mjs 전례와 같다.
  빌드 0 = npx 실행물과 소스가 항상 동일(감사 용이). 타입은 JSDoc + 루트 tsc
  `checkJs` 편입은 후속(루트 tsconfig은 공유 파일 — §9-Q3 범위 밖).
- **의존성 2개, 각 정당화** (미션 규칙: 최소한 + 정당화):
  - `@modelcontextprotocol/sdk` ^1.29.0 — 프로토콜 구현 그 자체. JSON-RPC 프레이밍·
    capabilities 협상 자작은 재발명. v2와 동일 메이저·동일 버전 범위라 lockfile 재사용.
  - `zod` — SDK `registerTool` inputSchema 계약이 zod 표면. **명시 선언**으로 v2의
    전이 의존 취약(§1.3-3)을 v3에서 보정.
- 신설 스크립트는 전부 패키지 내부(`packages/mcp/scripts/`) — 루트 `scripts/` 불리기
  금지(01 §3.4) 준수.

### 6.2 소비자 연결 (README에 수록할 계약)

```bash
# Claude Code (소비자 프로젝트 어디서든)
claude mcp add junds -- npx -y @junds/mcp
```

```jsonc
// 또는 소비자 프로젝트 .mcp.json
{ "mcpServers": { "junds": { "command": "npx", "args": ["-y", "@junds/mcp"] } } }
```

퍼블리시 전(로컬 개발·이 레포 안)은 `node packages/mcp/src/server.mjs` 직접 지정.
npm publish는 DEC-005대로 요청 시에만 — 본 트랙은 publish하지 않는다.

### 6.3 루트 공유 파일 최소 수정 2건 (소유권 밖 — 승인 필요, §9-Q3)

1. 루트 `package.json` workspaces에 `"packages/mcp"` 추가 (설치·테스트 연동.
   `v3:build`/`v3:test`는 `--workspaces --if-present`라 자동 포함 — 스크립트 수정 불요).
2. 루트 `.mcp.json`에 `junds-v3` 항목 병기 (v2 `junds` 무수정):

```jsonc
{ "mcpServers": {
    "junds":    { "command": "node", "args": ["mcp/server.mjs"] },
    "junds-v3": { "command": "node", "args": ["packages/mcp/src/server.mjs"] } } }
```

---

## 7. 테스트·실검증

1. **단위 (도구별)**: 도구 함수에 픽스처 데이터 주입 — 매칭·랭킹·절단·미발견 제안·
   미전환 구조화 응답(§4.3) 전부. vitest node 환경, 루트 러너에 워크스페이스로 편입.
2. **정합 게이트**: 정본 검증기(docs-content/build-index.mjs) 실행 성공 + 보완
   게이트(web done* ⇒ web 스니펫, §3.2)를 vitest로. 토큰 파생 이름은 생성물
   `tokens.css`/`JdToken.swift`의 실제 이름과 전수 대조(생성기 규칙 재사용 검증).
3. **통합 (프로토콜 왕복)**: SDK `InMemoryTransport`로 클라이언트↔서버 실왕복 —
   도구 목록 조회 + 도구 5종 호출 각 1건. 프로세스 spawn 없이 CI 안정.
4. **스냅샷 모드**: build-data.mjs 실행 → 레포 탐지를 차단한 로더로 동일 질의 → 라이브
   모드와 응답 동일성 비교 (npx 소비자 경로가 2급 시민이 되지 않게).
5. **Claude Code 실검증 (README 절차화)**: `.mcp.json` junds-v3 병기 후 Claude Code
   재시작 → `search_components {query:"button"}` → `get_usage {id:"Button", platform:"swiftui"}` →
   `get_status` 3건의 기대 응답을 README에 명시하고 수행 결과를 커밋 메시지에 기록.

검증 러너는 nvm22 (07 §4 — 기본 셸 Node v16 금지). vitest stale 캐시 함정은
DEC-014-8 프로토콜(node_modules/.vite 삭제) 준수.

## 8. DoD

1. 도구 5종 구현 + zod 입력 스키마 + 응답 메타(generatedAt) 전 도구 일관.
2. §7의 1~4 테스트 전부 통과 (nvm22).
3. 콘텐츠 정본(루트 docs-content/) 소비 + web done* 전수 스니펫 커버(게이트 통과, DEC-026).
4. eslint 에러 0, 루트 `v3:test` 무해 통과(--if-present 편입 확인).
5. README(도구 표·연결·실검증 절차) + Claude Code 실검증 수행.
6. DECISIONS.md append(승인 결과 기록) + 커밋 1건(내 경로만 스테이징).

## 9. 열린 쟁점 — 승인 요청 3건

- **Q1. 도구 표면**: 소비자 조회 5종으로 확정하고 v2 기여자 도구
  (scaffold·map_refresh·extract_props·locate 파일랭킹·requirements 계열)는 미계승 —
  v2 서버 병행 존치로 커버. 이대로 가는가?
- **Q2. docs-content 정본화**: `docs-spec/registry/docs-content/<id>.json` 신설,
  web:done 전수(16건) 손저작으로 시작, 후속 게이트에서 06 문서 파이프라인(코드 탭 3종)이
  같은 파일을 소비하도록 06 개정 — 문서 화면과 MCP의 단일 저작점. 이대로 가는가?
- **Q3. 배포·루트 수정**: `@junds/mcp` 무빌드 npx 패키지(의존성 2: SDK+zod) +
  소유권 밖 공유 파일 2건 최소 수정(루트 package.json workspaces 추가·.mcp.json
  junds-v3 병기) 허용하는가?
