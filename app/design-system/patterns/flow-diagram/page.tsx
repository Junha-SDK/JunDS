"use client";
import { useState, useCallback } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FlowDiagram } from "@/ds/patterns/FlowDiagram";
import type { FlowNode, FlowConnection } from "@/ds/patterns/FlowDiagram";

// ── Section 1: 제조 프로세스 흐름 ──────────────────────

const mfgNodes: FlowNode[] = [
  {
    id: "ord",
    title: "주문접수",
    x: 50,
    y: 100,
    variant: "info",
    icon: <span>📋</span>,
    group: "전처리",
    content: <p className="text-xs">PO 입력 및 확인</p>,
  },
  {
    id: "mat",
    title: "자재입고",
    x: 300,
    y: 100,
    variant: "default",
    icon: <span>📦</span>,
    group: "전처리",
    content: <p className="text-xs">LOT 배정 완료</p>,
  },
  {
    id: "prod",
    title: "생산",
    x: 560,
    y: 100,
    variant: "success",
    icon: <span>🏭</span>,
    content: <p className="text-xs">공정 진행 중</p>,
  },
  {
    id: "qa",
    title: "품질검사",
    x: 560,
    y: 280,
    variant: "warning",
    icon: <span>🔍</span>,
    group: "후처리",
    content: <p className="text-xs">검사 대기</p>,
  },
  {
    id: "insp",
    title: "수입검사",
    x: 300,
    y: 280,
    variant: "danger",
    icon: <span>🧪</span>,
    group: "후처리",
    content: <p className="text-xs">외부 검사 요청</p>,
  },
  {
    id: "ship",
    title: "출하",
    x: 50,
    y: 280,
    variant: "success",
    icon: <span>🚚</span>,
    group: "후처리",
    content: <p className="text-xs">출하 준비 완료</p>,
  },
];

const mfgConnections: FlowConnection[] = [
  { id: "mc1", from: "ord", to: "mat", label: "투입" },
  { id: "mc2", from: "mat", to: "prod", label: "생산 지시" },
  { id: "mc3", from: "prod", to: "qa", label: "검사 요청" },
  { id: "mc4", from: "qa", to: "insp", label: "외부 의뢰" },
  { id: "mc5", from: "insp", to: "ship", label: "합격" },
];

// ── Section 2: 연결선 스타일 ──────────────────────────

const styleNodes: FlowNode[] = [
  { id: "s1", title: "시작", x: 30, y: 50, variant: "info" },
  { id: "s2", title: "처리", x: 280, y: 50, variant: "success" },
  { id: "s3", title: "종료", x: 530, y: 50, variant: "default" },
];

const styleConnections: FlowConnection[] = [
  { id: "sc1", from: "s1", to: "s2", label: "Step 1" },
  { id: "sc2", from: "s2", to: "s3", label: "Step 2" },
];

// ── Section 3: 읽기 전용 ────────────────────────────

const readonlyNodes: FlowNode[] = [
  { id: "r1", title: "입력", x: 30, y: 60, variant: "info" },
  { id: "r2", title: "처리", x: 280, y: 60, variant: "success" },
  { id: "r3", title: "출력", x: 530, y: 60, variant: "default" },
];

const readonlyConnections: FlowConnection[] = [
  { id: "rc1", from: "r1", to: "r2" },
  { id: "rc2", from: "r2", to: "r3" },
];

// ── Section 4: 그룹 표시 ────────────────────────────

const groupNodes: FlowNode[] = [
  { id: "g1", title: "데이터 수집", x: 40, y: 80, variant: "info", group: "데이터 레이어" },
  { id: "g2", title: "데이터 정제", x: 280, y: 80, variant: "info", group: "데이터 레이어" },
  { id: "g3", title: "분석 엔진", x: 40, y: 260, variant: "success", group: "분석 레이어" },
  { id: "g4", title: "시각화", x: 280, y: 260, variant: "success", group: "분석 레이어" },
  { id: "g5", title: "대시보드", x: 540, y: 170, variant: "warning", group: "표현 레이어" },
];

const groupConnections: FlowConnection[] = [
  { id: "gc1", from: "g1", to: "g2", label: "ETL" },
  { id: "gc2", from: "g2", to: "g3", label: "정제 데이터" },
  { id: "gc3", from: "g3", to: "g4", label: "결과" },
  { id: "gc4", from: "g4", to: "g5", label: "렌더링" },
];

