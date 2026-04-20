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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="px-4 py-2.5 font-semibold text-[11px] text-muted-light uppercase tracking-wider">Prop</th>
            <th className="px-4 py-2.5 font-semibold text-[11px] text-muted-light uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 font-semibold text-[11px] text-muted-light uppercase tracking-wider">Default</th>
            <th className="px-4 py-2.5 font-semibold text-[11px] text-muted-light uppercase tracking-wider">설명</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-t border-border-light">
              <td className="px-4 py-2.5">
                <code className="text-xs font-mono text-primary bg-primary-light px-1.5 py-0.5 rounded">
                  {p.name}
                </code>
                {p.required && <span className="text-danger ml-1 text-[10px]">*</span>}
              </td>
              <td className="px-4 py-2.5">
                <code className="text-xs font-mono text-muted">{p.type}</code>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-light">
                {p.default || "—"}
              </td>
              <td className="px-4 py-2.5 text-xs text-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
