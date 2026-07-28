"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";

export default function SeoHeadPage() {
  return (
    <ComponentPage
      name="SeoHead"
      description="페이지 SEO 메타태그를 선언적으로 지정한다. 아무것도 렌더하지 않으며, 사이트 기본값은 SeoProvider 로 한 번만 지정한다."
      importPath='import { SeoHead } from "@/ds/composites/SeoHead"'
      props={[]}
    >
      <Section title="Usage">
        <Preview>
          {/* 실제로 <head> 를 바꾸므로 쇼케이스에서는 렌더하지 않고 코드만 보여준다 */}
          <pre className="w-full overflow-x-auto rounded-lg border border-border bg-card p-4 text-xs leading-relaxed">
            {`// 앱 루트에서 한 번
<SeoProvider defaults={{
  title: "junome",
  titleTemplate: "%s | junome",
  description: "개발 블로그 & 포트폴리오",
  siteUrl: "https://www.junome.info",
  ogImage: "https://www.junome.info/og/home.png",
}}>
  <App />
</SeoProvider>

// 각 페이지에서
<SeoHead
  title={post.title}
  description={post.summary}
  ogImage={post.cover}
  ogType="article"
  canonical={\`/blog/\${post.slug}\`}
/>`}
          </pre>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
