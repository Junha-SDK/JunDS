# release/CHECKLIST.md — JunDS v3 최초 배포 절차 (사람 실행)

작성: 2026-07-24 (릴리스·CI 준비 트랙) · 전제: 01-repo-structure §5·§9, 05-perf §3, DEC-005(푸시·배포는 사람 요청·실행), DEC-015.
아래 모든 명령은 **사람이 직접 실행**한다. 준비 트랙은 여기까지의 상태(워크플로·설정·드라이런)만 만들었고
push·publish·태그를 하나도 수행하지 않았다.

레포: `https://github.com/Junha-SDK/JunDS` · 작업 브랜치 `v3` · 릴리스 기준 브랜치 `main`.

---

## 상태 요약 (2026-07-24 드라이런 실측)

| 항목 | 상태 |
|---|---|
| npm 스코프 `@junds` | **미선점 — 가용** (user·org 모두 "Scope not found" 실측). 대안: `@jjunhaa`(가용 확인), 무스코프 `junds-*`(junds-web 404 확인) |
| 패키지명 | `@junds/web·react·finance-data·ui`, `junds`, `junds-web`, `create-junds` 전부 미공개(404) |
| CI v3 레인 | 11게이트 작성 완료(`.github/workflows/junds-v3.yml`) — iOS 2게이트 제외 로컬 1회 실행 증명 |
| `@junds/web` tarball | pack·exports 맵(57항 실파일 전수)·ESM/Node 스모크 통과. **블로커 3건**: exports types 조건 부재(TS7016 실측 — 수정은 `packages/web/scripts/gen-exports.mjs` 생성기 경유)·prepack 부재·LICENSE 미포함 |
| `@junds/finance-data` | **실구현 완료**(DEC-019: 이관 + 계약 테스트 77/77 로컬 통과) · `private: true` 유지(공개 시점은 GA 결정) · pack 확인: esm/cjs/types 3중 + types 조건 완비 + README ✓ — 잔여: LICENSE·`files` 필드(src/build.mjs 동봉이 의도인지) |
| `@junds/react` | 자리표시자 + `private: true` — publish 자동 차단(의도). 어댑터 구현 트랙 진행 중 |
| web-a11y | 게이트 성립·**현재 RED**: serious color-contrast 4건 실측(danger 버튼·error 텍스트·데모 라벨 — 3페이지 스캔) — 웹 트랙 수리 대상 |
| iOS | 코드 실체는 DEC-015-1로 검증(XCTest 31/31, CLT 우회). xcodebuild 명령형(스킴명·destination)만 CI 첫 실행 확인 |

---

## 0. 사전 1회 준비

- [ ] **npm 조직 생성**: npmjs.com 로그인 → Org 생성 `junds` (Free — public 패키지 전용).
      *준비 트랙은 조회만 수행 — 선점 전까지 제3자가 가져갈 수 있으므로 이 단계를 미루지 말 것.*
- [ ] **Automation 토큰 발급**(Granular: `@junds` 스코프 publish 한정) → CI publish를 쓰게 될 경우
      `gh secret set NPM_TOKEN` (수동 publish만 할 거면 생략 가능).
- [ ] **changesets CLI 설치**: 루트 devDependency 부재 실측 —
      ```bash
      npm i -D @changesets/cli && git add package.json package-lock.json && git commit -m "chore(v3): changesets CLI devDependency 추가"
      ```
- [ ] **publish 블로커 해소 확인** (별도 트랙 진행):
  - [ ] `@junds/web` exports `types` 조건: **`packages/web/scripts/gen-exports.mjs`(DEC-018 생성기)가 package.json exports를 소유**하므로 생성기에서 types 조건을 방출하도록 수정(수기 편집은 재생성 시 소실). 형태는 finance-data의 exports(types/import 3중)가 사내 선례
  - [ ] `packages/web`: `prepack: node build.mjs` + LICENSE/README 동봉
  - [ ] `packages/finance-data`: LICENSE + `files` 필드(src·build.mjs 동봉 의도 명시 or 제외)
  - [ ] web-a11y serious 4건(contrast, 3페이지) 수리 → `node .github/scripts/web-a11y-audit.mjs` 로컬 그린
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
      `private: true`인 react(자리표시자)·finance-data(실구현 완료, 공개 시점 미결)는 **자동 스킵**(web만 공개됨).
      두 패키지는 각 트랙에서 private 제거를 결정한 시점에 락스텝 publish에 합류한다 —
      합류 전 finance-data는 LICENSE·`files` 필드 정비(§0 참조).
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
