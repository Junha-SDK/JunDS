# No-Code Framework — Phase 0 (Schema & Renderer 분리)

- **Slug:** `no-code-framework-phase-0`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-08-03

## Goal

JunDS를 비개발자도 웹사이트를 만들 수 있는 **노코드 프레임워크**로 키우기 위한
첫 단계. 현재 `app/design-system/lab/`에는 드래그앤드롭 빌더 v0가 있지만, 트리
구조와 prop 모델이 Lab 안에 갇혀 있어 다중 페이지·데이터 바인딩·게시
파이프라인을 얹을 수 없다. Phase 0 의 목표는 **빌더(디자인타임)와 게시
사이트(런타임)가 같은 JSON 스키마와 같은 렌더러를 공유**하도록 만드는 것이다.
이 한 가지 분리가 끝나야 이후 모든 단계(다중 페이지, 데이터 바인딩, AI 패치,
게시)가 같은 한 줄 위에서 자랄 수 있다.

## Scope

- In scope:
  - `PageDoc` / `ProjectDoc` JSON 스키마 정식화 (런타임 검증 포함).
  - `ds/runtime/` 디렉터리 신설 — 단일 `Renderer`, `componentRegistry`,
    `actionRunner`, `bindingResolver`.
  - 기존 Lab `TreeNode` → `PageDoc.tree` 마이그레이션 어댑터.
  - 직렬화/역직렬화 라운드트립 (Lab 상태 ↔ JSON 문자열).
  - JSON → TSX 코드 export 는 **부산물**이며 진실의 원천이 아님을 코드/문서로
    명시.
- Out of scope (Phase 1 이후):
  - 다중 페이지/라우팅 UX, `ProjectDoc.pages[]` 의 페이지 간 네비게이션.
  - 클라우드 영속화 (현 단계는 메모리 + IndexedDB 까지).
  - `DataSource` 어댑터, 액션 그래프 빌더 UI.
  - AI 코파일럿 통합.
  - 게시(배포) 파이프라인.

## User stories / acceptance criteria

- [x] As a 라이브러리 메인테이너, I can `import { Renderer, parsePageDoc } from "@junds/ui/runtime"`,
      so that 외부 호스트 앱이 임의의 `PageDoc` JSON 을 화면에 그릴 수 있다.
- [x] As a Lab 사용자, I can 캔버스에서 만든 트리를 JSON으로 export 하고, 같은
      JSON 을 다시 import 했을 때 **시각적으로 동일한** 결과가 나온다 (round-trip).
- [x] As a 라이브러리 메인테이너, I can `parsePageDoc(unknown)` 호출 시 잘못된
      JSON 에 대해 사람이 읽을 수 있는 오류 경로(`tree[2].props.variant`)를
      받는다.
- [x] As a 게시 사이트 방문자, I see 디자인 타임 캔버스와 픽셀 동일한 화면을
      본다 — 두 환경 모두 같은 `<Renderer />` 함수를 사용한다.
- [x] As an AI 에이전트, I can `PageDoc` 의 한 노드만 patch 한 결과를 다시
      검증할 수 있다 — 스키마는 부분 patch 검증을 지원한다.

## Architecture decisions

### A1 — JSON 페이지 그래프가 진실의 원천

`PageDoc` (한 페이지) / `ProjectDoc` (여러 페이지 + 테마 + 데이터원) 두
스키마를 정식화한다. 빌더, 런타임, AI, export, import 모두 이 형식만 본다.
TSX 코드 export 는 사용자 신뢰를 위한 escape hatch 일 뿐 — 진실은 JSON.

### A2 — 단일 렌더러 (Single Renderer)

`ds/runtime/Renderer.tsx` 한 함수가 **두 모드**(`design` / `runtime`)를 처리.
디자인 모드에서는 hover/select overlay 와 "이 노드 클릭" 같은 편집 이벤트를
emit 하고, 런타임 모드에서는 그 훅들을 비활성화한다. 두 모드의 출력 DOM 구조는
동일.

### A3 — 컴포넌트 레지스트리 일원화

현재 두 곳에 컴포넌트 정보가 흩어져 있다:

