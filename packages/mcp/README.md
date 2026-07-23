# @junds/mcp — JunDS v3 MCP 서버

JunDS로 앱을 만드는 개발자의 **AI 에디터**가 컴포넌트·사용법·토큰·전환 상태를 정확히
조회하게 하는 [MCP](https://modelcontextprotocol.io) 서버. 스펙: `docs-spec/08-mcp.md`,
승인: DECISIONS DEC-016. v2 기여자 도구(scaffold 등)는 `mcp/server.mjs`(동결)가 담당.

v3는 전환 중인 시스템이므로 **진행 상태가 응답의 1급 시민**이다 — "있다/없다"가 아니라
"웹 done, iOS todo — 대안은 이것"으로 답해 AI가 거짓말하지 않게 한다.

## 도구 5종 (전부 읽기 전용)

| 도구 | 입력 | 응답 요지 |
|---|---|---|
| `search_components` | `query?` `category?` `platform?` `status?` | 원장+콘텐츠 랭킹 검색. platform 단독 = 그 플랫폼에서 지금 쓸 수 있는 것(done). 상한 50 + `truncated` 명시 |
| `get_component` | `id` | 원장 행(웹/iOS/docs/tests/bench 상태)+notes+태그·속성 표·a11y·저작된 스니펫 플랫폼·gzip 사이즈. 미발견 시 `suggestions` |
| `get_usage` | `id` `platform`(web·swiftui·uikit·react) | `{imp, code}` 스니펫. 미전환·미저작이면 **에러가 아니라** `{available:false, status, alternatives}` 구조화 응답 |
| `get_tokens` | `group?` `name?` | `{path, cssVar(--jd-*), value, swift(JdToken.*)}`. 무인자는 그룹 요약만. name은 정확 일치 우선 → 부분 일치 |
| `get_status` | `category?` | 원장 집계 대시보드 — 카테고리×플랫폼 done/wip/todo/na |

id 매칭은 전 도구 공통 대소문자 무시 + kebab↔Pascal 접기(`otp-input` ≡ `OTPInput`).
모든 응답에 `mode`(live/snapshot)와 `generatedAt`(원장 기준일)이 실린다.

## 연결

**이 레포 안 (기여자·에이전트)** — 루트 `.mcp.json`에 등록돼 있다:

```jsonc
{ "mcpServers": { "junds-v3": { "command": "node", "args": ["packages/mcp/src/server.mjs"] } } }
```

**소비자 프로젝트 (퍼블리시 후)**:

```bash
claude mcp add junds -- npx -y @junds/mcp
```

```jsonc
// 또는 프로젝트 .mcp.json
{ "mcpServers": { "junds": { "command": "npx", "args": ["-y", "@junds/mcp"] } } }
```

단독 디버그: `node packages/mcp/src/server.mjs` (stdio JSON-RPC).

## 데이터 해석 우선순위 (08-mcp §3.3)

```
1. $JUNDS_REPO_ROOT               (env 명시)
2. 서버 파일 위치 기준 상향 탐색     (레포 체크아웃 — 라이브 직독, 항상 최신)
3. 동봉 data/snapshot.json         (npx 소비자 — prepublishOnly가 생성)
```

소스 4계열: `docs-spec/registry/ledger.json`(상태 정본 445행) ·
`docs-spec/registry/docs-content/*.json`(설명·태그·스니펫) · `tokens/*.json`(12그룹,
파생 이름은 생성기 `cssVarName`/`swiftKey` 재사용) · `docs-spec/registry/size-baseline.json`.

스냅샷 생성: `npm run build:data -w @junds/mcp` (커밋하지 않는 생성물 — 퍼블리시 전용).

## docs-content 저작 규약 (DEC-016-2)

`docs-spec/registry/docs-content/<id>.json` — 파일명 = ledger id 정확 일치.

```jsonc
{
  "id": "Button",                     // 필수 — ledger id
  "desc": "…", "tags": ["…"],         // 필수
  "tag": "jd-button",                 // CE 태그 (사이즈 매핑 키로도 사용 — Input↔jd-text-field)
  "attributes": [{ "name": "variant", "values": ["primary"], "default": "primary" }],
  "snippets": { "web|swiftui|uikit|react": { "imp": "…", "code": "…", "note": "…" } },
  "a11y": [{ "item": "…", "note": "…" }],
  "note": "…"
}
```

**저작 게이트**: `web:done*` 원장 행은 docs-content가 반드시 존재해야 한다 —
`content-gate.test.mjs`가 v3:test에서 강제한다. 배치에서 web 상태를 done으로
갱신할 때 저작이 DoD다. 수동 점검: `npm run validate:content -w @junds/mcp`.

## 테스트

```bash
npm run test -w @junds/mcp   # nvm 22 — 단위(픽스처)·정합 게이트·라이브 패리티·InMemory 왕복·스냅샷 동일성
```

토큰 패리티(live-data.test.mjs)가 파생 이름을 실제 생성물(tokens.css·JdToken.swift)과
전수 대조한다 — 로더의 그룹 목록·Swift enum 매핑이 생성기와 어긋나면 여기서 잡힌다.

## Claude Code 실검증 절차 (08-mcp §7-5)

1. 이 레포를 연 Claude Code 세션 재시작(또는 MCP 재연결) → `junds-v3` 서버 인식 확인.
2. 아래 3콜을 순서대로 — 기대 응답:

| 호출 | 기대 |
|---|---|
| `search_components {query:"button"}` | `ok:true`, results 선두가 `Button`(web done·ios done), `mode:"live"` |
| `get_usage {id:"Button", platform:"swiftui"}` | `imp:"import JunDS"`, code에 `JdButton("저장", variant: .primary)` |
| `get_status {}` | `total` = 원장 counts.total(445+), `overall.web.done` ≥ 28 |

3. 음성 경로 1콜: `get_usage {id:"OTPInput", platform:"web"}` →
   `available:false, status:"todo"` (에러 아님 — 구조화 응답이 계약이다).
