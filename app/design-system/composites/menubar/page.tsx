"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Menubar } from "@/ds/composites/Menubar";

export default function MenubarPage() {
  return (
    <ComponentPage
      name="Menubar"
      description="메뉴바. macOS 스타일의 수평 메뉴로, 클릭으로 열고 호버로 메뉴를 전환합니다."
      importPath='import { Menubar } from "@/ds/composites/Menubar"'
      props={[
        { name: "items", type: "MenubarItem[]", required: true, description: "메뉴 바 항목 목록" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <Menubar
            items={[
              {
                key: "file",
                label: "파일",
                items: [
                  { key: "new", label: "새 파일", shortcut: "⌘N" },
                  { key: "open", label: "열기", shortcut: "⌘O" },
                  { key: "save", label: "저장", shortcut: "⌘S" },
                  { key: "save-as", label: "다른 이름으로 저장", shortcut: "⇧⌘S" },
                  { key: "div1", label: "", divider: true },
                  { key: "export", label: "내보내기", shortcut: "⌘E" },
                  { key: "div2", label: "", divider: true },
                  { key: "close", label: "닫기", shortcut: "⌘W" },
                ],
              },
              {
                key: "edit",
                label: "편집",
                items: [
                  { key: "undo", label: "실행 취소", shortcut: "⌘Z" },
                  { key: "redo", label: "다시 실행", shortcut: "⇧⌘Z" },
                  { key: "div1", label: "", divider: true },
                  { key: "cut", label: "잘라내기", shortcut: "⌘X" },
                  { key: "copy", label: "복사", shortcut: "⌘C" },
                  { key: "paste", label: "붙여넣기", shortcut: "⌘V" },
                  { key: "div2", label: "", divider: true },
                  { key: "select-all", label: "모두 선택", shortcut: "⌘A" },
                ],
              },
              {
                key: "view",
                label: "보기",
                items: [
                  { key: "zoom-in", label: "확대", shortcut: "⌘+" },
                  { key: "zoom-out", label: "축소", shortcut: "⌘-" },
                  { key: "actual-size", label: "실제 크기", shortcut: "⌘0" },
                  { key: "div1", label: "", divider: true },
                  { key: "fullscreen", label: "전체 화면", shortcut: "F11" },
                  { key: "sidebar", label: "사이드바 토글", shortcut: "⌘B" },
                  { key: "div2", label: "", divider: true },
                  { key: "word-wrap", label: "자동 줄바꿈", disabled: true },
                ],
              },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
