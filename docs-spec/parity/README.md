# v2 시각 패리티 기준(baseline)

42배치 바닐라·iOS 구현이 대조할 v2 실렌더 "정답지". 근거·판단은 DECISIONS.md
DEC-017, 커버리지는 [COVERAGE.md](COVERAGE.md), 기계 대조 입력은
[manifest.json](manifest.json) (컴포넌트→캡처→sha256).

- `baseline/<ledger-id>/<variant>-<theme>.png` — 라이트/다크 × 스토리 variant, 1280×800@2x
- 캡처 조건(시간·랜덤 고정, 애니메이션 off 등)은 manifest.json `captureConditions`

## 재현 절차

기존 storybook-static/ 은 CSS 트리셰이킹으로 무스타일이라 쓰지 않는다(DEC-017-1).
레포 파일은 일절 수정하지 않고, 빌드 산출물은 임시 디렉토리에 둔다.

```bash
# 0) Node 22.12+ (storybook 10 요구)
nvm use 22

# 1) v3 워크트리에서 storybook 재빌드 → 임시 디렉토리
node node_modules/.bin/storybook build -o /tmp/sb-v3

# 2) 앱 CSS 별도 컴파일(캡처 시 주입용)
node docs-spec/parity/tools/build-css.mjs /tmp/globals.compiled.css

# 3) 정적 서빙(의존성 0)
node docs-spec/parity/tools/serve.mjs /tmp/sb-v3 6107 &

# 4) 캡처(전량) → baseline/ + tools/.capture-raw.json
node docs-spec/parity/tools/capture.mjs --sb /tmp/sb-v3 --css /tmp/globals.compiled.css

# 5) manifest.json + COVERAGE.md 재생성
node docs-spec/parity/tools/manifest.mjs
```

특정 스토리만 재캡처: `capture.mjs --only <storyId,...>` (raw 병합됨).
시스템 Chrome 을 사용한다(레포 playwright 캐시 리비전 불일치 대비).
