/**
 * packages/web 실브라우저 상호작용 스위트 (03-web-arch §9.1 의무 구간).
 *
 * 루트 playwright.config.ts가 아니라 자체 config인 이유(§9.1 "루트에 프로젝트 추가" 이탈):
 * 루트 config의 webServer는 v2 문서앱(next dev :6100)을 전역 부팅한다 — CE 스위트는
 * 서버가 필요 없고(dist 산출물 + setContent), v2 앱 부팅은 CI 비용·포트 충돌만 낳는다.
 * DECISIONS "Playwright 웹 스위트" 항목 참조.
 *
 * 실행: (레포 루트) npx playwright test -c packages/web/playwright.config.ts
 * 전제: packages/web/dist 빌드 존재 (node packages/web/build.mjs)
 */
import { defineConfig } from "@playwright/test";

const chromiumChannel =
  process.env.JUNDS_SYSTEM_CHROME === "1" ? { channel: "chrome" as const } : {};

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  timeout: 15_000,
  retries: 1,
  use: {
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium", ...chromiumChannel } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
