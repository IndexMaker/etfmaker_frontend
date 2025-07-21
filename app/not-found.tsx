"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl text-primary font-bold">404 - Page Not Found</h1>
      <p className="text-lg text-secondary">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => router.push("/")}
        className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition text-white"
      >
        Return Home
      </button>
      {/* Alternative using Link component */}
      <Link href="/" className="text-blue-500 hover:underline">
        Or click here to go home
      </Link>
    </div>
  );
}