// ── Section 5: 멀티 포트 ────────────────────────────

const multiPortNodes: FlowNode[] = [
  { id: "mp1", title: "데이터 소스 A", x: 30, y: 40, variant: "info", outputs: 2 },
  { id: "mp2", title: "데이터 소스 B", x: 30, y: 200, variant: "info", outputs: 1 },
  { id: "mp3", title: "병합 처리기", x: 320, y: 100, variant: "warning", inputs: 3, outputs: 2 },
  { id: "mp4", title: "출력 A", x: 620, y: 40, variant: "success", inputs: 1 },
  { id: "mp5", title: "출력 B", x: 620, y: 220, variant: "success", inputs: 1 },
];

const multiPortConnections: FlowConnection[] = [
  { id: "mpc1", from: "mp1", to: "mp3", fromPort: 0, toPort: 0, label: "채널 1" },
  { id: "mpc2", from: "mp1", to: "mp3", fromPort: 1, toPort: 1, label: "채널 2" },
  { id: "mpc3", from: "mp2", to: "mp3", fromPort: 0, toPort: 2, label: "보조" },
  { id: "mpc4", from: "mp3", to: "mp4", fromPort: 0, toPort: 0, label: "메인" },
  { id: "mpc5", from: "mp3", to: "mp5", fromPort: 1, toPort: 0, label: "서브" },
];

// ── Page Component ──────────────────────────────────

