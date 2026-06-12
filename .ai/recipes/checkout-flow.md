# Recipe — Checkout Flow

## Goal

결제 흐름의 핵심 — 장바구니 항목 + 수량 조정 + 가격 계산 + 단계 진행 +
오프라인/네트워크 실패 알림까지를 한 곳에 묶는다.

## Used components

- `CartItem` — `@/ds/composites/CartItem`
- `QuantitySelector` — `@/ds/composites/QuantitySelector` (CartItem 내부에서 또는 별도 사용)
- `PriceDisplay` — `@/ds/composites/PriceDisplay`
- `FormWizard` — `@/ds/patterns/FormWizard` (배송 → 결제 → 확인)
- `OfflineIndicator` — `@/ds/composites/OfflineIndicator`
- `LoadingButton` — `@/ds/composites/LoadingButton`
- `EmptyState` — `@/ds/composites/EmptyState`

## Recipe

```tsx
"use client";
import { useMemo, useState } from "react";
import { CartItem } from "@/ds/composites/CartItem";
import { PriceDisplay } from "@/ds/composites/PriceDisplay";
import { FormWizard } from "@/ds/patterns/FormWizard";
import { OfflineIndicator } from "@/ds/composites/OfflineIndicator";
import { LoadingButton } from "@/ds/composites/LoadingButton";
import { EmptyState } from "@/ds/composites/EmptyState";
import { Input } from "@/ds/primitives/Input";

interface Line {
  id: string;
  title: string;
  image: string;
  price: number;
  qty: number;
}

export default function Checkout() {
  const [lines, setLines] = useState<Line[]>([
    { id: "a", title: "JunDS Hoodie", image: "/p/hoodie.png", price: 49, qty: 1 },
    { id: "b", title: "JunDS Stickers Pack", image: "/p/stickers.png", price: 12, qty: 2 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.qty, 0),
    [lines],
  );

  const updateQty = (id: string, qty: number) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty } : l)));
  const remove = (id: string) =>
    setLines((ls) => ls.filter((l) => l.id !== id));

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="장바구니가 비어 있어요"
        description="상품을 담은 뒤 다시 방문해 주세요."
        action={{ label: "쇼핑 계속하기", href: "/shop" }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <OfflineIndicator />

      <FormWizard
        steps={[
          {
            title: "장바구니 확인",
            description: "수량을 조정하거나 항목을 제거하세요.",
            content: (
              <div className="space-y-3">
                {lines.map((l) => (
                  <CartItem
                    key={l.id}
                    title={l.title}
                    image={l.image}
                    price={l.price * l.qty}
                    quantity={l.qty}
                    onQuantityChange={(q) => updateQty(l.id, q)}
                    onRemove={() => remove(l.id)}
                  />
                ))}
                <div className="flex justify-end pt-4 border-t">
                  <PriceDisplay value={total} currency="USD" size="lg" suffix=" 합계" />
                </div>
              </div>
            ),
          },
          {
            title: "배송 정보",
            description: "받으실 곳을 입력하세요.",
            content: (
              <div className="space-y-3">
                <Input placeholder="이름" aria-label="받는 사람" />
                <Input placeholder="주소" aria-label="배송 주소" />
                <Input placeholder="우편번호" aria-label="우편번호" />
              </div>
            ),
            validate: () => true,
          },
          {
            title: "결제",
            description: "안전한 결제로 마무리합니다.",
            content: (
              <div className="space-y-3">
                <Input placeholder="카드 번호" aria-label="카드 번호" inputMode="numeric" />
                <Input placeholder="MM/YY" aria-label="카드 만료" />
                <Input placeholder="CVC" aria-label="카드 CVC" inputMode="numeric" />
                <LoadingButton
                  loading={submitting}
                  loadingText="결제 처리 중…"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await fetch("/api/checkout", {
                        method: "POST",
                        body: JSON.stringify({ lines }),
                      });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  fullWidth
                >
                  ${total} 결제
                </LoadingButton>
              </div>
            ),
          },
        ]}
        onComplete={() => alert("주문 완료")}
      />
    </div>
  );
}
```

## Variations

- **세션 만료 가드**: `OfflineIndicator` 옆에 `useSessionStorage` 훅으로 마지막
  단계 보존
- **할인 코드**: 1단계 푸터에 `Input`(coupon) + `Button` 추가, 적용 시
  `PriceDisplay original={total} value={discounted} showDiscount`
- **주문 완료 화면**: `onComplete`에서 `LoadingScreen → PageHeader` 순서로
  완료 화면 진입

## See also

- `app/design-system/composites/cart-item/page.tsx`
- `.ai/recipes/form-wizard.md` — 일반 위저드 패턴
- `.ai/recipes/notification-stack.md` — 결제 실패 토스트
