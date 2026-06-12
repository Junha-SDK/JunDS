#!/usr/bin/env node
/**
 * create-junds-app — 새 Next.js 프로젝트에 JunDS를 즉시 셋업.
 *
 * 사용:
 *   node scripts/create-junds-app.mjs <target-dir>
 *   node scripts/create-junds-app.mjs ../my-app --brand ocean --locale ko
 *
 * 결과:
 *   <target-dir>/
 *     app/layout.tsx        — JunDSProvider + BrandProvider + I18nProvider 셋업
 *     app/page.tsx          — Hero + 샘플 사용
 *     app/globals.css       — JunDS CSS 변수 import
 *     package.json          — react/next/tailwindcss + @junds/ui 의존성
 *     tsconfig.json
 *     postcss.config.mjs
 *     README.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const brandIdx = args.indexOf("--brand");
const localeIdx = args.indexOf("--locale");
const brand = brandIdx >= 0 ? args[brandIdx + 1] : "default";
const locale = localeIdx >= 0 ? args[localeIdx + 1] : "ko";

if (!target) {
  console.log(`create-junds-app — 새 프로젝트 부트스트랩

사용법:
  node scripts/create-junds-app.mjs <target>
  node scripts/create-junds-app.mjs ./my-app --brand ocean --locale ko

옵션:
  --brand   default | ocean | forest | sunset | midnight  (기본 default)
  --locale  ko | en | ja | zh                              (기본 ko)
`);
  process.exit(0);
}

const targetAbs = path.resolve(target);
if (fs.existsSync(targetAbs)) {
  if (fs.readdirSync(targetAbs).length > 0) {
    console.error(`✗ ${target} 이미 존재하고 비어 있지 않음.`);
    process.exit(1);
  }
} else {
  fs.mkdirSync(targetAbs, { recursive: true });
}

function write(rel, content) {
  const p = path.join(targetAbs, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log(`  + ${rel}`);
}

const projName = path.basename(targetAbs).replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();

write("package.json", JSON.stringify({
  name: projName,
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "next dev -p 3000",
    build: "next build",
    start: "next start",
  },
  dependencies: {
    "@junds/ui": "^2.5.0",
    next: "^16.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  },
  devDependencies: {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    tailwindcss: "^4",
    typescript: "^5",
  },
}, null, 2) + "\n");

write("tsconfig.json", JSON.stringify({
  compilerOptions: {
    target: "ES2022",
    lib: ["DOM", "DOM.Iterable", "ES2022"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    paths: { "@/*": ["./*"] },
    plugins: [{ name: "next" }],
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"],
}, null, 2) + "\n");

write("next-env.d.ts", `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`);

write("postcss.config.mjs", `export default {
  plugins: { "@tailwindcss/postcss": {} },
};
`);

write("app/globals.css", `@import "tailwindcss";
@import "@junds/ui/styles.css";

body {
  font-family: var(--font-sans);
  background: var(--background);
  color: var(--foreground);
}
`);

write("app/layout.tsx", `import { BrandProvider, I18nProvider } from "@junds/ui";
import "./globals.css";

export const metadata = {
  title: "${projName}",
  description: "Built with JunDS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${locale}">
      <body>
        <BrandProvider brand="${brand}">
          <I18nProvider locale="${locale}">
            {children}
          </I18nProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
`);

write("app/page.tsx", `import { HeroSection } from "@junds/ui/patterns";
import { FeatureGrid } from "@junds/ui/patterns";
import { Button } from "@junds/ui/primitives";

export default function Home() {
  return (
    <main>
      <HeroSection
        variant="centered"
        eyebrow="JunDS로 시작합니다"
        title="${projName}"
        subtitle="브랜드 ${brand} · 로케일 ${locale}"
        primaryCta={{ label: "시작하기", href: "/dashboard" }}
        secondaryCta={{ label: "문서", href: "https://github.com/jjunhaa0211/JunDS" }}
      />

      <FeatureGrid
        title="이 프로젝트에 포함된 것"
        columns={3}
        features={[
          { icon: "🎨", title: "5개 브랜드", description: "Default/Ocean/Forest/Sunset/Midnight 즉시 전환." },
          { icon: "♿", title: "a11y 0 critical", description: "axe-core CI 게이트 통과." },
          { icon: "📦", title: "tree-shaken", description: "필요한 컴포넌트만 번들에 포함." },
          { icon: "🌐", title: "4개 언어", description: "ko/en/ja/zh 사전 빌트인." },
          { icon: "⚡", title: "Tailwind v4", description: "CSS 변수 기반 토큰." },
          { icon: "🧩", title: "270+ 컴포넌트", description: "primitives + composites + patterns." },
        ]}
      />

      <section style={{ padding: 32, textAlign: "center" }}>
        <Button variant="primary" size="lg">시작하기</Button>
      </section>
    </main>
  );
}
`);

write("README.md", `# ${projName}

JunDS로 부트스트랩된 Next.js 프로젝트.

- 브랜드: \`${brand}\` (변경: \`<BrandProvider brand="ocean">\`)
- 로케일: \`${locale}\` (변경: \`<I18nProvider locale="ja">\`)

## 시작

\`\`\`bash
npm install
npm run dev
\`\`\`

## 다음 단계

- \`app/layout.tsx\` — provider 설정
- \`app/page.tsx\` — 첫 화면
- 컴포넌트 추가 — \`import { Button } from "@junds/ui/primitives"\`
- 더 많은 패턴 — \`@junds/ui/patterns\`, \`@junds/ui/composites\`
- 레시피 — https://github.com/jjunhaa0211/JunDS/tree/main/.ai/recipes
`);

write(".gitignore", `node_modules/
.next/
*.log
.env*.local
`);

console.log(`
✓ ${projName} 스캐폴드 완료 (${targetAbs})

다음 단계:
  cd ${target}
  npm install
  npm run dev
`);
