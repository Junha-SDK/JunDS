"use client";

import { useMemo } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { labComponentMap } from "../_lib/component-registry";

export function PropertyEditor() {
  const { state, dispatch } = useLab();

  const selectedNode = useMemo(() => {
    if (state.selectedIds.length !== 1) return null;
    return state.nodes[state.selectedIds[0]] ?? null;
  }, [state.selectedIds, state.nodes]);

  const def = selectedNode
    ? labComponentMap.get(selectedNode.componentId)
    : null;

  if (!selectedNode || !def) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
        컴포넌트를 선택하세요
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
              def.category === "Primitives"
                ? "bg-blue-50 text-blue-500"
                : "bg-purple-50 text-purple-500",
            )}
          >
            {def.id.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{def.label}</p>
            <p className="text-[10px] text-gray-400">{def.category}</p>
          </div>
        </div>
      </div>

      {/* Props */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          속성
        </p>
        <div className="flex flex-col gap-2.5">
          {def.props.map((propDef) => {
            const value = selectedNode.props[propDef.name];
            const label = propDef.label ?? propDef.name;

            return (
              <div key={propDef.name} className="flex items-center gap-1.5">
                <label className="text-[11px] font-medium text-gray-500 w-20 shrink-0 truncate">
                  {label}
                </label>
                <div className="flex-1">
                  {propDef.type === "select" && (
                    <select
                      value={(value as string) ?? propDef.defaultValue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PROP",
                          nodeId: selectedNode.id,
                          propName: propDef.name,
                          value: e.target.value,
                        })
                      }
                      className="w-full h-7 px-2 text-xs border border-gray-200 rounded-md bg-white cursor-pointer focus:border-blue-500 focus:outline-none"
                    >
                      {propDef.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                  {propDef.type === "boolean" && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_PROP",
                          nodeId: selectedNode.id,
                          propName: propDef.name,
                          value: !value,
                        })
                      }
                      className={cn(
                        "w-8 h-5 rounded-full transition-colors relative cursor-pointer",
                        value ? "bg-blue-500" : "bg-gray-300",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                          value && "translate-x-3",
                        )}
                      />
                    </button>
                  )}
                  {propDef.type === "text" && (
                    <input
                      value={(value as string) ?? ""}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PROP",
                          nodeId: selectedNode.id,
                          propName: propDef.name,
                          value: e.target.value,
                        })
                      }
                      className="w-full h-7 px-2 text-xs border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:outline-none"
                    />
                  )}
                  {propDef.type === "number" && (
                    <input
                      type="number"
                      value={(value as number) ?? 0}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PROP",
                          nodeId: selectedNode.id,
                          propName: propDef.name,
                          value: Number(e.target.value),
                        })
                      }
                      className="w-full h-7 px-2 text-xs border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:outline-none"
                    />
                  )}
                  {propDef.type === "color" && (
                    <input
                      type="color"
                      value={(value as string) ?? "#000000"}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PROP",
                          nodeId: selectedNode.id,
                          propName: propDef.name,
                          value: e.target.value,
                        })
                      }
                      className="w-8 h-7 p-0.5 border border-gray-200 rounded-md cursor-pointer"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Children */}
      {def.acceptsChildren && (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Children
          </p>
          <input
            value={selectedNode.children ?? ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_CHILDREN",
                nodeId: selectedNode.id,
                children: e.target.value,
              })
            }
            className="w-full h-7 px-2 text-xs border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {/* Position / Size */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          위치 / 크기
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["x", "y", "width", "height"] as const).map((field) => (
            <div key={field} className="flex items-center gap-1">
              <label className="text-[10px] font-medium text-gray-400 w-5 uppercase">
                {field.charAt(0)}
              </label>
              <input
                type="number"
                value={Math.round(selectedNode.rect[field])}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (field === "x" || field === "y") {
                    dispatch({
                      type: "MOVE_NODE",
                      nodeId: selectedNode.id,
                      x: field === "x" ? val : selectedNode.rect.x,
                      y: field === "y" ? val : selectedNode.rect.y,
                    });
                  } else {
                    dispatch({
                      type: "RESIZE_NODE",
                      nodeId: selectedNode.id,
                      width: field === "width" ? val : selectedNode.rect.width,
                      height:
                        field === "height" ? val : selectedNode.rect.height,
                    });
                  }
                }}
                className="w-full h-7 px-2 text-xs border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Layer controls */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          레이어
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "BRING_FORWARD", nodeId: selectedNode.id })
            }
            className="flex-1 h-7 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            앞으로
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "SEND_BACKWARD", nodeId: selectedNode.id })
            }
            className="flex-1 h-7 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            뒤로
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: "DELETE_NODES", nodeIds: [selectedNode.id] })
          }
          className="w-full h-8 text-xs font-medium text-red-600 border border-red-200 rounded-md bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