- `app/design-system/lab/_lib/registry.ts` — 빌더용 `ComponentDef`
- `.ai/props.json` — 자동 추출 prop 시그니처

Phase 0 에서 이 둘을 **하나의 `ComponentManifest`** 로 통합한다 (코드는
빌드 시 `.ai/props.json` 에서 생성, 빌더용 메타데이터만 추가 레이어로 얹는다).

### A4 — 런타임 검증기 의존성 결정

`PageDoc` 은 외부 입력(파일/네트워크)으로도 들어오므로 런타임 스키마 검증이
필수다. 후보:

| 라이브러리 | gzip   | 장점                        | 단점        |
| ---------- | ------ | --------------------------- | ----------- |
| `zod`      | ~12 KB | 타입 추론 강력, 생태계 풍부 | 가장 큼     |
| `valibot`  | ~3 KB  | tree-shakable, 모듈러       | 생태계 작음 |
| 자체 구현  | 0 KB   | 의존성 0                    | 유지비 증가 |

**결정 (이 문서):** `valibot` 채택. `@junds/ui` 가 sideEffects:false 라이브러리라
번들 크기에 민감하고, 사용 면적은 PageDoc 검증 한 곳뿐이라 zod 의 풀 기능이
필요 없다. 단, **이 문서의 스키마 초안은 zod 표기로 작성**한다 — 호환 표기가
더 익숙하고, 실제 구현 단계에서 valibot 으로 mechanical 하게 옮긴다.

### A5 — 부분 patch 가능한 스키마 모양

AI 에이전트가 트리의 한 노드만 갱신하는 시나리오를 위해, `Node` 는
`partial()` 을 통해 patch 형태로 검증 가능해야 한다. 따라서 모든 필드의
required/optional 을 명시하고, 필수 필드(예: `id`, `componentId`) 와
선택 필드(예: `props`, `bindings`) 를 분리한다.

## Design / behavior notes

- `Renderer` 는 디자인/런타임 두 모드를 토글 prop 으로 받지만 **출력 DOM 은
  동일**. 디자인 모드에서만 hover/select 인디케이터를 추가 레이어로 얹는다.
- `bindings` 표현식은 식별자·점·대괄호만 허용. 함수 호출/연산자 금지. 평가는
  자체 구현 (eval/Function 사용 금지).
- 액션 그래프는 Phase 0 에서 **shape 만** 정의. `actionRunner.run(action)` 은
  `kind: "noop"` 외 모두 console.warn 후 무시. 실제 디스패치는 Phase 2.
- `responsiveValue` 는 기존 라이브러리의 `{ base, sm, md, lg, xl }` plain
  object 와 호환. `Renderer` 는 `$kind: "responsive"` 태그가 없는 plain
  object 도 받아들이는 어댑터를 둔다.
- round-trip 보장: 어떤 빌더 상태든 `serialize → JSON.stringify → JSON.parse →
parsePageDoc → deserialize` 후 시각적으로 동일해야 한다. 시각 동치는
  Playwright 스냅샷으로 검증.
- `schemaVersion` 은 마이그레이션 hook 의 자리. Phase 0 은 항상 1, 입력을
  그대로 반환하는 `migrate(doc)` 만 노출.

## Touched files (for agents)

다음은 **이미 존재**하며 Phase 0 작업이 수정하는 파일이다. 신설 파일은 아래
`## Planned files (Phase 0 deliverables)` 참조.

- `ds/index.ts` — `export * from "./runtime"` 추가.
- `package.json` — `exports` 에 `./runtime` subpath, `dependencies` 에
  `valibot` 추가.
- `rollup.config.mjs` — `runtime` 두 번째 entry point 빌드.
- `app/design-system/lab/_lib/types.ts` — `TreeNode` 가 `Node` 와 호환되도록
  필드 정렬.
- `app/design-system/lab/_lib/store.tsx` — `serialize(state): PageDoc` /
  `deserialize(doc: PageDoc): LabState` 추가.
