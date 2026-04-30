"use client";
import {
  ComponentPage,
  Section,
  Guidelines,
  Anatomy,
  UsageNote,
  AccessibilityNote,
  CodeExample,
  VariantGrid,
  VariantItem,
  DecisionMatrix,
} from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Card } from "@/ds/composites/Card";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";

export default function CardPage() {
  return (
    <ComponentPage
      name="Card"
      description="관련된 콘텐츠를 하나의 시각적 단위로 그룹화하는 컨테이너 컴포넌트입니다. Header, Body, Footer 서브 컴포넌트를 조합하여 구조화된 레이아웃을 구성할 수 있습니다."
      importPath='import { Card } from "@/ds/composites/Card"'
      status="stable"
      version="1.0.0"
      props={[
        { name: "hoverable", type: "boolean", default: "false", description: "마우스 호버 시 그림자 강화 및 약간의 상승 효과를 적용합니다. 클릭 가능한 카드에 사용하세요." },
        { name: "noPadding", type: "boolean", default: "false", description: "카드 내부 패딩을 제거합니다. 이미지나 커스텀 레이아웃에 유용합니다." },
        { name: "asChild", type: "boolean", default: "false", description: "Radix-style Slot. true이면 자체 div 대신 단일 자식 엘리먼트의 root에 className/style/이벤트를 합칩니다. <Link>, <button> 등으로 위임할 때 사용합니다." },
        { name: "className", type: "string", description: "카드 컨테이너에 추가할 커스텀 클래스" },
        { name: "children", type: "ReactNode", required: true, description: "Card.Header, Card.Body, Card.Footer 등 서브 컴포넌트를 포함합니다." },
      ]}
      related={[
        { name: "StatCard", href: "/design-system/composites/stat-card" },
        { name: "MetricCard", href: "/design-system/composites/metric-card" },
        { name: "SpotlightCard", href: "/design-system/composites/spotlight-card" },
        { name: "BookCard", href: "/design-system/composites/book-card" },
      ]}
    >
      {/* ── 개요 ── */}
      <Section title="개요" description="Card는 Header, Body, Footer를 조합하여 콘텐츠를 체계적으로 구성합니다.">
        <Preview
          sourceCode={`<Card>
  <Card.Header>프로젝트 현황</Card.Header>
  <Card.Body>
    <p>현재 진행 중인 프로젝트의 전체 상태를 한눈에 확인할 수 있습니다.</p>
  </Card.Body>
  <Card.Footer>
    <div className="flex items-center justify-between">
      <span>최종 업데이트: 2시간 전</span>
      <Button size="sm">자세히 보기</Button>
    </div>
  </Card.Footer>
</Card>`}
        >
          <div className="max-w-sm w-full">
            <Card>
              <Card.Header>프로젝트 현황</Card.Header>
              <Card.Body>
                <p className="text-sm text-muted">현재 진행 중인 프로젝트의 전체 상태를 한눈에 확인할 수 있습니다. 세부 사항은 대시보드에서 확인하세요.</p>
              </Card.Body>
              <Card.Footer>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">최종 업데이트: 2시간 전</span>
                  <Button size="sm">자세히 보기</Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        </Preview>
      </Section>

      {/* ── 구조 ── */}
      <Section title="구조 (Anatomy)">
        <Anatomy
          items={[
            { label: "Container", description: "카드의 최외곽 래퍼입니다. 테두리, 둥근 모서리, 그림자를 제공합니다." },
            { label: "Header", description: "카드 상단의 제목 영역입니다. 문자열을 전달하면 자동으로 h3 태그로 렌더링됩니다." },
            { label: "Body", description: "카드의 메인 콘텐츠 영역입니다. 텍스트, 이미지, 리스트 등 자유롭게 배치할 수 있습니다." },
            { label: "Footer", description: "카드 하단의 액션 영역입니다. 버튼, 링크 등 사용자 인터랙션 요소를 배치합니다." },
          ]}
        />
      </Section>

      {/* ── 변형 ── */}
      <Section title="변형 (Variants)" description="Card는 다양한 스타일과 조합으로 활용할 수 있습니다. 각 변형의 우상단 '코드' 버튼으로 즉시 복사하세요.">
        <VariantGrid cols={2}>
          <VariantItem
            label="기본 (Default)"
            description="기본 스타일의 카드. 정보 표시에 적합합니다."
            sourceCode={`<Card>
  <Card.Header>기본 카드</Card.Header>
  <Card.Body>
    <p>기본 스타일의 카드입니다.</p>
  </Card.Body>
</Card>`}
          >
            <div className="w-full px-2">
              <Card>
                <Card.Header>기본 카드</Card.Header>
                <Card.Body>
                  <p className="text-xs text-muted">기본 스타일의 카드입니다.</p>
                </Card.Body>
              </Card>
            </div>
          </VariantItem>
          <VariantItem
            label="Hoverable"
            description="호버 시 시각적 피드백을 제공합니다."
            sourceCode={`<Card hoverable>
  <Card.Header>
    <div className="flex items-center gap-2">
      <span className="font-semibold">인터랙티브</span>
      <Badge variant="primary" size="sm">New</Badge>
    </div>
  </Card.Header>
  <Card.Body>
    <p>마우스를 올려보세요.</p>
  </Card.Body>
</Card>`}
          >
            <div className="w-full px-2">
              <Card hoverable>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">인터랙티브</span>
                    <Badge variant="primary" size="sm">New</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="text-xs text-muted">마우스를 올려보세요.</p>
                </Card.Body>
              </Card>
            </div>
          </VariantItem>
          <VariantItem
            label="Header + Body"
            description="Footer 없이 간단한 정보를 표시합니다."
            sourceCode={`<Card>
  <Card.Header>알림</Card.Header>
  <Card.Body>
    <p>새로운 업데이트가 있습니다.</p>
  </Card.Body>
</Card>`}
          >
            <div className="w-full px-2">
              <Card>
                <Card.Header>알림</Card.Header>
                <Card.Body>
                  <p className="text-xs text-muted">새로운 업데이트가 있습니다.</p>
                </Card.Body>
              </Card>
            </div>
          </VariantItem>
          <VariantItem
            label="전체 구조"
            description="Header, Body, Footer를 모두 포함한 완전한 형태"
            sourceCode={`<Card>
  <Card.Header>
    <div className="flex items-center gap-2">
      <span className="font-semibold">결제 정보</span>
      <Badge variant="success" size="sm">완료</Badge>
    </div>
  </Card.Header>
  <Card.Body>
    <p>총 결제 금액: 45,000원</p>
  </Card.Body>
  <Card.Footer>
    <Button size="sm" variant="secondary">영수증 보기</Button>
  </Card.Footer>
</Card>`}
          >
            <div className="w-full px-2">
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">결제 정보</span>
                    <Badge variant="success" size="sm">완료</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="text-xs text-muted">총 결제 금액: 45,000원</p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant="secondary">영수증 보기</Button>
                </Card.Footer>
              </Card>
            </div>
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── 의사결정 매트릭스 ── */}
      <Section title="비슷한 카드 컴포넌트 비교" description="Card 외에도 카드 형태의 전용 컴포넌트가 있습니다. 의도에 맞춰 선택하세요.">
        <DecisionMatrix
          rows={[
            {
              name: "Card",
              href: "/design-system/composites/card",
              signature: "범용 컨테이너",
              useWhen: "Header / Body / Footer 조합으로 자유롭게 콘텐츠를 그룹화할 때. 가장 무난한 기본 선택.",
              avoidWhen: "지표·강조·리스트 항목처럼 의미가 명확한 경우 — 전용 컴포넌트가 더 명확한 의도를 전달.",
            },
            {
              name: "StatCard",
              href: "/design-system/composites/stat-card",
              signature: "지표 표시",
              useWhen: "단일 지표(숫자 + 라벨 + 변화율)를 카드 한 장에 보여줄 때. 대시보드 상단 KPI에 적합.",
              avoidWhen: "여러 메트릭이나 비주얼이 함께 들어가야 한다면 MetricCard나 ChartCard를 사용.",
            },
            {
              name: "MetricCard",
              href: "/design-system/composites/metric-card",
              signature: "지표 + 미니차트",
              useWhen: "지표 옆에 스파크라인 등 추세 시각화를 함께 보여줄 때. 분석 대시보드의 카드 그리드.",
              avoidWhen: "차트가 필요 없다면 StatCard로 충분 — 번들 사이즈가 더 작음.",
            },
            {
              name: "SpotlightCard",
              href: "/design-system/composites/spotlight-card",
              signature: "강조 / 마케팅",
              useWhen: "마우스 추적 글로우 효과로 시선을 끌고 싶은 마케팅·랜딩 페이지의 hero 카드.",
              avoidWhen: "관리자 화면이나 정보 밀도가 높은 페이지 — 시각적 노이즈로 작용.",
            },
            {
              name: "BookCard",
              href: "/design-system/composites/book-card",
              signature: "책/제품",
              useWhen: "표지 이미지 + 제목 + 저자 같은 책 메타데이터 패턴 — 도서·강의·콘텐츠 카탈로그.",
              avoidWhen: "일반 정보 카드 — 의미가 모호해짐.",
            },
          ]}
        />
      </Section>

      {/* ── 실제 활용 예시 ── */}
      <Section title="실제 활용 예시" description="다양한 상황에서 Card를 활용하는 패턴입니다.">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* 사용자 프로필 카드 */}
            <Card>
              <Card.Body>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">JH</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">김준하</p>
                    <p className="text-xs text-muted">프론트엔드 개발자</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted">
                  <span><strong className="text-foreground">128</strong> 커밋</span>
                  <span><strong className="text-foreground">34</strong> PR</span>
                  <span><strong className="text-foreground">12</strong> 리뷰</span>
                </div>
              </Card.Body>
            </Card>

            {/* 통계 카드 */}
            <Card hoverable>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">월간 활성 사용자</span>
                  <Badge variant="success" size="sm" dot>증가</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-2xl font-bold text-foreground">12,847</p>
                <p className="text-xs text-success mt-1">+23.5% 전월 대비</p>
              </Card.Body>
            </Card>
          </div>
        </Preview>
      </Section>

      {/* ── noPadding 활용 ── */}
      <Section title="noPadding 활용" description="이미지나 커스텀 레이아웃을 사용할 때 noPadding 옵션으로 내부 여백을 제거할 수 있습니다.">
        <Preview>
          <div className="max-w-xs w-full">
            <Card noPadding>
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm font-semibold text-foreground">디자인 시스템</p>
                <p className="text-xs text-muted mt-1">일관된 UI를 위한 컴포넌트 라이브러리</p>
              </div>
            </Card>
          </div>
        </Preview>
        <UsageNote type="info">
          <code className="text-xs font-mono bg-gray-100 px-1 rounded">noPadding</code>을 사용할 때는 서브 컴포넌트(Header, Body, Footer) 대신 직접 레이아웃을 구성하는 것이 더 유연합니다.
        </UsageNote>
      </Section>

      {/* ── asChild — Slot 위임 ── */}
      <Section title="asChild — 외부 컨테이너 위임" description="asChild={true}이면 Card는 자체 <div>를 렌더하지 않고 단일 자식 엘리먼트로 위임합니다. Next의 <Link>, <button> 등 임의의 컨테이너로 카드 디자인을 적용할 수 있습니다.">
        <Preview>
          <div className="max-w-sm w-full">
            <Card asChild hoverable>
              <a href="#card-aschild-demo" className="block no-underline text-inherit">
                <Card.Body>
                  <p className="text-sm font-semibold text-foreground">프로필로 이동</p>
                  <p className="text-xs text-muted mt-1">전체 카드 영역이 클릭 가능한 링크가 됩니다.</p>
                </Card.Body>
              </a>
            </Card>
          </div>
        </Preview>
        <UsageNote type="tip">
          asChild를 쓸 때 자식은 <strong>정확히 하나</strong>의 React element여야 합니다. 문자열·fragment·복수 자식은 dev 환경에서 console.warn 후 null이 렌더됩니다. className은 tailwind-merge로 병합되어 자식 className이 충돌 시 우선합니다.
        </UsageNote>
        <CodeExample
          code={`// 카드 전체를 Next Link로 위임
<Card asChild hoverable>
  <Link href="/profile">
    <Card.Body>프로필로 이동</Card.Body>
  </Link>
</Card>

// button으로 위임 — onClick 핸들러는 Card와 button 양쪽에서 시퀀스 실행
<Card asChild onClick={track}>
  <button type="button" onClick={open}>
    <Card.Body>다이얼로그 열기</Card.Body>
  </button>
</Card>`}
        />
      </Section>

      {/* ── 가이드라인 ── */}
      <Section title="가이드라인">
        <Guidelines
          items={[
            {
              type: "do",
              description: "관련된 정보를 하나의 카드로 그룹화하세요. 카드는 독립적인 콘텐츠 단위로 동작해야 합니다.",
            },
            {
              type: "dont",
              description: "카드 안에 카드를 중첩하지 마세요. 시각적 계층 구조가 혼란스러워지고 레이아웃이 복잡해집니다.",
            },
            {
              type: "do",
              description: "같은 그리드 내의 카드는 동일한 구조(Header/Body/Footer 조합)를 유지하여 시각적 일관성을 확보하세요.",
            },
            {
              type: "dont",
              description: "카드 내부에 과도한 양의 콘텐츠를 넣지 마세요. 핵심 정보만 요약하고, 상세 내용은 별도 페이지로 이동하세요.",
            },
            {
              type: "caution",
              description: "hoverable 카드는 반드시 클릭 가능한 인터랙션이 있어야 합니다. 시각 효과만 있고 동작이 없으면 사용자를 혼란스럽게 합니다.",
            },
            {
              type: "do",
              description: "Footer에는 주요 액션 버튼을 1~2개로 제한하세요. 너무 많은 버튼은 선택 부담을 증가시킵니다.",
            },
          ]}
        />
      </Section>

      {/* ── 접근성 ── */}
      <Section title="접근성">
        <AccessibilityNote
          items={[
            "Card는 시멘틱 div 요소로 렌더링됩니다. 독립적인 콘텐츠 블록이라면 article 역할을 고려하세요.",
            "hoverable 카드에 클릭 동작을 추가할 때는 onClick과 함께 role=\"button\", tabIndex={0}을 설정하세요.",
            "Card.Header에 문자열을 전달하면 자동으로 h3 태그로 렌더링되어 문서 계층 구조를 형성합니다.",
            "Footer의 버튼은 키보드 Tab 키로 접근 가능하며, Enter/Space로 활성화됩니다.",
          ]}
        />
      </Section>

      {/* ── 사용 예시 코드 ── */}
      <Section title="사용 예시">
        <CodeExample
          code={`// 기본 카드
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>
    <p>내용을 자유롭게 구성하세요.</p>
  </Card.Body>
  <Card.Footer>
    <Button size="sm">액션</Button>
  </Card.Footer>
</Card>

// Hoverable + Badge 조합
<Card hoverable>
  <Card.Header>
    <div className="flex items-center gap-2">
      <span>프로젝트</span>
      <Badge variant="success" size="sm">Active</Badge>
    </div>
  </Card.Header>
  <Card.Body>
    <p>클릭 가능한 인터랙티브 카드입니다.</p>
  </Card.Body>
</Card>

// noPadding + 커스텀 레이아웃
<Card noPadding>
  <img src="/cover.jpg" alt="커버" className="w-full h-40 object-cover" />
  <div className="p-4">
    <h3>커스텀 카드</h3>
  </div>
</Card>`}
        />
      </Section>
    </ComponentPage>
  );
}
