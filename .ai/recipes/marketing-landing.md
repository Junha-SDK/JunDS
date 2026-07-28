# Recipe — Marketing Landing Page

## Goal

랜딩 페이지의 표준 흐름(히어로 → 신뢰 로고 → 핵심 가치 → 뉴스레터 → CTA)을
한 화면에 묶는다. 신뢰도 → 가치 → 행동 유도의 정보 위계를 따른다.

## Used components

- `HeroSection` — `@/ds/patterns/HeroSection`
- `LogoCloud` — `@/ds/composites/LogoCloud`
- `FeatureGrid` — `@/ds/patterns/FeatureGrid`
- `Newsletter` — `@/ds/composites/Newsletter`
- `CTASection` — `@/ds/composites/CTASection`

Props 검증: `.ai/props.json` → patterns/HeroSection (variant·primaryCta),
composites/LogoCloud (logos[].name|src), patterns/FeatureGrid (features[]),
composites/Newsletter (onSubmit + requireConsent), composites/CTASection
(primaryCta + secondaryCta).

## Recipe

```tsx
"use client";
import { HeroSection } from "@/ds/patterns/HeroSection";
import { LogoCloud } from "@/ds/composites/LogoCloud";
import { FeatureGrid } from "@/ds/patterns/FeatureGrid";
import { Newsletter } from "@/ds/composites/Newsletter";
import { CTASection } from "@/ds/composites/CTASection";

export default function MarketingLanding() {
  return (
    <main>
      <HeroSection
        variant="centered"
        eyebrow="새로운 버전 v3.0"
        title="설계도부터 코드까지, 한 흐름에 담다"
        subtitle="JunDS는 디자인 시스템과 런타임을 하나로 묶어 팀이 더 빠르게 출시하도록 돕습니다."
        primaryCta={{ label: "무료로 시작하기", href: "/signup" }}
        secondaryCta={{ label: "데모 보기", href: "/demo" }}
      />

      <LogoCloud
        title="이미 검증된 팀들"
        layout="grid"
        columns={5}
        grayscale
        logos={[
          { name: "Acme", src: "/logos/acme.svg" },
          { name: "Globex", src: "/logos/globex.svg" },
          { name: "Initech", src: "/logos/initech.svg" },
          { name: "Umbrella", src: "/logos/umbrella.svg" },
          { name: "Hooli", src: "/logos/hooli.svg" },
        ]}
      />

      <FeatureGrid
        title="왜 JunDS인가"
        subtitle="설치 5분, 실 효과는 한 분기."
        columns={3}
        features={[
          {
            icon: "⚡",
            title: "0-config",
            description: "Tailwind v4 + RSC 준비된 토큰.",
          },
          {
            icon: "🎨",
            title: "노코드 런타임",
            description: "스키마 → 화면 자동 렌더링.",
          },
          { icon: "♿", title: "a11y 0 critical", description: "axe-core CI 게이트." },
          {
            icon: "🌐",
            title: "i18n 빌트인",
            description: "I18nProvider 한 줄로 다국어.",
          },
          {
            icon: "📦",
            title: "tree-shaken",
            description: "kind별 entry로 필요한 만큼만.",
          },
          { icon: "📈", title: "사이즈 게이트", description: "PR마다 KB 회귀 차단." },
        ]}
      />

      <Newsletter
        title="월 1회, 디자인 시스템 인사이트"
        description="새 컴포넌트 출시·마이그레이션 가이드를 보내드립니다."
        placeholder="you@team.com"
        submitLabel="구독"
        requireConsent
        consentLabel="개인정보 수집 및 마케팅 활용에 동의합니다"
        onSubmit={async (email) => {
          await fetch("/api/newsletter", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
        }}
      />

      <CTASection
        variant="gradient"
        title="지금 시작하세요"
        description="14일 무료 체험. 카드 등록 불필요."
        primaryCta={{ label: "무료로 시작", href: "/signup" }}
        secondaryCta={{ label: "영업팀과 상담", href: "/contact" }}
      />
    </main>
  );
}
```

## Variations

- **B2B 톤**: `HeroSection variant="split"` + 우측에 데모 영상 `media`
- **이벤트 페이지**: `Newsletter` 자리에 `Countdown` (kind=composite)
- **로고 부족**: `LogoCloud layout="row"` + `grayscale={false}` 로 컬러 강조

## See also

- `requirements/design-system-library.md` — 라이브러리 정책
- `app/design-system/patterns/hero-section/page.tsx` — Hero 쇼케이스
- `.ai/recipes/pricing-page-full.md` — 다음 단계: 가격 페이지
