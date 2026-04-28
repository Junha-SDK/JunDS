"use client";
import { ComponentPage, Section, CodeExample } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";

const migrations = [
  {
    from: "MUI (Material UI)",
    mappings: [
      { mui: "<Button variant=\"contained\">", junds: "<Button variant=\"primary\">" },
      { mui: "<TextField label=\"Name\" />", junds: "<Input placeholder=\"Name\" />" },
      { mui: "<Box sx={{ p: 2 }}>", junds: "<Box p={2}>" },
      { mui: "<Stack spacing={2}>", junds: "<VStack gap={2}>" },
      { mui: "<Grid container spacing={2}>", junds: "<SimpleGrid cols={3} gap={2}>" },
      { mui: "<Dialog open={open}>", junds: "<Modal open={open}>" },
      { mui: "<Snackbar>", junds: "<Toast> (useDsToast)" },
      { mui: "<Chip label=\"tag\">", junds: "<Badge>tag</Badge>" },
    ],
  },
  {
    from: "Chakra UI",
    mappings: [
      { mui: "<Button colorScheme=\"blue\">", junds: "<Button variant=\"primary\">" },
      { mui: "<Input />", junds: "<Input />" },
      { mui: "<Box p={4}>", junds: "<Box p={4}>" },
      { mui: "<HStack spacing={4}>", junds: "<HStack gap={4}>" },
      { mui: "<VStack spacing={4}>", junds: "<VStack gap={4}>" },
      { mui: "<SimpleGrid columns={3}>", junds: "<SimpleGrid cols={3}>" },
      { mui: "<Modal isOpen={open}>", junds: "<Modal open={open}>" },
      { mui: "<useToast()>", junds: "<useDsToast()>" },
    ],
  },
  {
    from: "shadcn/ui",
    mappings: [
      { mui: "<Button variant=\"default\">", junds: "<Button variant=\"primary\">" },
      { mui: "<Input />", junds: "<Input />" },
      { mui: "<Card>", junds: "<Card>" },
      { mui: "<Dialog>", junds: "<Modal>" },
      { mui: "<Select>", junds: "<Select>" },
      { mui: "<Tabs>", junds: "<Tabs>" },
      { mui: "<Badge>", junds: "<Badge>" },
      { mui: "cn()", junds: "cn() (동일)" },
    ],
  },
];

export default function MigrationPage() {
  return (
    <ComponentPage
      name="Migration Guide"
      description="MUI, Chakra UI, shadcn/ui에서 JunDS로 마이그레이션하는 가이드입니다."
      importPath='import { ... } from "@junds/ui"'
      status="stable"
    >
      {migrations.map((m) => (
        <Section key={m.from} title={`${m.from} → JunDS`} description={`${m.from}에서 JunDS로 전환할 때 참고하세요.`}>
          <Preview padding={false}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{m.from}</th>
                  <th className="px-4 py-2.5 text-center text-xs text-muted">→</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-primary uppercase">JunDS</th>
                </tr>
              </thead>
              <tbody>
                {m.mappings.map((row, i) => (
                  <tr key={i} className="border-b border-border-light">
                    <td className="px-4 py-2 font-mono text-xs text-muted">{row.mui}</td>
                    <td className="px-4 py-2 text-center text-muted">→</td>
                    <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{row.junds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Preview>
        </Section>
      ))}

      <Section title="JunDS만의 장점" description="다른 라이브러리에는 없는 JunDS만의 기능입니다.">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: "프레임워크 코어", desc: "Box, Flex, Page — 토큰 기반 레이아웃 시스템" },
              { title: "반응형 Props", desc: "p={{ base: 2, md: 4 }} 브레이크포인트별 제어" },
              { title: "25기능 DataTable", desc: "검색, 필터, 정렬, 가상스크롤, 인라인 편집" },
              { title: "219+ 컴포넌트", desc: "대부분의 DS보다 훨씬 많은 컴포넌트" },
              { title: "전역 밀도/반경/간격", desc: "JunDSProvider로 한 곳에서 제어" },
              { title: "Korean First", desc: "한국어 기본, 한국 서비스에 최적화" },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm font-bold text-primary">{item.title}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