- `app/design-system/lab/_components/BuilderCanvas.tsx` — 직접 컴포넌트 import
  을 끊고 신규 `Renderer` 호출로 단일화 (가장 큰 변경, 약 30개 직접 import).
- `app/design-system/lab/_components/CodeExporter.tsx` — `generateCode`
  시그니처 변경.
- `app/design-system/lab/_lib/code-generator.ts` — 입력 타입 `LabState` →
  `PageDoc`.
- `mcp/server.mjs` — 신규 tool 추가: `validate_page_doc`, `apply_page_patch`.
- `requirements/README.md` — 이 문서 + `no-code-personas.md` 인덱스 추가.
- `AGENTS.md` — "AI Agent Onboarding" 섹션에 런타임 스키마 항목 추가.
- `ds/runtime/index.ts` — public barrel: `Renderer`, `parsePageDoc`,
  `parseProjectDoc`, `parseNodePatch`, 타입 export.
- `ds/runtime/schema.ts` — `PageDoc` / `ProjectDoc` 검증 스키마 + `NodePatch` + 추론 타입.
- `ds/runtime/Renderer.tsx` — JSON 트리를 DOM 으로 그리는 단일 함수.
- `ds/runtime/registry.ts` — `ComponentRegistry` 모델 + 기본 레지스트리.
- `ds/runtime/bindings.ts` — `{{ expr }}` 표현식 파서/평가기.
- `ds/runtime/actions.ts` — 선언적 액션 인터프리터 스텁 (Phase 0 은 noop만).
- `ds/__tests__/runtime/*` — round-trip · 오류 경로 · 부분 patch · Renderer 모드 동치.
- `app/design-system/lab/_lib/adapter.ts` — `serialize`/`deserialize` (Lab ↔ PageDoc).

## Migration plan (Lab → PageDoc)

1. `LabState` 의 `nodes`/`rootIds` 평면 구조를 `PageDoc.tree` 의 중첩 구조로
   변환하는 `flattenToNested(state)` / `nestedToFlat(doc)` 두 함수를
   `app/design-system/lab/_lib/adapter.ts` 에 둔다.
2. `BuilderCanvas` 의 `renderNode` 를 단계적으로 분해해 `ds/runtime/Renderer`
   로 옮긴다. 한 컴포넌트씩 옮기며 시각 회귀를 확인한다 (Storybook + Playwright
   스냅샷이 이미 존재).
3. Lab 컴포넌트 정의 (`registry.ts`)와 `.ai/props.json` 사이의 prop 차이를
   `scripts/build-component-manifest.mjs` 가 빌드 시 통합 — 단일 `manifest.json`
   생성. Lab 의 `componentDefs` 는 이 매니페스트의 view 가 된다.
4. Lab 의 prop 편집 UI 는 `.ai/props.json` 의 한국어 설명을 자동으로 끌어와
   라벨로 사용 (현재는 `label` 을 코드에 박아 둠 — 향후 자동화의 발판).

## Schema reference (zod 표기 — 실제 구현은 valibot 으로 옮김)

