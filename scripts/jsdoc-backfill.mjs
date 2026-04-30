#!/usr/bin/env node
//
// One-shot JSDoc backfill for components whose Props interface is missing
// per-prop descriptions. Idempotent — re-running skips props that already
// have a JSDoc above them.
//
// Usage: node scripts/jsdoc-backfill.mjs
//

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DESCRIPTIONS = {
  "ds/composites/DiffViewer/DiffViewer.tsx": {
    oldText: "이전 텍스트",
    newText: "새 텍스트",
    oldTitle: "이전 제목 라벨",
    newTitle: "새 제목 라벨",
    className: "추가 클래스",
  },
  "ds/composites/Dock/Dock.tsx": {
    children: "도크 아이템 (DockItem)",
    magnification: "호버 시 확대 배율",
    className: "추가 클래스",
  },
  "ds/composites/Drawer/Drawer.tsx": {
    open: "열림 상태",
    onClose: "닫기 콜백",
    side: "열리는 방향",
    size: "드로어 크기",
    title: "헤더 제목",
    children: "본문 콘텐츠",
    footer: "푸터 영역",
    dismissible: "외부 클릭/ESC로 닫기 허용",
    className: "추가 클래스",
  },
  "ds/composites/Dropdown/Dropdown.tsx": {
    trigger: "트리거 요소",
    items: "메뉴 항목 목록",
    onSelect: "항목 선택 콜백",
    align: "정렬 방향",
    className: "추가 클래스",
  },
  "ds/composites/EmojiPicker/EmojiPicker.tsx": {
    onSelect: "이모지 선택 콜백",
    className: "추가 클래스",
  },
  "ds/composites/EmptyState/EmptyState.tsx": {
    icon: "표시할 아이콘",
    title: "제목 텍스트",
    description: "설명 텍스트",
    action: "하단 액션 버튼",
    className: "추가 클래스",
  },
  "ds/composites/FilterButtonGroup/FilterButtonGroup.tsx": {
    options: "필터 옵션 목록",
    value: "선택된 값",
    onChange: "값 변경 콜백",
    className: "추가 클래스",
  },
  "ds/composites/FloatingActionButton/FloatingActionButton.tsx": {
    actions: "표시할 액션 목록",
    className: "추가 클래스",
  },
  "ds/composites/FormField/FormField.tsx": {
    children: "입력 요소",
    className: "추가 클래스",
  },
  "ds/composites/FunnelChart/FunnelChart.tsx": {
    data: "퍼널 단계 데이터",
    height: "차트 높이(px)",
    className: "추가 클래스",
  },
  "ds/composites/GaugeChart/GaugeChart.tsx": {
    value: "현재 값",
    min: "최솟값",
    max: "최댓값",
    label: "중앙 라벨",
    size: "차트 크기(px)",
    segments: "구간별 색상 정의",
    className: "추가 클래스",
  },
  "ds/composites/Globe/Globe.tsx": {
    size: "글로브 크기(px)",
    color: "기본 색상",
    dotColor: "점 색상",
    speed: "회전 속도",
    className: "추가 클래스",
  },
  "ds/composites/GradientBorder/GradientBorder.tsx": {
    children: "감싸질 콘텐츠",
    gradient: "그라디언트 색상 배열",
    borderWidth: "테두리 두께(px)",
    rounded: "모서리 둥글기",
    animated: "애니메이션 여부",
    className: "추가 클래스",
  },
  "ds/composites/Heatmap/Heatmap.tsx": {
    data: "히트맵 셀 데이터",
    colorScale: "색상 스케일",
    cellSize: "셀 크기(px)",
    gap: "셀 간격(px)",
    className: "추가 클래스",
  },
  "ds/composites/HoverCard/HoverCard.tsx": {
    trigger: "트리거 요소",
    children: "호버 시 표시할 콘텐츠",
    side: "표시 방향",
    openDelay: "열림 지연(ms)",
    closeDelay: "닫힘 지연(ms)",
    className: "추가 클래스",
  },
  "ds/composites/ImageCropper/ImageCropper.tsx": {
    src: "이미지 소스 URL",
    aspectRatio: "크롭 영역 종횡비",
    onCrop: "크롭 결과 콜백",
    className: "추가 클래스",
  },
  "ds/composites/Table/Table.tsx": {
    className: "추가 클래스",
  },
  "ds/composites/TagInput/TagInput.tsx": {
    value: "태그 배열",
    onChange: "태그 변경 콜백",
    placeholder: "플레이스홀더",
    maxTags: "최대 태그 수",
    disabled: "비활성화 여부",
    error: "오류 상태",
    size: "입력 크기",
    className: "추가 클래스",
  },
  "ds/composites/Timeline/Timeline.tsx": {
    items: "타임라인 항목",
    className: "추가 클래스",
  },
  "ds/composites/TimePicker/TimePicker.tsx": {
    onChange: "값 변경 콜백",
    disabled: "비활성화 여부",
    placeholder: "플레이스홀더",
    className: "추가 클래스",
  },
  "ds/composites/Tooltip/Tooltip.tsx": {
    content: "툴팁 내용",
    position: "표시 위치",
    delay: "표시 지연(ms)",
    children: "트리거 요소",
    className: "추가 클래스",
  },
  "ds/composites/Transfer/Transfer.tsx": {
    source: "출발측 항목",
    target: "도착측 항목",
    onChange: "이동 시 콜백",
    sourceTitle: "출발측 제목",
    targetTitle: "도착측 제목",
    searchable: "검색 활성화",
    className: "추가 클래스",
  },
  "ds/composites/TreemapChart/TreemapChart.tsx": {
    data: "트리맵 데이터",
    width: "차트 너비(px)",
    height: "차트 높이(px)",
    className: "추가 클래스",
  },
  "ds/composites/TreeNav/TreeNav.tsx": {
    className: "추가 클래스",
  },
  "ds/composites/TreeView/TreeView.tsx": {
    nodes: "트리 노드",
    selected: "선택된 노드 ID",
    onSelect: "노드 선택 콜백",
    defaultExpanded: "기본으로 펼쳐진 노드 ID 배열",
    className: "추가 클래스",
  },
  "ds/composites/TrustIndicator/TrustIndicator.tsx": {
    items: "신뢰 지표 항목",
    className: "추가 클래스",
  },
  "ds/composites/Typewriter/Typewriter.tsx": {
    texts: "순환 표시할 문장 배열",
    speed: "타이핑 속도(ms/char)",
    deleteSpeed: "삭제 속도(ms/char)",
    delay: "다음 문장 시작 전 지연(ms)",
    loop: "무한 반복",
    cursor: "커서 표시",
    cursorChar: "커서 문자",
    className: "추가 클래스",
    onComplete: "완료 콜백",
  },
  "ds/composites/VideoPlayer/VideoPlayer.tsx": {
    src: "비디오 소스 URL",
    poster: "포스터 이미지 URL",
    autoPlay: "자동 재생",
    muted: "음소거 시작",
    loop: "반복 재생",
    className: "추가 클래스",
  },
  "ds/composites/VirtualScroll/VirtualScroll.tsx": {
    items: "렌더링할 항목 배열",
    itemHeight: "항목 고정 높이(px)",
    renderItem: "항목 렌더 함수",
    overscan: "뷰포트 외 추가 렌더 개수",
    className: "추가 클래스",
    style: "추가 스타일",
  },
  "ds/composites/Watermark/Watermark.tsx": {
    text: "워터마크 텍스트",
    children: "감쌀 콘텐츠",
    fontSize: "글자 크기(px)",
    color: "텍스트 색상",
    rotate: "회전 각도(deg)",
    gap: "패턴 간격(px)",
    className: "추가 클래스",
  },
  "ds/patterns/RichTextEditor/RichTextEditor.tsx": {
    value: "HTML 값",
    onChange: "값 변경 콜백",
    placeholder: "플레이스홀더",
    disabled: "비활성화 여부",
    className: "추가 클래스",
  },
  "ds/patterns/SecurityChecklist/SecurityChecklist.tsx": {
    items: "체크리스트 항목",
    title: "제목",
    className: "추가 클래스",
  },
  "ds/patterns/Sidebar/Sidebar.tsx": {
    header: "상단 헤더 영역",
    footer: "하단 푸터 영역",
    children: "사이드바 본문",
    width: "펼친 상태 너비(px)",
    collapsedWidth: "접힌 상태 너비(px)",
    className: "추가 클래스",
  },
  "ds/patterns/SortableList/SortableList.tsx": {
    items: "정렬 가능한 항목",
    renderItem: "항목 렌더 함수",
    onReorder: "재정렬 콜백",
    className: "추가 클래스",
  },
  "ds/patterns/Starfield/Starfield.tsx": {
    className: "추가 클래스",
  },
  "ds/patterns/StatsGrid/StatsGrid.tsx": {
    stats: "통계 항목 배열",
    columns: "그리드 열 수",
    className: "추가 클래스",
  },
  "ds/patterns/Tour/Tour.tsx": {
    steps: "투어 단계 정의",
    open: "투어 표시 여부",
    onClose: "투어 종료 콜백",
    current: "현재 단계 인덱스",
    onStepChange: "단계 변경 콜백",
    className: "추가 클래스",
  },
  "ds/patterns/VirtualList/VirtualList.tsx": {
    items: "렌더할 항목 배열",
    itemHeight: "항목 고정 높이(px)",
    renderItem: "항목 렌더 함수",
    keyExtractor: "키 추출 함수",
    className: "추가 클래스",
  },
};

let totalAdded = 0;
let filesTouched = 0;

for (const [relPath, props] of Object.entries(DESCRIPTIONS)) {
  const file = path.resolve(relPath);
  const content = await readFile(file, "utf8");
  const lines = content.split("\n");
  const out = [];
  let added = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\s+)(\w+)(\??):/);
    if (m && Object.prototype.hasOwnProperty.call(props, m[2])) {
      const propName = m[2];
      const indent = m[1];
      const prev = i > 0 ? lines[i - 1].trim() : "";
      // skip if a JSDoc already sits above this line
      if (!prev.startsWith("/**")) {
        out.push(`${indent}/** ${props[propName]} */`);
        added++;
      }
    }
    out.push(line);
  }

  if (added > 0) {
    await writeFile(file, out.join("\n"));
    totalAdded += added;
    filesTouched++;
    console.log(`  ${relPath}: +${added}`);
  }
}

console.log(`[jsdoc-backfill] +${totalAdded} JSDoc comments across ${filesTouched} files`);