export default function FlowDiagramPage() {
  // Section 1 state
  const [mfgN, setMfgN] = useState(mfgNodes);
  const [mfgC, setMfgC] = useState(mfgConnections);
  const [mfgSel, setMfgSel] = useState<string[]>([]);

  const handleMfgMove = useCallback((id: string, x: number, y: number) => {
    setMfgN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handleMfgConnect = useCallback((from: string, to: string) => {
    setMfgC((prev) => [...prev, { id: `mc${Date.now()}`, from, to }]);
  }, []);
  const handleMfgDisconnect = useCallback((connId: string) => {
    setMfgC((prev) => prev.filter((c) => c.id !== connId));
  }, []);
  const handleMfgDelete = useCallback((ids: string[]) => {
    setMfgN((prev) => prev.filter((n) => !ids.includes(n.id)));
    setMfgC((prev) => prev.filter((c) => !ids.includes(c.from) && !ids.includes(c.to)));
    setMfgSel([]);
  }, []);

  // Section 2 state - 3 independent style examples
  const [bezierN, setBezierN] = useState(styleNodes);
  const [straightN, setStraightN] = useState(styleNodes.map((n) => ({ ...n, id: `st-${n.id}` })));
  const [stepN, setStepN] = useState(styleNodes.map((n) => ({ ...n, id: `sp-${n.id}` })));

  const straightConns: FlowConnection[] = styleConnections.map((c) => ({
    ...c,
    id: `st-${c.id}`,
    from: `st-${c.from}`,
    to: `st-${c.to}`,
  }));
  const stepConns: FlowConnection[] = styleConnections.map((c) => ({
    ...c,
    id: `sp-${c.id}`,
    from: `sp-${c.from}`,
    to: `sp-${c.to}`,
  }));

  const handleBezierMove = useCallback((id: string, x: number, y: number) => {
    setBezierN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handleStraightMove = useCallback((id: string, x: number, y: number) => {
    setStraightN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handleStepMove = useCallback((id: string, x: number, y: number) => {
    setStepN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  // Section 4 state
  const [grpN, setGrpN] = useState(groupNodes);
  const [grpC] = useState(groupConnections);

  const handleGrpMove = useCallback((id: string, x: number, y: number) => {
    setGrpN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  // Section 5 state
  const [mpN, setMpN] = useState(multiPortNodes);
  const [mpC, setMpC] = useState(multiPortConnections);

  const handleMpMove = useCallback((id: string, x: number, y: number) => {
    setMpN((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);
  const handleMpConnect = useCallback((from: string, to: string) => {
    setMpC((prev) => [...prev, { id: `mpc${Date.now()}`, from, to }]);
  }, []);
  const handleMpDisconnect = useCallback((connId: string) => {
    setMpC((prev) => prev.filter((c) => c.id !== connId));
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
        { name: "readonly", type: "boolean", default: "false", description: "읽기 전용 모드" },
        { name: "connectionStyle", type: '"bezier" | "straight" | "step"', default: '"bezier"', description: "연결선 스타일" },
        { name: "animateConnections", type: "boolean", default: "false", description: "연결선 애니메이션" },
      ]}
    >
      {/* Section 1: 제조 프로세스 흐름 */}
      <Section title="제조 프로세스 흐름">
        <Preview padding={false}>
          <FlowDiagram
            nodes={mfgN}
            connections={mfgC}
            onNodeMove={handleMfgMove}
            onConnect={handleMfgConnect}
            onDisconnect={handleMfgDisconnect}
            onNodeDelete={handleMfgDelete}
            selectedIds={mfgSel}
            onSelectionChange={setMfgSel}
            showGrid
            showMinimap
            animateConnections
            className="h-[500px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- 6개의 제조 공정 노드와 라벨이 있는 연결선</p>
          <p>- &quot;전처리&quot;, &quot;후처리&quot; 그룹 영역 표시</p>
          <p>- 노드 드래그, 줌, 연결, 삭제 (Delete 키) 지원</p>
          <p>- 연결선 위 라벨과 점선 애니메이션 효과</p>
        </div>
      </Section>

      {/* Section 2: 연결선 스타일 */}
      <Section title="연결선 스타일">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted mb-2 font-semibold">Bezier (곡선)</p>
            <Preview padding={false}>
              <FlowDiagram
                nodes={bezierN}
                connections={styleConnections}
                onNodeMove={handleBezierMove}
                connectionStyle="bezier"
                className="h-[200px] rounded-xl"
              />
            </Preview>
          </div>
          <div>
            <p className="text-xs text-muted mb-2 font-semibold">Straight (직선)</p>
            <Preview padding={false}>
              <FlowDiagram
                nodes={straightN}
                connections={straightConns}
                onNodeMove={handleStraightMove}
                connectionStyle="straight"
                className="h-[200px] rounded-xl"
              />
            </Preview>
          </div>
          <div>
            <p className="text-xs text-muted mb-2 font-semibold">Step (직각)</p>
            <Preview padding={false}>
              <FlowDiagram
                nodes={stepN}
                connections={stepConns}
                onNodeMove={handleStepMove}
                connectionStyle="step"
                className="h-[200px] rounded-xl"
              />
            </Preview>
          </div>
        </div>
      </Section>

      {/* Section 3: 읽기 전용 모드 */}
      <Section title="읽기 전용 모드">
        <Preview padding={false}>
          <FlowDiagram
            nodes={readonlyNodes}
            connections={readonlyConnections}
            readonly
            showGrid
            className="h-[220px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- readonly=true: 드래그, 연결, 삭제 비활성화</p>
          <p>- 줌/패닝만 가능</p>
        </div>
      </Section>

      {/* Section 4: 그룹 표시 */}
      <Section title="그룹 표시">
        <Preview padding={false}>
          <FlowDiagram
            nodes={grpN}
            connections={grpC}
            onNodeMove={handleGrpMove}
            showGrid
            animateConnections
            className="h-[450px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- 같은 group 값을 가진 노드들이 반투명 배경 영역으로 표시됩니다</p>
          <p>- 각 그룹은 점선 테두리와 라벨로 구분됩니다</p>
        </div>
      </Section>

      {/* Section 5: 멀티 포트 */}
      <Section title="멀티 포트">
        <Preview padding={false}>
          <FlowDiagram
            nodes={mpN}
            connections={mpC}
            onNodeMove={handleMpMove}
            onConnect={handleMpConnect}
            onDisconnect={handleMpDisconnect}
            showGrid
            connectionStyle="bezier"
            animateConnections
            className="h-[400px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>- inputs/outputs 속성으로 여러 포트를 설정합니다</p>
          <p>- fromPort/toPort로 특정 포트 간 연결을 지정합니다</p>
          <p>- 포트는 노드 좌/우 측면에 수직으로 분배됩니다</p>
        </div>
      </Section>
    </ComponentPage>
  );
}