```ts
// ds/runtime/schema.ts (draft — depends on adding `valibot` or `zod` to deps)
import { z } from "zod";

// ── Primitive value types ────────────────────────────────────────────

/** A literal prop value supplied directly. */
export const literalValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);

/**
 * A bound prop value — resolved at render time from data sources / state.
 * `expr` is a restricted expression: identifiers, `.member`, `[index]`.
 * No function calls, no operators, no `globalThis`.
 *
 * Examples:
 *   "user.name"
 *   "products[0].title"
 *   "form.email"
 */
export const bindingValue = z.object({
  $kind: z.literal("binding"),
  expr: z.string().min(1),
  fallback: literalValue.optional(),
});

/**
 * A responsive prop value — `{ base, sm, md, lg, xl }` per breakpoint.
 * Mirrors Box/Flex `p={{ base: 2, md: 4 }}` already in the lib.
 */
export const responsiveValue: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    $kind: z.literal("responsive"),
    base: propValue,
    sm: propValue.optional(),
    md: propValue.optional(),
    lg: propValue.optional(),
    xl: propValue.optional(),
  }),
);

/** Final prop value — literal | binding | responsive. */
export const propValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([literalValue, bindingValue, responsiveValue]),
);

// ── Action graph (Phase 0: shape only, runner stubbed) ───────────────

/**
 * Declarative event handlers. NEVER raw JS strings.
 * Phase 0 supports only the shape; the runner returns no-op for non-`noop`
 * kinds. Real navigate/api/openModal land in Phase 2.
 */
export const actionNode = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("noop") }),
  z.object({ kind: z.literal("navigate"), to: z.string() }),
  z.object({ kind: z.literal("openModal"), modalId: z.string() }),
  z.object({ kind: z.literal("closeModal"), modalId: z.string().optional() }),
  z.object({
    kind: z.literal("setState"),
    path: z.string(),
    value: propValue,
  }),
  z.object({
    kind: z.literal("submitForm"),
    formId: z.string(),
    onSuccess: z.array(z.lazy(() => actionNode)).optional(),
    onError: z.array(z.lazy(() => actionNode)).optional(),
  }),
  z.object({
    kind: z.literal("callApi"),
    sourceId: z.string(),
    operation: z.enum(["read", "create", "update", "delete"]),
    body: z.record(z.string(), propValue).optional(),
  }),
]);

export type ActionNode = z.infer<typeof actionNode>;

// ── Tree node ────────────────────────────────────────────────────────

/**
 * A single node in the page tree.
 * - `id`         — stable identifier; survives serialization.
 * - `componentId`— matches `ComponentManifest` entry; renderer looks up here.
 * - `props`      — keyed by prop name; values may be literal/binding/responsive.
 * - `events`     — keyed by event name (`onClick`, `onSubmit`, …); values are
 *                  ordered action lists.
 * - `slots`      — children grouped by slot name (default slot is `"default"`).
 *                  This generalises today's flat `childNodes` array and
 *                  unblocks compound APIs (Card.Header / Card.Body).
 */
export const node: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    componentId: z.string().min(1),
    props: z.record(z.string(), propValue).optional(),
    events: z.record(z.string(), z.array(actionNode)).optional(),
    children: z.string().optional(), // raw text content (Button label, etc.)
    slots: z.record(z.string(), z.array(node)).optional(),
  }),
);

export type Node = {
  id: string;
  componentId: string;
  props?: Record<string, unknown>;
  events?: Record<string, ActionNode[]>;
  children?: string;
  slots?: Record<string, Node[]>;
};

// ── Page ─────────────────────────────────────────────────────────────

export const pageMeta = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().url().optional(),
  noIndex: z.boolean().optional(),
});

export const pageDoc = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  /** Route path — `/`, `/about`, `/blog/[slug]`. */
  route: z.string().regex(/^\//),
  meta: pageMeta.optional(),
  /** Top-level nodes; usually a single layout root. */
  tree: z.array(node),
});

export type PageDoc = z.infer<typeof pageDoc>;

// ── Data sources (shape only in Phase 0) ─────────────────────────────

export const dataSource = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("static"),
    id: z.string(),
    rows: z.array(z.record(z.string(), literalValue)),
  }),
  z.object({
    kind: z.literal("rest"),
    id: z.string(),
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
    headers: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    kind: z.literal("sheet"),
    id: z.string(),
    spreadsheetId: z.string(),
    range: z.string(),
  }),
]);

export type DataSource = z.infer<typeof dataSource>;

// ── Theme override (mirrors JunDSProvider props) ─────────────────────

export const themeOverride = z.object({
  theme: z.string().optional(),
  colorMode: z.enum(["light", "dark", "system"]).optional(),
  density: z.enum(["compact", "normal", "comfortable"]).optional(),
  radius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
  spacing: z.enum(["tight", "default", "relaxed"]).optional(),
});

// ── Project ──────────────────────────────────────────────────────────

export const projectDoc = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  name: z.string(),
  pages: z.array(pageDoc).min(1),
  navigation: z
    .array(
      z.object({
        label: z.string(),
        pageId: z.string(),
      }),
    )
    .optional(),
  dataSources: z.array(dataSource).optional(),
  theme: themeOverride.optional(),
  /** Shared layout wrapper applied to every page (header/footer). */
  layout: node.optional(),
});

export type ProjectDoc = z.infer<typeof projectDoc>;

// ── Public parse helpers ─────────────────────────────────────────────

export const parsePageDoc = (input: unknown): PageDoc => pageDoc.parse(input);

export const parseProjectDoc = (input: unknown): ProjectDoc => projectDoc.parse(input);
```

