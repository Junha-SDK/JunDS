# License & Auth Subsystem (`ds/auth`)

- **Slug:** `license-and-auth`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-04-29

## Goal

JunDS 는 상용 라이브러리이므로 호스트 앱이 유효한 라이선스 키 없이 사용하지
못하도록 막아야 한다. `ds/auth/*` 는 **(1) 라이선스 키 원격 검증**,
**(2) 도메인 화이트리스트 잠금**, **(3) 런타임 무결성 모니터링** 세 축으로
이를 해결한다. 동시에 호스트 앱 입장에서는 `<JunDSProvider licenseKey="...">`
한 줄 + 옵션으로 `withLicense(Component)` HOC 만 알면 되는 작은 표면을
유지한다.

## Scope

- In scope:
  - 라이선스 키 검증과 4시간 캐시.
  - 1시간 주기 재검증 인터벌.
  - 도메인 잠금 (`window.location.hostname` 화이트리스트, location 변조 감지).
  - 무결성 모니터 (DevTools / globals 변조 감시).
  - 라이선스 상태 (`pending` | `valid` | `invalid` | `expired`) 컨텍스트와
    `useLicenseStatus` 훅.
  - 컴포넌트 보호용 HOC `withLicense`.
  - 빌드 시 `_` prefix 식별자 자동 mangle (rollup terser).
- Out of scope:
  - 결제·플랜 업그레이드 UI.
  - 백엔드 라이선스 API (`https://api.junds.dev/v1/license`) 자체 구현.
  - 사용량 메트릭 / 텔레메트리.

## User stories / acceptance criteria

- [x] As a 호스트 앱 개발자, I can 루트에 `<JunDSProvider licenseKey={KEY}>` 만
      두면 별도 설정 없이 검증이 시작된다.
- [x] As a 호스트 앱 개발자, I can `useLicenseStatus()` 로 현재 상태를 읽어
      자체 fallback UI 를 그릴 수 있다.
- [x] As a 라이브러리 운영자, 라이선스가 `invalid` / `expired` 면 보호된
      컴포넌트가 렌더되지 않거나 fallback 으로 대체된다.
- [x] As a 라이브러리 운영자, 잘못된 도메인에서 동작하면 `invalid` 로 즉시
      전환된다.
- [x] As a 라이브러리 운영자, location 객체가 변조되면 (`_isLocationTampered`)
      검증이 실패한다.
- [x] As a 호스트 앱 개발자, 정상적으로 검증되면 4시간 동안 같은 결과를
      재사용 (네트워크 요청 절약).
- [x] As a 호스트 앱 개발자, `JunDSProvider` 는 1시간마다 백그라운드 재검증을
      한다.
- [x] As a 라이브러리 운영자, 빌드 산출물에서 내부 식별자 (`_validateLicense`,
      `_LICENSE_API` 등) 가 mangle 된다.

## Design / behavior notes

- **상태 머신.**
  - 초기: `pending` → 첫 검증 후 `valid` | `invalid` | `expired`.
  - `onLicenseError(status)` 콜백으로 호스트가 에러를 후킹.
  - 1시간 (`_REVALIDATION_INTERVAL`) 마다 재검증, 실패 시 상태 즉시 갱신.
- **캐시.** `localStorage["__jds_lv"]` 에 `{ _h: hash, _t: timestamp,
  _s: success }` 저장, 4시간 TTL.
- **도메인 잠금.** `_isDomainAllowed(host, domains[])` 가 응답의 도메인 화이트
  리스트와 현재 hostname 을 비교. `localhost`/`127.0.0.1` 은 개발 편의를 위해
  허용 정책이 들어 있다.
- **변조 감지.** `_isLocationTampered()` 는 `window.location` 의 prototype 또는
  hostname getter 가 덮어쓰기 됐는지 확인.
- **무결성 모니터.** `_startIntegrityMonitor` / `_stopIntegrityMonitor` 가
  마운트/언마운트와 함께 동작 (콘솔 디버깅·전역 변수 변조 감시 수준).
- **HOC.** `withLicense(Component, fallback?)` 는 라이선스가 `valid` 가 아니면
  `fallback` (또는 `null`) 을 렌더하고, 그 외에는 원래 컴포넌트를 그대로
  렌더한다.
- **빌드.** `rollup.config.mjs` 의 terser `mangle.properties` 에서 `_` 로
  시작하는 모든 prop/식별자를 자동 난독화. 외부 호환 prop (`children`,
  `className`, `value` 등) 은 reserved 로 보호.

## Touched files (for agents)

- `ds/auth/JunDSProvider.tsx` — provider, 컨텍스트, `useJunDS`,
  `useLicenseStatus`.
- `ds/auth/withLicense.tsx` — HOC.
- `ds/auth/license-validator.ts` — 원격 검증 + 4시간 캐시.
- `ds/auth/domain-lock.ts` — 도메인 화이트리스트 / location 변조 감지.
- `ds/auth/integrity.ts` — 런타임 무결성 모니터.
- `ds/auth/crypto.ts` — `_hmacSign`, `_sha256`, `_obfuscateKey`.
- `ds/auth/index.ts` — barrel.
- `ds/index.ts` — `JunDSProvider`, `useJunDS`, `useLicenseStatus`,
  `withLicense` 재-export.
- `rollup.config.mjs` — `_` prefix mangle 정책.
- `app/design-system/security/` — 사이트 내 보안 시연 (있다면 여기서 활용).

## Open questions

- 오프라인 환경에서 4시간 캐시가 만료된 직후 동작 (현재는 `invalid` 처리)
  사용자 경험을 어떻게 안내할지.
- `withLicense` 의 fallback 디폴트를 라이브러리 내장 안내 UI 로 둘지
  `null` 유지할지.

## Changelog

- 2026-04-29 — created.
