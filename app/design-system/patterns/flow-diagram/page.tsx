"use client";
import { useState, useCallback } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FlowDiagram } from "@/ds/patterns/FlowDiagram";
import type { FlowNode, FlowConnection } from "@/ds/patterns/FlowDiagram";
import { SegmentedControl } from "@/ds/composites/SegmentedControl";

// ── Section 1: 프로세스 흐름 예시 ──────────────────────

const processNodes: FlowNode[] = [
  // Row 1: 입고 프로세스
  {
    id: "ord",
    title: "주문접수",
    x: 50,
    y: 40,
    variant: "info",
    icon: <span>📋</span>,
    group: "입고 프로세스",
    content: <p className="text-xs">PO 입력 및 확인</p>,
  },
  {
    id: "mat",
    title: "자재입고",
    x: 300,
    y: 40,
    variant: "default",
    icon: <span>📦</span>,
    group: "입고 프로세스",
    content: <p className="text-xs">LOT 배정 완료</p>,
  },
  {
    id: "prod",
    title: "생산",
    x: 550,
    y: 40,
    variant: "success",
    icon: <span>🏭</span>,
    group: "입고 프로세스",
    content: <p className="text-xs">공정 진행 중</p>,
  },
  // Row 2: 출고 프로세스
  {
    id: "qa",
    title: "품질검사",
    x: 550,
    y: 200,
    variant: "warning",
    icon: <span>🔍</span>,
    group: "출고 프로세스",
    content: <p className="text-xs">검사 대기</p>,
  },
  {
    id: "insp",
    title: "수입검사",
    x: 300,
    y: 200,
    variant: "danger",
    icon: <span>🧪</span>,
    group: "출고 프로세스",
    content: <p className="text-xs">외부 검사 요청</p>,
  },
  {
    id: "ship",
    title: "출하",
    x: 50,
    y: 200,
    variant: "success",
    icon: <span>🚚</span>,
    group: "출고 프로세스",
    content: <p className="text-xs">출하 준비 완료</p>,
  },
];

const processConnections: FlowConnection[] = [
  { id: "pc1", from: "ord", to: "mat", label: "투입" },
  { id: "pc2", from: "mat", to: "prod", label: "생산 지시" },
  { id: "pc3", from: "prod", to: "qa", label: "검사 요청" },
  { id: "pc4", from: "qa", to: "insp", label: "외부 의뢰" },
  { id: "pc5", from: "insp", to: "ship", label: "합격" },
];

// ── Section 2: 연결선 스타일 비교 ──────────────────────

const diamondNodes: FlowNode[] = [
  { id: "d-top", title: "데이터 수집", x: 200, y: 20, variant: "info" },
  { id: "d-left", title: "전처리", x: 50, y: 150, variant: "warning" },
  { id: "d-right", title: "분석", x: 350, y: 150, variant: "success" },
  { id: "d-bottom", title: "결과", x: 200, y: 280, variant: "default" },
];

const diamondConnections: FlowConnection[] = [
  { id: "dc1", from: "d-top", to: "d-left", label: "정제" },
  { id: "dc2", from: "d-top", to: "d-right", label: "분석" },
  { id: "dc3", from: "d-left", to: "d-bottom", label: "출력" },
  { id: "dc4", from: "d-right", to: "d-bottom", label: "출력" },
];

// ── Section 3: 실시간 데이터 파이프라인 ──────────────────

const pipelineNodes: FlowNode[] = [
  { id: "src-api", title: "API", x: 30, y: 30, variant: "info", outputs: 2, icon: <span>🌐</span> },
  { id: "src-db", title: "DB", x: 30, y: 150, variant: "info", outputs: 2, icon: <span>🗄️</span> },
  { id: "src-file", title: "File", x: 30, y: 270, variant: "info", outputs: 2, icon: <span>📁</span> },
  { id: "merger", title: "병합 처리기", x: 300, y: 130, variant: "warning", inputs: 3, outputs: 2, icon: <span>🔀</span> },
  { id: "proc-a", title: "실시간 분석", x: 580, y: 60, variant: "success", inputs: 1, icon: <span>📊</span> },
  { id: "proc-b", title: "배치 저장", x: 580, y: 220, variant: "success", inputs: 1, icon: <span>💾</span> },
];

const pipelineConnections: FlowConnection[] = [
  { id: "plc1", from: "src-api", to: "merger", fromPort: 0, toPort: 0, label: "REST" },
  { id: "plc2", from: "src-db", to: "merger", fromPort: 0, toPort: 1, label: "Query" },
  { id: "plc3", from: "src-file", to: "merger", fromPort: 0, toPort: 2, label: "CSV" },
  { id: "plc4", from: "merger", to: "proc-a", fromPort: 0, toPort: 0, label: "Stream" },
  { id: "plc5", from: "merger", to: "proc-b", fromPort: 1, toPort: 0, label: "Batch" },
];

// ── Connection style options ────────────────────────────

const connectionStyleOptions = [
  { key: "bezier", label: "Bezier (곡선)" },
  { key: "straight", label: "Straight (직선)" },
  { key: "step", label: "Step (직각)" },
];

// ── Page Component ──────────────────────────────────────