### Round-trip invariant

```ts
// ds/runtime/__tests__/schema.test.ts
import { describe, it, expect } from "vitest";
import { parsePageDoc, type PageDoc } from "../schema";

describe("PageDoc", () => {
  it("round-trips through JSON.stringify", () => {
    const doc: PageDoc = {
      schemaVersion: 1,
      id: "home",
      route: "/",
      tree: [
        {
          id: "n1",
          componentId: "Card",
          slots: {
            default: [
              {
                id: "n2",
                componentId: "Button",
                props: { variant: "primary" },
                events: {
                  onClick: [{ kind: "navigate", to: "/about" }],
                },
                children: "About us",
              },
            ],
          },
        },
      ],
    };
    expect(parsePageDoc(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  });

  it("rejects unknown action kinds with a useful path", () => {
    expect(() =>
      parsePageDoc({
        schemaVersion: 1,
        id: "x",
        route: "/x",
        tree: [
          {
            id: "n1",
            componentId: "Button",
            events: { onClick: [{ kind: "evil" }] },
          },
        ],
      }),
    ).toThrow(/tree\[0\]\.events\.onClick\[0\]/);
  });
});
```

## Open questions

- **자체 정의 prop 형 vs `.ai/props.json`** — props.json 은 TS 타입을
  `string | number | "primary" | "secondary"` 처럼 union 으로 유지한다. 빌더가
  union 옵션을 인지하려면 manifest 빌드 단계에서 union → enum 추출 로직이
  필요하다. 추출이 실패하는 prop (예: 함수형) 은 빌더에서 "코드 escape" 로만
  편집 가능하다고 표기.
- **`asChild` 패턴** — Slot 위임은 JSON 으로 표현하기 미묘하다. Phase 0 은
  지원하지 않는다고 명시 (Phase 2 에서 `slots.asChild` 같은 특수 슬롯으로
  도입). `requirements/compound-api.md` 와 모순되지 않게 주의.
- **반응형 값의 직렬화** — 현재 라이브러리는 `p={{ base: 2, md: 4 }}` 같이 plain
  object 를 prop value 로 받는다. Phase 0 스키마는 `$kind: "responsive"` 라는
  명시적 태그를 두므로, 런타임에서 둘 다 받는 어댑터가 필요. `Renderer` 가
  `$kind` 를 보고 분기.
- **valibot 채택의 영향** — 기존 라이브러리에 검증기 의존성이 처음 들어간다.
  peer 가 아닌 dependency 로 추가되며 약 3 KB gzip 증가. CHANGELOG / changeset
  필수.
- **schemaVersion** — 현재 1. 향후 변경 시 마이그레이션 유틸 (`migrate(doc, to)`)
  이 필요. Phase 0 에서는 함수 시그니처만 export 하고 항상 입력을 그대로
  반환.

## Changelog

- 2026-08-03 — Phase 0 출고 확인: `ds/runtime/`(schema·Renderer·registry·bindings·actions,
  valibot) + Lab adapter(serialize/deserialize) + `./runtime` subpath + rollup entry 가
  구현·테스트돼 있음을 실사로 확인. 남아 있던 조각을 마감 — `parseNodePatch`(A5 부분
  patch 검증) + MCP `validate_page_doc`/`apply_page_patch` + 루트 barrel 네임스페이스
  export(`export * as runtime` — `export *` 는 Node·Breakpoint 이름 충돌로 기존 공개
  API 를 깨뜨려 네임스페이스로 대체) + AGENTS.md 온보딩 항목. round-trip 의 시각 동치
  Playwright 스냅샷은 후속 항목으로 남김.
- 2026-04-30 — created (Phase 0 spec + Zod schema draft + persona reference).
