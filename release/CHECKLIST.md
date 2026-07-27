# release/CHECKLIST.md — JunDS v3 최초 배포 절차 (사람 실행)

작성: 2026-07-24 (릴리스·CI 준비 트랙) · 전제: 01-repo-structure §5·§9, 05-perf §3, DEC-005(푸시·배포는 사람 요청·실행), DEC-015.
아래 모든 명령은 **사람이 직접 실행**한다. 준비 트랙은 여기까지의 상태(워크플로·설정·드라이런)만 만들었고
push·publish·태그를 하나도 수행하지 않았다.

레포: `https://github.com/Junha-SDK/JunDS` · 작업 브랜치 `v3` · 릴리스 기준 브랜치 `main`.

---

## 상태 요약 (2026-07-27 갱신 — DEC-050 배포 성립성 트랙 실측)

| 항목 | 상태 |
|---|---|
| npm 스코프 `@junds` | **미선점 — 가용** (2026-07-24 실측, 이후 재조회 없음). 대안: `@jjunhaa`(가용 확인), 무스코프 `junds-*`(junds-web 404 확인). **선점 지연 리스크 지속 — §0 최우선** |
| 패키지명 | `@junds/web·react·finance-data·ui`, `junds`, `junds-web`, `create-junds` 전부 미공개(404, 2026-07-24 실측) |
| CI v3 레인 | **17게이트**(`.github/workflows/junds-v3.yml`) — packaging·mcp-test 2건 신설(DEC-050). iOS 2게이트 제외 로컬 실행 증명 |
| `@junds/web` tarball | **블로커 3건 전부 해소.** exports types 조건 완비(789 서브패스 전수)·`prepack: node build.mjs`·LICENSE/README 동봉 확인. pack 실측 2777파일 / 11.69MB unpacked / 2.17MB tarball. `publishConfig.access:"public"` 추가(부재 시 스코프 publish 402) |
| `@junds/finance-data` | 실구현 완료(DEC-019: 계약 테스트 77/77) · **잔여 2건 해소**: LICENSE(패키지별 MIT 전문) + `files:["dist","README.md","LICENSE"]`로 `src`·`build.mjs` 제외 · `private: true` 유지 — **공개 시점은 여전히 GA 결정 사항(사람)** |
| `@junds/react` | 자리표시자 아님 — 어댑터 387종 구현 완료, `private` 해제됨. 테스트 71/71, React 18/19 매트릭스 CI 게이트 보유 |
| `@junds/mcp` | 배포 대상(무빌드 npx). LICENSE 추가 + CI 게이트 신설. **테스트 RED가 정상 신호** — docs-content web 스니펫 394/445 미저작이라 advisory로 진입(DEC-050) |
| 배포 메타데이터 | 4패키지 전부 repository·homepage·bugs·author·keywords·engines 부재였음 → **주입 완료** |
| `@changesets/cli` | **설치 완료**(2.31.1, 루트 devDependency) — 이전엔 스크립트만 있고 CLI가 없어 릴리스 명령 실행 불가였음. §0 항목 해소 |
| exports ↔ tarball | **신설 게이트 PASS** — `npm run exports:gate`. 광고 진입점 전수(web 1575 · react 782 · finance-data 39 · mcp bin 1)가 배포물에 실재. 역방향 검증(결함 3종 주입 → exit 1) 완료 |
| consumer:smoke | **PASS 4/4** — Vanilla Vite · React 18 Vite · React 19 Vite · Next App Router |
| web-a11y | **GREEN** — 10페이지 × 2테마, blocking 0 · advisory 0 (2026-07-24 RED였던 serious contrast 4건 해소). 단 fixture coverage 98/390(25%) — 292종 미감사 |
| tokens:test | **RED — 사람 결정 대기(DEC-050).** v2 동결본이 커밋 7b5578a에서 `--cat-*` 32종 + `2xs`를 얻었고 v3가 미추종. 게이트가 설계대로 잡은 것이며, 해소는 값 결정이라 packaging 트랙에서 하지 않음 |
| iOS | 코드 실체는 DEC-015-1로 검증(XCTest 783/783, DEC-049 기준). xcodebuild 명령형(스킴명·destination)만 CI 첫 실행 확인 |

---

## 0. 사전 1회 준비

- [ ] **npm 조직 생성**: npmjs.com 로그인 → Org 생성 `junds` (Free — public 패키지 전용).
      *준비 트랙은 조회만 수행 — 선점 전까지 제3자가 가져갈 수 있으므로 이 단계를 미루지 말 것.*
- [ ] **Automation 토큰 발급**(Granular: `@junds` 스코프 publish 한정) → CI publish를 쓰게 될 경우
      `gh secret set NPM_TOKEN` (수동 publish만 할 거면 생략 가능).
