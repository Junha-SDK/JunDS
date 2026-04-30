import { Button } from "@junds/ui";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">{{NAME}}</h1>
        <p className="text-sm opacity-70">
          Bootstrapped with <code>@junds/ui</code>. Edit{" "}
          <code>app/page.tsx</code> to start building.
        </p>
        <div className="flex gap-3">
          <Button variant="primary">Get started</Button>
          <Button variant="secondary">Docs</Button>
        </div>
      </div>
    </main>
  );
}
