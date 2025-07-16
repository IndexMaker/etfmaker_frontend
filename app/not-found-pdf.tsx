"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function PdfNotFoundPage() {
  const router = useRouter();
  const params = useParams();
  const missingPdfName = params?.id || "the requested file";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      {/* PDF-specific icon */}
      <div className="bg-red-100 p-4 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-primary">
        PDF Not Found
      </h1>
      
      <p className="text-lg text-secondary text-center max-w-md">
        <span className="font-mono bg-foreground px-2 py-1 rounded">
          {missingPdfName}
        </span>{" "}
        could not be found or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-primary rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>

        <Link
          href="/documents" // Adjust to your documents directory
          className="px-6 py-3 text-center text-primary border border-muted rounded-lg hover:bg-accent transition-colors bg-foreground"
        >
          Browse Available PDFs
        </Link>
      </div>

      <div className="mt-8 text-sm text-secondary">
        <p className="text-secondary">Need help? <Link href="/contact-us" className="text-blue-500 hover:underline">Contact support</Link></p>
      </div>
    </div>
  );
}