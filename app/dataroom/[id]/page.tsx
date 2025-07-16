"use client";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the PDF not found page to avoid circular dependencies
const PdfNotFoundPage = dynamic(() => import("@/app/not-found-pdf"));

export default function DataroomPage() {
  const params = useParams();
  const pdfName = params.id?.toString();
  const [status, setStatus] = useState<"loading" | "found" | "not-found">(
    "loading"
  );

  useEffect(() => {
    async function checkPdfExists() {
      try {
        if (!pdfName) {
          setStatus("not-found");
          return;
        }

        // Check if PDF exists in public folder
        const response = await fetch(`/${pdfName}`, { method: "HEAD" });

        if (response.ok) {
          // Use setTimeout to allow state to update before redirect
          setTimeout(() => redirect(`/${pdfName}`), 0);
        } else {
          setStatus("not-found");
        }
      } catch (error) {
        setStatus("not-found");
      }
    }

    checkPdfExists();
  }, [pdfName]);

  // Show loading state while checking
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Checking document availability...</p>
      </div>
    );
  }

  // Show not found page if PDF doesn't exist
  if (status === "not-found") {
    return <PdfNotFoundPage />;
  }

  // Empty fragment as fallback (redirect will happen if PDF exists)
  return <></>;
}
