import { Button } from '@eventon/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-8 text-slate-900">
      <h1 className="text-4xl font-bold">EventOn Platform</h1>
      <p className="max-w-xl text-center text-lg">
        Welcome to the EventOn monorepo. Explore shared UI components, TypeScript services, and the
        optimization scheduler from a single developer workflow.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="primary">Get Started</Button>
        <Button variant="secondary">View Docs</Button>
      </div>
    </main>
  );
}
