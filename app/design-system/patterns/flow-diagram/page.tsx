"use client";
import { useState, useCallback } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FlowDiagram } from "@/ds/patterns/FlowDiagram";
import type { FlowNode, FlowConnection } from "@/ds/patterns/FlowDiagram";

const initialNodes: FlowNode[] = [
  { id: "1", title: "주문 접수", x: 50, y: 80, variant: "info", content: <p className="text-xs">PO 입력 후 확인</p> },
  { id: "2", title: "자재 투입", x: 320, y: 40, variant: "default", content: <p className="text-xs">LOT 배정</p> },
  { id: "3", title: "생산", x: 580, y: 80, variant: "success", content: <p className="text-xs">공정 진행 중</p> },
  { id: "4", title: "품질 검사", x: 580, y: 250, variant: "warning", content: <p className="text-xs">검사 대기</p> },
  { id: "5", title: "출하", x: 320, y: 250, variant: "danger", content: <p className="text-xs">미완료</p> },
];

const initialConnections: FlowConnection[] = [
  { id: "c1", from: "1", to: "2" },
  { id: "c2", from: "2", to: "3" },
  { id: "c3", from: "3", to: "4" },
  { id: "c4", from: "4", to: "5" },
];

export default function FlowDiagramPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [connections, setConnections] = useState(initialConnections);
  const [selected, setSelected] = useState<string[]>([]);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const handleConnect = useCallback((from: string, to: string) => {
    setConnections((prev) => [...prev, { id: `c${Date.now()}`, from, to }]);
  }, []);

  const handleDisconnect = useCallback((connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  }, []);

  return (
    <ComponentPage
      name="FlowDiagram"
      description="인터랙티브 플로우 다이어그램. 노드를 자유롭게 배치하고 연결선으로 프로세스 흐름을 시각화합니다."
      importPath='import { FlowDiagram } from "@/ds/patterns/FlowDiagram"'
      props={[
        { name: "nodes", type: "FlowNode[]", description: "노드 배열 (id, title, x, y, variant, content)" },
        { name: "connections", type: "FlowConnection[]", description: "연결선 배열 (id, from, to)" },
        { name: "onNodeMove", type: "(id, x, y) => void", description: "노드 이동 핸들러" },
        { name: "onConnect", type: "(from, to) => void", description: "연결 생성 핸들러" },
        { name: "onDisconnect", type: "(connId) => void", description: "연결 삭제 핸들러" },
        { name: "selectedIds", type: "string[]", description: "선택된 노드 ID" },
        { name: "showGrid", type: "boolean", default: "false", description: "그리드 배경 표시" },
        { name: "showMinimap", type: "boolean", default: "false", description: "미니맵 표시" },
      ]}
    >
      <Section title="인터랙티브 데모">
        <Preview padding={false}>
          <FlowDiagram
            nodes={nodes}
            connections={connections}
            onNodeMove={handleNodeMove}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            selectedIds={selected}
            onSelectionChange={setSelected}
            showGrid
            showMinimap
            className="h-[500px] rounded-xl"
          />
        </Preview>
        <div className="mt-3 text-xs text-muted space-y-1">
          <p>• 노드를 드래그하여 이동</p>
          <p>• Shift+드래그로 범위 선택 → 그룹 이동</p>
          <p>• 마우스 휠로 줌, 가운데 버튼/Space+드래그로 팬</p>
          <p>• 포트(파란 점)를 클릭하여 연결 생성</p>
          <p>• 연결선 클릭 후 Delete로 삭제</p>
        </div>
      </Section>
    </ComponentPage>
  );
}
