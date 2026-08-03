"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Page, Box, GridLayout } from "@/ds/core";

export default function PageLayoutPage() {
  return (
    <ComponentPage
      name="Page"
      description="페이지 레벨 레이아웃. maxWidth, Header, Body를 제공하여 일관된 페이지 구조를 강제합니다."
      importPath='import { Page } from "@junds/ui/core"'
      props={[
        {
          name: "maxWidth",
          type: '"sm"|"md"|"lg"|"xl"|"2xl"|"full"',
          default: '"xl"',
          description: "최대 너비",
        },
        { name: "p", type: "SpacingToken", default: "6", description: "페이지 패딩" },
      ]}
    >
      <Section title="구조">
        <Preview padding={false}>
          <div className="border border-border rounded-xl overflow-hidden">
            <Page maxWidth="full" p={5}>
              <Page.Header
                title="대시보드"
                description="오늘의 현황을 확인하세요"
                actions={
                  <button className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg">
                    새로 만들기
                  </button>
                }
              />
              <Page.Body>
                <GridLayout cols={3} gap="md">
                  {[1, 2, 3].map((n) => (
                    <Box key={n} p={4} bg="surface-raised" radius="lg" border>
                      <p className="text-xs text-muted">카드 {n}</p>
                    </Box>
                  ))}
                </GridLayout>
              </Page.Body>
            </Page>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
