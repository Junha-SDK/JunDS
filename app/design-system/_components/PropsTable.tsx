"use client";

export interface PropDef {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export function PropsTable({ props }: { props: PropDef[] }) {
  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        {/* muted-light 는 카드 위에서 3.1:1 — 11px 헤더에 쓰면 AA 를 못 넘긴다.
            보조 텍스트의 하한은 muted 다 */}
        <thead>
          <tr className="text-left border-b border-border bg-surface-soft">
            <th
              scope="col"
              className="px-4 py-2.5 font-semibold text-[11px] text-muted uppercase tracking-wider whitespace-nowrap"
            >
              Prop
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 font-semibold text-[11px] text-muted uppercase tracking-wider whitespace-nowrap"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 font-semibold text-[11px] text-muted uppercase tracking-wider whitespace-nowrap"
            >
              Default
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 font-semibold text-[11px] text-muted uppercase tracking-wider whitespace-nowrap"
            >
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-t border-border-light">
              <td className="px-4 py-2.5 align-top">
                <code className="text-xs font-mono text-primary-ink bg-primary-light px-1.5 py-0.5 rounded whitespace-nowrap">
                  {p.name}
                </code>
                {p.required && (
                  <span className="text-danger ml-1 text-[10px]" title="필수 prop">
                    *
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 align-top">
                <code className="text-xs font-mono text-muted">{p.type}</code>
              </td>
              <td className="px-4 py-2.5 align-top text-xs text-muted">{p.default || "—"}</td>
              <td className="px-4 py-2.5 align-top text-xs text-foreground leading-relaxed">
                {p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