export default function FlowDiagramPage() {
  // Section 1 state
  const [procNodes, setProcNodes] = useState(processNodes);
  const [procConns, setProcConns] = useState(processConnections);
  const [procSel, setProcSel] = useState<string[]>([]);

  const handleProcMove = useCallback((id: string, x: number, y: number) => {
    setProcNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handleProcConnect = useCallback((from: string, to: string) => {
    setProcConns((prev) => [...prev, { id: `pc${Date.now()}`, from, to }]);
  }, []);
  const handleProcDisconnect = useCallback((connId: string) => {
    setProcConns((prev) => prev.filter((c) => c.id !== connId));
  }, []);
  const handleProcDelete = useCallback((ids: string[]) => {
    setProcNodes((prev) => prev.filter((n) => !ids.includes(n.id)));
    setProcConns((prev) => prev.filter((c) => !ids.includes(c.from) && !ids.includes(c.to)));
    setProcSel([]);
  }, []);

  // Section 2 state
  const [connStyle, setConnStyle] = useState<"bezier" | "straight" | "step">("bezier");
  const [diaNodes, setDiaNodes] = useState(diamondNodes);

  const handleDiaMove = useCallback((id: string, x: number, y: number) => {
    setDiaNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  // Section 3 state
  const [pipeNodes, setPipeNodes] = useState(pipelineNodes);
  const [pipeConns, setPipeConns] = useState(pipelineConnections);

  const handlePipeMove = useCallback((id: string, x: number, y: number) => {
    setPipeNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handlePipeConnect = useCallback((from: string, to: string) => {
    setPipeConns((prev) => [...prev, { id: `plc${Date.now()}`, from, to }]);
  }, []);
  const handlePipeDisconnect = useCallback((connId: string) => {
    setPipeConns((prev) => prev.filter((c) => c.id !== connId));
  }, []);

  return (
    <ComponentPage
      name="FlowDiagram"
      description="인터랙티브 플로우 다이어그램. 노드를 자유롭게 배치하고 연결선으로 프로세스 흐름을 시각화합니다."
      importPath='import { FlowDiagram } from "@/ds/patterns/FlowDiagram"'
      props={[
        { name: "nodes", type: "FlowNode[]", description: "노드 배열 (id, title, x, y, variant, content, icon, group, inputs, outputs)" },
        { name: "connections", type: "FlowConnection[]", description: "연결선 배열 (id, from, to, label, fromPort, toPort)" },
        { name: "onNodeMove", type: "(id, x, y) => void", description: "노드 이동 핸들러" },
        { name: "onConnect", type: "(from, to) => void", description: "연결 생성 핸들러" },
        { name: "onDisconnect", type: "(connId) => void", description: "연결 삭제 핸들러" },
        { name: "onNodeDelete", type: "(ids) => void", description: "노드 삭제 핸들러 (Delete 키)" },
        { name: "onNodeDoubleClick", type: "(id) => void", description: "노드 더블클릭 핸들러" },
        { name: "selectedIds", type: "string[]", description: "선택된 노드 ID" },
        { name: "showGrid", type: "boolean", default: "true", description: "그리드 배경 표시" },
        { name: "showMinimap", type: "boolean", default: "false", description: "미니맵 표시" },
        { name: "fitToView", type: "boolean", default: "false", description: "전체 보기 자동 적용" },
{ name: "connectionStyle", type: '"bezier" | "straight" | "step"', default: '"bezier"', description: "연결선 스타일" },
        { name: "animateConnections", type: "boolean", default: "false", description: "연결선 애니메이션" },
      ]}
    >
      {/* Section 1: 프로세스 흐름 예시 */}
      <Section title="프로세스 흐름 예시">
        <Preview padding={false}>
          <FlowDiagram
            nodes={procNodes}
            connections={procConns}
            onNodeMove={handleProcMove}
            onConnect={handleProcConnect}
            onDisconnect={handleProcDisconnect}
            onNodeDelete={handleProcDelete}
            selectedIds={procSel}
            onSelectionChange={setProcSel}
            fitToView
            showGrid
            showMinimap
            animateConnections
            className="h-[500px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- 6개 노드의 제조 프로세스 흐름 (2행 배치, fitToView 자동 적용)</p>
          <p>- &quot;입고 프로세스&quot;, &quot;출고 프로세스&quot; 그룹 영역 표시</p>
          <p>- 노드 드래그, 줌, 연결, 삭제 (Delete 키) 모두 지원</p>
          <p>- 미니맵과 연결선 애니메이션 활성화</p>
        </div>
      </Section>

      {/* Section 2: 연결선 스타일 비교 */}
      <Section title="연결선 스타일 비교">
        <div className="mb-3 flex justify-center">
          <SegmentedControl
            options={connectionStyleOptions}
            value={connStyle}
            onChange={(v) => setConnStyle(v as "bezier" | "straight" | "step")}
            size="sm"
          />
        </div>
        <Preview padding={false}>
          <FlowDiagram
            nodes={diaNodes}
            connections={diamondConnections}
            onNodeMove={handleDiaMove}
            connectionStyle={connStyle}
            fitToView
            animateConnections
            className="h-[380px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- 다이아몬드 형태의 4개 노드로 연결선 스타일을 비교합니다</p>
          <p>- 상단 토글로 bezier / straight / step 스타일을 전환해 보세요</p>
        </div>
      </Section>

      {/* Section 3: 실시간 데이터 파이프라인 */}
      <Section title="실시간 데이터 파이프라인">
        <Preview padding={false}>
          <FlowDiagram
            nodes={pipeNodes}
            connections={pipeConns}
            onNodeMove={handlePipeMove}
            onConnect={handlePipeConnect}
            onDisconnect={handlePipeDisconnect}
            connectionStyle="step"
            fitToView
            showGrid
            animateConnections
            className="h-[400px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- 3개의 데이터 소스(API, DB, File)가 병합 처리기로 연결</p>
          <p>- 멀티 포트(inputs/outputs)를 활용한 복잡한 데이터 흐름</p>
          <p>- step 스타일 연결선과 애니메이션으로 파이프라인 시각화</p>
        </div>
      </Section>

    </ComponentPage>
  );
}
