"use client";
import type { ReactNode } from "react";
import type { PropDef } from "./PropsTable";
import { PropsTable } from "./PropsTable";

export function ComponentPage({
  name,
  description,
  importPath,
  children,
  props,
}: {
  name: string;
  description: string;
  importPath: string;
  children: ReactNode;
  props?: PropDef[];
}) {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{name}</h1>
        <p className="text-sm text-muted mb-2">{description}</p>
        <code className="text-xs font-mono bg-gray-100 text-muted px-2 py-1 rounded-md">
          {importPath}
        </code>
      </div>

      {/* Content (previews, variants, code examples) */}
      <div className="flex flex-col gap-8">
        {children}
      </div>

      {/* Props Table */}
      {props && props.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Props</h2>
          <PropsTable props={props} />
        </div>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </div>
  );
}
