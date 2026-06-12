# Recipe — Brand Switching

## Goal

한 줄 prop으로 색상·라운드·밀도·폰트가 한꺼번에 바뀌는 멀티 브랜드 시스템.
화이트 라벨/멀티 테넌시 SaaS의 표준 요구사항.

## Used components

- `BrandProvider` — `@/ds/providers/BrandProvider`
- `BrandSwitcher` — `@/ds/composites/BrandSwitcher`
- `Card`, `Button`, `Input` — 미리보기

## Recipe

```tsx
"use client";
import { BrandProvider, useBrand } from "@/ds/providers/BrandProvider";
import { BrandSwitcher } from "@/ds/composites/BrandSwitcher";
import { Card } from "@/ds/composites/Card";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";

function Preview() {
  const { brand } = useBrand();
  return (
    <Card>
      <Card.Header>
        <h3 className="text-base font-semibold">{brand?.label ?? "Default"}</h3>
        <p className="text-xs text-muted">{brand?.tagline}</p>
      </Card.Header>
      <Card.Body>
        <Input placeholder="이메일을 입력하세요" aria-label="이메일" />
        <div className="mt-3 flex gap-2">
          <Button variant="primary">시작하기</Button>
          <Button variant="secondary">데모</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function BrandShowcase() {
  return (
    <BrandProvider brand="default" persist>
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <header>
          <h1 className="text-xl font-bold">브랜드 전환 데모</h1>
          <p className="text-sm text-muted mt-1">
            칩을 클릭하면 색상·라운드·밀도·폰트가 즉시 바뀝니다 — 새로고침 후에도 유지됩니다.
          </p>
        </header>

        <BrandSwitcher variant="chips" />

        <Preview />
      </main>
    </BrandProvider>
  );
}
```

## 사용자 정의 브랜드 추가

```tsx
import { generateTheme } from "@/ds/tokens/themes";
import { applyBrand } from "@/ds/tokens/brands";

// Acme 회사 색상으로 전환
applyBrand({
  id: "acme",
  label: "Acme Corp",
  theme: generateTheme("acme", "Acme", "#ff6b35"),
  radius: "soft",
  density: "comfortable",
  font: "sans",
});
```

## Variations

- **per-route 브랜드**: 라우트마다 다른 `<BrandProvider brand="...">` 감싸기
- **다크 모드와 직교**: 같은 자식 안에 `<ThemeProvider>` + `<BrandProvider>` 동시 사용
- **CSS 직접 오버라이드**: `[data-brand="forest"] .Card { ... }` — 컴포넌트
  레벨 미세 조정

## See also

- `requirements/multi-brand-theming.md`
- `requirements/theming.md` — 라이트/다크 토글
