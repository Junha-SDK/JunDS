"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SpoilerBlock } from "@/ds/composites/SpoilerBlock";

export default function SpoilerBlockPage() {
  return (
    <ComponentPage
      name="SpoilerBlock"
      description="민감하거나 스포일러성 콘텐츠를 블러 처리하여 숨깁니다. 버튼 클릭으로 공개할 수 있습니다."
      importPath='import { SpoilerBlock } from "@/ds/composites/SpoilerBlock"'
      props={[
        {
          name: "type",
          type: '"spoiler"|"caution"',
          default: '"spoiler"',
          description: "블록 유형",
        },
        {
          name: "label",
          type: "string",
          description: "공개 버튼 레이블 (기본값: type에 따라 자동)",
        },
        { name: "children", type: "ReactNode", description: "숨길 콘텐츠" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="스포일러">
        <Preview>
          <div className="flex flex-col gap-4">
            <SpoilerBlock type="spoiler">
              <div className="space-y-2">
                <p className="font-semibold text-sm text-foreground">결말 스포일러</p>
                <p className="text-sm text-muted">
                  주인공은 마지막 전투에서 승리하지만, 동료를 잃는 대가를 치릅니다. 엔딩 크레딧 후
                  숨겨진 장면에서 새로운 적의 등장이 암시됩니다.
                </p>
              </div>
            </SpoilerBlock>
            <SpoilerBlock type="spoiler">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                  A+
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">최종 성적</p>
                  <p className="text-xs text-muted">2026년 1학기 종합 평가</p>
                </div>
              </div>
            </SpoilerBlock>
          </div>
        </Preview>
      </Section>

      <Section title="주의">
        <Preview>
          <div className="flex flex-col gap-4">
            <SpoilerBlock type="caution">
              <div className="space-y-2">
                <p className="font-semibold text-sm text-foreground">민감한 내용 포함</p>
                <p className="text-sm text-muted">
                  이 섹션에는 민감한 정보가 포함되어 있습니다. 확인 전 주의하시기 바랍니다.
                </p>
                <div className="flex gap-2">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20" />
                  <div className="w-16 h-16 rounded-lg bg-accent/10 border border-accent/20" />
                  <div className="w-16 h-16 rounded-lg bg-success/10 border border-success/20" />
                </div>
              </div>
            </SpoilerBlock>
            <SpoilerBlock type="caution">
              <p className="text-sm text-foreground">
                이 답변에는 수학 문제의 풀이 과정이 포함되어 있습니다.
              </p>
              <pre className="mt-2 p-3 bg-card border border-border rounded-lg text-xs font-mono text-foreground">
                {`x² + 5x + 6 = 0
(x + 2)(x + 3) = 0
x = -2 또는 x = -3`}
              </pre>
            </SpoilerBlock>
          </div>
        </Preview>
      </Section>

      <Section title="커스텀 라벨">
        <Preview>
          <div className="flex flex-col gap-4">
            <SpoilerBlock type="spoiler" label="정답 확인하기">
              <p className="text-sm font-medium text-foreground">정답: 42</p>
              <p className="text-xs text-muted mt-1">삶, 우주, 그리고 모든 것에 대한 궁극적 답</p>
            </SpoilerBlock>
            <SpoilerBlock type="caution" label="비밀번호 표시">
              <code className="text-sm font-mono bg-card border border-border px-3 py-1.5 rounded-lg text-foreground">
                s3cur3-p@ssw0rd!
              </code>
            </SpoilerBlock>
            <SpoilerBlock type="spoiler" label="힌트 보기">
              <p className="text-sm italic text-muted">
                열쇠는 첫 번째 문단의 세 번째 단어에 있습니다.
              </p>
            </SpoilerBlock>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
