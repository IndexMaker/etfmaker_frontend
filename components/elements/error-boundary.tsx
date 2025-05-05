// components/error-boundary.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NotFound from "./not-found";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  if (error.message === 'Project not found') {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-center">{error.message}</p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/ecosystem')}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Go back
        </button>
      </div>
    </div>
  );
}