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
        { name: "type", type: '"spoiler"|"caution"', default: '"spoiler"', description: "블록 유형" },
        { name: "label", type: "string", description: "공개 버튼 레이블 (기본값: type에 따라 자동)" },
        { name: "children", type: "ReactNode", description: "숨길 콘텐츠" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="스포일러">
        <Preview>
          <div className="flex flex-col gap-4">
            <SpoilerBlock type="spoiler">
              <div className="space-y-2">
                <p className="font-semibold text-sm">결말 스포일러</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  주인공은 마지막 전투에서 승리하지만, 동료를 잃는 대가를 치릅니다.
                  엔딩 크레딧 후 숨겨진 장면에서 새로운 적의 등장이 암시됩니다.
                </p>
              </div>
            </SpoilerBlock>
            <SpoilerBlock type="spoiler">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">A+</div>
                <div>
                  <p className="text-sm font-medium">최종 성적</p>
                  <p className="text-xs text-slate-500">2024년 2학기 종합 평가</p>
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
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">민감한 이미지 포함</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  이 섹션에는 의료 관련 이미지가 포함되어 있습니다.
                  일부 사용자에게 불편할 수 있는 내용입니다.
                </p>
                <div className="flex gap-2">
                  <div className="w-20 h-20 rounded bg-amber-200 dark:bg-amber-800" />
                  <div className="w-20 h-20 rounded bg-amber-300 dark:bg-amber-700" />
                  <div className="w-20 h-20 rounded bg-amber-100 dark:bg-amber-900" />
                </div>
              </div>
            </SpoilerBlock>
            <SpoilerBlock type="caution">
              <p className="text-sm">
                이 답변에는 수학 문제의 풀이 과정이 포함되어 있습니다.
                먼저 직접 풀어본 후 확인하세요.
              </p>
              <pre className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded text-xs font-mono">
{`x^2 + 5x + 6 = 0
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
              <p className="text-sm font-medium">정답: 42</p>
              <p className="text-xs text-slate-500 mt-1">삶, 우주, 그리고 모든 것에 대한 궁극적 답</p>
            </SpoilerBlock>
            <SpoilerBlock type="caution" label="비밀번호 표시">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                  s3cur3-p@ssw0rd!
                </code>
              </div>
            </SpoilerBlock>
            <SpoilerBlock type="spoiler" label="힌트 보기">
              <p className="text-sm italic text-slate-600 dark:text-slate-300">
                열쇠는 첫 번째 문단의 세 번째 단어에 있습니다.
              </p>
            </SpoilerBlock>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