- [x] **changesets CLI 설치** — 완료(2.31.1, DEC-050). `npx changeset status`가 워크스페이스 3패키지를 인식하는 것까지 확인.
- [x] **publish 블로커 해소 확인** — 아래 5건 전부 닫힘(DEC-050 실측):
  - [x] `@junds/web` exports `types` 조건 — 789 서브패스 전수 완비(gen-exports.mjs 생성기가 방출)
  - [x] `packages/web`: `prepack: node build.mjs` + LICENSE/README 동봉
  - [x] `packages/finance-data`: LICENSE(패키지별 MIT 전문) + `files:["dist","README.md","LICENSE"]` — `src`·`build.mjs`는 **제외**로 확정
  - [x] web-a11y serious 4건(contrast) 수리 — 로컬 그린(10페이지 × 2테마 blocking 0)
  - [x] `publishConfig.access:"public"` — `@junds/web`에 부재였음(무료 org의 restricted publish는 402). web·finance-data·mcp에 추가, react는 기보유
- [ ] **남은 RED 1건 — 사람 결정 필요**: `npm run tokens:test` 2건 실패.
      v2 동결본(`ds/styles/tokens.css`·`ds/tokens/typography.ts`)이 커밋 7b5578a에서
      `--cat-*` 32종 + `2xs`를 얻었고 v3 토큰 파이프라인이 미추종. DEC-050이 선택지
      (a) v3 편입 / (b) 카테고리 색은 앱 레이어로 선언 + `2xs`만 편입 을 정리해 뒀다.
      **releases는 이 게이트가 그린이 된 뒤에 진행할 것.**
- [ ] (선택) **docs-content 저작 따라잡기**: web:done 445행 중 394행이 web 스니펫 미저작 —
      mcp-test 게이트가 advisory인 이유. 배포 자체를 막지는 않으나 MCP·문서 소비 품질에 직결.
- [ ] (로컬 iOS 루프 복구가 필요하면) **Xcode 재설치** — DEC-015-2: libclang 코드서명 파손, 재설치 외 복구 불가.
      CI에는 불필요(러너 Xcode는 정상).

## 1. 원격 push → CI 그린

- [ ] ```bash
      git push -u origin v3
      ```
