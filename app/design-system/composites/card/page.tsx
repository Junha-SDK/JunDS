"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Card } from "@/ds/composites/Card";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";

export default function CardPage() {
  return (
    <ComponentPage
      name="Card"
      description="콘텐츠 컨테이너. Header, Body, Footer 서브 컴포넌트."
      importPath='import { Card } from "@/ds/composites/Card"'
      props={[
        { name: "hoverable", type: "boolean", description: "호버 효과" },
        { name: "noPadding", type: "boolean", description: "패딩 제거" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <Card.Header>기본 카드</Card.Header>
              <Card.Body>
                <p className="text-sm text-muted">카드 내용입니다.</p>
              </Card.Body>
            </Card>

            <Card hoverable>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Hoverable</span>
                  <Badge variant="primary" size="sm">New</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-muted">마우스를 올려보세요.</p>
              </Card.Body>
              <Card.Footer>
                <Button size="sm">자세히</Button>
              </Card.Footer>
            </Card>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
