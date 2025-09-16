'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-red-50 p-8 text-red-900">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p>Please try again or refresh the page.</p>
      <button
        className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        type="button"
        onClick={() => reset()}
      >
        Reload
      </button>
    </main>
  );
}
