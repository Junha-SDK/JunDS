"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AspectRatio } from "@/ds/primitives/AspectRatio";

export default function AspectRatioPage() {
  return (
    <ComponentPage
      name="AspectRatio"
      description="자식 요소가 지정된 종횡비를 유지하도록 하는 컨테이너입니다."
      importPath='import { AspectRatio } from "@/ds/primitives/AspectRatio"'
      props={[
        { name: "ratio", type: "number", default: "16/9", description: "가로:세로 비율" },
        { name: "children", type: "ReactNode", description: "자식 요소" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div>
              <p className="text-sm text-muted-foreground mb-2">16:9</p>
              <AspectRatio ratio={16 / 9}>
                <div className="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center text-primary-ink font-medium">
                  16 : 9
                </div>
              </AspectRatio>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">4:3</p>
              <AspectRatio ratio={4 / 3}>
                <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium">
                  4 : 3
                </div>
              </AspectRatio>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">1:1</p>
              <AspectRatio ratio={1}>
                <div className="w-full h-full bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-medium">
                  1 : 1
                </div>
              </AspectRatio>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
