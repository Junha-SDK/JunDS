"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ImageLightbox } from "@/ds/composites/ImageLightbox";

export default function ImageLightboxPage() {
  return (
    <ComponentPage
      name="ImageLightbox"
      description="썸네일 클릭 시 전체 화면으로 확대되는 이미지 라이트박스. 줌 컨트롤과 키보드 탐색을 지원합니다."
      importPath='import { ImageLightbox } from "@/ds/composites/ImageLightbox"'
      props={[
        { name: "src", type: "string", description: "이미지 URL" },
        { name: "alt", type: "string", description: "대체 텍스트" },
        { name: "children", type: "ReactNode", description: "커스텀 썸네일 (없으면 src 이미지 사용)" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <p className="text-xs text-muted mb-3">클릭하면 라이트박스가 열립니다. +/- 로 줌, Esc로 닫기</p>
          <ImageLightbox
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='50%25' stop-color='%23ec4899'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='500' fill='url(%23g)'/%3E%3Ctext x='400' y='260' text-anchor='middle' fill='white' font-size='32' font-family='system-ui'>Click to Expand</text%3E%3C/svg%3E"
            alt="그라데이션 예시"
          >
            <div className="w-full max-w-sm h-48 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 via-pink-500 to-amber-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow cursor-zoom-in">
              클릭하여 확대
            </div>
          </ImageLightbox>
        </Preview>
      </Section>

      <Section title="이미지 갤러리">
        <Preview>
          <p className="text-xs text-muted mb-3">각 카드를 클릭하여 확대된 이미지를 확인하세요</p>
          <div className="grid grid-cols-3 gap-3">
            <ImageLightbox
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2306b6d4'/%3E%3Cstop offset='100%25' stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='600' fill='url(%23a)'/%3E%3Ccircle cx='300' cy='300' r='150' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='300' cy='300' r='80' fill='white' fill-opacity='0.2'/%3E%3C/svg%3E"
              alt="시안-블루 그라데이션"
            >
              <div className="aspect-square rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-zoom-in">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                </div>
              </div>
            </ImageLightbox>
            <ImageLightbox
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cdefs%3E%3ClinearGradient id='b' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f43f5e'/%3E%3Cstop offset='100%25' stop-color='%23f97316'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='600' fill='url(%23b)'/%3E%3Crect x='200' y='200' width='200' height='200' rx='20' fill='white' fill-opacity='0.2' transform='rotate(45 300 300)'/%3E%3C/svg%3E"
              alt="로즈-오렌지 그라데이션"
            >
              <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-zoom-in">
                <div className="w-12 h-12 rounded-lg bg-white/20 rotate-45" />
              </div>
            </ImageLightbox>
            <ImageLightbox
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cdefs%3E%3ClinearGradient id='c' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%23a78bfa'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='600' fill='url(%23c)'/%3E%3Cpolygon points='300,150 420,350 180,350' fill='white' fill-opacity='0.2'/%3E%3C/svg%3E"
              alt="에메랄드-바이올렛 그라데이션"
            >
              <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-400 to-violet-400 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-zoom-in">
                <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-transparent border-b-white/20" />
              </div>
            </ImageLightbox>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