- [ ] Actions에서 **CI v3** 11게이트 확인. 첫 실행 확인 항목:
  - [ ] `ios-build`/`ios-test`: 진단 스텝의 `xcodebuild -list` 출력에서 실제 스킴명 확인 —
        `JunDS`가 아니라 `JunDS-Package`라면 루트 package.json의 `ios:build`/`ios:test` 스킴 교정(iOS 트랙 소유).
        `ios:test`의 `iPhone 15` destination은 macos-14(Xcode 15.x/iOS 17)에서 성립 예상 —
        러너 이미지 승급 시 진단 스텝의 디바이스 목록으로 교정.
  - [ ] `web-a11y`: contrast 수리 전이면 RED가 **정상 신호**(실위반 2건).
  - [ ] `bench-smoke`: advisory(continue-on-error) — 실패해도 비차단, G3에서 승격.
  - [ ] **v2 레인 무트리거 검증**: packages/** 만 바뀐 푸시에 기존 CI(14잡)가 돌지 않아야 함(paths 강등 확인).
- [ ] macos 러너 과금 주의: private 레포면 macos 분은 10배 계상 — iOS 게이트 빈도가 부담되면
      paths 협소화(Package.swift·packages/ios/**만)로 후속 조정.

## 2. v3 → main 병합

- [ ] PR `v3` → `main` 생성, 양 레인 그린 확인 후 머지. **릴리스는 main에서 진행**(changesets baseBranch=main).

## 3. 버전 확정 (changesets — fixed 락스텝)

`.changeset/config.json`: `fixed [[web, react, finance-data]]` + `access: public` 설정 완료(준비 트랙).

- [ ] **최초 alpha는 changeset 불필요** — 3패키지 모두 이미 `3.0.0-alpha.0`.
- [ ] **alpha 트레인 유지 시 pre 모드 선진입**(미진입 상태에서 `changeset version` 하면 prerelease가 벗겨진다):
      ```bash
      npx changeset pre enter alpha
      ```
      GA 직전 `npx changeset pre exit`.
- [ ] 이후 릴리스 루프: `npx changeset add`(한 패키지에만 붙여도 락스텝으로 3패키지 동반 범프) →
      `npx changeset version` → diff 검토 → 커밋.

## 4. npm publish

- [ ] 최종 드라이런(재빌드 포함 확인):
      ```bash
      cd packages/web && npm pack && tar -tzf junds-web-*.tgz | head -30
      ```
      dist/ 산출물·LICENSE 포함 확인 (prepack이 없으면 **스테일 dist가 그대로 실린다** — §0 블로커).
- [ ] 로그인 확인: `npm whoami` / 조직 확인.
- [ ] ```bash
      npx changeset publish
      ```
      현재 `private: true`는 **finance-data 하나뿐**(공개 시점 미결) — 자동 스킵된다.
      react는 private가 해제되어 web과 함께 락스텝 publish 대상이다.
      finance-data는 LICENSE·`files` 정비가 끝났으므로(DEC-050), private 제거 결정만 하면 즉시 합류 가능.
      `@junds/mcp`는 락스텝(fixed) 밖의 독립 패키지 — `npm publish -w @junds/mcp`로 별도 배포한다.
- [ ] 검증: `npm view @junds/web` + 신규 임시 프로젝트에서
      `npm i @junds/web` → `node -e "import('@junds/web').then(m=>console.log(Object.keys(m).length))"`.
- [ ] changeset publish가 만든 패키지 태그 푸시:
      ```bash
      git push --follow-tags
      ```

## 5. SPM 태그 (iOS 앵커)

01 §5: 릴리스 태그 `vX.Y.Z` 하나가 npm 3패키지 + SPM의 공통 버전 앵커.

- [ ] 릴리스 커밋(main)에:
      ```bash
      git tag v3.0.0-alpha.0 && git push origin v3.0.0-alpha.0
      ```
- [ ] 소비 검증(별도 임시 프로젝트): `.package(url: "https://github.com/Junha-SDK/JunDS.git", exact: "3.0.0-alpha.0")`
      해석·빌드 확인 (Package.swift 루트 + `packages/ios/Sources` path 참조 — 태그 커밋에서 성립해야 함).
      *prerelease 태그는 `from:` 범위 해석에서 제외되므로 alpha 동안은 `exact:` 안내가 정확하다.*

## 6. CDN

npm 공개 즉시 자동 미러 — 별도 배포 절차 없음:

- [ ] jsDelivr 스모크:
      `https://cdn.jsdelivr.net/npm/@junds/web@3.0.0-alpha.0/dist/junds.min.js`
      `https://cdn.jsdelivr.net/npm/@junds/web@3.0.0-alpha.0/dist/junds.css`
      (unpkg 동형: `https://unpkg.com/@junds/web@3.0.0-alpha.0/dist/junds.min.js`)
- [ ] 한 줄 소비 스모크 — 빈 HTML에:
      ```html
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@junds/web@3.0.0-alpha.0/dist/junds.css">
      <script src="https://cdn.jsdelivr.net/npm/@junds/web@3.0.0-alpha.0/dist/junds.min.js" defer></script>
      <jd-button variant="primary">CDN OK</jd-button>
      ```
- [ ] 문서·데모의 CDN 안내는 정확 버전 핀(`@3.0.0-alpha.0`) — `@3` 범위 핀은 GA 후.

## 7. create-junds 후속 (이번 트랙은 조사만 — 수정 금지 준수)

실측: `create-junds@0.1.0` 미공개(이름 가용), 템플릿 의존성 `"@junds/ui": "^2.2.0"` —
**@junds/ui가 npm에 없어 현 템플릿은 공개 사용 불가**(npm install 단계에서 404).

- [ ] (01 §1 로드맵대로 v3 GA 후) 바닐라 템플릿 신설: `@junds/web` 소비 2형(CDN 한 줄 / 번들러+ESM)
- [ ] default(Next) 템플릿 처리 결정: @junds/ui v2를 npm에 공개할 계획이 없다면
      템플릿을 v3(@junds/react)로 갈아타거나 tarball 안내로 명시
- [ ] create-junds 자체 publish 여부 결정(이름 가용 확인됨) — files/engines 재점검 + `npx create-junds smoke --target /tmp` 스모크
- [ ] MySelf `/docs/junds` 문서의 설치 안내를 npm 좌표로 갱신(D7 — 정본 문서가 MySelf에 있음)

## 8. 롤백·비상

- npm: 공개 72시간 내 조건 충족 시 `npm unpublish @junds/web@X.Y.Z` — 이후에는
  `npm deprecate @junds/web@X.Y.Z "사유"` + 패치 릴리스가 정석.
- SPM: 잘못 찍은 태그는 삭제보다 **새 패치 태그**를 권장(소비자·프록시 캐시가 태그 삭제를 안 따라옴).
- CDN: jsDelivr는 태그별 영구 캐시 — 오염 버전은 새 버전 공개로만 해소.
- 게이트 소유 트랙: tokens·web(웹 트랙) / ios(iOS 트랙) / size·bench(성능 트랙) /
  react·finance-data(각 슬라이스 트랙) / 워크플로 자체(릴리스 트랙).
