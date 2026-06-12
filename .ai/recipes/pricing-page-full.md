# Recipe — Full Pricing Page

## Goal

가격 페이지가 단순 표 한 개로 끝나지 않는다. 신뢰 강조(통계) → 가격 표 →
자주 묻는 질문 → 마지막 CTA의 4단 구성을 한 컴포넌트로 묶는다.

## Used components

- `HeroSection` — `@/ds/patterns/HeroSection` (compact 변형)
- `Stat` — `@/ds/composites/Stat`
- `PricingTable` — `@/ds/composites/PricingTable`
- `PriceDisplay` — `@/ds/composites/PriceDisplay` (FAQ 위 부가 표시)
- `FAQ` — `@/ds/patterns/FAQ`
- `CTASection` — `@/ds/composites/CTASection`

## Recipe

```tsx
"use client";
import { HeroSection } from "@/ds/patterns/HeroSection";
import { Stat } from "@/ds/composites/Stat";
import { PricingTable } from "@/ds/composites/PricingTable";
import { PriceDisplay } from "@/ds/composites/PriceDisplay";
import { FAQ } from "@/ds/patterns/FAQ";
import { CTASection } from "@/ds/composites/CTASection";

export default function PricingPage() {
  return (
    <main>
      <HeroSection
        variant="centered"
        eyebrow="가격"
        title="팀 규모에 맞춘 단순한 요금"
        subtitle="필요한 만큼만, 14일 무료 체험"
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4 py-10">
        <Stat label="활성 팀" value="3,200+" change={12} trend="up" />
        <Stat label="월간 PR 처리" value="48k" change={8} trend="up" />
        <Stat label="평균 절약 시간" value="6.2" unit="h/주" change={4} trend="up" />
        <Stat label="만족도" value="4.8" unit="/5" align="center" />
      </section>

      <PricingTable
        columns={3}
        plans={[
          {
            name: "Starter",
            price: "무료",
            description: "1인 또는 작은 팀",
            features: ["primitives 무제한", "composites 50개", "커뮤니티 지원"],
            cta: { label: "지금 시작", href: "/signup" },
          },
          {
            name: "Team",
            price: "$29",
            unit: "/월/사용자",
            highlight: true,
            description: "성장하는 팀",
            features: [
              "patterns 전체 잠금 해제",
              "PR 사이즈 게이트",
              "이메일 지원",
              "Figma sync",
            ],
            cta: { label: "팀 플랜 시작", href: "/signup?plan=team" },
          },
          {
            name: "Enterprise",
            price: "맞춤",
            description: "규모 있는 조직",
            features: ["SSO/SAML", "전담 SRE", "컴포넌트 우선 개발", "SLA 99.95%"],
            cta: { label: "영업팀 상담", href: "/contact" },
          },
        ]}
      />

      <section className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-muted text-center mb-2">연간 결제 시</p>
        <PriceDisplay
          value={290}
          original={348}
          currency="USD"
          locale="en-US"
          suffix="/년"
          size="xl"
          showDiscount
          layout="inline"
        />
      </section>

      <FAQ
        title="자주 묻는 질문"
        searchable
        showCategoryFilter
        items={[
          { id: "1", category: "결제", question: "환불 정책이 어떻게 되나요?", answer: "구독 후 14일 이내 100% 환불됩니다." },
          { id: "2", category: "결제", question: "VAT는 포함되나요?", answer: "결제 시 거주 국가 기준으로 자동 산정됩니다." },
          { id: "3", category: "기능", question: "오픈소스인가요?", answer: "core는 MIT, patterns 일부는 상업 라이선스입니다." },
          { id: "4", category: "기능", question: "다른 디자인 시스템과 함께 쓸 수 있나요?", answer: "네 — kind 별 entry로 부분 도입이 가능합니다." },
          { id: "5", category: "지원", question: "지원 응답 시간은?", answer: "Team 24h, Enterprise 4h SLA." },
        ]}
      />

      <CTASection
        title="지금 시작해 보세요"
        description="신용카드 없이 14일 무료 체험."
        primaryCta={{ label: "무료 체험", href: "/signup" }}
        secondaryCta={{ label: "데모 예약", href: "/demo" }}
      />
    </main>
  );
}
```

## Variations

- **단일 플랜만**: `PricingTable columns={1}` + 위 `Stat` 3개로 줄이기
- **B2B Enterprise 강조**: `plans[2].highlight = true` 로 우측 강조

## See also

- `app/design-system/patterns/pricing-page/page.tsx`
- `.ai/recipes/marketing-landing.md`
