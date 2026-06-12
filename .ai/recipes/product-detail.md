# Recipe — E-commerce Product Detail

## Goal

상품 상세 페이지의 표준 — 이미지 갤러리 + 가격/할인 + 수량 + 리뷰 반응 +
공유. 결제 직전 의사결정에 필요한 모든 정보를 한 화면에 묶는다.

## Used components

- `ProductCard` — `@/ds/composites/ProductCard` (관련 상품 추천)
- `PriceDisplay` — `@/ds/composites/PriceDisplay`
- `QuantitySelector` — `@/ds/composites/QuantitySelector`
- `EmojiReaction` — `@/ds/composites/EmojiReaction`
- `SocialShare` — `@/ds/composites/SocialShare`
- `Tabs` — `@/ds/composites/Tabs` (설명/리뷰/배송 분리)
- `Button` — `@/ds/primitives/Button`

## Recipe

```tsx
"use client";
import { useState } from "react";
import { PriceDisplay } from "@/ds/composites/PriceDisplay";
import { QuantitySelector } from "@/ds/composites/QuantitySelector";
import { EmojiReaction } from "@/ds/composites/EmojiReaction";
import { SocialShare } from "@/ds/composites/SocialShare";
import { ProductCard } from "@/ds/composites/ProductCard";
import { Tabs } from "@/ds/composites/Tabs";
import { Button } from "@/ds/primitives/Button";

interface Product {
  id: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  original?: number;
  currency: string;
  rating: number;
  reviews: number;
}

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [qty, setQty] = useState(1);
  const [reactions, setReactions] = useState([
    { emoji: "❤️", count: 142, reacted: false },
    { emoji: "🔥", count: 87, reacted: false },
    { emoji: "👍", count: 53, reacted: true },
  ]);

  const toggleReaction = (emoji: string) => {
    setReactions((rs) =>
      rs.map((r) =>
        r.emoji === emoji ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) } : r,
      ),
    );
  };

  return (
    <article className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10">
      <div>
        <img src={product.image} alt={product.title} className="w-full rounded-2xl" />
      </div>

      <div className="space-y-5">
        <header>
          <p className="text-sm text-muted">{product.brand}</p>
          <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
        </header>

        <PriceDisplay
          value={product.price}
          original={product.original}
          currency={product.currency}
          size="lg"
          showDiscount
        />

        <div className="flex items-center gap-3">
          <QuantitySelector value={qty} onChange={setQty} min={1} max={10} />
          <Button variant="primary" size="lg" className="flex-1">
            장바구니에 담기 ({qty})
          </Button>
        </div>

        <EmojiReaction reactions={reactions} onToggle={toggleReaction} showAddButton />

        <SocialShare
          url={`https://shop.example.com/p/${product.id}`}
          title={product.title}
          platforms={["twitter", "facebook", "kakao", "copy"]}
          shape="circle"
        />

        <Tabs
          items={[
            {
              key: "desc",
              label: "상품 설명",
              content: <p className="text-sm leading-relaxed">상세 설명 본문…</p>,
            },
            {
              key: "review",
              label: `리뷰 (${product.reviews})`,
              content: <p className="text-sm">리뷰 목록…</p>,
            },
            {
              key: "ship",
              label: "배송/반품",
              content: <p className="text-sm">3일 이내 무료 배송, 30일 반품…</p>,
            },
          ]}
        />
      </div>

      <section className="lg:col-span-2 mt-10">
        <h2 className="text-lg font-semibold mb-4">함께 본 상품</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {related.map((p) => (
            <ProductCard
              key={p.id}
              title={p.title}
              brand={p.brand}
              image={p.image}
              price={
                <PriceDisplay value={p.price} currency={p.currency} size="sm" />
              }
              rating={p.rating}
              reviewCount={p.reviews}
            />
          ))}
        </div>
      </section>
    </article>
  );
}
```

## Variations

- **재고 0 상태**: `Button disabled` + `aria-label="품절"` + `QuantitySelector disabled`
- **옵션 선택 필요**: `QuantitySelector` 위에 `RadioCardGroup` (composite) 추가
- **퀵 뷰 모달**: 같은 구성을 `Modal` 안에 넣어 `composites/modal` recipe와 결합

## See also

- `.ai/recipes/notification-stack.md` — 장바구니 추가 토스트
- `app/design-system/composites/product-card/page.tsx`
